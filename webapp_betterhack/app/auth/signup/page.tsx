// @/app/signup/page.tsx
'use client'; // This page now handles client-side state and events

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/betterauth-client'; // Import our Better Auth client
import { SignupForm } from '@/components/signup-form';

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Define the submission logic in the parent
  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // 1. Add client-side validation for matching passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return; // Stop the submission
    }

    // 2. Use the Better Auth client to sign up
    await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/chat", // Where to redirect after successful signup
    }, {
      onSuccess: () => {
        // Library handles redirection. You can also manually redirect:
        // router.push('/chat');
      },
      onError: (ctx) => {
        // Display error message from the API
        setError(ctx.error.message);
        setIsLoading(false);
      },
    });
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {/* 3. Pass the state and handler down as props */}
        <SignupForm
          onSignupSubmit={handleSignupSubmit}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
