import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import { ROUTES } from '../../constants/routes.constants';
import styles from './Navbar.module.css';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  return (
    <header className={styles.navbar}>
      <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Toggle menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className={styles.search}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input type="text" placeholder="Search trips, cities..." className={styles.searchInput} />
      </div>

      <div className={styles.right}>
        <Link to={ROUTES.CREATE_TRIP} className={styles.newTripBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Trip
        </Link>

        <button
          className={styles.avatarBtn}
          onClick={() => navigate(ROUTES.PROFILE)}
          title="Profile"
        >
          <Avatar name={user?.name} src={user?.photo} size="sm" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
