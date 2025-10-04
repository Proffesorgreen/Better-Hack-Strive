"use client"

export default function LoginExamplePage() {
  return (
    <article className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-4">Login Form Example</h1>
      <p className="text-lg text-muted-foreground mb-8">
        A complete example of a login form with email and password fields.
      </p>

      <h2 className="text-2xl font-semibold mt-12 mb-4">Schema</h2>
      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto">
        <code className="text-sm font-mono">{`{
  "type": "login",
  "title": "Welcome back",
  "description": "Sign in to your account to continue",
  "fields": [
    {
      "name": "email",
      "type": "email",
      "label": "Email Address",
      "placeholder": "you@example.com",
      "required": true,
      "validation": {
        "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
      }
    },
    {
      "name": "password",
      "type": "password",
      "label": "Password",
      "placeholder": "Enter your password",
      "required": true,
      "validation": {
        "minLength": 8
      }
    }
  ],
  "submit": "Sign In",
  "footer": {
    "text": "Don't have an account?",
    "link": {
      "text": "Create one now",
      "href": "/signup"
    }
  }
}`}</code>
      </pre>

      <h2 className="text-2xl font-semibold mt-12 mb-4">Usage</h2>
      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto">
        <code className="text-sm font-mono">{`import { AuthForm } from 'declarative-auth-forms'
import schema from './login-schema.json'

export default function LoginPage() {
  return (
    <AuthForm 
      schema={schema}
      onSubmit={async (data) => {
        // Handle login
        console.log(data)
      }}
    />
  )
}`}</code>
      </pre>
    </article>
  )
}
