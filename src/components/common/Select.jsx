import React from 'react';

export const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Sélectionner...',
  error,
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
          className="block text-xs font-bold text-slate-700 mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`block w-full rounded-xl border bg-white text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-4 transition-all px-3.5 py-2.5 shadow-2xs ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
            : 'border-slate-300/90 focus:border-blue-500 focus:ring-blue-500/10'
        } disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer`}
        {...props}
      >
        <option value="">
          {placeholder}
        </option>
        {options.map((opt) => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={optValue} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600 font-semibold">{error}</p>}
    </div>
  );
};
