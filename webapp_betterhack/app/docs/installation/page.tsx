export default function InstallationPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Installation</h1>
      <p className="lead">Get started with Declarative Auth Forms in your Next.js project.</p>

      <h2>Prerequisites</h2>
      <p>Before you begin, make sure you have the following installed:</p>
      <ul>
        <li>Node.js 18.17 or later</li>
        <li>A Next.js 15 project with App Router</li>
        <li>shadcn/ui components set up in your project</li>
      </ul>

      <h2>Install Dependencies</h2>
      <p>Install the required packages:</p>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>npm install declarative-auth-forms react-hook-form zod</code>
      </pre>

      <h2>Set Up Better Auth</h2>
      <p>If you haven't already, install and configure Better Auth:</p>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>npm install better-auth</code>
      </pre>

      <p>
        Create a <code>lib/auth.ts</code> file with your Better Auth configuration:
      </p>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>{`import { betterAuth } from "better-auth"

export const auth = betterAuth({
  database: {
    // Your database configuration
  },
  emailAndPassword: {
    enabled: true,
  },
})`}</code>
      </pre>

      <h2>Add shadcn/ui Components</h2>
      <p>Make sure you have the required shadcn/ui components:</p>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>npx shadcn@latest add button input label card</code>
      </pre>

      <h2>Quick Start</h2>
      <p>Create your first declarative auth form:</p>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>{`import { AuthForm } from "declarative-auth-forms"

const loginSchema = {
  type: "login",
  title: "Welcome back",
  fields: [
    {
      name: "email",
      type: "email",
      label: "Email",
      required: true
    },
    {
      name: "password",
      type: "password",
      label: "Password",
      required: true
    }
  ],
  submit: "Sign In"
}

export default function LoginPage() {
  return <AuthForm schema={loginSchema} />
}`}</code>
      </pre>

      <p>That's it! You now have a fully functional authentication form.</p>
    </div>
  )
}
