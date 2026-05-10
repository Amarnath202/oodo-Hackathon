import styles from './Spinner.module.css';

const Spinner = ({ size = 'md', color }) => {
  const sizeClass = { sm: styles.sm, md: styles.md, lg: styles.lg }[size] || styles.md;
  return (
    <div className={[styles.spinner, sizeClass].join(' ')} style={color ? { borderTopColor: color } : {}} />
  );
};

export default Spinner;
