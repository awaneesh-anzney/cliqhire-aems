"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePasswordReset } from "@/hooks/usePasswordReset";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must include one uppercase, one lowercase, and one number.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPassword({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { resetPassword, isResetPasswordPending, isResetPasswordSuccess } = usePasswordReset();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link. Please request a new one.");
      router.push("/forgot-password");
    }
  }, [token, router]);

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) {
      toast.error("Reset token is missing.");
      return;
    }
    resetPassword({ token, newPassword: values.newPassword });
  };

  if (isResetPasswordSuccess) {
    return (
      <div className={cn("flex w-full flex-col gap-6 items-center text-center", className)} {...props}>
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-[#2B3674]">Success!</h2>
        <p className="text-gray-500 max-w-sm">
          Your password has been successfully reset. You can now use your new password to log in.
        </p>
        <div className="flex flex-col gap-3 w-full mt-4">
          <Link href="/login" className="w-full">
            <Button className="w-full h-12 rounded-full bg-brand hover:bg-brand/90 text-white font-medium shadow-md shadow-brand/20">
              Go to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full flex-col gap-6", className)} {...props}>
      <h2 className="text-3xl font-bold tracking-tight text-[#2B3674] mb-2">Set New Password</h2>
      <p className="text-gray-500 mb-4 text-sm leading-relaxed">
        Your new password must be different from previous used passwords.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="New Password"
                      className="w-full pl-12 pr-12 h-12 rounded-full border-gray-200 focus-visible:ring-brand focus-visible:ring-offset-0 bg-white"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-xs ml-2" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm New Password"
                      className="w-full pl-12 pr-12 h-12 rounded-full border-gray-200 focus-visible:ring-brand focus-visible:ring-offset-0 bg-white"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-xs ml-2" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-12 rounded-full bg-brand hover:bg-brand/90 text-white font-medium text-base mt-2 shadow-md transition-all shadow-brand/20"
            disabled={isResetPasswordPending}
          >
            {isResetPasswordPending ? "Resetting password..." : "Reset Password"}
          </Button>

          <div className="text-center mt-6">
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand transition-colors"
            >
              Back to login
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
