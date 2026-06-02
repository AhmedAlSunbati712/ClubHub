import { Inbox } from 'lucide-react';

// Friendly empty state: icon + title + optional hint/action.
export default function EmptyState({ icon: Icon = Inbox, title, hint, children }) {
  return (
    <div className="empty">
      <span className="empty__icon">
        <Icon size={26} />
      </span>
      <p className="empty__title">{title}</p>
      {hint && <p className="empty__hint">{hint}</p>}
      {children}
    </div>
  );
}
