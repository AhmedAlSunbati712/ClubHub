import { useCountUp } from '../../hooks/useCountUp.js';

// Animated number that counts up on mount.
export default function CountUp({ value = 0, duration }) {
  const display = useCountUp(value, duration);
  return <>{display.toLocaleString()}</>;
}
