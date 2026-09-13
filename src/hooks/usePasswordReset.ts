import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { toast } from "sonner";

export function usePasswordReset() {
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authService.resetPassword(token, newPassword),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reset password");
    },
  });

  return {
    forgotPassword: forgotPasswordMutation.mutate,
    isForgotPasswordPending: forgotPasswordMutation.isPending,
    isForgotPasswordSuccess: forgotPasswordMutation.isSuccess,
    forgotPasswordError: forgotPasswordMutation.error,

    resetPassword: resetPasswordMutation.mutate,
    isResetPasswordPending: resetPasswordMutation.isPending,
    isResetPasswordSuccess: resetPasswordMutation.isSuccess,
    resetPasswordError: resetPasswordMutation.error,
  };
}

export function useVerifyResetToken(token: string | null) {
  const { data, isPending, isFetching, isSuccess, isError, error } = useQuery({
    queryKey: ["verifyResetToken", token],
    queryFn: () => {
      if (!token) throw new Error("No token provided");
      return authService.verifyResetToken(token);
    },
    enabled: !!token,
    retry: false,
  });

  return {
    isValid: data?.valid ?? false,
    message: data?.message,
    isLoading: isPending || isFetching,
    isSuccess,
    isError,
    error,
  };
}
