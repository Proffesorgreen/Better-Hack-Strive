"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { JsonEditor } from "@/components/json-editor"
import { FormBuilder } from "@/components/form-builder"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormConfigError, parseFormConfig } from "@/lib/form-parser"

const defaultSchema = `{
  "type": "login",
  "title": "Welcome back",
  "description": "Sign in to your account to continue",
  "endpoint": "/api/auth/login",
  "method": "POST",
  "fields": [
    {
      "name": "email",
      "type": "email",
      "label": "Email Address",
      "placeholder": "you@example.com",
      "validation": {
        "required": true
      }
    },
    {
      "name": "password",
      "type": "password",
      "label": "Password",
      "placeholder": "Enter your password",
      "validation": {
        "required": true,
        "minLength": 8
      }
    },
    {
      "name": "rememberMe",
      "type": "checkbox",
      "label": "Remember me",
      "description": "Keep me signed in on this device"
    }
  ],
  "submit": {
    "label": "Sign In",
    "loadingText": "Signing in..."
  }
}`

export default function BuildPage() {
  const [jsonValue, setJsonValue] = useState(defaultSchema)
  const [parsedSchema, setParsedSchema] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonValue)
      try {
        const validated = parseFormConfig(parsed)
        setParsedSchema(validated)
        setError(null)
      } catch (err) {
        if (err instanceof FormConfigError) {
          setError(
            err.issues.map((issue: any) => issue.message).join("\n")
          )
        } else {
          setError(err instanceof Error ? err.message : "Invalid schema")
        }
        setParsedSchema(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON")
      setParsedSchema(null)
    }
  }, [jsonValue])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="pt-16 border-b border-border bg-card">
        <div className="max-w-[1800px] mx-auto px-8 py-10">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <svg
                    className="h-6 w-6 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="9" x2="15" y2="9" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                </div>
                <h1 className="text-5xl font-bold tracking-tight">Playground</h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
                Edit the JSON schema and watch your form come to life in real-time. Experiment with different field
                types, validation rules, and layouts.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {error ? (
                <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-destructive/10 border border-destructive/20 shadow-sm">
                  <svg
                    className="h-5 w-5 text-destructive flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span className="text-sm font-semibold text-destructive">Invalid JSON</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-green-500/10 border border-green-500/20 shadow-sm">
                  <svg
                    className="h-5 w-5 text-green-600 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span className="text-sm font-semibold text-green-600">Valid Schema</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-2 overflow-hidden">
        <div className="border-r border-border bg-background overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto p-8">
            <div className="h-full min-h-[calc(100vh-280px)]">
              <JsonEditor value={jsonValue} onChange={setJsonValue} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-muted/30 via-muted/10 to-background overflow-auto">
          <div className="min-h-full p-12 flex items-center justify-center">
            {error ? (
              <Alert variant="destructive" className="max-w-2xl w-full shadow-lg">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <AlertDescription className="font-mono text-sm ml-2">{error}</AlertDescription>
              </Alert>
            ) : parsedSchema ? (
              <Card className="max-w-2xl w-full border-border bg-card shadow-2xl">
                <CardContent className="p-10">
                  <FormBuilder
                    config={parsedSchema}
                    onSubmitSuccess={(data) => {
                      console.log("[v0] Form submitted successfully:", data)
                    }}
                    onSubmitError={(error) => {
                      console.log("[v0] Form submission error:", error)
                    }}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="h-12 w-12 rounded-full border-2 border-muted-foreground/20 border-t-foreground animate-spin" />
                <p className="text-muted-foreground">Loading preview...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t border-border bg-card">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span>Declarative Auth Forms</span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <a href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </a>
              <a href="/docs/examples" className="text-muted-foreground hover:text-foreground transition-colors">
                Examples
              </a>
              <a
                href="https://github.com"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}