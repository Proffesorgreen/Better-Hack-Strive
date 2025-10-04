"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { JsonEditor } from "@/components/json-editor"
import { FormPreview } from "@/components/form-preview"

const defaultSchema = `{
  "type": "login",
  "title": "Welcome back",
  "description": "Sign in to your account to continue",
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
      "placeholder": "Enter your password",
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
}`

export default function BuildPage() {
  const [jsonValue, setJsonValue] = useState(defaultSchema)
  const [parsedSchema, setParsedSchema] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonValue)
      setParsedSchema(parsed)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON")
      setParsedSchema(null)
    }
  }, [jsonValue])

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16 h-screen flex flex-col">
        <div className="border-b border-border bg-card/50 px-6 py-4">
          <h1 className="text-2xl font-bold">Playground</h1>
          <p className="text-sm text-muted-foreground">Edit the JSON schema and see the form update in real-time</p>
        </div>
        <div className="flex-1 grid md:grid-cols-2 overflow-hidden">
          <div className="border-r border-border bg-background">
            <div className="h-full">
              <JsonEditor value={jsonValue} onChange={setJsonValue} />
            </div>
          </div>
          <div className="bg-muted/20">
            <FormPreview schema={parsedSchema} error={error} />
          </div>
        </div>
      </div>
    </div>
  )
}
