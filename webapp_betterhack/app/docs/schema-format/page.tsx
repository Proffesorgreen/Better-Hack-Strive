export default function SchemaFormatPage() {
  return (
    <article className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-4">Schema Format</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Learn about the JSON schema format used to define authentication forms.
      </p>

      <h2 className="text-2xl font-semibold mt-12 mb-4">Basic Structure</h2>
      <p className="text-muted-foreground leading-relaxed">
        Every form schema follows a consistent structure with the following top-level properties:
      </p>

      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto mt-4">
        <code className="text-sm font-mono">{`{
  "type": "login" | "signup" | "reset-password",
  "title": "Optional form title",
  "description": "Optional form description",
  "fields": [...],
  "submit": "Submit button text",
  "footer": {...}
}`}</code>
      </pre>

      <h2 className="text-2xl font-semibold mt-12 mb-4">Field Definition</h2>
      <p className="text-muted-foreground leading-relaxed">
        Each field in the <code className="text-accent">fields</code> array defines an input with the following
        properties:
      </p>

      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto mt-4">
        <code className="text-sm font-mono">{`{
  "name": "fieldName",
  "type": "text" | "email" | "password" | "tel" | "url",
  "label": "Field Label",
  "placeholder": "Optional placeholder",
  "required": true | false,
  "validation": {
    "minLength": 8,
    "maxLength": 100,
    "pattern": "regex pattern"
  }
}`}</code>
      </pre>

      <h2 className="text-2xl font-semibold mt-12 mb-4">Footer Configuration</h2>
      <p className="text-muted-foreground leading-relaxed">Add links or additional text below the form:</p>

      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto mt-4">
        <code className="text-sm font-mono">{`{
  "footer": {
    "text": "Don't have an account?",
    "link": {
      "text": "Sign up",
      "href": "/signup"
    }
  }
}`}</code>
      </pre>
    </article>
  )
}
