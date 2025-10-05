// app/auth/signin/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/betterauth-client';
import { FormBuilder } from '@/components/FormBuilder';
import { loginFormConfig } from '@/forms/loginFormConfig';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Custom action for the FormBuilder
  const handleLoginSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    setError(null);

    await authClient.signIn.email({
      email: data.email as string,
      password: data.password as string,
      callbackURL: "/dashboard",
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
      callbackURL: "/dashboard",
    });
    // No need for finally, as the page will redirect
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <FormBuilder
          config={loginFormConfig}
          onSubmitAction={handleLoginSubmit}
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
              {isSubmitting ? 'Redirecting...' : 'Login with Google'}
            </Button>
            <p className="mt-4 px-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="underline hover:text-primary">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
