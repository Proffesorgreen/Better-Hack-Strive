// @/app/login/page.tsx
'use client';

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/betterauth-client";
import { LoginForm } from "@/components/login-form";

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await authClient.signIn.email({
      email,
      password,
      callbackURL: "/chat",
    }, {
      onSuccess: () => {
        // You can let the library handle redirection or do it manually
        // router.push('/chat');
      },
      onError: (ctx) => {
        setError(ctx.error.message);
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {/* 4. PASS the prop with its new name */}
        <LoginForm
          onLoginSubmit={handleLoginSubmit}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
