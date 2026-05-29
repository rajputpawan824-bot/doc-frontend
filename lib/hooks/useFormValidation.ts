/**
 * Form Validation Hooks
 * Reusable validation logic for forms
 */

import { useState, useCallback } from "react";

export interface ValidationRules {
  [key: string]: {
    required?: boolean | string;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
    validate?: (value: unknown) => string | true;
  };
}

export interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation<T extends Record<string, unknown>>(
  rules: ValidationRules
) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validate = useCallback(
    (formData: T): boolean => {
      const newErrors: ValidationErrors = {};

      for (const field in rules) {
        const rule = rules[field];
        const value = formData[field];

        // Check required
        if (rule.required) {
          if (!value || (typeof value === "string" && !value.trim())) {
            newErrors[field] =
              typeof rule.required === "string"
                ? rule.required
                : `${field} is required`;
            continue;
          }
        }

        // Check minLength
        if (
          rule.minLength &&
          typeof value === "string" &&
          value.length < rule.minLength.value
        ) {
          newErrors[field] = rule.minLength.message;
          continue;
        }

        // Check maxLength
        if (
          rule.maxLength &&
          typeof value === "string" &&
          value.length > rule.maxLength.value
        ) {
          newErrors[field] = rule.maxLength.message;
          continue;
        }

        // Check pattern
        if (rule.pattern && typeof value === "string") {
          if (!rule.pattern.value.test(value)) {
            newErrors[field] = rule.pattern.message;
            continue;
          }
        }

        // Custom validation
        if (rule.validate) {
          const result = rule.validate(value);
          if (result !== true) {
            newErrors[field] = result;
          }
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [rules]
  );

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validate,
    clearError,
    clearAllErrors,
    hasError: (field: string) => Boolean(errors[field]),
    getError: (field: string) => errors[field],
  };
}
