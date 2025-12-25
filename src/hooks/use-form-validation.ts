/**
 * Form Validation Hook - "Reward Early, Punish Late" Pattern
 *
 * Implements industry-leading form validation UX pattern:
 * - **Reward Early**: Show success indicators immediately when field is valid
 * - **Punish Late**: Only show errors after user has left the field (onBlur)
 *
 * **Research-Backed Benefits**:
 * - 22% better form completion rates
 * - 42% faster completion time
 * - Reduced user frustration and cognitive load
 *
 * @see https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux/
 * @see docs/ai/form-validation-pattern.md
 */

import { useState, useCallback, useRef } from 'react'

/**
 * Validation rule definition
 */
export type ValidationRule<T = string> = {
  /** Validation function - returns error message if invalid, null if valid */
  validate: (value: T) => string | null
  /** Optional: only validate after first blur (default: false for required checks) */
  onBlurOnly?: boolean
}

/**
 * Field state for a single form field
 */
export type FieldState = {
  value: string
  error: string | null
  touched: boolean
  /** True if field has been blurred at least once */
  blurred: boolean
  /** True if field is currently valid */
  isValid: boolean
  /** True if field should show success indicator */
  showSuccess: boolean
}

/**
 * Form validation configuration
 */
export type FormConfig<T extends Record<string, string>> = {
  /** Initial field values */
  initialValues: T
  /** Validation rules for each field */
  validationRules: {
    [K in keyof T]?: ValidationRule[]
  }
  /** Callback when form is successfully validated and submitted */
  onSubmit: (values: T) => Promise<void> | void
}

/**
 * Return type for useFormValidation hook
 */
export type UseFormValidationReturn<T extends Record<string, string>> = {
  /** Current field values */
  values: T
  /** Field states (error, touched, valid, etc.) */
  fieldStates: Record<keyof T, FieldState>
  /** Whether form is currently submitting */
  isSubmitting: boolean
  /** Update a field's value */
  setValue: (field: keyof T, value: string) => void
  /** Handle field blur event */
  handleBlur: (field: keyof T) => void
  /** Handle form submission */
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  /** Reset form to initial state */
  reset: () => void
  /** Check if entire form is valid */
  isFormValid: boolean
}

/**
 * Built-in validation rules (common patterns)
 */
export const validators = {
  /** Required field validator */
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => (!value || value.trim() === '' ? message : null),
    onBlurOnly: false, // Show immediately on submit
  }),

  /** Email format validator */
  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    validate: (value) => {
      if (!value) return null // Only validate if value exists (combine with required)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value) ? null : message
    },
    onBlurOnly: true, // Only show after blur (Punish Late)
  }),

  /** Minimum length validator */
  minLength: (
    min: number,
    message = `Must be at least ${min} characters`
  ): ValidationRule => ({
    validate: (value) => {
      if (!value) return null // Only validate if value exists
      return value.length >= min ? null : message
    },
    onBlurOnly: true, // Only show after blur
  }),

  /** Maximum length validator */
  maxLength: (
    max: number,
    message = `Must be no more than ${max} characters`
  ): ValidationRule => ({
    validate: (value) => {
      if (!value) return null
      return value.length <= max ? null : message
    },
    onBlurOnly: true,
  }),

  /** Pattern matching validator */
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value) => {
      if (!value) return null
      return regex.test(value) ? null : message
    },
    onBlurOnly: true,
  }),

  /** Custom validator */
  custom: (
    validator: (value: string) => boolean,
    message: string,
    onBlurOnly = true
  ): ValidationRule => ({
    validate: (value) => (validator(value) ? null : message),
    onBlurOnly,
  }),
}

/**
 * Form validation hook implementing "Reward Early, Punish Late" pattern
 *
 * @example
 * ```tsx
 * const { values, fieldStates, setValue, handleBlur, handleSubmit } = useFormValidation({
 *   initialValues: { email: '', name: '' },
 *   validationRules: {
 *     email: [validators.required(), validators.email()],
 *     name: [validators.required(), validators.minLength(2)],
 *   },
 *   onSubmit: async (values) => {
 *     await sendToAPI(values)
 *   },
 * })
 * ```
 */
