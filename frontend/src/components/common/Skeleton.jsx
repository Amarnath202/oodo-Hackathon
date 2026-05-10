import styles from './Skeleton.module.css';

export const Skeleton = ({ width, height, borderRadius, className = '' }) => (
  <div
    className={[styles.skeleton, className].join(' ')}
    style={{ width, height, borderRadius }}
  />
);

export const SkeletonCard = () => (
  <div className={styles.card}>
    <Skeleton height={180} borderRadius="var(--radius-lg) var(--radius-lg) 0 0" />
    <div className={styles.cardBody}>
      <Skeleton height={20} width="70%" />
      <Skeleton height={14} width="50%" />
      <div className={styles.row}>
        <Skeleton height={14} width="40%" />
        <Skeleton height={14} width="30%" />
      </div>
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className={styles.textBlock}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} height={14} width={i === lines - 1 ? '60%' : '100%'} />
    ))}
  </div>
);

export default Skeleton;
