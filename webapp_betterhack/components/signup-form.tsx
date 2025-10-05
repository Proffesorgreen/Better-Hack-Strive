// @/components/signup-form.tsx
'use client'; // This component now has client-side interaction

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// 1. Define the props our component will accept
interface SignupFormProps extends React.ComponentProps<typeof Card> {
  onSignupSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function SignupForm({
  className,
  onSignupSubmit, // Destructure the new props
  isLoading = false,
  error = null,
  ...props
}: SignupFormProps) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 2. Attach the passed-in onSignupSubmit handler */}
        <form onSubmit={onSignupSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              {/* 3. Add name attribute and disable on load */}
              <Input id="name" name="name" type="text" placeholder="John Doe" required disabled={isLoading} />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email" // Add name attribute
                type="email"
                placeholder="m@example.com"
                required
                disabled={isLoading}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" name="password" type="password" required disabled={isLoading} />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
              <Input id="confirm-password" name="confirmPassword" type="password" required disabled={isLoading} />
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {/* 4. Show loading state */}
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
                <Button variant="outline" type="button" className="w-full" disabled={isLoading}>
                  Sign up with Google
                </Button>
                
                {/* 5. Display any errors passed from the parent */}
                {error && <p className="text-sm text-center text-red-500">{error}</p>}

                <FieldDescription className="text-center">
                  Already have an account?{' '}
                  {/* 6. Use Next.js Link for better navigation */}
                  <Link href="/auth/signin" className="underline-offset-4 hover:underline">
                    Sign in
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
