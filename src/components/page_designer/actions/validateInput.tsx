import { ValidationConfigType } from "./ValidationConfig";


export function validateInput(value: string, validation: ValidationConfigType) {
  // Clear previous error
  // Check required rule
  if (validation.required && value.trim() === "") {
    return "Input is required";
  }

  // Check email rule
  if (validation.email && !/\S+@\S+\.\S+/.test(value)) {
    return "Invalid email format";
  }

  // Check minLength rule
  if (validation.minLength && value.length < validation.minLength) {
    return `Input should be at least ${validation.minLength} characters`;
  }

  // Check maxLength rule
  if (validation.maxLength && value.length > validation.maxLength) {
    return `Input should be no more than ${validation.maxLength} characters`;
  }

  // Check regex rules
  if (validation.regex) {
    for (let i = 0; i < validation.regex.length; i++) {
      const regexRule = validation.regex[i];
      if (regexRule.enabled) {
        const regex = new RegExp(regexRule.value);
        if (!regex.test(value)) {
          return regexRule.message;
        }
      }
    }
  }
}
