"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactElement } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import type { Control, ControllerRenderProps, Path } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { buildBackendValidator, parseFormConfig } from "@/lib/form-parser"
import { cn } from "@/lib/utils"
import type { FormConfig, FormField, FormStep, StaticOption, VisibilityRule } from "@/types/form.types"

interface FormBuilderProps {
  config: FormConfig
  onSubmitSuccess?: (data: Record<string, unknown>) => void
  onSubmitError?: (error: unknown) => void
}

type FieldOptionsState = {
  options: StaticOption[]
  loading: boolean
  error: string | null
}

type FieldVisibilityValues = Record<string, unknown>

const getColSpanClass = (field: FormField) => {
  if (field.layout?.colSpan) {
    return `md:col-span-${field.layout.colSpan}`
  }

  switch (field.layout?.width) {
    case "half":
      return "md:col-span-6"
    case "third":
      return "md:col-span-4"
    default:
      return "md:col-span-12"
  }
}

const evaluateVisibility = (rules: VisibilityRule[] | undefined, values: FieldVisibilityValues) => {
  if (!rules?.length) {
    return true
  }

  return rules.every((rule) => {
    const target = values[rule.field]

    switch (rule.operator) {
      case "equals":
        return target === rule.value
      case "notEquals":
        return target !== rule.value
      case "in":
        return Array.isArray(rule.value) ? rule.value.includes(target) : false
      case "notIn":
        return Array.isArray(rule.value) ? !rule.value.includes(target) : true
      case "exists":
        return target !== undefined && target !== null && target !== ""
      case "greaterThan":
        return typeof target === "number" && typeof rule.value === "number" ? target > rule.value : false
      case "lessThan":
        return typeof target === "number" && typeof rule.value === "number" ? target < rule.value : false
      default:
        return true
    }
  })
}

const extractRemoteOptions = (payload: unknown, labelKey: string, valueKey: string): StaticOption[] => {
  const candidates = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as Record<string, unknown>)?.data)
      ? ((payload as Record<string, unknown>).data as unknown[])
      : Array.isArray((payload as Record<string, unknown>)?.items)
        ? ((payload as Record<string, unknown>).items as unknown[])
        : Array.isArray((payload as Record<string, unknown>)?.results)
          ? ((payload as Record<string, unknown>).results as unknown[])
          : []

  return candidates
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null
      }
      const record = item as Record<string, unknown>
      const label = record[labelKey]
      const value = record[valueKey]
      if (
        (typeof label === "string" || typeof label === "number") &&
        (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
      ) {
        return {
          label: String(label),
          value,
        } satisfies StaticOption
      }
      return null
    })
    .filter((option): option is StaticOption => option !== null)
}

