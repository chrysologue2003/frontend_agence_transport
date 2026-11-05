import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footer,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow overflow-hidden ${className}`}
      {...props}
    >
      {(title || action) && (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-b border-slate-100/90 px-6 py-4 bg-slate-50/30 ${headerClassName}`}
        >
          <div>
            {title && (
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-5 sm:p-6 ${bodyClassName}`}>{children}</div>
      {footer && (
        <div className="border-t border-slate-100 px-6 py-3.5 bg-slate-50/60 text-xs text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
};
