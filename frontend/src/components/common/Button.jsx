import styles from './Button.module.css';

const sizeMap = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

const variantMap = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
  danger: styles.danger,
  outline: styles.outline,
  success: styles.success,
};

const Spinner = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ animation: 'spin 0.8s linear infinite' }}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" strokeLinecap="round" />
  </svg>
);

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const cls = [
    styles.btn,
    variantMap[variant] || styles.primary,
    sizeMap[size] || styles.md,
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={16} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && <span className={styles.icon}>{icon}</span>}
          {children}
          {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
