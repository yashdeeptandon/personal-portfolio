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
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
