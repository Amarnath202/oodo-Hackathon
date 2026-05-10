import { forwardRef } from 'react';
import ErrorMessage from './ErrorMessage';
import styles from './Select.module.css';

const Select = forwardRef(({
  label,
  error,
  hint,
  required,
  disabled,
  options = [],
  placeholder = 'Select...',
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
      <div className={[styles.wrapper, error ? styles.hasError : '', disabled ? styles.disabled : ''].filter(Boolean).join(' ')}>
        <select
          ref={ref}
          disabled={disabled}
          className={[styles.select, className].filter(Boolean).join(' ')}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className={styles.arrow}>▾</span>
      </div>
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && <ErrorMessage message={error} />}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
