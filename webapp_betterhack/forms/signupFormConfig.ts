// src/forms/signupFormConfig.ts
import { parseFormConfig } from "@/lib/formParser";
import type { FormConfigInput } from "@/lib/formSchema";

const signupFormJson: FormConfigInput = {
  title: "Create an account",
  description: "Enter your information below to create your account.",
  endpoint: "/api/auth/sign-up/email", // Placeholder endpoint
  method: "POST",
  fields: [
    {
      name: "name",
      type: "text",
      label: "Full Name",
      placeholder: "John Doe",
      validation: {
        required: "Full name is required.",
      },
    },
    {
      name: "email",
      type: "email",
      label: "Email",
      placeholder: "m@example.com",
      validation: {
        required: "Email is required.",
        email: true,
      },
    },
    {
      name: "password",
      type: "password",
      label: "Password",
      isPassword: true,
      description: "Must be at least 8 characters long.",
      validation: {
        required: "Password is required.",
        minLength: 8,
      },
    },
    {
      name: "confirmPassword",
      type: "password",
      label: "Confirm Password",
      isPassword: true,
      validation: {
        required: "Please confirm your password.",
        sameAs: "password", // This uses your form engine's built-in validation!
      },
    },
  ],
  submit: {
    label: "Create Account",
    loadingText: "Creating Account...",
  },
};

export const signupFormConfig = parseFormConfig(signupFormJson);