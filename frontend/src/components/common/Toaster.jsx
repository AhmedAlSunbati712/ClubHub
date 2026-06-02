import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

// Renders the live toast stack.
export default function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="toaster" role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => {
        const Icon = ICONS[t.variant] ?? Info;
        return (
          <div key={t.id} className={`toast toast--${t.variant}`} role="status">
            <Icon className="toast__icon" size={18} />
            <span className="toast__msg">{t.message}</span>
            <button
              type="button"
              className="toast__close"
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
