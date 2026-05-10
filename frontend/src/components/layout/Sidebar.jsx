import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import { ROUTES } from '../../constants/routes.constants';
import styles from './Sidebar.module.css';

const navItems = [
  { to: ROUTES.DASHBOARD, icon: '🏠', label: 'Dashboard' },
  { to: ROUTES.TRIPS, icon: '✈️', label: 'My Trips' },
  { to: ROUTES.CITIES, icon: '🌆', label: 'Cities' },
  { to: ROUTES.ACTIVITIES, icon: '🎭', label: 'Activities' },
  { to: ROUTES.PROFILE, icon: '👤', label: 'Profile' },
];

const adminItems = [
  { to: ROUTES.ADMIN, icon: '⚙️', label: 'Admin' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside className={[styles.sidebar, isOpen ? styles.open : ''].join(' ')}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandLogo}>✈</div>
          <span className={styles.brandName}>Traveloop</span>
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          <p className={styles.navLabel}>Main Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [styles.navItem, isActive ? styles.active : ''].join(' ')
              }
              onClick={onClose}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navText}>{item.label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <p className={styles.navLabel} style={{ marginTop: 'var(--space-6)' }}>Admin</p>
              {adminItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [styles.navItem, isActive ? styles.active : ''].join(' ')
                  }
                  onClick={onClose}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navText}>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User */}
        <div className={styles.userSection}>
          <div className={styles.user}>
            <Avatar name={user?.name} src={user?.photo} size="sm" />
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user?.name || 'User'}</p>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
