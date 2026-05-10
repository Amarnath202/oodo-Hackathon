import styles from './ErrorMessage.module.css';

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <p className={styles.error} role="alert" aria-live="polite">
      <span className={styles.icon}>⚠</span>
      {message}
    </p>
  );
};

export default ErrorMessage;
