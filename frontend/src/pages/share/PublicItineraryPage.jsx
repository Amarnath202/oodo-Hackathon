import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useShare from '../../hooks/useShare';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';
import { formatDateRange, getDurationDays } from '../../utils/formatDate.util';
import { formatCurrency } from '../../utils/formatCurrency.util';
import styles from './PublicItineraryPage.module.css';
import { ROUTES } from '../../constants/routes.constants';

const ACTIVITY_ICONS = {
  sightseeing: '🎭',
  food: '🍽️',
  adventure: '🧗',
  shopping: '🛍️',
  culture: '🏛️',
  wellness: '🧘',
  default: '✨'
};

const ACTIVITY_COLORS = {
  sightseeing: 'var(--color-primary-soft)',
  food: '#ffedd5',
  adventure: '#dcfce7',
  shopping: '#f3e8ff',
  culture: '#fef3c7',
  wellness: '#ccfbf1',
  default: 'var(--color-surface)'
};

const PublicItineraryPage = () => {
  const { slug } = useParams();
  const { fetchPublicTrip, copyTrip, loading } = useShare();
  const { isAuthenticated } = useAuth();
  const [trip, setTrip] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [copying, setCopying] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPublicTrip(slug);
        setTrip(data);
      } catch {
        setNotFound(true);
      }
    };
    load();
  }, [slug, fetchPublicTrip]);

  const handleCopy = async () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    setCopying(true);
    try { 
      await copyTrip(slug); 
      // Handled by toast and optionally redirect in hook/component
    } catch {
      // Handled by hook
    } finally { 
      setCopying(false); 
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.navBar}>
          <div className={styles.logo}>🌍 Traveloop</div>
        </div>
        <Skeleton height={300} borderRadius="var(--radius-xl)" />
        <div style={{ marginTop: '20px' }}>
          <Skeleton height={150} />
        </div>
        <div style={{ marginTop: '20px' }}>
          <Skeleton height={150} />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundIcon}>🔍</div>
        <h1 className={styles.notFoundTitle}>Itinerary Not Found</h1>
        <p className={styles.notFoundText}>This trip may have been unpublished or the link is incorrect</p>
        <Link to="/"><Button>Explore Traveloop →</Button></Link>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className={styles.page}>
      <div className={styles.navBar}>
        <div className={styles.logo}>🌍 Traveloop</div>
        {!isAuthenticated && (
          <div className={styles.authLinks}>
            <Link to={ROUTES.LOGIN}><Button variant="outline" size="sm">Log In</Button></Link>
            <Link to={ROUTES.REGISTER}><Button size="sm">Sign Up</Button></Link>
          </div>
        )}
      </div>

      <div className={styles.coverPhoto} style={{ backgroundImage: (trip.cover_image || trip.cover_photo) ? `url(${trip.cover_image || trip.cover_photo})` : 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-light))' }}>
        <div className={styles.coverGradient} />
        <div className={styles.coverContent}>
          <h1 className={styles.tripName}>{trip.name}</h1>
          <p className={styles.tripOwner}>By {trip.owner?.name || trip.user?.name || 'Traveloop User'} · {formatDateRange(trip.start_date || trip.startDate, trip.end_date || trip.endDate)}</p>
          <div className={styles.tripMeta}>
            <span className={styles.metaBadge}>📍 {trip.stops?.length || 0} Stops</span>
            <span className={styles.metaBadge}>💰 {trip.budget?.total_cost ? formatCurrency(trip.budget.total_cost) : 'N/A'} Total</span>
          </div>
        </div>
      </div>

      <div className={styles.actionRow}>
        <Button onClick={handleCopy} loading={copying} icon={<span>📋</span>}>Copy This Trip</Button>
        <Button variant="outline" onClick={handleShare} icon={<span>🔗</span>}>Share</Button>
      </div>

      <div className={styles.contentSections}>
        <div className={styles.mainContent}>
          <h2 className={styles.sectionTitle}>Itinerary Timeline</h2>
          <div className={styles.timeline}>
            {trip.stops?.length === 0 ? (
              <p>No stops planned for this trip.</p>
            ) : (
              trip.stops?.map((stop, idx) => (
                <div key={stop.id} className={styles.stopCard}>
                  <div className={styles.stopHeader}>
                    <div className={styles.stopMarker}>📍</div>
                    <div className={styles.stopInfo}>
                      <h3>STOP {idx + 1}: {stop.city?.name || stop.cityName}</h3>
                      <p>{formatDateRange(stop.start_date || stop.startDate, stop.end_date || stop.endDate)}</p>
                    </div>
                  </div>
                  <div className={styles.activitiesList}>
                    {stop.activities?.length === 0 ? (
                      <p className={styles.noActivities}>No activities planned here.</p>
                    ) : (
                      stop.activities?.map(act => (
                        <div key={act.id} className={styles.activityCard} style={{ backgroundColor: ACTIVITY_COLORS[act.type] || ACTIVITY_COLORS.default }}>
                          <div className={styles.activityTop}>
                            <span className={styles.activityIcon}>{ACTIVITY_ICONS[act.type] || ACTIVITY_ICONS.default}</span>
                            <span className={styles.activityName}>{act.name}</span>
                          </div>
                          <div className={styles.activityDetails}>
                            {act.stopActivities?.scheduled_time && <span>🕐 {act.stopActivities.scheduled_time}</span>}
                            {act.duration_minutes && <span>⏱️ {Math.round(act.duration_minutes / 60)}hr</span>}
                            {act.cost > 0 && <span>💵 {formatCurrency(act.cost)}</span>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.sidebar}>
          <h2 className={styles.sectionTitle}>Budget Summary</h2>
          <div className={styles.budgetCard}>
            <div className={styles.budgetItem}>
              <span>Transport</span>
              <strong>{formatCurrency(trip.budget?.transport_cost || 0)}</strong>
            </div>
            <div className={styles.budgetItem}>
              <span>Stay</span>
              <strong>{formatCurrency(trip.budget?.stay_cost || 0)}</strong>
            </div>
            <div className={styles.budgetItem}>
              <span>Activities</span>
              <strong>{formatCurrency(trip.budget?.activity_cost || 0)}</strong>
            </div>
            <div className={styles.budgetItem}>
              <span>Meals</span>
              <strong>{formatCurrency(trip.budget?.meal_cost || 0)}</strong>
            </div>
            <div className={styles.budgetTotal}>
              <span>Total Cost</span>
              <strong>{formatCurrency(trip.budget?.total_cost || 0)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.stickyFooter}>
        <div className={styles.stickyContainer}>
          <div className={styles.stickyInfo}>
            <h4>Like this trip?</h4>
            <p>Save it to your account and customize it.</p>
          </div>
          <Button onClick={handleCopy} loading={copying} icon={<span>📋</span>}>Copy This Trip</Button>
        </div>
      </div>

      {showLoginPrompt && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Sign in required</h3>
            <p>You need an account to copy this trip to your own dashboard.</p>
            <div className={styles.modalActions}>
              <Link to={ROUTES.LOGIN}><Button>Log In</Button></Link>
              <Link to={ROUTES.REGISTER}><Button variant="secondary">Sign Up</Button></Link>
              <Button variant="outline" onClick={() => setShowLoginPrompt(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicItineraryPage;
