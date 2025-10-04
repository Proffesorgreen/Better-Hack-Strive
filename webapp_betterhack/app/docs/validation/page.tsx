export default function ValidationPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Validation</h1>
      <p className="lead">
        Declarative Auth Forms uses Zod for powerful, type-safe validation with automatic error messages.
      </p>

      <h2>Built-in Validation</h2>
      <p>Each field type comes with sensible default validation:</p>
      <ul>
        <li>
          <strong>Email</strong> - Validates proper email format
        </li>
        <li>
          <strong>Password</strong> - Enforces minimum length requirements
        </li>
        <li>
          <strong>Phone</strong> - Validates phone number format
        </li>
        <li>
          <strong>Required</strong> - Ensures field is not empty
        </li>
      </ul>

      <h2>Required Fields</h2>
      <p>
        Mark fields as required using the <code>required</code> property:
      </p>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>{`{
  "name": "email",
  "type": "email",
  "label": "Email Address",
  "required": true
}`}</code>
      </pre>

      <h2>String Length Validation</h2>
      <p>Control minimum and maximum length for text inputs:</p>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>{`{
  "name": "password",
  "type": "password",
  "label": "Password",
  "required": true,
  "minLength": 8,
  "maxLength": 128
}`}</code>
      </pre>

      <h2>Pattern Matching</h2>
      <p>Use regex patterns for custom validation:</p>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>{`{
  "name": "username",
  "type": "text",
  "label": "Username",
  "pattern": "^[a-zA-Z0-9_]+$",
  "patternMessage": "Username can only contain letters, numbers, and underscores"
}`}</code>
      </pre>

      <h2>Custom Error Messages</h2>
      <p>Override default error messages with custom text:</p>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>{`{
  "name": "email",
  "type": "email",
  "label": "Email Address",
  "required": true,
  "errorMessages": {
    "required": "Please enter your email address",
    "invalid": "Please enter a valid email address"
  }
}`}</code>
      </pre>

      <h2>Password Confirmation</h2>
      <p>Validate that two password fields match:</p>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>{`{
  "fields": [
    {
      "name": "password",
      "type": "password",
      "label": "Password",
      "required": true,
      "minLength": 8
    },
    {
      "name": "confirmPassword",
      "type": "password",
      "label": "Confirm Password",
      "required": true,
      "matchField": "password",
      "matchMessage": "Passwords do not match"
    }
  ]
}`}</code>
      </pre>

      <h2>Real-time Validation</h2>
      <p>
        Validation runs automatically as users type, providing immediate feedback. Error messages appear below fields
        when validation fails.
      </p>

      <h2>Server-side Validation</h2>
      <p>
        While client-side validation provides instant feedback, always validate on the server as well. Better Auth
        handles server-side validation automatically when you submit the form.
      </p>
    </div>
  )
}