const useFieldOptions = (field: FormField): FieldOptionsState => {
  const [state, setState] = useState<FieldOptionsState>({
    options: field.options ?? [],
    loading: Boolean(field.dataSource),
    error: null,
  })

  useEffect(() => {
    setState({
      options: field.options ?? [],
      loading: Boolean(field.dataSource),
      error: null,
    })
  }, [field.options, field.dataSource])

  useEffect(() => {
    if (!field.dataSource) {
      return
    }

    const dataSource = field.dataSource
    let cancelled = false
    const abortController = new AbortController()

    async function load() {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const response = await fetch(dataSource.endpoint, {
          method: dataSource.method ?? "GET",
          headers: {
            ...(dataSource.method === "POST" ? { "Content-Type": "application/json" } : {}),
            ...dataSource.headers,
          },
          body:
            dataSource.method === "POST" && dataSource.payloadTemplate
              ? JSON.stringify(dataSource.payloadTemplate)
              : undefined,
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const json = await response.json()
        const labelKey = dataSource.pagination?.labelKey ?? "label"
        const valueKey = dataSource.pagination?.valueKey ?? "value"
        const options = extractRemoteOptions(json, labelKey, valueKey)

        if (!cancelled) {
          setState({ options, loading: false, error: null })
        }
      } catch (error) {
        if (cancelled) {
          return
        }

        setState({
          options: field.options ?? [],
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load options",
        })
      }
    }

    load()

    return () => {
      cancelled = true
      abortController.abort()
    }
  }, [field.dataSource, field.options])

  return state
}

interface FieldRendererProps {
  field: FormField
  control: Control<Record<string, unknown>>
  renderFieldControl: (
    field: FormField,
    fieldProps: ControllerRenderProps<Record<string, unknown>, string>,
    optionsState: FieldOptionsState,
  ) => ReactElement
  error?: string
  isVisible: boolean
}

const FieldRenderer = ({ field, control, renderFieldControl, error, isVisible }: FieldRendererProps) => {
  const optionsState = useFieldOptions(field)

  if (!isVisible) {
    return null
  }

  return (
    <div className={cn("space-y-2", getColSpanClass(field))}>
      <div>
        {field.label && (
          <label htmlFor={field.name} className="text-sm font-medium">
            {field.label}
          </label>
        )}
        <div className="mt-1.5">
          <Controller
            name={field.name}
            control={control}
            render={({ field: fieldProps }) => renderFieldControl(field, fieldProps, optionsState)}
          />
        </div>
        {field.description && <p className="text-sm text-muted-foreground mt-1.5">{field.description}</p>}
        {field.helpText && <p className="text-sm text-muted-foreground mt-1.5">{field.helpText}</p>}
        {optionsState.loading && <p className="text-sm text-muted-foreground mt-1.5">Loading options…</p>}
        {(error || optionsState.error) && (
          <p className="text-sm text-destructive mt-1.5">{error ?? optionsState.error ?? ""}</p>
        )}
      </div>
    </div>
  )
}

export const FormBuilder = ({ config, onSubmitError, onSubmitSuccess }: FormBuilderProps) => {
  const router = useRouter()
  const normalizedConfig = useMemo(() => parseFormConfig(config), [config])
  const schema = useMemo(() => buildBackendValidator(normalizedConfig), [normalizedConfig])
  const steps = useMemo<FormStep[]>(() => {
    const base: FormStep[] =
      normalizedConfig.steps && normalizedConfig.steps.length > 0
        ? normalizedConfig.steps
        : [
            {
              id: "__all__",
              title: normalizedConfig.title,
              description: normalizedConfig.description,
              fields: normalizedConfig.fields.map((field) => field.name),
            },
          ]

    const sanitized = base
      .map((step) => ({
        ...step,
        fields: step.fields.filter((fieldName) => normalizedConfig.fields.some((field) => field.name === fieldName)),
      }))
      .filter((step) => step.fields.length > 0)

    if (sanitized.length === 0) {
      return [
        {
          id: "__all__",
          title: normalizedConfig.title,
          description: normalizedConfig.description,
          fields: normalizedConfig.fields.map((field) => field.name),
        },
      ]
    }

    return sanitized
  }, [normalizedConfig])

  const isMultiStep = normalizedConfig.steps !== undefined && steps.length > 1

  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  useEffect(() => {
    setCurrentStepIndex(0)
  }, [steps])

  const currentStep = steps[currentStepIndex] ?? steps[0]

  const fieldMap = useMemo(() => {
    const map = new Map<string, FormField>()
    normalizedConfig.fields.forEach((field) => {
      map.set(field.name, field)
    })
    return map
  }, [normalizedConfig.fields])

  const fieldsForCurrentStep: FormField[] = useMemo(() => {
    if (!currentStep) {
      return normalizedConfig.fields
    }

    return currentStep.fields
      .map((fieldName) => fieldMap.get(fieldName))
      .filter((field): field is FormField => Boolean(field))
  }, [currentStep, fieldMap, normalizedConfig.fields])

  type FormValues = z.infer<typeof schema>

  const defaultValues = useMemo(() => {
    const values: Record<string, unknown> = {}

    normalizedConfig.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        values[field.name] = field.defaultValue
        return
      }

      if (field.type === "checkbox" || field.type === "toggle") {
        values[field.name] = false
        return
      }

      if (field.type === "multiselect") {
        values[field.name] = []
      }
    })

    return values
  }, [normalizedConfig])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as FormValues,
    mode: "onSubmit",
  })

  const [submissionState, setSubmissionState] = useState<
    { status: "idle" } | { status: "success"; message?: string } | { status: "error"; message?: string }
  >({ status: "idle" })

  const submitHandler = form.handleSubmit(async (values) => {
    try {
      const response = await fetch(normalizedConfig.endpoint, {
        method: normalizedConfig.method ?? "POST",
        headers: {
          "Content-Type": "application/json",
          ...normalizedConfig.headers,
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      setSubmissionState({
        status: "success",
        message: normalizedConfig.submit.successMessage,
      })
      onSubmitSuccess?.(values)

      if (normalizedConfig.onSuccessRedirect) {
        router.push(normalizedConfig.onSuccessRedirect)
      }
    } catch (error) {
      setSubmissionState({
        status: "error",
        message:
          normalizedConfig.submit.errorMessage ?? normalizedConfig.onErrorMessage ?? "An unexpected error occurred",
      })
      onSubmitError?.(error)
    }
  })

  const renderFieldControl = useCallback(
    (
      field: FormField,
      fieldProps: ControllerRenderProps<Record<string, unknown>, string>,
      optionsState: FieldOptionsState,
    ) => {
      const commonProps = {
        placeholder: field.placeholder,
        disabled: field.disabled,
        "aria-label": field.label ?? field.placeholder,
      } as const

      const rawValue = fieldProps.value

      const normalizeTextValue = (value: unknown) =>
        value === null || value === undefined ? "" : typeof value === "string" ? value : String(value)

      const resolveOptionValue = (raw: string) => {
        const match = optionsState.options.find((option) => String(option.value) === raw)
        return match ? match.value : raw
      }

      switch (field.type) {
        case "textarea":
          return (
            <Textarea
              {...commonProps}
              rows={field.rows}
              value={normalizeTextValue(rawValue)}
              onChange={(event) => fieldProps.onChange(event.target.value)}
            />
          )
        case "number":
          return (
            <Input
              {...commonProps}
              type="number"
              value={typeof rawValue === "number" ? rawValue : normalizeTextValue(rawValue)}
              step={field.step}
              min={field.min as number | string | undefined}
              max={field.max as number | string | undefined}
              onChange={(event) => {
                const nextValue = event.target.value
                fieldProps.onChange(nextValue === "" ? undefined : Number(nextValue))
              }}
            />
          )
        case "select":
          return (
            <select
              {...commonProps}
              disabled={field.disabled || optionsState.loading}
              value={normalizeTextValue(rawValue)}
              onChange={(event) => {
                const nextValue = event.target.value
                if (nextValue === "") {
                  fieldProps.onChange(undefined)
                  return
                }
                fieldProps.onChange(resolveOptionValue(nextValue))
              }}
              className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled={Boolean(field.validation?.required)}>
                {field.placeholder ?? "Select an option"}
              </option>
              {optionsState.options.map((option) => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          )
        case "multiselect":
          return (
            <select
              {...commonProps}
              multiple
              disabled={field.disabled || optionsState.loading}
              value={Array.isArray(rawValue) ? rawValue.map((item) => String(item)) : []}
              onChange={(event) => {
                const selected = Array.from(event.target.selectedOptions).map((opt) => resolveOptionValue(opt.value))
                fieldProps.onChange(selected)
              }}
              size={Math.min(optionsState.options.length || 3, 6)}
              className="flex w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {optionsState.options.map((option) => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          )
        case "checkbox":
          return (
            <div className="flex items-center space-x-2">
              <Checkbox
                aria-label={field.label ?? field.placeholder}
                disabled={field.disabled}
                checked={Boolean(rawValue)}
                onCheckedChange={(checked) => fieldProps.onChange(Boolean(checked))}
              />
              {field.placeholder && <span className="text-sm text-muted-foreground">{field.placeholder}</span>}
            </div>
          )
        case "toggle":
          return (
            <Switch
              checked={Boolean(rawValue)}
              onCheckedChange={(checked) => fieldProps.onChange(checked)}
              disabled={field.disabled}
            />
          )
        case "radio":
          return (
            <div className="grid gap-2">
              {optionsState.options.map((option) => (
                <label key={String(option.value)} className="flex items-center space-x-2 text-sm">
                  <input
                    type="radio"
                    name={fieldProps.name}
                    value={String(option.value)}
                    checked={String(rawValue) === String(option.value)}
                    onChange={() => fieldProps.onChange(option.value)}
                    className="h-4 w-4"
                    disabled={field.disabled}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          )
        case "date":
          return (
            <Input
              {...commonProps}
              type="date"
              value={normalizeTextValue(rawValue).slice(0, 10)}
              onChange={(event) => fieldProps.onChange(event.target.value || undefined)}
            />
          )
        case "datetime":
          return (
            <Input
              {...commonProps}
              type="datetime-local"
              value={normalizeTextValue(rawValue).slice(0, 16)}
              onChange={(event) => fieldProps.onChange(event.target.value || undefined)}
            />
          )
        case "file":
          return (
            <Input
              {...commonProps}
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null
                fieldProps.onChange(file)
              }}
            />
          )
        default:
          return (
            <Input
              {...commonProps}
              type={field.isPassword ? "password" : field.type === "email" ? "email" : "text"}
              value={normalizeTextValue(rawValue)}
              autoComplete={field.autoComplete}
              onChange={(event) => fieldProps.onChange(event.target.value)}
            />
          )
      }
    },
    [],
  )

  const watchValues = form.watch()
  const visibleFieldNames = fieldsForCurrentStep
    .filter((field) => evaluateVisibility(field.visibleWhen, watchValues as FieldVisibilityValues))
    .map((field) => field.name)

  const handleNext = async () => {
    const validationTargets = (
      visibleFieldNames.length ? visibleFieldNames : fieldsForCurrentStep.map((field) => field.name)
    ) as string[]

    const isValid = await form.trigger(validationTargets as Path<FormValues>[], {
      shouldFocus: true,
    })

    if (isValid) {
      setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0))
  }

  const isLastStep = currentStepIndex === steps.length - 1
  const progressLabel = currentStep?.progressLabel
    ? currentStep.progressLabel
    : `Step ${Math.min(currentStepIndex + 1, steps.length)} of ${steps.length}`

  return (
    <form onSubmit={submitHandler} className="space-y-6">
      <div className="space-y-2 text-center">
        {normalizedConfig.title && <h1 className="text-2xl font-semibold">{normalizedConfig.title}</h1>}
        {isMultiStep && currentStep && (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{progressLabel}</p>
        )}
        {isMultiStep && currentStep?.title && <h2 className="text-lg font-medium">{currentStep.title}</h2>}
        {(isMultiStep ? currentStep?.description : normalizedConfig.description) && (
          <p className="text-sm text-muted-foreground">
            {isMultiStep ? (currentStep?.description ?? normalizedConfig.description) : normalizedConfig.description}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {fieldsForCurrentStep.map((field) => {
          const fieldError = form.formState.errors[field.name]
          const isVisible = visibleFieldNames.includes(field.name)

          return (
            <FieldRenderer
              key={field.name}
              field={field}
              control={form.control}
              renderFieldControl={renderFieldControl}
              error={typeof fieldError?.message === "string" ? fieldError.message : fieldError?.message?.toString()}
              isVisible={isVisible}
            />
          )
        })}
      </div>

      {submissionState.status === "success" && submissionState.message && (
        <p className="text-sm text-green-600">{submissionState.message}</p>
      )}
      {submissionState.status === "error" && submissionState.message && (
        <p className="text-sm text-destructive">{submissionState.message}</p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {isMultiStep && currentStepIndex > 0 && (
          <Button type="button" variant="outline" onClick={handlePrevious} disabled={form.formState.isSubmitting}>
            {currentStep?.previousLabel ?? "Back"}
          </Button>
        )}

        {isLastStep ? (
          <Button type="submit" className="w-full sm:ml-auto sm:w-auto" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? (normalizedConfig.submit.loadingText ?? "Submitting…")
              : normalizedConfig.submit.label}
          </Button>
        ) : (
          <Button
            type="button"
            className="w-full sm:ml-auto sm:w-auto"
            onClick={handleNext}
            disabled={form.formState.isSubmitting}
          >
            {currentStep?.nextLabel ?? "Next"}
          </Button>
        )}
      </div>
    </form>
  )
}