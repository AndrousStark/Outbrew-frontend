"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MobiadzRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/mobiadz-extraction");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#050505]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-3 text-sm text-neutral-400">Redirecting...</p>
      </div>
    </div>
  );
}
