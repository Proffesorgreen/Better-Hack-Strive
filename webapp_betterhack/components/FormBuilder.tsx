"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import type { Control, ControllerRenderProps, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createParser, useQueryState } from "nuqs";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { buildBackendValidator, parseFormConfig } from "@/lib/formParser";
import { cn } from "@/lib/utils";
import type {
  FormConfig,
  FormField,
  FormStep,
  StaticOption,
  VisibilityRule,
} from "@/types/form.types";

interface FormBuilderProps {
  config: FormConfig;
  onSubmitAction?: (data: Record<string, unknown>) => Promise<any>;
  isSubmitting?: boolean;
  submissionError?: string | null;
  onSubmitSuccess?: (data: Record<string, unknown>) => void;
  onSubmitError?: (error: unknown) => void;
}

type FieldOptionsState = {
  options: StaticOption[];
  loading: boolean;
  error: string | null;
};

type FieldVisibilityValues = Record<string, unknown>;

const sanitizeForKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildFormPersistenceKey = (config: FormConfig) => {
  const base = [config.title, config.endpoint].filter(Boolean).join("-");
  const sanitized = sanitizeForKey(base || "form");
  return sanitized ? `form-${sanitized}` : "form-state";
};

const safeStringify = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
};

const valuesAreEqual = (a: unknown, b: unknown) => {
  if (a === undefined && b === undefined) {
    return true;
  }

  const aString = safeStringify(a);
  const bString = safeStringify(b);

  if (aString !== undefined || bString !== undefined) {
    return aString === bString;
  }

  return Object.is(a, b);
};

const getColSpanClass = (field: FormField) => {
  if (field.layout?.colSpan) {
    return `md:col-span-${field.layout.colSpan}`;
  }

  switch (field.layout?.width) {
    case "half":
      return "md:col-span-6";
    case "third":
      return "md:col-span-4";
    default:
      return "md:col-span-12";
  }
};

const evaluateVisibility = (
  rules: VisibilityRule[] | undefined,
  values: FieldVisibilityValues
) => {
  if (!rules?.length) {
    return true;
  }

  return rules.every((rule) => {
    const target = values[rule.field];

    switch (rule.operator) {
      case "equals":
        return target === rule.value;
      case "notEquals":
        return target !== rule.value;
      case "in":
        return Array.isArray(rule.value) ? rule.value.includes(target) : false;
      case "notIn":
        return Array.isArray(rule.value) ? !rule.value.includes(target) : true;
      case "exists":
        return target !== undefined && target !== null && target !== "";
      case "greaterThan":
        return typeof target === "number" && typeof rule.value === "number"
          ? target > rule.value
          : false;
      case "lessThan":
        return typeof target === "number" && typeof rule.value === "number"
          ? target < rule.value
          : false;
      default:
        return true;
    }
  });
};

const extractRemoteOptions = (
  payload: unknown,
  labelKey: string,
  valueKey: string
): StaticOption[] => {
  const candidates = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as Record<string, unknown>)?.data)
    ? ((payload as Record<string, unknown>).data as unknown[])
    : Array.isArray((payload as Record<string, unknown>)?.items)
    ? ((payload as Record<string, unknown>).items as unknown[])
    : Array.isArray((payload as Record<string, unknown>)?.results)
    ? ((payload as Record<string, unknown>).results as unknown[])
    : [];

  return candidates
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const record = item as Record<string, unknown>;
      const label = record[labelKey];
      const value = record[valueKey];
      if (
        (typeof label === "string" || typeof label === "number") &&
        (typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean")
      ) {
        return {
          label: String(label),
          value,
        } satisfies StaticOption;
      }
      return null;
    })
    .filter((option): option is StaticOption => option !== null);
};

