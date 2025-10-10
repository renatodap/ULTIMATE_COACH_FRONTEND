/**
 * Reusable form components for onboarding
 */
'use client'

import React, { useState } from 'react'
import { UseFormRegister, FieldError } from 'react-hook-form'

// ================================
// Text Input
// ================================

interface TextInputProps {
  label: string
  name: string
  placeholder?: string
  register: UseFormRegister<any>
  error?: FieldError
  required?: boolean
  helpText?: string
}

export function TextInput({
  label,
  name,
  placeholder,
  register,
  error,
  required,
  helpText,
}: TextInputProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-200">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type="text"
        id={name}
        {...register(name)}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
      {helpText && !error && (
        <p className="text-xs text-gray-400">{helpText}</p>
      )}
      {error && <p className="text-xs text-red-400">{error.message}</p>}
    </div>
  )
}

// ================================
// Text Area
// ================================

interface TextAreaProps {
  label: string
  name: string
  placeholder?: string
  register: UseFormRegister<any>
  error?: FieldError
  required?: boolean
  rows?: number
  helpText?: string
}

export function TextArea({
  label,
  name,
  placeholder,
  register,
  error,
  required,
  rows = 3,
  helpText,
}: TextAreaProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-200">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        {...register(name)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
      />
      {helpText && !error && (
        <p className="text-xs text-gray-400">{helpText}</p>
      )}
      {error && <p className="text-xs text-red-400">{error.message}</p>}
    </div>
  )
}

// ================================
// Tag Input (for arrays)
// ================================

interface TagInputProps {
  label: string
  name: string
  placeholder?: string
  value: string[]
  onChange: (value: string[]) => void
  error?: any
  required?: boolean
  helpText?: string
  maxTags?: number
}

export function TagInput({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  required,
  helpText,
  maxTags,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      if (maxTags && value.length >= maxTags) {
        return
      }
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()])
      }
      setInputValue('')
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-200">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs rounded"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          id={name}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
          disabled={maxTags ? value.length >= maxTags : false}
        />
      </div>
      {helpText && !error && (
        <p className="text-xs text-gray-400">{helpText}</p>
      )}
      {maxTags && (
        <p className="text-xs text-gray-400">
          {value.length} / {maxTags} items
        </p>
      )}
      {error && <p className="text-xs text-red-400">{error?.message || 'Invalid value'}</p>}
    </div>
  )
}

// ================================
// Select Dropdown
// ================================

interface SelectProps {
  label: string
  name: string
  options: { value: string; label: string }[]
  register: UseFormRegister<any>
  error?: FieldError
  required?: boolean
  helpText?: string
}

export function Select({
  label,
  name,
  options,
  register,
  error,
  required,
  helpText,
}: SelectProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-200">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <select
        id={name}
        {...register(name)}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helpText && !error && (
        <p className="text-xs text-gray-400">{helpText}</p>
      )}
      {error && <p className="text-xs text-red-400">{error.message}</p>}
    </div>
  )
}

// ================================
// Multi-Select Checkboxes
// ================================

interface MultiSelectProps {
  label: string
  name: string
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  error?: any
  required?: boolean
  helpText?: string
}

export function MultiSelect({
  label,
  name,
  options,
  value,
  onChange,
  error,
  required,
  helpText,
}: MultiSelectProps) {
  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-200">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 p-2 bg-gray-800 border border-gray-700 rounded cursor-pointer hover:bg-gray-750"
          >
            <input
              type="checkbox"
              checked={value.includes(option)}
              onChange={() => handleToggle(option)}
              className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-200">{option}</span>
          </label>
        ))}
      </div>
      {helpText && !error && (
        <p className="text-xs text-gray-400">{helpText}</p>
      )}
      {error && <p className="text-xs text-red-400">{error?.message || 'Invalid value'}</p>}
    </div>
  )
}

// ================================
// Number Input
// ================================

interface NumberInputProps {
  label: string
  name: string
  placeholder?: string
  register: UseFormRegister<any>
  error?: FieldError
  required?: boolean
  helpText?: string
  min?: number
  max?: number
}

export function NumberInput({
  label,
  name,
  placeholder,
  register,
  error,
  required,
  helpText,
  min,
  max,
}: NumberInputProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-200">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type="number"
        id={name}
        {...register(name, { valueAsNumber: true })}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
      {helpText && !error && (
        <p className="text-xs text-gray-400">{helpText}</p>
      )}
      {error && <p className="text-xs text-red-400">{error.message}</p>}
    </div>
  )
}
