"use client";

import * as React from "react";
import type {
  FieldValues,
  FormProviderProps,
  UseFormReturn,
} from "react-hook-form";
import { FormProvider } from "react-hook-form";

import { cn } from "@/lib/utils";

export interface FormProps<TFieldValues extends FieldValues = FieldValues>
  extends React.FormHTMLAttributes<HTMLFormElement> {
  form: UseFormReturn<TFieldValues>;
  children: React.ReactNode;
}

export function Form<TFieldValues extends FieldValues>({
  form,
  children,
  className,
  ...props
}: FormProps<TFieldValues>) {
  return (
    <FormProvider {...(form as unknown as FormProviderProps)}>
      <form className={className} {...props}>
        {children}
      </form>
    </FormProvider>
  );
}

export type FormItemProps = React.HTMLAttributes<HTMLDivElement>;

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
  )
);
FormItem.displayName = "FormItem";

export const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-sm font-medium", className)}
    {...props}
  />
));
FormLabel.displayName = "FormLabel";

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
FormDescription.displayName = "FormDescription";

export const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-destructive", className)}
    {...props}
  />
));
FormMessage.displayName = "FormMessage";

export const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2", className)}
    {...props}
  />
));
FormControl.displayName = "FormControl";
