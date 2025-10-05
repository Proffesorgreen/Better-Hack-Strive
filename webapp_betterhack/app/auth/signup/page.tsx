// app/auth/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/betterauth-client';
import { FormBuilder } from '@/components/FormBuilder';
import { signupFormConfig } from '@/forms/signupFormConfig';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SignUpPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Custom action for the FormBuilder
  const handleSignupSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    setError(null);

    await authClient.signUp.email({
      name: data.name as string,
      email: data.email as string,
      password: data.password as string,
      callbackURL: "/",
    }, {
      onError: (ctx) => setError(ctx.error.message),
    }).finally(() => setIsSubmitting(false));
  };
  
  // Separate handler for Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError(null);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <FormBuilder
          config={signupFormConfig}
          onSubmitAction={handleSignupSubmit}
          isSubmitting={isSubmitting}
          submissionError={error}
        />
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <Card className="mt-6">
          <CardContent className="p-6">
            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
              {isSubmitting ? 'Redirecting...' : 'Sign up with Google'}
            </Button>
            <p className="mt-4 px-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/signin" className="underline hover:text-primary">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
