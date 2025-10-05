import { z } from "zod";

import type { FormConfig, FormField, FormFieldType } from "../types/form.types";
import { formConfigSchema } from "./formSchema";

export class FormConfigError extends Error {
  issues: z.ZodIssue[];

  constructor(message: string, issues: z.ZodIssue[]) {
    super(message);
    this.name = "FormConfigError";
    this.issues = issues;
  }
}

/**
 * Parse an unknown input (object or JSON string) into a validated {@link FormConfig}.
 */
export function parseFormConfig(input: unknown): FormConfig {
  const source = typeof input === "string" ? safeJsonParse(input) : input;

  const result = formConfigSchema.safeParse(source);
  if (!result.success) {
    throw new FormConfigError(
      "Invalid form configuration",
      result.error.issues
    );
  }

  return result.data as FormConfig;
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new FormConfigError("Failed to parse JSON form configuration", [
      {
        code: z.ZodIssueCode.custom,
        message:
          error instanceof Error ? error.message : "Unknown JSON parse error",
        path: [],
      },
    ]);
  }
}

type PrimitiveLiteral = string | number | boolean;

const literalFromValue = (
  value: unknown
): z.ZodLiteral<PrimitiveLiteral> | null => {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return z.literal(value);
  }

  return null;
};

const arrayOf = (schema: z.ZodTypeAny, field: FormField) => {
  let arraySchema = z.array(schema);

  const minLength = field.validation?.minLength;
  if (minLength !== undefined) {
    arraySchema = arraySchema.min(minLength, {
      message:
        typeof field.validation?.required === "string"
          ? field.validation.required
          : `Select at least ${minLength} options`,
    });
  }

  const maxLength = field.validation?.maxLength;
  if (maxLength !== undefined) {
    arraySchema = arraySchema.max(maxLength, {
      message: `Select at most ${maxLength} options`,
    });
  }

  if (field.maxSelections !== undefined) {
    arraySchema = arraySchema.max(field.maxSelections, {
      message: `Select no more than ${field.maxSelections} options`,
    });
  }

  return arraySchema;
};

const deriveDataType = (field: FormField): FormField["dataType"] => {
  if (field.dataType) {
    return field.dataType;
  }

  const inferredByType: Partial<Record<FormFieldType, FormField["dataType"]>> =
    {
      text: "string",
      email: "string",
      password: "string",
      textarea: "string",
      number: "number",
      select: inferSelectDataType(field),
      multiselect: "array",
      checkbox: "boolean",
      radio: inferSelectDataType(field),
      date: "date",
      datetime: "datetime",
      file: "string",
      toggle: "boolean",
    };

  return inferredByType[field.type] ?? "json";
};

const inferSelectDataType = (field: FormField): FormField["dataType"] => {
  const firstOption = field.options?.[0];
  if (!firstOption) {
    return "string";
  }

  const value = firstOption.value;
  switch (typeof value) {
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    default:
      return "string";
  }
};

const applyStringConstraints = (schema: z.ZodString, field: FormField) => {
  const { validation } = field;
  let result = schema;

  if (validation?.minLength !== undefined) {
    result = result.min(validation.minLength, {
      message: `Must be at least ${validation.minLength} characters`,
    });
  }

  if (validation?.maxLength !== undefined) {
    result = result.max(validation.maxLength, {
      message: `Must be at most ${validation.maxLength} characters`,
    });
  }

  if (validation?.pattern) {
    try {
      const regex = new RegExp(validation.pattern);
      result = result.regex(regex, {
        message: "Value does not match required pattern",
      });
    } catch (error) {
      throw new FormConfigError(
        `Invalid regex pattern for field '${field.name}'`,
        [
          {
            code: z.ZodIssueCode.custom,
            message: error instanceof Error ? error.message : "Invalid regex",
            path: ["fields", field.name, "validation", "pattern"],
          },
        ]
      );
    }
  }

  if (validation?.email) {
    result = result.email();
  }

  if (validation?.url) {
    result = result.url();
  }

  return result;
};

