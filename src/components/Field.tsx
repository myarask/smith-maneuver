"use client";

import { handleChange } from "@/global/store";
import { FormState } from "@/global/types";

interface FieldProps {
  name: keyof FormState;
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  step?: string;
  hint?: string;
}

export function Field({
  name,
  label,
  value,
  prefix,
  suffix,
  placeholder,
  step = "0.01",
  hint,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <div className="flex items-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-zinc-500">
        {prefix && (
          <span className="px-3 text-zinc-500 text-sm select-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          name={name}
          step={step}
          min="0"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className="flex-1 py-2 px-3 bg-transparent text-zinc-900 dark:text-zinc-50 outline-none text-sm"
        />
        {suffix && (
          <span className="px-3 text-zinc-500 text-sm select-none">
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>
      )}
    </div>
  );
}
