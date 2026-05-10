import styles from './Badge.module.css';

const variantClass = {
  primary: styles.primary,
  success: styles.success,
  warning: styles.warning,
  error: styles.error,
  info: styles.info,
  neutral: styles.neutral,
};

const Badge = ({ children, variant = 'neutral', className = '' }) => (
  <span className={[styles.badge, variantClass[variant] || styles.neutral, className].filter(Boolean).join(' ')}>
    {children}
  </span>
);

export default Badge;
