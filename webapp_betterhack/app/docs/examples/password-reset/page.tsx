"use client"

export default function PasswordResetExamplePage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Password Reset Example</h1>
      <p className="lead">A two-step password reset flow with email verification.</p>

      <h2>Step 1: Request Reset</h2>
      <p>First, users enter their email to request a password reset link.</p>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>{`{
  "type": "password-reset-request",
  "title": "Reset your password",
  "description": "Enter your email and we'll send you a reset link",
  "fields": [
    {
      "name": "email",
      "type": "email",
      "label": "Email Address",
      "placeholder": "you@example.com",
      "required": true
    }
  ],
  "submit": "Send Reset Link",
  "footer": {
    "text": "Remember your password?",
    "link": {
      "text": "Sign in",
      "href": "/login"
    }
  }
}`}</code>
      </pre>

      <h2>Step 2: Reset Password</h2>
      <p>After clicking the email link, users can set a new password.</p>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>{`{
  "type": "password-reset",
  "title": "Create new password",
  "description": "Enter a strong password for your account",
  "fields": [
    {
      "name": "password",
      "type": "password",
      "label": "New Password",
      "placeholder": "Enter your new password",
      "required": true,
      "minLength": 8
    },
    {
      "name": "confirmPassword",
      "type": "password",
      "label": "Confirm Password",
      "placeholder": "Re-enter your new password",
      "required": true,
      "matchField": "password"
    }
  ],
  "submit": "Reset Password"
}`}</code>
      </pre>

      <h2>Implementation</h2>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>{`// app/reset-password/page.tsx
import { AuthForm } from "declarative-auth-forms"
import requestSchema from "./request-schema.json"

export default function RequestResetPage() {
  const handleRequest = async (data: any) => {
    const response = await fetch("/api/auth/reset-password/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    
    if (response.ok) {
      // Show success message
      alert("Check your email for a reset link")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AuthForm 
        schema={requestSchema} 
        onSubmit={handleRequest}
      />
    </div>
  )
}

// app/reset-password/confirm/page.tsx
import { AuthForm } from "declarative-auth-forms"
import resetSchema from "./reset-schema.json"

export default function ConfirmResetPage() {
  const handleReset = async (data: any) => {
    const token = new URLSearchParams(window.location.search).get("token")
    
    const response = await fetch("/api/auth/reset-password/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, token }),
    })
    
    if (response.ok) {
      window.location.href = "/login"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AuthForm 
        schema={resetSchema} 
        onSubmit={handleReset}
      />
    </div>
  )
}`}</code>
      </pre>

      <h2>Security Considerations</h2>
      <ul>
        <li>Reset tokens should expire after a short period (e.g., 1 hour)</li>
        <li>Tokens should be single-use only</li>
        <li>Always validate tokens on the server</li>
        <li>Don't reveal whether an email exists in the system</li>
        <li>Rate limit reset requests to prevent abuse</li>
      </ul>

      <h2>Email Template</h2>
      <p>Your password reset email should include:</p>
      <ul>
        <li>Clear subject line: "Reset your password"</li>
        <li>Explanation of why they received the email</li>
        <li>Prominent reset button/link</li>
        <li>Token expiration time</li>
        <li>Instructions to ignore if they didn't request it</li>
      </ul>
    </div>
  )
}
