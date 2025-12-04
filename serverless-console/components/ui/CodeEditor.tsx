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
        className="h-64 w-full resize-none rounded-md border border-[#11182f] bg-[#0c1224] px-4 py-3 font-mono text-sm text-[#3cf9a2] focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="absolute right-2 top-2 rounded bg-[#11182f] px-2 py-1 text-xs text-slate-300">
        Code Editor
      </div>
    </div>
  );
}
