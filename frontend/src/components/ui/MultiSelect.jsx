import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

/**
 * MultiSelect — dropdown with checkbox options.
 *
 *   options:     string[]
 *   value:       string[] (selected)
 *   onChange:    (next: string[]) => void
 *   placeholder: shown when nothing is selected (default "Any")
 */
const MultiSelect = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Any",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (opt) =>
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);

  const allSelected = options.length > 0 && value.length === options.length;

  const summary =
    value.length === 0
      ? placeholder
      : value.length <= 2
      ? value.join(", ")
      : `${value.length} selected`;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`input flex items-center justify-between gap-2 text-left ${
          value.length ? "pr-16" : "pr-10"
        }`}
      >
        <span className={`truncate text-sm ${value.length ? "text-ink" : "text-muted"}`}>
          {summary}
        </span>
      </button>

      {/* Controls sit over the button's right padding */}
      <div className="absolute inset-y-0 right-2 flex items-center gap-0.5">
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            aria-label="Clear selection"
            title="Clear"
            className="icon-btn !w-6 !h-6 text-muted hover:text-ink"
          >
            <X size={12} />
          </button>
        )}
        <ChevronDown
          size={14}
          className={`text-muted mx-1 transition-transform pointer-events-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-30 mt-1.5 w-full max-h-64 overflow-y-auto rounded-xl border border-line bg-surface shadow-lg p-1"
        >
          <button
            type="button"
            onClick={() => onChange(allSelected ? [] : [...options])}
            className="w-full text-left px-3 py-1.5 text-xs font-semibold text-brand hover:underline"
          >
            {allSelected ? "Clear all" : "Select all"}
          </button>
          {options.map((opt) => {
            const on = value.includes(opt);
            return (
              <div
                key={opt}
                role="option"
                aria-selected={on}
                tabIndex={0}
                onClick={() => toggle(opt)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(opt);
                  }
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer select-none hover:bg-surface-2 ${
                  on ? "text-ink font-medium" : "text-muted"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    on ? "bg-brand border-brand text-brand-ink" : "border-line bg-surface"
                  }`}
                >
                  {on && <Check size={11} strokeWidth={3} />}
                </span>
                <span className="truncate">{opt}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
