import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTripApi } from '../../api/trip.api';
import { DEMO_TRIPS } from '../../constants/mockData';
import { parseError } from '../../utils/errorParser.util';
import { ROUTES } from '../../constants/routes.constants';
import { formatDateRange, getDurationDays } from '../../utils/formatDate.util';
import { formatCurrency } from '../../utils/formatCurrency.util';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import ShareButton from '../../components/trip/ShareButton';
import toast from 'react-hot-toast';
import styles from './TripDetailPage.module.css';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const TripDetailPage = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (IS_DEMO) {
      const found = DEMO_TRIPS.find((t) => t.id === tripId) || DEMO_TRIPS[0];
      setTrip(found);
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const { data } = await getTripApi(tripId);
        setTrip(data.trip || data);
      } catch (err) {
        toast.error(parseError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tripId]);

  if (loading) return <div className={styles.center}><Spinner size="lg" /></div>;
  if (!trip) return <div className={styles.center}><p>Trip not found</p></div>;

  const days = getDurationDays(trip.start_date, trip.end_date);

  return (
    <div className={styles.page}>
      <div className={styles.hero} style={{ backgroundImage: (trip.cover_image || trip.cover_photo) ? `url(${trip.cover_image || trip.cover_photo})` : undefined }}>
        <div className={styles.heroGradient} />
        <div className={styles.heroContent}>
          <div className={styles.heroHeader}>
            <div>
              <h1 className={styles.tripName}>{trip.name}</h1>
              <p className={styles.tripDates}>{formatDateRange(trip.start_date, trip.end_date)}</p>
            </div>
            <ShareButton trip={trip} />
          </div>
          {trip.description && <p className={styles.tripDesc}>{trip.description}</p>}
        </div>
      </div>

      <div className={styles.metaRow}>
        <div className={styles.metaCard}><span className={styles.metaIcon}>📅</span><div><p className={styles.metaValue}>{days}</p><p className={styles.metaLabel}>Days</p></div></div>
        <div className={styles.metaCard}><span className={styles.metaIcon}>📍</span><div><p className={styles.metaValue}>{trip.stopCount || 0}</p><p className={styles.metaLabel}>Stops</p></div></div>
        <div className={styles.metaCard}><span className={styles.metaIcon}>💰</span><div><p className={styles.metaValue}>{trip.totalBudget ? formatCurrency(trip.totalBudget) : '—'}</p><p className={styles.metaLabel}>Budget</p></div></div>
        <div className={styles.metaCard}><span className={styles.metaIcon}>🎭</span><div><p className={styles.metaValue}>{trip.activityCount || 0}</p><p className={styles.metaLabel}>Activities</p></div></div>
      </div>

      <div className={styles.quickLinks}>
        <Link to={ROUTES.ITINERARY_BUILDER_PATH(tripId)}><Button icon={<span>🏗️</span>}>Itinerary Builder</Button></Link>
        <Link to={ROUTES.ITINERARY_VIEW_PATH(tripId)}><Button variant="secondary" icon={<span>📋</span>}>View Itinerary</Button></Link>
        <Link to={ROUTES.BUDGET_PATH(tripId)}><Button variant="secondary" icon={<span>💰</span>}>Budget</Button></Link>
        <Link to={ROUTES.CHECKLIST_PATH(tripId)}><Button variant="secondary" icon={<span>☑️</span>}>Checklist</Button></Link>
        <Link to={ROUTES.NOTES_PATH(tripId)}><Button variant="secondary" icon={<span>📝</span>}>Notes</Button></Link>
      </div>
    </div>
  );
};

export default TripDetailPage;
