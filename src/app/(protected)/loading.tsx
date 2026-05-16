import { AuthLoading } from "@/components/auth-loading";

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <AuthLoading />
    </div>
  );
}
