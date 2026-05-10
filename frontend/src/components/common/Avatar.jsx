import styles from './Avatar.module.css';

const Avatar = ({ name, src, size = 'md' }) => {
  const sizeClass = { sm: styles.sm, md: styles.md, lg: styles.lg, xl: styles.xl }[size] || styles.md;
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className={[styles.avatar, sizeClass].join(' ')}>
      {src ? (
        <img src={src} alt={name} className={styles.img} />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
