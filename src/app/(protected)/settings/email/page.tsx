"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SettingsEmailRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Collect the query parameters from the backend redirect
    const params = new URLSearchParams(searchParams?.toString() || "");
    
    // Redirect the user back to the actual email page with the query params
    // so that the toasts can be shown correctly.
    router.replace(`/email?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-transparent">
      <div className="flex items-center gap-3 text-sm text-muted-foreground font-semibold">
        <span className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Completing mailbox connection...</span>
      </div>
    </div>
  );
}
