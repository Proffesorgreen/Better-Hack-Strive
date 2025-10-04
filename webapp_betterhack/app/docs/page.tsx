import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DocsPage() {
  return (
    <article className="max-w-none">
      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Introduction</h1>
        <p className="text-xl text-muted-foreground">
          Welcome to Declarative Auth Forms - a modern approach to building authentication UIs with JSON Schema and
          shadcn/ui.
        </p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">What is Declarative Auth Forms?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Declarative Auth Forms is a library that allows you to define authentication forms using simple JSON
            schemas. Instead of writing repetitive form code, you describe what you want, and the library generates
            beautiful, accessible forms styled with shadcn/ui components.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Key Features</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">•</span>
              <span>Define forms with declarative JSON schemas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">•</span>
              <span>Built on shadcn/ui for beautiful, accessible components</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">•</span>
              <span>Seamless integration with Better Auth</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">•</span>
              <span>Type-safe with TypeScript support</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">•</span>
              <span>Customizable validation and styling</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">•</span>
              <span>Zero configuration required</span>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Quick Example</h2>
          <p className="text-muted-foreground leading-relaxed">Here's a simple login form defined with JSON:</p>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-muted/30">
              <span className="text-xs font-mono text-muted-foreground">schema.json</span>
            </div>
            <pre className="p-4 overflow-x-auto">
              <code className="text-sm font-mono text-foreground">{`{
  "type": "login",
  "fields": [
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
      "required": true
    }
  ],
  "submit": "Sign In",
  "footer": {
    "text": "Don't have an account?",
    "link": {
      "text": "Sign up",
      "href": "/signup"
    }
  }
}`}</code>
            </pre>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            This JSON schema automatically generates a fully functional, styled login form with validation, error
            handling, and accessibility features built in.
          </p>
        </section>

        <div className="flex gap-4 pt-4">
          <Button asChild size="lg">
            <Link href="/docs/installation">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/build">Try Playground</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
