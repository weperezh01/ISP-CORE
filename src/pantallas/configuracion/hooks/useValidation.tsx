import { useState, useCallback } from 'react';
import { VALIDATION_RULES, ERROR_MESSAGES } from '../constants/configurationConstants';

interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

interface ValidationErrors {
  [key: string]: string;
}

export const useValidation = (schema: ValidationSchema) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  const validate = useCallback((data: Record<string, any>): boolean => {
    const newErrors: ValidationErrors = {};

    Object.keys(schema).forEach((field) => {
      const rule = schema[field];
      const value = data[field];

      // Required validation
      if (rule.required && (!value || value === '')) {
        newErrors[field] = 'Este campo es requerido';
        return;
      }

      // Skip other validations if field is empty and not required
      if (!value && !rule.required) return;

      // Min validation (for numbers)
      if (rule.min !== undefined) {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < rule.min) {
          newErrors[field] = `El valor mínimo es ${rule.min}`;
          return;
        }
      }

      // Max validation (for numbers)
      if (rule.max !== undefined) {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue > rule.max) {
          newErrors[field] = `El valor máximo es ${rule.max}`;
          return;
        }
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        newErrors[field] = 'Formato inválido';
        return;
      }

      // Custom validation
      if (rule.custom) {
        const error = rule.custom(value);
        if (error) {
          newErrors[field] = error;
          return;
        }
      }
    });

    setErrors(newErrors);
    const valid = Object.keys(newErrors).length === 0;
    setIsValid(valid);
    return valid;
  }, [schema]);

  const validateField = useCallback((field: string, value: any): string | null => {
    const rule = schema[field];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || value === '')) {
      return 'Este campo es requerido';
    }

    // Skip other validations if field is empty and not required
    if (!value && !rule.required) return null;

    // Min validation (for numbers)
    if (rule.min !== undefined) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < rule.min) {
        return `El valor mínimo es ${rule.min}`;
      }
    }

    // Max validation (for numbers)
    if (rule.max !== undefined) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue > rule.max) {
        return `El valor máximo es ${rule.max}`;
      }
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      return 'Formato inválido';
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(false);
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
    setIsValid(false);
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    isValid,
    validate,
    validateField,
    clearErrors,
    setFieldError,
    clearFieldError,
  };
};

// Esquemas de validación predefinidos para configuración
export const speedConfigurationSchema: ValidationSchema = {
  uploadSpeed: {
    required: true,
    min: VALIDATION_RULES.MIN_SPEED,
    max: VALIDATION_RULES.MAX_SPEED,
    custom: (value) => {
      const num = parseFloat(value);
      if (isNaN(num)) return 'Debe ser un número válido';
      return null;
    },
  },
  downloadSpeed: {
    required: true,
    min: VALIDATION_RULES.MIN_SPEED,
    max: VALIDATION_RULES.MAX_SPEED,
    custom: (value) => {
      const num = parseFloat(value);
      if (isNaN(num)) return 'Debe ser un número válido';
      return null;
    },
  },
  uploadUnit: {
    required: true,
  },
  downloadUnit: {
    required: true,
  },
};

export const ipConfigurationSchema: ValidationSchema = {
  direccionIp: {
    required: true,
    pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    custom: (value) => {
      if (!value) return null;
      const parts = value.split('.');
      if (parts.length !== 4) return 'Formato de IP inválido';
      return null;
    },
  },
};

export const routerSelectionSchema: ValidationSchema = {
  selectedRouter: {
    required: true,
    custom: (value) => {
      if (!value || !value.id_router) return 'Debe seleccionar un router';
      return null;
    },
  },
};

export default useValidation;