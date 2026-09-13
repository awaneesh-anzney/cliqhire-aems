"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Layers } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { usePasswordReset } from "@/hooks/usePasswordReset";

const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const { forgotPassword, isForgotPasswordPending, isForgotPasswordSuccess } = usePasswordReset();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    forgotPassword(values.email);
  };

  if (isForgotPasswordSuccess) {
    return (
      <div className={cn("space-y-6 text-center animate-in fade-in zoom-in-95 duration-500", className)} {...props}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-sm border border-primary/20">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">Check your email</h2>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            We have sent a password reset link to{" "}
            <span className="font-semibold text-foreground break-all">{form.getValues("email")}</span>.
          </p>
          <p className="text-xs text-muted-foreground/80 pt-1">
            Didn&apos;t receive the email? Check your spam folder or try again below.
          </p>
        </div>
        <div className="space-y-3 pt-2">
          <Button 
            type="button"
            onClick={() => window.location.reload()}
            variant="outline" 
            className="w-full h-12 rounded-xl border-muted-foreground/20 font-bold hover:bg-muted transition-all text-foreground"
          >
            Try another email
          </Button>
          <Link href="/login" className="block w-full">
            <Button className="w-full h-12 rounded-xl font-bold text-base transition-all group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <div className="mb-4 space-y-3 text-center md:text-left">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 md:hidden">
          <Layers className="h-6 w-6" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight">Forgot password?</h2>
        <p className="text-sm font-medium text-muted-foreground leading-relaxed">
          Enter your registered email address and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="group relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="Email address"
                      className="pl-11 h-12 rounded-xl bg-background border-muted-foreground/20 focus-visible:ring-primary focus-visible:bg-background focus-visible:border-primary transition-all font-medium"
                      disabled={isForgotPasswordPending}
                      autoComplete="email"
                    />
                  </div>
                </FormControl>
                <FormMessage className="ml-1 text-xs" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-12 rounded-xl font-bold text-base mt-2 group transition-all"
            disabled={isForgotPasswordPending}
          >
            {isForgotPasswordPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sending reset link...
              </>
            ) : (
              <span className="flex items-center justify-center">
                Send Reset Link
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>

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
