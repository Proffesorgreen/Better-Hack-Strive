export default function FieldTypesPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Field Types</h1>
      <p className="lead">
        Declarative Auth Forms supports various field types to build comprehensive authentication forms.
      </p>

      <h2>Text Input</h2>
      <p>Standard text input field for general text entry.</p>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>{`{
  "name": "username",
  "type": "text",
  "label": "Username",
  "placeholder": "Enter your username",
  "required": true
}`}</code>
      </pre>

      <h2>Email</h2>
      <p>Email input with built-in validation for email format.</p>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>{`{
  "name": "email",
  "type": "email",
  "label": "Email Address",
  "placeholder": "you@example.com",
  "required": true
}`}</code>
      </pre>

      <h2>Password</h2>
      <p>Password input with masked characters and optional strength indicator.</p>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>{`{
  "name": "password",
  "type": "password",
  "label": "Password",
  "placeholder": "Enter your password",
  "required": true,
  "minLength": 8
}`}</code>
      </pre>

      <h2>Checkbox</h2>
      <p>Checkbox input for boolean values, commonly used for terms acceptance.</p>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>{`{
  "name": "terms",
  "type": "checkbox",
  "label": "I agree to the terms and conditions",
  "required": true
}`}</code>
      </pre>

      <h2>Select</h2>
      <p>Dropdown select for choosing from predefined options.</p>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>{`{
  "name": "country",
  "type": "select",
  "label": "Country",
  "options": [
    { "value": "us", "label": "United States" },
    { "value": "uk", "label": "United Kingdom" },
    { "value": "ca", "label": "Canada" }
  ],
  "required": true
}`}</code>
      </pre>

      <h2>Phone</h2>
      <p>Phone number input with format validation.</p>
      <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
        <code>{`{
  "name": "phone",
  "type": "phone",
  "label": "Phone Number",
  "placeholder": "+1 (555) 000-0000",
  "required": false
}`}</code>
      </pre>

      <h2>Common Properties</h2>
      <p>All field types support these common properties:</p>
      <ul>
        <li>
          <code>name</code> - Unique identifier for the field
        </li>
        <li>
          <code>type</code> - The field type
        </li>
        <li>
          <code>label</code> - Display label for the field
        </li>
        <li>
          <code>placeholder</code> - Placeholder text
        </li>
        <li>
          <code>required</code> - Whether the field is required
        </li>
        <li>
          <code>disabled</code> - Whether the field is disabled
        </li>
        <li>
          <code>helperText</code> - Additional help text below the field
        </li>
      </ul>
    </div>
  )
}
