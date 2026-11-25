import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const base =
  'w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-slate-100'

interface FieldProps {
  label?: string
  error?: string
}

function Wrapper({ label, error, children }: FieldProps & { children: ReactNode }) {
  return (
    <label className="block text-sm">
      {label && <span className="mb-1 block font-medium text-slate-700">{label}</span>}
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

export function Input({ label, error, className = '', ...props }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrapper label={label} error={error}>
      <input className={`${base} ${error ? 'border-red-400' : 'border-slate-300'} ${className}`} {...props} />
    </Wrapper>
  )
}

export function Select({ label, error, className = '', children, ...props }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Wrapper label={label} error={error}>
      <select className={`${base} ${error ? 'border-red-400' : 'border-slate-300'} ${className}`} {...props}>
        {children}
      </select>
    </Wrapper>
  )
}

export function Textarea({ label, error, className = '', ...props }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrapper label={label} error={error}>
      <textarea rows={3} className={`${base} ${error ? 'border-red-400' : 'border-slate-300'} ${className}`} {...props} />
    </Wrapper>
  )
}
