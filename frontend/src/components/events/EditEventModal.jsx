import { useEffect, useMemo, useState } from 'react';
import { AlignLeft, CalendarClock, ChevronDown, MapPin, Type, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import { useUpdateEvent } from '../../api/events.ts';
import { useLocations } from '../../api/locations.ts';

const EMPTY = {
  title: '',
  startTime: '',
  locationId: '',
  capacity: '',
  description: '',
};

export default function EditEventModal({ open, onClose, event, clubId }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const { data: locations = [] } = useLocations();
  const { mutate: updateEvent, isPending } = useUpdateEvent(() => {
    toast.success(`Event “${form.title.trim()}” updated`);
    close();
  });

  useEffect(() => {
    if (open && event) {
      setForm({
        title: event.title ?? '',
        startTime: event.date ? event.date.slice(0, 16) : '',
        locationId: String(event.locationId ?? ''),
        capacity: event.capacity ? String(event.capacity) : '',
        description: event.description ?? '',
      });
      setErrors({});
    }
    if (!open) {
      setForm(EMPTY);
      setErrors({});
    }
  }, [open, event]);

  const nowLocal = useMemo(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    const off = d.getTimezoneOffset();
    return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
  }, []);

  const room = (locations ?? []).find((location) => String(location.id) === form.locationId);

  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    const capacity = Number(form.capacity);

    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.startTime) next.startTime = 'Pick a date and time';
    else if (form.startTime < nowLocal) next.startTime = 'Date must be in the future';
    if (!form.locationId) next.locationId = 'Select a location';
    if (!form.capacity) next.capacity = 'Capacity is required';
    else if (!Number.isInteger(capacity) || capacity < 1) next.capacity = 'Capacity must be at least 1';
    else if (room && capacity > room.capacity) next.capacity = `Max ${room.capacity} for this room`;
    if (!form.description.trim()) next.description = 'Add a short description';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const close = () => {
    setForm(EMPTY);
    setErrors({});
    onClose?.();
  };

  const submit = (e) => {
    e.preventDefault();
    if (!event || !validate()) return;

    updateEvent(
      {
        eventId: event.id,
        clubId,
        payload: {
          title: form.title.trim(),
          description: form.description.trim(),
          eventDateTime: form.startTime,
          locationId: Number(form.locationId),
          eventCapacity: Number(form.capacity),
        },
      },
      {
        onError: (error) => {
          const message =
            error?.response?.data?.Error ||
            error?.response?.data?.errors?.[0]?.msg ||
            'Failed to update event';
          toast.error(message);
        },
      },
    );
  };

  return (
    <Modal open={open} onClose={close} title="Manage Event" labelledBy="edit-event-title">
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
            <select value={form.locationId} onChange={(e) => set('locationId', e.target.value)}>
              <option value="">Select a location…</option>
              {(locations ?? []).map((location) => (
                <option key={location.id} value={location.id}>
                  {location.building} — {location.room} ({location.capacity} seats)
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
              placeholder="What's this event about?"
            />
          </span>
          {errors.description && <span className="field__error">{errors.description}</span>}
        </label>

        <div className="modal__actions">
          <Button variant="secondary" type="button" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
