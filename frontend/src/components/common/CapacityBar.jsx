import { capacityColor, capacityRatio } from '../../utils/capacity.js';

// progress bar (green/amber/red states). `compact` hides the label row (track only).
export default function CapacityBar({ filled = 0, total = 0, label = 'Capacity', compact = false }) {
  const color = capacityColor(filled, total);
  const pct = Math.round(capacityRatio(filled, total) * 100);

  return (
    <div className="capacity-bar" data-color={color}>
      {!compact && (
        <div className="capacity-bar__top">
          <span className="capacity-bar__label">{label}</span>
          <span className="capacity-bar__count">
            {filled} / {total}
          </span>
        </div>
      )}
      <div
        className="capacity-bar__track"
        role="progressbar"
        aria-valuenow={filled}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div className="capacity-bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
