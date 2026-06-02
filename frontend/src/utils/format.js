// Date/time formatting helpers.

const DATE_OPTS = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
};

const TIME_OPTS = {
  hour: 'numeric',
  minute: '2-digit',
};

/** "Tue, May 26 at 7:00 PM" */
export function formatEventDate(input) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  const day = date.toLocaleDateString('en-US', DATE_OPTS);
  const time = date.toLocaleTimeString('en-US', TIME_OPTS);
  return `${day} at ${time}`;
}

/** "May 26, 2026" */
export function formatDate(input) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
