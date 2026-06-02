// Capacity color logic: full = red, near-full = amber, else green.

export const CAPACITY_COLORS = {
  FULL: 'full',
  NEAR: 'near',
  OPEN: 'open',
};

const NEAR_FULL_THRESHOLD = 0.8;

/** Returns a fraction 0..1 of seats taken. */
export function capacityRatio(filled, total) {
  if (!total || total <= 0) return 0;
  return Math.min(filled / total, 1);
}

/** Returns 'full' | 'near' | 'open' based on how full the event is. */
export function capacityColor(filled, total) {
  const ratio = capacityRatio(filled, total);
  if (ratio >= 1) return CAPACITY_COLORS.FULL;
  if (ratio >= NEAR_FULL_THRESHOLD) return CAPACITY_COLORS.NEAR;
  return CAPACITY_COLORS.OPEN;
}

/** Remaining seats (never negative). */
export function seatsLeft(filled, total) {
  return Math.max((total ?? 0) - (filled ?? 0), 0);
}

export function isFull(filled, total) {
  return capacityRatio(filled, total) >= 1;
}
