import { useEffect, useState } from 'react';
import { Building2, DoorOpen, Users } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';

const EMPTY_FORM = {
  building: '',
  room: '',
  capacity: '',
};

export default function EditLocationModal({
  open,
  onClose,
  location,
  onSubmit,
  isSubmitting = false,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && location) {
      setForm({
        building: location.building ?? '',
        room: location.room ?? '',
        capacity: String(location.capacity ?? ''),
      });
      setErrors({});
    }
    if (!open) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }, [open, location]);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const close = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose?.();
  };

  const validate = () => {
    const next = {};
    const capacity = Number(form.capacity);

    if (!form.building.trim()) next.building = 'Building is required';
    if (!form.room.trim()) next.room = 'Room is required';
    if (!form.capacity) next.capacity = 'Capacity is required';
    else if (!Number.isInteger(capacity) || capacity < 1) next.capacity = 'Capacity must be at least 1';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit?.({
      building: form.building.trim(),
      room: form.room.trim(),
      capacity: Number(form.capacity),
    });
  };

  return (
    <Modal open={open} onClose={close} title="Edit Location" labelledBy="edit-location-title">
      <form className="form" onSubmit={submit} noValidate>
        <label className={`field${errors.building ? ' field--error' : ''}`}>
          <span className="field__label">Building</span>
          <span className="field__control">
            <Building2 className="field__icon" size={17} />
            <input
              type="text"
              value={form.building}
              onChange={(e) => setField('building', e.target.value)}
              placeholder="Collis Center"
            />
          </span>
          {errors.building && <span className="field__error">{errors.building}</span>}
        </label>

        <div className="form__row">
          <label className={`field${errors.room ? ' field--error' : ''}`}>
            <span className="field__label">Room</span>
            <span className="field__control">
              <DoorOpen className="field__icon" size={17} />
              <input
                type="text"
                value={form.room}
                onChange={(e) => setField('room', e.target.value)}
                placeholder="201"
              />
            </span>
            {errors.room && <span className="field__error">{errors.room}</span>}
          </label>

          <label className={`field${errors.capacity ? ' field--error' : ''}`}>
            <span className="field__label">Capacity</span>
            <span className="field__control">
              <Users className="field__icon" size={17} />
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setField('capacity', e.target.value)}
                placeholder="50"
              />
            </span>
            {errors.capacity && <span className="field__error">{errors.capacity}</span>}
          </label>
        </div>

        <div className="modal__actions">
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
