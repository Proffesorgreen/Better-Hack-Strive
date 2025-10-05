"use client"

export default function SignupExamplePage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Signup Form Example</h1>
      <p className="lead">A complete signup form with email, password confirmation, and terms acceptance.</p>

      <h2>Schema Definition</h2>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>{`{
  "type": "signup",
  "title": "Create your account",
  "description": "Get started with your free account today",
  "fields": [
    {
      "name": "name",
      "type": "text",
      "label": "Full Name",
      "placeholder": "John Doe",
      "required": true
    },
    {
      "name": "email",
      "type": "email",
      "label": "Email Address",
      "placeholder": "you@example.com",
      "required": true
    },
    {
      "name": "password",
      "type": "password",
      "label": "Password",
      "placeholder": "Create a strong password",
      "required": true,
      "minLength": 8
    },
    {
      "name": "confirmPassword",
      "type": "password",
      "label": "Confirm Password",
      "placeholder": "Re-enter your password",
      "required": true,
      "matchField": "password"
    },
    {
      "name": "terms",
      "type": "checkbox",
      "label": "I agree to the Terms of Service and Privacy Policy",
      "required": true
    }
  ],
  "submit": "Create Account",
  "footer": {
    "text": "Already have an account?",
    "link": {
      "text": "Sign in",
      "href": "/login"
    }
  }
}`}</code>
      </pre>

      <h2>Implementation</h2>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>{`import { AuthForm } from "declarative-auth-forms"
import signupSchema from "./signup-schema.json"

export default function SignupPage() {
  const handleSignup = async (data: any) => {
    // Handle signup with Better Auth
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    
    if (response.ok) {
      // Redirect to dashboard or login
      window.location.href = "/"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AuthForm 
        schema={signupSchema} 
        onSubmit={handleSignup}
      />
    </div>
  )
}`}</code>
      </pre>

      <h2>Features</h2>
      <ul>
        <li>Full name collection for personalization</li>
        <li>Email validation with proper format checking</li>
        <li>Password strength requirements (minimum 8 characters)</li>
        <li>Password confirmation to prevent typos</li>
        <li>Terms and conditions acceptance checkbox</li>
        <li>Link to login page for existing users</li>
      </ul>

      <h2>Customization</h2>
      <p>You can customize the signup form by:</p>
      <ul>
        <li>Adding additional fields like phone number or company name</li>
        <li>Adjusting password requirements (length, complexity)</li>
        <li>Customizing error messages</li>
        <li>Adding social signup options</li>
        <li>Implementing email verification flow</li>
      </ul>
    </div>
  )
}
