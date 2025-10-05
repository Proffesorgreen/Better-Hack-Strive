import { z } from "zod"

const formFieldTypeSchema = z.union([
  z.literal("text"),
  z.literal("email"),
  z.literal("password"),
  z.literal("textarea"),
  z.literal("number"),
  z.literal("select"),
  z.literal("multiselect"),
  z.literal("checkbox"),
  z.literal("radio"),
  z.literal("date"),
  z.literal("datetime"),
  z.literal("file"),
  z.literal("toggle"),
])

const backendDataTypeSchema = z.union([
  z.literal("string"),
  z.literal("number"),
  z.literal("boolean"),
  z.literal("date"),
  z.literal("datetime"),
  z.literal("enum"),
  z.literal("object"),
  z.literal("array"),
  z.literal("json"),
])

const staticOptionSchema = z.object({
  value: z.union([z.string(), z.number(), z.boolean()]),
  label: z.string(),
  description: z.string().optional(),
  disabled: z.boolean().optional(),
})

const dynamicDataSourceSchema = z.object({
  type: z.literal("remote"),
  endpoint: z.string().min(1, "Endpoint is required"),
  method: z.enum(["GET", "POST"]).optional(),
  queryParam: z.string().optional(),
  payloadTemplate: z.record(z.unknown()).optional(),
  headers: z.record(z.string()).optional(),
  authTokenRef: z.string().optional(),
  debounceMs: z.number().int().nonnegative().optional(),
  pagination: z
    .object({
      mode: z.enum(["infinite", "paged"]),
      pageSize: z.number().int().positive().optional(),
      pageParam: z.string().optional(),
      cursorParam: z.string().optional(),
      labelKey: z.string().min(1),
      valueKey: z.string().min(1),
      hasMoreKey: z.string().optional(),
    })
    .optional(),
  cacheTtlMs: z.number().int().nonnegative().optional(),
})

const formFieldValidationSchema = z
  .object({
    required: z.union([z.boolean(), z.string()]).optional(),
    minLength: z.number().int().nonnegative().optional(),
    maxLength: z.number().int().nonnegative().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    email: z.boolean().optional(),
    url: z.boolean().optional(),
    sameAs: z.string().optional(),
    customValidatorKey: z.string().optional(),
  })
  .refine(
    (schema) => {
      if (schema.minLength !== undefined && schema.maxLength !== undefined) {
        return schema.minLength <= schema.maxLength
      }
      return true
    },
    {
      message: "minLength cannot be greater than maxLength",
      path: ["maxLength"],
    },
  )
  .refine(
    (schema) => {
      if (schema.min !== undefined && schema.max !== undefined) {
        return schema.min <= schema.max
      }
      return true
    },
    {
      message: "min cannot be greater than max",
      path: ["max"],
    },
  )

const visibilityRuleSchema = z.object({
  field: z.string().min(1, "Visibility rule requires a field"),
  operator: z.enum(["equals", "notEquals", "in", "notIn", "exists", "greaterThan", "lessThan"]),
  value: z.unknown().optional(),
})

const layoutSchema = z.object({
  colSpan: z.number().int().positive().max(12).optional(),
  rowSpan: z.number().int().positive().optional(),
  order: z.number().int().nonnegative().optional(),
  width: z.enum(["full", "half", "third"]).optional(),
})

const formStepSchema = z.object({
  id: z.string().min(1, "Step id is required"),
  title: z.string().optional(),
  description: z.string().optional(),
  fields: z.array(z.string().min(1)).min(1, "Step must reference at least one field"),
  nextLabel: z.string().optional(),
  previousLabel: z.string().optional(),
  progressLabel: z.string().optional(),
})

