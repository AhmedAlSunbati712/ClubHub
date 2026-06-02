import { createContext, useContext, useState, useCallback, useRef } from 'react';
import Modal from '../components/common/Modal.jsx';
import Button from '../components/common/Button.jsx';

const ConfirmContext = createContext(null);

const DEFAULTS = {
  title: 'Are you sure?',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'danger', // 'danger' | 'primary'
};

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((options = {}) => {
    setState({ ...DEFAULTS, ...options });
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (value) => {
    resolver.current?.(value);
    resolver.current = null;
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={Boolean(state)}
        onClose={() => settle(false)}
        title={state?.title}
        labelledBy="confirm-title"
      >
        {state?.message && <p className="modal__body">{state.message}</p>}
        <div className="modal__actions">
          <Button variant="secondary" onClick={() => settle(false)}>
            {state?.cancelLabel}
          </Button>
          <Button variant={state?.variant === 'danger' ? 'danger' : 'primary'} onClick={() => settle(true)}>
            {state?.confirmLabel}
          </Button>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
}
