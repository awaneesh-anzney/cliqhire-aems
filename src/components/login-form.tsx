"use client";

/**
 * login-form.tsx — Production Grade
 *
 * FIX LIST:
 *  1. Password NAHI rakhna localStorage mein — security risk (plaintext password)
 *     Sirf email remember karo agar "Remember me" tick hai
 *  2. Login ke baad router.push yahan nahi — LoginPage ka useEffect karega
 *     (double redirect race condition fix)
 *  3. isLoginLoading AuthContext se — form disabled rakhne ke liye
 */

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import * as z from "zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoginLoading } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  // FIX: sirf email restore karo — password localStorage mein nahi rakhna (security)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      form.setValue("email", rememberedEmail);
      form.setValue("remember", true);
    }
  }, [form]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const success = await login(values.email, values.password);

      if (success) {
        toast.success("Login successful!");

        // FIX: sirf email remember karo
        if (typeof window !== "undefined") {
          if (values.remember) {
            localStorage.setItem("rememberedEmail", values.email);
          } else {
            localStorage.removeItem("rememberedEmail");
          }
        }

        form.reset();
        // NOTE: redirect LoginPage ke useEffect se hoga — yahan nahi
        // Pehle yahan router.push('/dashboard') tha + LoginPage mein bhi tha → race condition
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("[LoginForm] submit error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="Email address"
                      className="pl-10"
                      disabled={isLoginLoading}
                      autoComplete="email"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="pl-10 pr-10"
                      disabled={isLoginLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember me */}
          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoginLoading}
                    />
                    <label
                      htmlFor="remember"
                      className="text-xs font-medium text-muted-foreground cursor-pointer select-none"
                    >
                      Remember my email
                    </label>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button type="submit" className="w-full font-bold" disabled={isLoginLoading}>
            {isLoginLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
