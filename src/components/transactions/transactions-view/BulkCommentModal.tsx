import { FileText, X } from "lucide-react";

interface BulkCommentModalProps {
  show: boolean;
  selectedIds: string[];
  commentText: string;
  setCommentText: (v: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function BulkCommentModal({
  show,
  selectedIds,
  commentText,
  setCommentText,
  onCancel,
  onSubmit,
}: BulkCommentModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-150 shadow-2xl p-6 relative animate-zoom-in">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition"
        >
          <X className="h-4.5 w-4.5" />
        </button>
        <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider mb-2 flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-blue-600" />
          <span>Add Bulk Comment / Annotation</span>
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Add a custom back-office comment or operation annotation to all{" "}
          <span className="font-bold text-gray-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
            {selectedIds.length} selected ticket(s)
          </span>{" "}
          simultaneously. This will be permanently recorded in their audit log
          history.
        </p>

        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase text-gray-500">Comment Text</label>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="e.g. Approved and verified as per dispatch sheet #401. Loading site approved."
            rows={4}
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 mt-5 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!commentText.trim()}
            className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition ${
              commentText.trim()
                ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                : "bg-gray-300 cursor-not-allowed opacity-60"
            }`}
          >
            Apply Comment ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  );
}
