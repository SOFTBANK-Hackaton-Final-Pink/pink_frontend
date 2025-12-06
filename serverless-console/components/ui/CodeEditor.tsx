import React from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({ value, onChange, readOnly = false }: CodeEditorProps) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        spellCheck={false}
        className="h-64 w-full resize-none rounded-xl border border-[#ffb7d5] bg-[#fffaf4] px-4 py-3 font-mono text-sm text-[#1f2933] caret-[#ff6b9d] shadow-[0_10px_30px_rgba(255,107,157,0.1)] focus:outline-none focus:ring-2 focus:ring-[#ff6b9d] focus:border-[#ff6b9d]"
      />
      <div className="absolute right-2 top-2 rounded-full bg-[#ff6b9d] px-3 py-1 text-xs font-semibold text-white shadow-sm">
        Code Editor
      </div>
    </div>
  );
}
