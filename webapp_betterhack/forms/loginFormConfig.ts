// src/forms/loginFormConfig.ts
import { parseFormConfig } from "@/lib/formParser";
import type { FormConfigInput } from "@/lib/formSchema";

const loginFormJson: FormConfigInput = {
  title: "Login to your account",
  description: "Enter your email below to login to your account.",
  // The endpoint is a placeholder because we will override the submission
  // with a custom function that uses the better-auth SDK.
  endpoint: "/api/auth/sign-in/email",
  method: "POST",
  fields: [
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
      validation: {
        required: "Password is required.",
      },
    },
  ],
  submit: {
    label: "Login",
    loadingText: "Logging in...",
  },
};

export const loginFormConfig = parseFormConfig(loginFormJson);