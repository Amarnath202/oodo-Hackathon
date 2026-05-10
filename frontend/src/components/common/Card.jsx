import styles from './Card.module.css';

const Card = ({ children, className = '', hover = false, padding = 'md', ...props }) => {
  const paddingClass = { sm: styles.paddingSm, md: styles.paddingMd, lg: styles.paddingLg }[padding] || styles.paddingMd;
  return (
    <div
      className={[styles.card, hover ? styles.hover : '', paddingClass, className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
