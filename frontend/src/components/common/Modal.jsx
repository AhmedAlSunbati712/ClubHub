import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Accessible overlay dialog: closes on Esc / backdrop click, restores focus.
export default function Modal({ open, onClose, title, children, labelledBy }) {
  const dialogRef = useRef(null);
  const lastActive = useRef(null);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    lastActive.current = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    // focus first focusable in dialog
    requestAnimationFrame(() => {
      const el = dialogRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      el?.focus();
    });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      lastActive.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal__head">
            <h2 className="modal__title" id={labelledBy}>
              {title}
            </h2>
            <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
