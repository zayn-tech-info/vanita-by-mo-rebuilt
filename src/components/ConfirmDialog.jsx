import { useEffect } from "react";
import { AlertTriangle, Info, X } from "lucide-react";

const variantStyles = {
  danger: {
    iconBg: "bg-red-50 border-red-100",
    iconColor: "text-red-600",
    confirm:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  },
  default: {
    iconBg: "bg-amber-50 border-amber-100",
    iconColor: "text-amber-700",
    confirm:
      "bg-stone-900 text-white hover:bg-stone-800 focus-visible:ring-stone-500",
  },
};

/**
 * Replaces native window.confirm / window.alert with a styled modal.
 * Omit cancelLabel (or pass null) for alert-style single-button dialogs.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  icon,
}) {
  const isAlert = cancelLabel == null;
  const styles = variantStyles[variant] ?? variantStyles.default;
  const Icon = variant === "danger" ? AlertTriangle : Info;

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  const handleConfirm = () => {
    if (loading) return;
    onConfirm?.();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60"
        onClick={loading ? undefined : onClose}
        aria-hidden="true"
      />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-70 w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start gap-4">
            <div
              className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 ${styles.iconBg}`}
            >
              {icon ?? <Icon size={22} className={styles.iconColor} />}
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <h2
            id="confirm-dialog-title"
            className="text-xl font-medium text-stone-900 tracking-wide mt-4"
          >
            {title}
          </h2>
          <p
            id="confirm-dialog-desc"
            className="text-stone-600 font-light text-sm sm:text-base mt-2 leading-relaxed"
          >
            {message}
          </p>

          <div
            className={`mt-6 sm:mt-8 flex gap-3 ${isAlert ? "flex-col" : "flex-col-reverse sm:flex-row sm:justify-end"}`}
          >
            {!isAlert && (
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 sm:flex-none px-5 py-3 border border-stone-300 text-stone-700 text-xs tracking-[0.15em] uppercase rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 sm:flex-none px-5 py-3 text-xs tracking-[0.15em] uppercase rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 ${styles.confirm}`}
            >
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
