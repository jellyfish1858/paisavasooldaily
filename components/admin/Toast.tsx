"use client";

export type ToastData = { type: "success" | "error"; message: string } | null;

export default function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: () => void;
}) {
  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-[70] w-[calc(100%-3rem)] max-w-sm animate-reveal-up border-2 border-line shadow-hard-lg"
    >
      <div
        className={`flex items-start justify-between gap-3 px-5 py-4 ${
          isSuccess ? "bg-green-50" : "bg-red-50"
        }`}
      >
        <div>
          <p
            className={`font-mono text-[11px] uppercase tracking-widest2 ${
              isSuccess ? "text-green-700" : "text-red-700"
            }`}
          >
            {isSuccess ? "Success" : "Error"}
          </p>
          <p className="mt-1 text-sm text-ink">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 font-mono text-xs text-ink hover:text-muted"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
