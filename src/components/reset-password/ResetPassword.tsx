"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Layers } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

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
import { usePasswordReset, useVerifyResetToken } from "@/hooks/usePasswordReset";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must include one uppercase, one lowercase, and one number.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPassword({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token") ?? null;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { resetPassword, isResetPasswordPending, isResetPasswordSuccess } = usePasswordReset();
  const { isValid, isLoading: isVerifying, isSuccess, isError } = useVerifyResetToken(token);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (token === null) {
      toast.error("Invalid reset link. Please request a new one.");
      router.push("/forgot-password");
    } else if (isSuccess && !isValid) {
      toast.error("Reset link is invalid or expired. Please request a new one.");
      router.push("/forgot-password");
    } else if (isError) {
      toast.error("Failed to verify reset link. Please try again.");
      router.push("/forgot-password");
    }
  }, [token, router, isSuccess, isValid, isError]);

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) {
      toast.error("Reset token is missing.");
      return;
    }
    resetPassword({ token, newPassword: values.newPassword });
  };

  if (isResetPasswordSuccess) {
    return (
      <div className={cn("space-y-6 text-center animate-in fade-in zoom-in-95 duration-500", className)} {...props}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-sm border border-primary/20">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">Password reset!</h2>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            Your password has been successfully updated. You can now use your new credentials to sign in.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/login" className="block w-full">
            <Button className="w-full h-12 rounded-xl font-bold text-base transition-all group">
              <span className="flex items-center justify-center">
                Sign In to Workspace
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 text-center space-y-4 animate-in fade-in duration-500", className)} {...props}>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold">Verifying reset link</h3>
          <p className="text-sm font-medium text-muted-foreground">Please wait while we validate your security token...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return null;
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <div className="mb-4 space-y-3 text-center md:text-left">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 md:hidden">
          <Layers className="h-6 w-6" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight">Set new password</h2>
        <p className="text-sm font-medium text-muted-foreground leading-relaxed">
          Create a strong, unique password to secure your account and workspace.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* New Password */}
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="group relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="New password (min. 8 characters)"
                      className="pl-11 pr-11 h-12 rounded-xl bg-background border-muted-foreground/20 focus-visible:ring-primary focus-visible:bg-background focus-visible:border-primary transition-all font-medium"
                      disabled={isResetPasswordPending}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="ml-1 text-xs" />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="group relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      className="pl-11 pr-11 h-12 rounded-xl bg-background border-muted-foreground/20 focus-visible:ring-primary focus-visible:bg-background focus-visible:border-primary transition-all font-medium"
                      disabled={isResetPasswordPending}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="ml-1 text-xs" />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 rounded-xl font-bold text-base mt-2 group transition-all"
            disabled={isResetPasswordPending}
          >
            {isResetPasswordPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Updating password...
              </>
            ) : (
              <span className="flex items-center justify-center">
                Update Password
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>

          {/* Back to login */}
          <div className="text-center pt-2">
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to sign in
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
