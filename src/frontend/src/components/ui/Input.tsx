import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const base =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { className?: string };

export function Input({ className = '', ...props }: InputProps) {
  return <input className={`${base} ${className}`} {...props} />;
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string };

export function Textarea({ className = '', ...props }: TextareaProps) {
  return <textarea className={`${base} resize-none ${className}`} {...props} />;
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { className?: string };

export function Select({ className = '', children, ...props }: SelectProps) {
  return (
    <select className={`${base} ${className}`} {...props}>
      {children}
    </select>
  );
}