const useFieldOptions = (field: FormField): FieldOptionsState => {
  const [state, setState] = useState<FieldOptionsState>({
    options: field.options ?? [],
    loading: Boolean(field.dataSource),
    error: null,
  });

  useEffect(() => {
    setState({
      options: field.options ?? [],
      loading: Boolean(field.dataSource),
      error: null,
    });
  }, [field.options, field.dataSource]);

  useEffect(() => {
    if (!field.dataSource) {
      return;
    }

    const dataSource = field.dataSource;
    let cancelled = false;
    const abortController = new AbortController();

    async function load() {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(dataSource.endpoint, {
          method: dataSource.method ?? "GET",
          headers: {
            ...(dataSource.method === "POST"
              ? { "Content-Type": "application/json" }
              : {}),
            ...dataSource.headers,
          },
          body:
            dataSource.method === "POST" && dataSource.payloadTemplate
              ? JSON.stringify(dataSource.payloadTemplate)
              : undefined,
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const json = await response.json();
        const labelKey = dataSource.pagination?.labelKey ?? "label";
        const valueKey = dataSource.pagination?.valueKey ?? "value";
        const options = extractRemoteOptions(json, labelKey, valueKey);

        if (!cancelled) {
          setState({ options, loading: false, error: null });
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState({
          options: field.options ?? [],
          loading: false,
          error:
            error instanceof Error ? error.message : "Failed to load options",
        });
      }
    }

    load();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [field.dataSource, field.options]);

  return state;
};

interface FieldRendererProps<FormValues extends Record<string, unknown>> {
  field: FormField;
  control: Control<FormValues>;
  renderFieldControl: (
    field: FormField,
    fieldProps: ControllerRenderProps<FormValues, Path<FormValues>>,
    optionsState: FieldOptionsState
  ) => ReactElement;
  error?: string;
  isVisible: boolean;
}

const FieldRenderer = <FormValues extends Record<string, unknown>>({
  field,
  control,
  renderFieldControl,
  error,
  isVisible,
}: FieldRendererProps<FormValues>) => {
  const optionsState = useFieldOptions(field);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn("space-y-2", getColSpanClass(field))}>
      <FormItem>
        {field.label && (
          <FormLabel htmlFor={field.name}>{field.label}</FormLabel>
        )}
        <FormControl>
          <Controller
            name={field.name as Path<FormValues>}
            control={control}
            render={({ field: fieldProps }) =>
              renderFieldControl(field, fieldProps, optionsState)
            }
          />
        </FormControl>
        {field.description && (
          <FormDescription>{field.description}</FormDescription>
        )}
        {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
        {optionsState.loading && (
          <FormDescription>Loading options…</FormDescription>
        )}
        {(error || optionsState.error) && (
          <FormMessage>{error ?? optionsState.error ?? ""}</FormMessage>
        )}
      </FormItem>
    </div>
  );
};

export const FormBuilder = ({
  config,
  onSubmitAction,
  isSubmitting: isSubmittingProp,
  submissionError: submissionErrorProp,
  onSubmitSuccess,
  onSubmitError,
}: FormBuilderProps) => {
  const router = useRouter();
  const normalizedConfig = useMemo(() => parseFormConfig(config), [config]);
  const schema = useMemo(
    () => buildBackendValidator(normalizedConfig),
    [normalizedConfig]
  );
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
          ];

    const sanitized = base
      .map((step) => ({
        ...step,
        fields: step.fields.filter((fieldName) =>
          normalizedConfig.fields.some((field) => field.name === fieldName)
        ),
      }))
      .filter((step) => step.fields.length > 0);

    if (sanitized.length === 0) {
      return [
        {
          id: "__all__",
          title: normalizedConfig.title,
          description: normalizedConfig.description,
          fields: normalizedConfig.fields.map((field) => field.name),
        },
      ];
    }

    return sanitized;
  }, [normalizedConfig]);

  const isMultiStep = normalizedConfig.steps !== undefined && steps.length > 1;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    setCurrentStepIndex(0);
  }, [steps]);

  const currentStep = steps[currentStepIndex] ?? steps[0];

  const fieldMap = useMemo(() => {
    const map = new Map<string, FormField>();
    normalizedConfig.fields.forEach((field) => {
      map.set(field.name, field);
    });
    return map;
  }, [normalizedConfig.fields]);

  const fieldsForCurrentStep: FormField[] = useMemo(() => {
    if (!currentStep) {
      return normalizedConfig.fields;
    }

    return currentStep.fields
      .map((fieldName) => fieldMap.get(fieldName))
      .filter((field): field is FormField => Boolean(field));
  }, [currentStep, fieldMap, normalizedConfig.fields]);

  type FormValues = z.infer<typeof schema>;

  const persistenceKey = useMemo(
    () => buildFormPersistenceKey(config),
    [config]
  );

  const defaultValues = useMemo<Partial<FormValues>>(() => {
    const values: Record<string, unknown> = {};

    normalizedConfig.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        values[field.name] = field.defaultValue;
        return;
      }

      if (field.type === "checkbox" || field.type === "toggle") {
        values[field.name] = false;
        return;
      }

      if (field.type === "multiselect") {
        values[field.name] = [];
      }
    });

    return values as Partial<FormValues>;
  }, [normalizedConfig]);

  // --- FROM THE 'nuqs' (origin/mikiasgoitom/added-nuqs) BRANCH ---
  const formStateParser = useMemo(
    () =>
      createParser<Partial<FormValues>>({
        parse: (value) => {
          if (!value) {
            return {};
          }
          try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === "object"
              ? (parsed as Partial<FormValues>)
              : {};
          } catch {
            return {};
          }
        },
        serialize: (value) => JSON.stringify(value ?? {}),
        eq: (a, b) => valuesAreEqual(a ?? {}, b ?? {}),
      })
        .withDefault({})
        .withOptions({
          history: "replace",
          shallow: true,
          clearOnDefault: true,
        }),
    []
  );

  const [queryValues, setQueryValues] = useQueryState<Partial<FormValues>>(
    "formState", // Using a consistent key like "formState"
    formStateParser
  );

  const mergedInitialValues = useMemo(() => {
    const base = {
      ...(defaultValues as Record<string, unknown>),
      ...(queryValues ?? {}),
    };
    return base as FormValues;
  }, [defaultValues, queryValues]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: mergedInitialValues,
    mode: "onSubmit",
  });

  // --- MERGED LOGIC: Combine state management from both branches ---

  // Internal state for fallback submission behavior (from the HEAD branch)
  const [internalSubmissionState, setInternalSubmissionState] = useState<
    { status: "idle" } | { status: "success"; message?: string } | { status: "error"; message?: string }
  >({ status: "idle" });

  // Determine which state to use for UI feedback (from the HEAD branch)
  const isSubmitting = isSubmittingProp !== undefined ? isSubmittingProp : form.formState.isSubmitting;
  const submissionError = submissionErrorProp ?? (internalSubmissionState.status === 'error' ? internalSubmissionState.message : null);
  const submissionSuccessMessage = internalSubmissionState.status === 'success' ? internalSubmissionState.message : null;

  // Refs and effects for syncing form state with URL query (from the 'nuqs' branch)
  const skipQuerySync = useRef(false);
  const lastDiffStringRef = useRef<string | undefined>(undefined);
  const defaultsStringRef = useRef<string | undefined>(undefined);

  const computeDiffFromDefaults = useCallback(
    (values: Record<string, unknown>) => {
      const diff: Record<string, unknown> = {};
      normalizedConfig.fields.forEach((field) => {
        if (field.type === "file") {
          return;
        }
        const key = field.name;
        const current = values[key];
        const defaultValue = (defaultValues as Record<string, unknown>)[key];
        if (!valuesAreEqual(current, defaultValue) && current !== undefined) {
          diff[key] = current;
        }
      });
      return diff as Partial<FormValues>;
    },
    [normalizedConfig.fields, defaultValues]
  );
  
  // Effect to reset form when URL query or defaults change (from 'nuqs' branch)
  useEffect(() => {
    const defaultsString = safeStringify(defaultValues) ?? "";
    const mergedValues = {
      ...(defaultValues as Record<string, unknown>),
      ...(queryValues ?? {}),
    } as FormValues;

    const diff = computeDiffFromDefaults(mergedValues);
    const diffString = safeStringify(diff) ?? "";
    const previousDefaults = defaultsStringRef.current;
    const previousDiff = lastDiffStringRef.current;

    if (previousDefaults !== defaultsString || previousDiff !== diffString) {
      defaultsStringRef.current = defaultsString;
      skipQuerySync.current = true;
      form.reset(mergedValues);
      lastDiffStringRef.current = diffString;
    }
  }, [queryValues, defaultValues, form, computeDiffFromDefaults]);

  // Effect to subscribe to form value changes and update the URL query (from 'nuqs' branch)
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (skipQuerySync.current) {
        skipQuerySync.current = false;
        return;
      }
      const diff = computeDiffFromDefaults(values as Record<string, unknown>);
      setQueryValues(diff);
      lastDiffStringRef.current = safeStringify(diff);
    });
    return () => subscription.unsubscribe();
  }, [form, setQueryValues, computeDiffFromDefaults]);


  // --- MERGED SUBMIT HANDLER ---
  // This combines the logic from both branches.
  const submitHandler = form.handleSubmit(async (values) => {
    // Logic from the HEAD branch (parent on submit)
    if (onSubmitAction) {
      await onSubmitAction(values);
      return;
    }
    
    try {
      const response = await fetch(normalizedConfig.endpoint, {
        method: normalizedConfig.method ?? "POST",
        headers: {
          "Content-Type": "application/json",
          ...normalizedConfig.headers,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setInternalSubmissionState({
        status: "success",
        message: normalizedConfig.submit.successMessage,
      });
      onSubmitSuccess?.(values);

      if (normalizedConfig.onSuccessRedirect) {
        router.push(normalizedConfig.onSuccessRedirect);
      }
    } catch (error) {
      setInternalSubmissionState({
        status: "error",
        message:
          normalizedConfig.submit.errorMessage ??
          normalizedConfig.onErrorMessage ??
          "An unexpected error occurred",
      });
      onSubmitError?.(error);
    }
  });

  const renderFieldControl = useCallback(
    (
      field: FormField,
      fieldProps: ControllerRenderProps<FormValues, Path<FormValues>>,
      optionsState: FieldOptionsState
    ) => {
      const commonProps = {
        placeholder: field.placeholder,
        disabled: field.disabled,
        "aria-label": field.label ?? field.placeholder,
      } as const;

      const rawValue = fieldProps.value;

      const normalizeTextValue = (value: unknown) =>
        value === null || value === undefined
          ? ""
          : typeof value === "string"
          ? value
          : String(value);

      const resolveOptionValue = (raw: string) => {
        const match = optionsState.options.find(
          (option) => String(option.value) === raw
        );
        return match ? match.value : raw;
      };

      switch (field.type) {
        case "textarea":
          return (
            <Textarea
              {...commonProps}
              rows={field.rows}
              value={normalizeTextValue(rawValue)}
              onChange={(event) => fieldProps.onChange(event.target.value)}
            />
          );
        case "number":
          return (
            <Input
              {...commonProps}
              type="number"
              value={
                typeof rawValue === "number"
                  ? rawValue
                  : normalizeTextValue(rawValue)
              }
              step={field.step}
              min={field.min as number | string | undefined}
              max={field.max as number | string | undefined}
              onChange={(event) => {
                const nextValue = event.target.value;
                fieldProps.onChange(
                  nextValue === "" ? undefined : Number(nextValue)
                );
              }}
            />
          );
        case "select":
          return (
            <Select
              {...commonProps}
              disabled={field.disabled || optionsState.loading}
              value={normalizeTextValue(rawValue)}
              onChange={(event) => {
                const nextValue = event.target.value;
                if (nextValue === "") {
                  fieldProps.onChange(undefined);
                  return;
                }
                fieldProps.onChange(resolveOptionValue(nextValue));
              }}
            >
              <option value="" disabled={Boolean(field.validation?.required)}>
                {field.placeholder ?? "Select an option"}
              </option>
              {optionsState.options.map((option) => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </Select>
          );
        case "multiselect":
          return (
            <Select
              {...commonProps}
              multiple
              disabled={field.disabled || optionsState.loading}
              value={
                Array.isArray(rawValue)
                  ? rawValue.map((item) => String(item))
                  : []
              }
              onChange={(event) => {
                const selected = Array.from(event.target.selectedOptions).map(
                  (opt) => resolveOptionValue(opt.value)
                );
                fieldProps.onChange(selected);
              }}
              size={Math.min(optionsState.options.length || 3, 6)}
            >
              {optionsState.options.map((option) => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </Select>
          );
        case "checkbox":
          return (
            <div className="flex items-center space-x-2">
              <Checkbox
                aria-label={field.label ?? field.placeholder}
                disabled={field.disabled}
                checked={Boolean(rawValue)}
                onCheckedChange={(checked) =>
                  fieldProps.onChange(Boolean(checked))
                }
              />
              {field.placeholder && (
                <span className="text-sm text-muted-foreground">
                  {field.placeholder}
                </span>
              )}
            </div>
          );
        case "toggle":
          return (
            <Switch
              checked={Boolean(rawValue)}
              onCheckedChange={(checked) => fieldProps.onChange(checked)}
              disabled={field.disabled}
            />
          );
        case "radio":
          return (
            <div className="grid gap-2">
              {optionsState.options.map((option) => (
                <label
                  key={String(option.value)}
                  className="flex items-center space-x-2 text-sm"
                >
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
          );
        case "date":
          return (
            <Input
              {...commonProps}
              type="date"
              value={normalizeTextValue(rawValue).slice(0, 10)}
              onChange={(event) =>
                fieldProps.onChange(event.target.value || undefined)
              }
            />
          );
        case "datetime":
          return (
            <Input
              {...commonProps}
              type="datetime-local"
              value={normalizeTextValue(rawValue).slice(0, 16)}
              onChange={(event) =>
                fieldProps.onChange(event.target.value || undefined)
              }
            />
          );
        case "file":
          return (
            <Input
              {...commonProps}
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                fieldProps.onChange(file);
              }}
            />
          );
        default:
          return (
            <Input
              {...commonProps}
              type={
                field.isPassword
                  ? "password"
                  : field.type === "email"
                  ? "email"
                  : "text"
              }
              value={normalizeTextValue(rawValue)}
              autoComplete={field.autoComplete}
              onChange={(event) => fieldProps.onChange(event.target.value)}
            />
          );
      }
    },
    []
  );

  const watchValues = form.watch();

  useEffect(() => {
    const currentValues = form.getValues();
    const diff = computeDiffFromDefaults(currentValues);
    const diffString = safeStringify(diff) ?? "";

    if (skipQuerySync.current) {
      skipQuerySync.current = false;
      lastDiffStringRef.current = diffString;
      return;
    }

    if (lastDiffStringRef.current === diffString) {
      return;
    }

    lastDiffStringRef.current = diffString;
    defaultsStringRef.current = safeStringify(defaultValues) ?? "";

    setQueryValues(diff).catch(() => undefined);
  }, [
    form,
    computeDiffFromDefaults,
    setQueryValues,
    watchValues,
    defaultValues,
  ]);

  const visibleFieldNames = fieldsForCurrentStep
    .filter((field) =>
      evaluateVisibility(
        field.visibleWhen,
        watchValues as FieldVisibilityValues
      )
    )
    .map((field) => field.name);

  const handleNext = async () => {
    const validationTargets = (
      visibleFieldNames.length
        ? visibleFieldNames
        : fieldsForCurrentStep.map((field) => field.name)
    ) as Path<FormValues>[];

    const isValid = await form.trigger(validationTargets, {
      shouldFocus: true,
    });

    if (isValid) {
      setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const isLastStep = currentStepIndex === steps.length - 1;
  const progressLabel = currentStep?.progressLabel
    ? currentStep.progressLabel
    : `Step ${Math.min(currentStepIndex + 1, steps.length)} of ${steps.length}`;

  return (
    <Form form={form} onSubmit={submitHandler} className="space-y-6">
      <div className="space-y-2 text-center">
        {normalizedConfig.title && (
          <h1 className="text-2xl font-semibold">{normalizedConfig.title}</h1>
        )}
        {isMultiStep && currentStep && (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {progressLabel}
          </p>
        )}
        {isMultiStep && currentStep?.title && (
          <h2 className="text-lg font-medium">{currentStep.title}</h2>
        )}
        {(isMultiStep
          ? currentStep?.description
          : normalizedConfig.description) && (
          <p className="text-sm text-muted-foreground">
            {isMultiStep
              ? currentStep?.description ?? normalizedConfig.description
              : normalizedConfig.description}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {fieldsForCurrentStep.map((field) => {
          const fieldError = form.formState.errors[field.name];
          const isVisible = visibleFieldNames.includes(field.name);

          return (
            <FieldRenderer<FormValues>
              key={field.name}
              field={field}
              control={form.control}
              renderFieldControl={renderFieldControl}
              error={
                typeof fieldError?.message === "string"
                  ? fieldError.message
                  : fieldError?.message?.toString()
              }
              isVisible={isVisible}
            />
          );
        })}
      </div>

      {submissionSuccessMessage && (
        <p className="text-sm text-green-600">{submissionSuccessMessage}</p>
      )}

      {submissionError && (
        <p className="text-sm text-destructive">{submissionError}</p>
      )}

      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-center",
          {
            // If it's a multi-step form, justify the space between buttons
            "sm:justify-between": isMultiStep,
            // If it's a single-step form, center the single submit button
            "sm:justify-center": !isMultiStep,
          }
        )}
      >
        {/* This "Back" button logic is already correct, as it only renders for multi-step forms */}
        {isMultiStep && currentStepIndex > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={isSubmitting}
          >
            {currentStep?.previousLabel ?? "Back"}
          </Button>
        )}

        {isLastStep ? (
          <Button
            type="submit"
            // Conditionally apply `sm:ml-auto` ONLY for multi-step forms
            className={cn("w-full sm:w-auto", {
              "sm:ml-auto": isMultiStep,
            })}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? normalizedConfig.submit.loadingText ?? "Submitting…"
              : normalizedConfig.submit.label}
          </Button>
        ) : (
          <Button
            type="button"
            // Conditionally apply `sm:ml-auto` ONLY for multi-step forms
            className={cn("w-full sm:w-auto", {
              "sm:ml-auto": isMultiStep,
            })}
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {currentStep?.nextLabel ?? "Next"}
          </Button>
        )}
      </div>
    </Form>
  );
};
