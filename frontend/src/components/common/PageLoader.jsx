import Spinner from './Spinner';
import styles from './PageLoader.module.css';

const PageLoader = ({ message = 'Loading...' }) => (
  <div className={styles.container}>
    <Spinner size="lg" />
    <p className={styles.message}>{message}</p>
  </div>
);

export default PageLoader;
