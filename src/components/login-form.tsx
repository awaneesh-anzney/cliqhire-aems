"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, User } from "lucide-react";
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
        // Reset form after failed login
        form.reset();
      }
    } catch (error) {
      console.error('LoginForm: Login error caught:', error);
      toast.error(error instanceof Error ? error.message : "Login failed");
      // Reset form after error
      form.reset();
    }
  };

  return (
    <div className={cn("flex w-full flex-col gap-8", className)} {...props}>
      <h2 className="text-3xl font-bold tracking-tight text-[#2B3674] mb-2">Sign In</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="Username or email"
                      className="w-full pl-12 h-12 rounded-full border-border focus-visible:ring-brand focus-visible:ring-offset-0 bg-card"
                      data-form-type="other"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-12 pr-12 h-12 rounded-full border-border focus-visible:ring-brand focus-visible:ring-offset-0 bg-card"
                      {...field}
                      placeholder="Password"
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
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between mt-4">
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <label className="text-sm text-muted-foreground font-medium cursor-pointer" onClick={() => field.onChange(!field.value)}>
                    Remember me
                  </label>
                </FormItem>
              )}
            />
            <a href="/forgot-password" className="text-sm text-muted-foreground hover:text-brand">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-full bg-brand hover:bg-brand/90 text-white font-medium text-base mt-4 shadow-md transition-all shadow-brand/20"
            disabled={isLoginLoading}
          >
            {isLoginLoading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center text-sm text-muted-foreground mt-6">
            New here?{" "}
            <a href="/register" className="text-brand hover:underline font-medium">
              Create an Account
            </a>
          </div>
        </form>
      </Form>
    </div>
  );
}
