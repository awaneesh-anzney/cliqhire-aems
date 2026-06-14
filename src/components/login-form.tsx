"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import * as z from "zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoginLoading } = useAuth();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const rememberedEmail = localStorage.getItem("rememberedEmail");
      const rememberedPassword = localStorage.getItem("rememberedPassword");
      if (rememberedEmail && rememberedPassword) {
        form.setValue("email", rememberedEmail);
        form.setValue("password", rememberedPassword);
        form.setValue("remember", true);
      }
    }
  }, [form]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const success = await login(values.email, values.password);

      if (success) {
        toast.success("Login successful!");
        
        if (typeof window !== "undefined") {
          if (values.remember) {
            localStorage.setItem("rememberedEmail", values.email);
            localStorage.setItem("rememberedPassword", values.password);
          } else {
            localStorage.removeItem("rememberedEmail");
            localStorage.removeItem("rememberedPassword");
          }
        }

        // Reset form after successful login
        form.reset();

        // Add a small delay to ensure state is updated
        setTimeout(() => {
          const profile = authService.getUserData();
          const role = String(profile?.role || '').toUpperCase();
          const perms = profile?.permissions || profile?.defaultPermissions || [];
          const isHeadhunter = role === 'HEADHUNTER' || role === 'HEAD_HUNTER' || perms.includes('HEAD_HUNTER_VIEW');
          const fallback = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
          sessionStorage.removeItem('redirectAfterLogin');
          router.push(isHeadhunter ? '/headhunter' : fallback);
        }, 100);
      } else {
        toast.error("Email or password is incorrect");
        form.reset();
      }
    } catch (error) {
      console.error('LoginForm: Login error caught:', error);
      toast.error(error instanceof Error ? error.message : "Login failed");
      form.reset();
    }
  };

  return (
    <div className={cn("flex w-full flex-col", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Email Address
                </label>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/60" />
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="xyz@cliqhire.com"
                      className="w-full pl-11 h-11 rounded-xl border border-input focus-visible:ring-primary focus-visible:ring-offset-0 bg-muted/20 text-xs font-semibold"
                      data-form-type="other"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Password
                  </label>
                  <a href="/forgot-password" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">
                    Forgot password?
                  </a>
                </div>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/60" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-11 pr-11 h-11 rounded-xl border border-input focus-visible:ring-primary focus-visible:ring-offset-0 bg-muted/20 text-xs font-semibold"
                      {...field}
                      placeholder="•••••••••••••"
                      autoComplete="current-password"
                      data-form-type="other"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-transparent text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4.5 w-4.5 text-muted-foreground/80" />
                      ) : (
                        <Eye className="h-4.5 w-4.5 text-muted-foreground/80" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Remember Me checkbox */}
          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0 py-1">
                <FormControl>
                  <Checkbox
                    className="h-4 w-4 border border-primary rounded-md text-primary focus:ring-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <label
                  className="text-xs text-muted-foreground font-bold cursor-pointer select-none"
                  onClick={() => field.onChange(!field.value)}
                >
                  Remember Me
                </label>
              </FormItem>
            )}
          />

          {/* Sign In Button */}
          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-md transition-all shadow-primary/20 mt-2"
            disabled={isLoginLoading}
          >
            {isLoginLoading ? "Signing in..." : "Sign In"}
          </Button>

          {/* Create an Account link */}
          <div className="text-center text-xs text-muted-foreground mt-4 font-semibold">
            New here?{" "}
            <a href="/register" className="text-primary hover:underline font-bold">
              Create an Account
            </a>
          </div>
        </form>
      </Form>
    </div>
  );
}
