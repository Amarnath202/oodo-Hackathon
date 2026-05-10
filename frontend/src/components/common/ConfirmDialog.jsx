import { useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import styles from './ConfirmDialog.module.css';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  requireTyping,
}) => {
  const [typed, setTyped] = useState('');

  const canConfirm = requireTyping ? typed === requireTyping : true;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm?.();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {message && <p className={styles.message}>{message}</p>}
      {requireTyping && (
        <div className={styles.typingField}>
          <p className={styles.typingLabel}>
            Type <strong>{requireTyping}</strong> to confirm:
          </p>
          <input
            type="text"
            className={styles.typingInput}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={requireTyping}
          />
        </div>
      )}
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant}
          onClick={handleConfirm}
          loading={loading}
          disabled={!canConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
