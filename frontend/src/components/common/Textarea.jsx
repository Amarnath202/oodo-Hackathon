import { forwardRef } from 'react';
import ErrorMessage from './ErrorMessage';
import styles from './Textarea.module.css';

const Textarea = forwardRef(({
  label,
  error,
  hint,
  required,
  rows = 4,
  placeholder,
  disabled,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={[styles.textarea, error ? styles.hasError : '', className].filter(Boolean).join(' ')}
        {...props}
      />
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && <ErrorMessage message={error} />}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
