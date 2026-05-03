"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call for forgot password
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Example implementation if authService had a forgotPassword method:
      // await authService.forgotPassword(values.email);
      
      toast.success("Password reset link sent!");
      setIsSubmitted(true);
    } catch (error) {
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={cn("flex w-full flex-col gap-6 items-center text-center", className)} {...props}>
        <div className="h-16 w-16 bg-brand/10 rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 className="h-8 w-8 text-brand" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-[#2B3674]">Check your email</h2>
        <p className="text-gray-500 max-w-sm">
          We have sent a password reset link to <span className="font-semibold text-[#2B3674]">{form.getValues("email")}</span>. 
        </p>
        <p className="text-sm text-gray-500">
          Didn't receive the email? Check your spam folder or try again.
        </p>
        <div className="flex flex-col gap-3 w-full mt-4">
          <Button 
            onClick={() => setIsSubmitted(false)}
            variant="outline" 
            className="w-full h-12 rounded-full border-gray-200 text-[#2B3674] hover:bg-gray-50 font-medium"
          >
            Try another email
          </Button>
          <Link href="/login" className="w-full">
            <Button className="w-full h-12 rounded-full bg-brand hover:bg-brand/90 text-white font-medium shadow-md shadow-brand/20">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full flex-col gap-6", className)} {...props}>
      <h2 className="text-3xl font-bold tracking-tight text-[#2B3674] mb-2">Forgot Password</h2>
      <p className="text-gray-500 mb-4 text-sm leading-relaxed">
        Enter the email address associated with your account and we'll send you a link to reset your password.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email address"
                      className="w-full pl-12 h-12 rounded-full border-gray-200 focus-visible:ring-brand focus-visible:ring-offset-0 bg-white"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-xs ml-2" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-12 rounded-full bg-brand hover:bg-brand/90 text-white font-medium text-base mt-2 shadow-md transition-all shadow-brand/20"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending reset link..." : "Send Reset Link"}
          </Button>

          <div className="text-center mt-6">
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
