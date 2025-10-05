export type FormFieldType =
  | "text"
  | "email"
  | "password"
  | "textarea"
  | "number"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "date"
  | "datetime"
  | "file"
  | "toggle";

export type BackendDataType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "enum"
  | "object"
  | "array"
  | "json";

export interface StaticOption {
  value: string | number | boolean;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface DynamicDataSource {
  type: "remote";
  endpoint: string;
  method?: "GET" | "POST";
  queryParam?: string; // e.g. search term
  payloadTemplate?: Record<string, unknown>;
  headers?: Record<string, string>;
  authTokenRef?: string; // e.g. env key
  debounceMs?: number;
  pagination?: {
    mode: "infinite" | "paged";
    pageSize?: number;
    pageParam?: string;
    cursorParam?: string;
    labelKey: string;
    valueKey: string;
    hasMoreKey?: string;
  };
  cacheTtlMs?: number;
}

export interface FormFieldValidation {
  required?: boolean | string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string; // regex as string for JSON
  email?: boolean;
  url?: boolean;
  sameAs?: string; // field name to match
  customValidatorKey?: string; // reference to runtime validator
}

export interface VisibilityRule {
  field: string;
  operator:
    | "equals"
    | "notEquals"
    | "in"
    | "notIn"
    | "exists"
    | "greaterThan"
    | "lessThan";
  value?: unknown;
}

export interface FormField {
  name: string;
  type: FormFieldType;
  label?: string;
  placeholder?: string;
  description?: string;
  helpText?: string;
  icon?: string;
  defaultValue?: unknown;
  disabled?: boolean;
  readOnly?: boolean;
  isPassword?: boolean;
  inputMode?: "text" | "email" | "numeric" | "tel" | "url";
  autoComplete?: string;
  mask?: string;
  rows?: number; // textarea
  step?: number;
  min?: number | string; // supports dates
  max?: number | string;
  maxSelections?: number; // multi-select
  dataType?: BackendDataType;
  options?: StaticOption[];
  dataSource?: DynamicDataSource;
  validation?: FormFieldValidation;
  visibleWhen?: VisibilityRule[];
  layout?: {
    colSpan?: number;
    rowSpan?: number;
    order?: number;
    width?: "full" | "half" | "third";
  };
  attributes?: Record<string, string | number | boolean>;
}

export interface FormStep {
  id: string;
  title?: string;
  description?: string;
  fields: string[];
  nextLabel?: string;
  previousLabel?: string;
  progressLabel?: string;
}

export interface SubmitAction {
  label: string;
  icon?: string;
  variant?: "primary" | "secondary" | "danger";
  loadingText?: string;
  successMessage?: string;
  errorMessage?: string;
  confirmDialog?: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
  };
}

export interface FormConfig {
  title?: string;
  description?: string;
  endpoint: string;
  method?: "POST" | "PUT" | "PATCH";
  headers?: Record<string, string>;
  authTokenRef?: string;
  fields: FormField[];
  steps?: FormStep[];
  submit: SubmitAction;
  onSuccessRedirect?: string;
  onSuccessMessage?: string;
  onErrorMessage?: string;
  draft?: { autosave?: boolean; intervalMs?: number };
}