export function useFormValidation<T extends Record<string, string>>({
  initialValues,
  validationRules,
  onSubmit,
}: FormConfig<T>): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Track field states separately for granular control
  const [fieldStates, setFieldStates] = useState<Record<keyof T, FieldState>>(
    () =>
      Object.keys(initialValues).reduce(
        (acc, key) => ({
          ...acc,
          [key]: {
            value: initialValues[key as keyof T],
            error: null,
            touched: false,
            blurred: false,
            isValid: false,
            showSuccess: false,
          },
        }),
        {} as Record<keyof T, FieldState>
      )
  )

  // Ref to track if form has been submitted (for showing all errors)
  const hasSubmittedRef = useRef(false)

  /**
   * Validate a single field
   * Returns error message if invalid, null if valid
   */
  const validateField = useCallback(
    (field: keyof T, value: string, isBlurred: boolean): string | null => {
      const rules = validationRules[field]
      if (!rules || rules.length === 0) return null

      // Run all validation rules
      for (const rule of rules) {
        // Skip onBlurOnly rules if field hasn't been blurred and form hasn't been submitted
        if (rule.onBlurOnly && !isBlurred && !hasSubmittedRef.current) {
          continue
        }

        const error = rule.validate(value)
        if (error) return error
      }

      return null
    },
    [validationRules]
  )

  /**
   * Update a field's value and validate it
   * Implements "Reward Early" - shows success immediately when valid
   */
  const setValue = useCallback(
    (field: keyof T, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }))

      const currentFieldState = fieldStates[field]
      const error = validateField(field, value, currentFieldState.blurred)
      const isValid = error === null
      const showSuccess =
        isValid && value.trim() !== '' && currentFieldState.blurred

      setFieldStates((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          value,
          error,
          touched: true,
          isValid,
          showSuccess,
        },
      }))
    },
    [validateField, fieldStates]
  )

  /**
   * Handle field blur event
   * Implements "Punish Late" - only show errors after user leaves field
   */
  const handleBlur = useCallback(
    (field: keyof T) => {
      const value = values[field]
      const error = validateField(field, value, true)
      const isValid = error === null
      const showSuccess = isValid && value.trim() !== ''

      setFieldStates((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          blurred: true,
          error,
          isValid,
          showSuccess,
        },
      }))
    },
    [values, validateField]
  )

  /**
   * Validate all fields (used on submit)
   */
  const validateAllFields = useCallback((): boolean => {
    let isValid = true
    const newFieldStates = { ...fieldStates }

    Object.keys(values).forEach((key) => {
      const field = key as keyof T
      const value = values[field]
      const error = validateField(field, value, true)

      if (error) {
        isValid = false
      }

      newFieldStates[field] = {
        ...newFieldStates[field],
        blurred: true,
        error,
        isValid: error === null,
        showSuccess: error === null && value.trim() !== '',
      }
    })

    setFieldStates(newFieldStates)
    return isValid
  }, [values, validateField, fieldStates])

  /**
   * Handle form submission
   * Validates all fields and calls onSubmit if valid
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      hasSubmittedRef.current = true

      const isValid = validateAllFields()
      if (!isValid) return

      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } finally {
        setIsSubmitting(false)
      }
    },
    [validateAllFields, onSubmit, values]
  )

  /**
   * Reset form to initial state
   */
  const reset = useCallback(() => {
    setValues(initialValues)
    hasSubmittedRef.current = false
    setFieldStates(
      Object.keys(initialValues).reduce(
        (acc, key) => ({
          ...acc,
          [key]: {
            value: initialValues[key as keyof T],
            error: null,
            touched: false,
            blurred: false,
            isValid: false,
            showSuccess: false,
          },
        }),
        {} as Record<keyof T, FieldState>
      )
    )
  }, [initialValues])

  /**
   * Check if entire form is valid
   */
  const isFormValid = Object.keys(fieldStates).every(
    (key) => fieldStates[key as keyof T].isValid
  )

  return {
    values,
    fieldStates,
    isSubmitting,
    setValue,
    handleBlur,
    handleSubmit,
    reset,
    isFormValid,
  }
}
