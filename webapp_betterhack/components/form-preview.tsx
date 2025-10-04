"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface FormSchema {
  type?: string
  title?: string
  description?: string
  fields?: Array<{
    name: string
    type: string
    label: string
    placeholder?: string
    required?: boolean
  }>
  submit?: string
  footer?: {
    text?: string
    link?: {
      text: string
      href: string
    }
  }
}

interface FormPreviewProps {
  schema: FormSchema | null
  error: string | null
}

export function FormPreview({ schema, error }: FormPreviewProps) {
  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="max-w-md w-full bg-destructive/10 border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid JSON</CardTitle>
            <CardDescription className="text-destructive/80">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!schema || !schema.fields || schema.fields.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="max-w-md w-full bg-muted/50">
          <CardHeader>
            <CardTitle className="text-muted-foreground">No Preview</CardTitle>
            <CardDescription>Enter a valid JSON schema to see the form preview</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full p-8 overflow-y-auto">
      <Card className="max-w-md w-full">
        <CardHeader>
          {schema.title && <CardTitle>{schema.title}</CardTitle>}
          {schema.description && <CardDescription>{schema.description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          {schema.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                required={field.required}
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full">{schema.submit || "Submit"}</Button>
          {schema.footer && (
            <div className="text-sm text-center text-muted-foreground">
              {schema.footer.text}{" "}
              {schema.footer.link && (
                <Link href={schema.footer.link.href} className="text-accent hover:underline">
                  {schema.footer.link.text}
                </Link>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
