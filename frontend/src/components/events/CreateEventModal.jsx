import { useMemo, useState } from 'react';
import { Type, CalendarClock, MapPin, Users, AlignLeft, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import { useCreateEvent } from '../../api/events.ts';
import { useLocations } from '../../api/locations.ts';

/**
 * Create Event form.
 *
 * Maps to the backend Event entity (to be implemented):
 *   ClubID (int, FK)      <- club
 *   Title (str)           <- title
 *   Description (str)     <- description
 *   StartTime (datetime)  <- startTime
 *   LocationID (int, FK)  <- locationId  (room carries seat capacity)
 *   Capacity (int > 0)    <- capacity    (must be <= room capacity)
 *   Status (EventStatus)  -> defaults to "Published" on the server
 */
const EMPTY = {
  title: '',
  clubId: '',
  startTime: '',
  locationId: '',
  capacity: '',
  description: '',
};

export default function CreateEventModal({ open, onClose, clubs = [], defaultClubId = '' }) {
  const [form, setForm] = useState({ ...EMPTY, clubId: defaultClubId });
  const [errors, setErrors] = useState({});
  const lockClub = clubs.length === 1;
  const { data: locations } = useLocations();
  const { mutate: createEvent, isPending: isPendingCreateEvent } = useCreateEvent(() => {
    toast.success(`Event “${form.title.trim()}” created`);
    close();
  });

  // local datetime string for the <input min>
  const nowLocal = useMemo(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    const off = d.getTimezoneOffset();
    return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
  }, []);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onLocation = (id) => {
    const room = (locations ?? []).find((location) => String(location.id) === id);
    setForm((f) => ({
      ...f,
      locationId: id,
      // default capacity to the room's seats unless the user already set a value
      capacity: f.capacity ? f.capacity : room ? String(room.capacity) : '',
    }));
    setErrors((e) => ({ ...e, locationId: undefined, capacity: undefined }));
  };

  const validate = () => {
    const next = {};
    const room = (locations ?? []).find((location) => String(location.id) === form.locationId);
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.clubId) next.clubId = 'Select a host club';
    if (!form.startTime) next.startTime = 'Pick a date and time';
    else if (form.startTime < nowLocal) next.startTime = 'Date must be in the future';
    if (!form.locationId) next.locationId = 'Select a location';
    const cap = Number(form.capacity);
    if (!form.capacity) next.capacity = 'Capacity is required';
    else if (!Number.isInteger(cap) || cap < 1) next.capacity = 'Capacity must be at least 1';
    else if (room && cap > room.capacity) next.capacity = `Max ${room.capacity} for this room`;
    if (!form.description.trim()) next.description = 'Add a short description';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const close = () => {
    setForm({ ...EMPTY, clubId: defaultClubId });
    setErrors({});
    onClose?.();
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    createEvent(
      {
        clubId: Number(form.clubId),
        locationId: Number(form.locationId),
        title: form.title.trim(),
        description: form.description.trim(),
        eventDateTime: form.startTime,
        eventCapacity: Number(form.capacity),
      },
      {
        onError: (error) => {
          const message =
            error?.response?.data?.Error ||
            error?.response?.data?.errors?.[0]?.msg ||
            'Failed to create event';
          toast.error(message);
        },
      },
    );
  };

  const room = (locations ?? []).find((location) => String(location.id) === form.locationId);

  return (
    <Modal open={open} onClose={close} title="Create Event" labelledBy="create-event-title">
      <form className="form" onSubmit={submit} noValidate>
        <label className={`field${errors.title ? ' field--error' : ''}`}>
          <span className="field__label">Event title</span>
          <span className="field__control">
            <Type className="field__icon" size={17} />
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Intro to React Workshop"
            />
          </span>
          {errors.title && <span className="field__error">{errors.title}</span>}
        </label>

        <label className={`field${errors.clubId ? ' field--error' : ''}`}>
          <span className="field__label">Host club</span>
          <span className="field__control field__control--select">
            <Users className="field__icon" size={17} />
            <select
              value={form.clubId}
              onChange={(e) => set('clubId', e.target.value)}
              disabled={lockClub}
            >
              <option value="">Select a club…</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="field__chevron" size={16} />
          </span>
          {errors.clubId && <span className="field__error">{errors.clubId}</span>}
        </label>

        <div className="form__row">
          <label className={`field${errors.startTime ? ' field--error' : ''}`}>
            <span className="field__label">Date &amp; time</span>
            <span className="field__control">
              <CalendarClock className="field__icon" size={17} />
              <input
                type="datetime-local"
                value={form.startTime}
                min={nowLocal}
                onChange={(e) => set('startTime', e.target.value)}
              />
            </span>
            {errors.startTime && <span className="field__error">{errors.startTime}</span>}
          </label>

          <label className={`field${errors.capacity ? ' field--error' : ''}`}>
            <span className="field__label">Capacity</span>
            <span className="field__control">
              <Users className="field__icon" size={17} />
              <input
                type="number"
                min={1}
                max={room?.capacity}
                value={form.capacity}
                onChange={(e) => set('capacity', e.target.value)}
                placeholder="100"
              />
            </span>
            {errors.capacity ? (
              <span className="field__error">{errors.capacity}</span>
            ) : (
              room && <span className="field__hint">Room seats {room.capacity}</span>
            )}
          </label>
        </div>

        <label className={`field${errors.locationId ? ' field--error' : ''}`}>
          <span className="field__label">Location</span>
          <span className="field__control field__control--select">
            <MapPin className="field__icon" size={17} />
            <select value={form.locationId} onChange={(e) => onLocation(e.target.value)}>
              <option value="">Select a location…</option>
              {(locations ?? []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.building} — {l.room} ({l.capacity} seats)
                </option>
              ))}
            </select>
            <ChevronDown className="field__chevron" size={16} />
          </span>
          {errors.locationId && <span className="field__error">{errors.locationId}</span>}
        </label>

        <label className={`field${errors.description ? ' field--error' : ''}`}>
          <span className="field__label">Description</span>
          <span className="field__control field__control--area">
            <AlignLeft className="field__icon field__icon--top" size={17} />
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="What's this event about? Who should come?"
            />
          </span>
          {errors.description && <span className="field__error">{errors.description}</span>}
        </label>

        <div className="modal__actions">
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPendingCreateEvent}>
            {isPendingCreateEvent ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