export const formFieldSchema = z
  .object({
    name: z.string().min(1, "Field name is required"),
    type: formFieldTypeSchema,
    label: z.string().optional(),
    placeholder: z.string().optional(),
    description: z.string().optional(),
    helpText: z.string().optional(),
    icon: z.string().optional(),
    defaultValue: z.unknown().optional(),
    disabled: z.boolean().optional(),
    readOnly: z.boolean().optional(),
    isPassword: z.boolean().optional(),
    inputMode: z.enum(["text", "email", "numeric", "tel", "url"]).optional(),
    autoComplete: z.string().optional(),
    mask: z.string().optional(),
    rows: z.number().int().positive().optional(),
    step: z.number().optional(),
    min: z.union([z.number(), z.string()]).optional(),
    max: z.union([z.number(), z.string()]).optional(),
    maxSelections: z.number().int().positive().optional(),
    dataType: backendDataTypeSchema.optional(),
    options: z.array(staticOptionSchema).optional(),
    dataSource: dynamicDataSourceSchema.optional(),
    validation: formFieldValidationSchema.optional(),
    visibleWhen: z.array(visibilityRuleSchema).optional(),
    layout: layoutSchema.optional(),
    attributes: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  })
  .superRefine((field, ctx) => {
    if (field.type === "password" && field.isPassword === false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password fields should not explicitly set isPassword to false",
        path: ["isPassword"],
      })
    }

    if (field.type !== "password" && field.isPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only password fields can set isPassword",
        path: ["isPassword"],
      })
    }

    if (["select", "multiselect", "radio"].includes(field.type) && !field.options && !field.dataSource) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select-like fields require options or a dataSource",
        path: ["options"],
      })
    }

    if (field.type === "multiselect" && field.maxSelections === 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use type 'select' instead of limiting multiselect to one option",
        path: ["maxSelections"],
      })
    }
  })

const submitActionSchema = z.object({
  label: z.string().min(1, "Submit button requires a label"),
  icon: z.string().optional(),
  variant: z.enum(["primary", "secondary", "danger"]).optional(),
  loadingText: z.string().optional(),
  successMessage: z.string().optional(),
  errorMessage: z.string().optional(),
  confirmDialog: z
    .object({
      title: z.string().min(1),
      message: z.string().min(1),
      confirmLabel: z.string().optional(),
      cancelLabel: z.string().optional(),
    })
    .optional(),
})

export const formConfigSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    endpoint: z.string().min(1, "Form endpoint is required"),
    method: z.enum(["POST", "PUT", "PATCH"]).default("POST"),
    headers: z.record(z.string()).optional(),
    authTokenRef: z.string().optional(),
    fields: z.array(formFieldSchema).min(1, "At least one field is required"),
    steps: z.array(formStepSchema).optional(),
    submit: submitActionSchema,
    onSuccessRedirect: z.string().optional(),
    onSuccessMessage: z.string().optional(),
    onErrorMessage: z.string().optional(),
    draft: z
      .object({
        autosave: z.boolean().optional(),
        intervalMs: z.number().int().positive().optional(),
      })
      .optional(),
  })
  .superRefine((config, ctx) => {
    const fieldNames = new Set<string>()

    config.fields.forEach((field, index) => {
      if (fieldNames.has(field.name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate field name: ${field.name}`,
          path: ["fields", index, "name"],
        })
      }
      fieldNames.add(field.name)
    })

    config.fields.forEach((field, index) => {
      const sameAs = field.validation?.sameAs
      if (sameAs && !fieldNames.has(sameAs)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `sameAs target '${sameAs}' does not exist`,
          path: ["fields", index, "validation", "sameAs"],
        })
      }
    })

    if (config.steps?.length) {
      const stepIds = new Set<string>()
      const referencedFields = new Set<string>()

      config.steps.forEach((step, stepIndex) => {
        if (stepIds.has(step.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate step id: ${step.id}`,
            path: ["steps", stepIndex, "id"],
          })
        }
        stepIds.add(step.id)

        const localFieldSet = new Set<string>()
        step.fields.forEach((fieldName, fieldIndex) => {
          if (!fieldNames.has(fieldName)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Step references unknown field '${fieldName}'`,
              path: ["steps", stepIndex, "fields", fieldIndex],
            })
            return
          }

          if (referencedFields.has(fieldName)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Field '${fieldName}' is already assigned to a previous step`,
              path: ["steps", stepIndex, "fields", fieldIndex],
            })
          }

          if (localFieldSet.has(fieldName)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Field '${fieldName}' is listed more than once in step '${step.id}'`,
              path: ["steps", stepIndex, "fields", fieldIndex],
            })
          }
          localFieldSet.add(fieldName)
          referencedFields.add(fieldName)
        })
      })

      if (referencedFields.size === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Steps must reference at least one defined field",
          path: ["steps"],
        })
      }
    }
  })

export type FormConfigInput = z.input<typeof formConfigSchema>
export type FormConfigOutput = z.output<typeof formConfigSchema>