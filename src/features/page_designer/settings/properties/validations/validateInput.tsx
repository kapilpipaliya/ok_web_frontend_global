import type { ValidationConfigType } from "./ValidationConfig";

export function validateInput(
  validation: ValidationConfigType,
  value?: string,
  fieldKey?: string,
) {
  const fieldName = fieldKey ? fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1) : "Input";
  
  // Clear previous error
  // Check required rule
  if (validation.required && (!value || value.trim() === "")) {
    return `${fieldName} is required`;
  }

  // Check email rule
  if (validation.email && value && !/\S+@\S+\.\S+/.test(value)) {
    return `Invalid ${fieldName.toLowerCase()} format`;
  }

  // Check minLength rule
  if (validation.minLength && value && value.length < validation.minLength) {
    return `${fieldName} should be at least ${validation.minLength} characters`;
  }

  // Check maxLength rule
  if (validation.maxLength && value && value.length > validation.maxLength) {
    return `${fieldName} should be no more than ${validation.maxLength} characters`;
  }

  // Check regex rules
  if (validation.regex) {
    const regexRules = Array.isArray(validation.regex) ? validation.regex : [validation.regex];
    for (const element of regexRules) {
      const regexRule = element;
      if (regexRule.enabled) {
        if (!value) {
          return regexRule.message || `${fieldName} does not match the required pattern`;
        }
        const regex = new RegExp(regexRule.value);
        if (!regex.test(value)) {
          return regexRule.message || `${fieldName} does not match the required pattern`;
        }
      }
    }
  }

  // Check custom validation functions
  if (validation.validate) {
    const validateFunctions = Array.isArray(validation.validate) 
      ? validation.validate 
      : [validation.validate];

    for (const validateFn of validateFunctions) {
      if (value) {
        const error = validateFn(value);
        if (error) {
          return error;
        }
      }
    }
  }

  return undefined;
}
