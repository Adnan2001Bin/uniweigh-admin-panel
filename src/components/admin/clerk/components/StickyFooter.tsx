import React from "react";
import { Trash2, X, Save, Check } from "lucide-react";

interface StickyFooterProps {
  isFormValid: boolean;
  onResetForm: () => void;
  onCancel: () => void;
  onSaveDraft: () => void;
  onComplete: () => void;
}

export default function StickyFooter({
  isFormValid,
  onResetForm,
  onCancel,
  onSaveDraft,
  onComplete
}: StickyFooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 flex h-[72px] items-center justify-between border-t border-gray-200 bg-white px-6 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onResetForm}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 cursor-pointer select-none"
        >
          <Trash2 className="h-3.5 w-3.5 text-gray-400" />
          <span>Reset fields</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 cursor-pointer select-none"
        >
          <X className="h-3.5 w-3.5 text-gray-400" />
          <span>Cancel entry</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSaveDraft()}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-4 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 cursor-pointer select-none"
        >
          <Save className="h-3.5 w-3.5 text-gray-500" />
          <span>Save as draft</span>
        </button>

        <button
          type="button"
          onClick={() => onComplete()}
          disabled={!isFormValid}
          className={`inline-flex h-10 items-center gap-2 rounded-lg px-5 text-xs font-medium transition-colors select-none ${
            isFormValid
              ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-sm"
              : "cursor-not-allowed bg-gray-100 text-gray-400"
          }`}
        >
          <Check className="h-3.5 w-3.5" />
          <span>Complete & print</span>
        </button>
      </div>
    </footer>
  );
}
