"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A text input with a suggestion dropdown, standing in for `<input list=…>`
 * + `<datalist>`. iOS Safari — what the whole field team uses — doesn't
 * reliably show native datalist suggestions at all, so every "type or pick
 * from a list" field in the app (product name, category, segment, …) was
 * silently missing its dropdown on the phones actually used in the field.
 * This renders the suggestion list itself instead of relying on the browser.
 *
 * Works both as an uncontrolled field (just give it `name` + `options` and
 * read the value from FormData like any input) and as a controlled one
 * (pass `value` + `onValueChange`, e.g. to prefill a price when a catalog
 * product is picked — see OrderItemsField).
 */
export function Autocomplete({
  name,
  id,
  value,
  defaultValue,
  onValueChange,
  options,
  placeholder,
  required,
  className = "input-field",
  maxSuggestions = 8,
}: {
  name?: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  maxSuggestions?: number;
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const current = isControlled ? value : internal;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  function setValue(v: string) {
    if (!isControlled) setInternal(v);
    onValueChange?.(v);
  }

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const needle = current.trim().toLowerCase();
  const filtered = options
    .filter((o) => o.toLowerCase().includes(needle))
    .slice(0, maxSuggestions);
  // Don't show a single suggestion that already exactly matches what's typed.
  const showDropdown = open && filtered.length > 0 && !(filtered.length === 1 && filtered[0] === current);

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        name={name}
        id={id}
        required={required}
        placeholder={placeholder}
        className={className}
        value={current}
        autoComplete="off"
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {showDropdown && (
        <ul className="absolute z-20 left-0 right-0 mt-1 max-h-52 overflow-auto rounded-lg border border-[var(--border)] bg-white shadow-lg">
          {filtered.map((o) => (
            <li key={o}>
              <button
                type="button"
                // Fires before the input's onBlur/document mousedown would
                // close the dropdown, so the click actually registers.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setValue(o);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-[var(--ink)] hover:bg-[var(--offwhite)]"
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
