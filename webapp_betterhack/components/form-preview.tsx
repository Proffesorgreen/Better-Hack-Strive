
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"

interface FormPreviewProps {
  schema: any | null
  error: string | null
}

export function FormPreview({ schema, error }: FormPreviewProps) {
  const [currentStep, setCurrentStep] = useState(0)

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

  if (!schema) {
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

  const renderField = (field: any) => {
    const { name, type, label, placeholder, autoComplete, defaultValue, description } = field
    const isRequired = !!field?.validation?.required

    return (
      <div key={name} className="space-y-2">
        {type === "toggle" ? (
          <>
            <div className="flex items-center space-x-2">
              <Switch id={name} defaultChecked={defaultValue} />
              <Label htmlFor={name}>{label}</Label>
            </div>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </>
        ) : (
          <>
            <Label htmlFor={name}>
              {label}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={name}
              name={name}
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              required={isRequired}
            />
          </>
        )}
      </div>
    )
  }

  const renderSingleForm = () => (
    <>
      <CardHeader>
        {schema.title && <CardTitle>{schema.title}</CardTitle>}
        {schema.description && <CardDescription>{schema.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {schema.fields?.map((field: any) => renderField(field))}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full">
          {typeof schema.submit === "string" ? schema.submit : schema.submit?.label || "Submit"}
        </Button>
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
    </>
  )

  const renderMultiStepForm = () => {
    if (!schema.steps || schema.steps.length === 0) return null

    const step = schema.steps[currentStep]
    const isLastStep = currentStep === schema.steps.length - 1

    return (
      <>
        <CardHeader>
          {step.title && <CardTitle>{step.title}</CardTitle>}
          {step.progressLabel && <CardDescription>{step.progressLabel}</CardDescription>}
          {step.description && <CardDescription>{step.description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          {step.fields?.map((fieldName: string) => {
            const field = schema.fields?.find((f: any) => f.name === fieldName)
            if (!field) return null
            return renderField(field)
          })}
        </CardContent>
        <CardFooter className="flex justify-between">
          {currentStep > 0 && (
            <Button variant="outline" onClick={() => setCurrentStep((prev) => prev - 1)}>
              {step.previousLabel || "Back"}
            </Button>
          )}
          <Button
            onClick={() => {
              if (!isLastStep) {
                setCurrentStep((prev) => prev + 1)
              } // else submit (preview, so no action)
            }}
          >
            {step.nextLabel || (isLastStep ? (schema.submit?.label || "Submit") : "Next")}
          </Button>
        </CardFooter>
      </>
    )
  }

  return (
    <div className="flex items-center justify-center h-full p-8 overflow-y-auto">
      <Card className="max-w-md w-full">
        {schema.steps?.length > 0 ? renderMultiStepForm() : renderSingleForm()}
      </Card>
    </div>
  )
}