const applyNumberConstraints = (
  schema: z.ZodNumber,
  field: FormField
): z.ZodTypeAny => {
  const { validation } = field;
  let result: z.ZodTypeAny = schema;

  if (validation?.min !== undefined) {
    result = (result as z.ZodNumber).min(validation.min, {
      message: `Must be greater than or equal to ${validation.min}`,
    });
  }

  if (validation?.max !== undefined) {
    result = (result as z.ZodNumber).max(validation.max, {
      message: `Must be less than or equal to ${validation.max}`,
    });
  }

  if (field.step !== undefined && field.step > 0) {
    const stepValue = field.step;
    const reference = typeof field.min === "number" ? field.min : 0;
    result = (result as z.ZodNumber).refine(
      (value) => {
        const delta = value - reference;
        return (
          Math.abs(delta / stepValue - Math.round(delta / stepValue)) <
          Number.EPSILON
        );
      },
      {
        message: `Must align with step ${stepValue}`,
      }
    );
  }

  return result;
};

const buildLiteralUnion = (field: FormField) => {
  if (!field.options?.length) {
    return undefined;
  }

  const literals = field.options
    .map((option) => literalFromValue(option.value))
    .filter(
      (literal): literal is z.ZodLiteral<PrimitiveLiteral> => literal !== null
    );

  if (!literals.length) {
    return undefined;
  }

  if (literals.length === 1) {
    return literals[0];
  }

  return z.union(
    literals as [
      z.ZodLiteral<PrimitiveLiteral>,
      z.ZodLiteral<PrimitiveLiteral>,
      ...z.ZodLiteral<PrimitiveLiteral>[]
    ]
  );
};

const buildFieldSchema = (field: FormField): z.ZodTypeAny => {
  const dataType = deriveDataType(field);
  let baseSchema: z.ZodTypeAny;

  switch (dataType) {
    case "number":
      baseSchema = z.number({ invalid_type_error: "Must be a number" });
      break;
    case "boolean":
      baseSchema = z.boolean({ invalid_type_error: "Must be a boolean" });
      break;
    case "date":
      baseSchema = z
        .string()
        .min(1, { message: "Date is required" })
        .refine((value) => !Number.isNaN(Date.parse(value)), {
          message: "Must be a valid ISO date string",
        });
      break;
    case "datetime":
      baseSchema = z.string().datetime();
      break;
    case "array":
      baseSchema = z.array(z.unknown());
      break;
    case "object":
      baseSchema = z.record(z.unknown());
      break;
    case "json":
      baseSchema = z.unknown();
      break;
    default:
      baseSchema = z.string();
      break;
  }

  if (dataType === "string") {
    baseSchema = applyStringConstraints(baseSchema as z.ZodString, field);
  }

  if (dataType === "number") {
    baseSchema = applyNumberConstraints(baseSchema as z.ZodNumber, field);
  }

  if (field.type === "select" || field.type === "radio") {
    const union = buildLiteralUnion(field);
    if (union) {
      baseSchema = union;
    }
  }

  if (field.type === "multiselect") {
    const union = buildLiteralUnion(field);
    const fallbackItemSchema = (() => {
      const sample = field.options?.[0]?.value;
      if (typeof sample === "number") return z.number();
      if (typeof sample === "boolean") return z.boolean();
      return z.string();
    })();

    const itemSchema = union ?? fallbackItemSchema;
    baseSchema = arrayOf(itemSchema, field);
  }

  if (field.type === "checkbox" || field.type === "toggle") {
    baseSchema = z.boolean();
  }

  const requiredSetting = field.validation?.required;
  const isRequired =
    requiredSetting === undefined ? true : Boolean(requiredSetting);

  if (isRequired && dataType === "string") {
    baseSchema = (baseSchema as z.ZodString).min(1, {
      message:
        typeof requiredSetting === "string"
          ? requiredSetting
          : "This field is required",
    });
  }

  if (!isRequired) {
    baseSchema = baseSchema.optional();
  }

  if (field.defaultValue !== undefined) {
    baseSchema = baseSchema.optional().default(field.defaultValue);
  }

  return baseSchema;
};

export function buildBackendValidator(config: FormConfig) {
  const normalized = parseFormConfig(config);

  const fieldSchemas: Record<string, z.ZodTypeAny> = {};
  normalized.fields.forEach((field) => {
    fieldSchemas[field.name] = buildFieldSchema(field);
  });

  const fieldsWithSameAs = normalized.fields.filter(
    (field) => field.validation?.sameAs
  );
  const baseSchema = z.object(fieldSchemas);

  if (!fieldsWithSameAs.length) {
    return baseSchema;
  }

  return baseSchema.superRefine((data, ctx) => {
    fieldsWithSameAs.forEach((field) => {
      const target = field.validation?.sameAs;
      if (!target) return;

      if (data[field.name] !== data[target]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field.label ?? field.name} must match ${target}`,
          path: [field.name],
        });
      }
    });
  });
}
