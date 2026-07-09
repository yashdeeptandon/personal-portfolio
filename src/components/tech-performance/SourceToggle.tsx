"use client";

interface Option<T extends string | number> {
  label: string;
  value: T;
}

export default function SourceToggle<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            value === opt.value
              ? "bg-indigo-500 text-white"
              : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
