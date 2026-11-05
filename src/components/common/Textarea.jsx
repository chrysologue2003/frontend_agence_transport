import React from 'react';

export const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  rows = 3,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`block w-full rounded-lg border bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 transition-all px-3.5 py-2.5 ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
            : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
        } disabled:bg-slate-50 disabled:text-slate-500`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};
