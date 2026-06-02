import { events as fixtureEvents } from '../data/fixtures.js';

// list, RSVP, check-in, waitlist. TODO: wire to api/events.js.
export function useEvents() {
  const events = fixtureEvents;
  const loading = false;
  const error = null;

  const rsvp = async (eventId) => {};
  const checkIn = async (eventId) => {};
  const waitlist = async (eventId) => {};

  return { events, loading, error, rsvp, checkIn, waitlist };
}
