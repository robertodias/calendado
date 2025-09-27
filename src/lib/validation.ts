/**
 * Unified validation utilities
 * 
 * Provides consistent validation patterns across the application
 */

import { createValidationError } from './errorHandler';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidation {
  field: string;
  value: unknown;
  rules: ValidationRule[];
}

export interface ValidationRule {
  name: string;
  test: (value: unknown) => boolean;
  message: string;
}

// Common validation rules
export const validationRules = {
  required: (field: string): ValidationRule => ({
    name: 'required',
    test: (value) => value != null && value !== '',
    message: `${field} is required`
  }),
  
  email: (field: string): ValidationRule => ({
    name: 'email',
    test: (value) => {
      if (typeof value !== 'string') return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message: `${field} must be a valid email address`
  }),
  
  minLength: (field: string, min: number): ValidationRule => ({
    name: 'minLength',
    test: (value) => {
      if (typeof value !== 'string') return false;
      return value.length >= min;
    },
    message: `${field} must be at least ${min} characters long`
  }),
  
  maxLength: (field: string, max: number): ValidationRule => ({
    name: 'maxLength',
    test: (value) => {
      if (typeof value !== 'string') return false;
      return value.length <= max;
    },
    message: `${field} must be no more than ${max} characters long`
  }),
  
  pattern: (field: string, regex: RegExp, message: string): ValidationRule => ({
    name: 'pattern',
    test: (value) => {
      if (typeof value !== 'string') return false;
      return regex.test(value);
    },
    message
  }),
  
  oneOf: (field: string, options: unknown[]): ValidationRule => ({
    name: 'oneOf',
    test: (value) => options.includes(value),
    message: `${field} must be one of: ${options.join(', ')}`
  }),
  
  custom: (field: string, test: (value: unknown) => boolean, message: string): ValidationRule => ({
    name: 'custom',
    test,
    message
  })
};

// Validate a single field
export function validateField(fieldValidation: FieldValidation): ValidationResult {
  const { value, rules } = fieldValidation;
  const errors: string[] = [];
  
  for (const rule of rules) {
    if (!rule.test(value)) {
      errors.push(rule.message);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate multiple fields
export function validateFields(fieldValidations: FieldValidation[]): ValidationResult {
  const allErrors: string[] = [];
  
  for (const fieldValidation of fieldValidations) {
    const result = validateField(fieldValidation);
    if (!result.isValid) {
      allErrors.push(...result.errors);
    }
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}

// Validate form data
export function validateFormData<T extends Record<string, unknown>>(
  data: T,
  schema: Record<keyof T, ValidationRule[]>
): ValidationResult {
  const fieldValidations: FieldValidation[] = Object.entries(schema).map(([field, rules]) => ({
    field,
    value: data[field],
    rules
  }));
  
  return validateFields(fieldValidations);
}

// Specific validators for common use cases
export function validateEmail(email: string): ValidationResult {
  return validateField({
    field: 'email',
    value: email,
    rules: [
      validationRules.required('Email'),
      validationRules.email('Email')
    ]
  });
}

export function validateName(name: string): ValidationResult {
  return validateField({
    field: 'name',
    value: name,
    rules: [
      validationRules.required('Name'),
      validationRules.minLength('Name', 2),
      validationRules.maxLength('Name', 100),
      validationRules.pattern('Name', /^[a-zA-Z\s\-'.]+$/, 'Name contains invalid characters')
    ]
  });
}

export function validateWaitlistData(data: {
  email: string;
  name?: string;
  locale?: string;
}): ValidationResult {
  const emailResult = validateEmail(data.email);
  const nameResult = data.name ? validateName(data.name) : { isValid: true, errors: [] };
  
  const localeResult = data.locale ? validateField({
    field: 'locale',
    value: data.locale,
    rules: [
      validationRules.oneOf('Locale', ['en-US', 'pt-BR', 'it-IT'])
    ]
  }) : { isValid: true, errors: [] };
  
  const allErrors = [
    ...emailResult.errors,
    ...nameResult.errors,
    ...localeResult.errors
  ];
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}

// Async validation helpers
export async function validateAsync<T>(
  value: T,
  validator: (value: T) => Promise<ValidationResult>
): Promise<ValidationResult> {
  try {
    return await validator(value);
  } catch {
    return {
      isValid: false,
      errors: ['Validation failed due to an error']
    };
  }
}

// Validation with error throwing
export function validateOrThrow<T extends Record<string, unknown>>(
  data: T,
  schema: Record<keyof T, ValidationRule[]>
): void {
  const result = validateFormData(data, schema);
  if (!result.isValid) {
    throw createValidationError(
      'Validation failed',
      { errors: result.errors }
    );
  }
}

// Debounced validation for real-time feedback
export function createDebouncedValidator<T>(
  validator: (value: T) => ValidationResult,
  delay = 300
): (value: T, callback: (result: ValidationResult) => void) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (value: T, callback: (result: ValidationResult) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = validator(value);
      callback(result);
    }, delay);
  };
}

// Form validation hook helper
export function createFormValidator<T extends Record<string, unknown>>(
  schema: Record<keyof T, ValidationRule[]>
) {
  return {
    validate: (data: T) => validateFormData(data, schema),
    validateField: (field: keyof T, value: unknown) => {
      const rules = schema[field] || [];
      return validateField({
        field: String(field),
        value,
        rules
      });
    }
  };
}
