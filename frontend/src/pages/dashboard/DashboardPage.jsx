import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import useTrips from '../../hooks/useTrips';
import useCities from '../../hooks/useCities';
import { SkeletonCard } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { ROUTES } from '../../constants/routes.constants';
import { formatDateRange } from '../../utils/formatDate.util';
import { formatCurrency } from '../../utils/formatCurrency.util';
import styles from './DashboardPage.module.css';

const StatCard = ({ icon, label, value, color, loading }) => (
  <div className={styles.statCard} style={{ '--accent': color }}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statContent}>
      {loading ? (
        <div className={styles.statLoading} />
      ) : (
        <p className={styles.statValue}>{value}</p>
      )}
      <p className={styles.statLabel}>{label}</p>
    </div>
  </div>
);

const TripCard = ({ trip }) => (
  <Link to={ROUTES.TRIP_DETAIL_PATH(trip.id || trip._id)} className={styles.tripCard}>
    <div className={styles.tripCover} style={{ backgroundImage: (trip.cover_image || trip.cover_photo) ? `url(${trip.cover_image || trip.cover_photo})` : undefined }}>
      {!(trip.cover_image || trip.cover_photo) && <span className={styles.tripEmoji}>✈️</span>}
      <div className={styles.tripOverlay} />
    </div>
    <div className={styles.tripInfo}>
      <h3 className={styles.tripName}>{trip.name}</h3>
      <p className={styles.tripMeta}>{formatDateRange(trip.start_date, trip.end_date)}</p>
      {trip.totalBudget > 0 && (
        <p className={styles.tripBudget}>{formatCurrency(trip.totalBudget)}</p>
      )}
    </div>
  </Link>
);

const CityCard = ({ city }) => (
  <div className={styles.cityCard}>
    <div className={styles.cityImage}>
      {city.image_url ? (
        <img src={city.image_url} alt={city.name} />
      ) : (
        <div className={styles.cityPlaceholder}>🌆</div>
      )}
    </div>
    <div className={styles.cityInfo}>
      <h4 className={styles.cityName}>{city.name}</h4>
      <p className={styles.cityCountry}>{city.country}</p>
      <Link to={`${ROUTES.CITIES}?search=${city.name}`}>
        <Button variant="ghost" size="xs" fullWidth className={styles.cityBtn}>+ Add to Trip</Button>
      </Link>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuthContext();
  const { trips, loading: tripsLoading, fetchTrips } = useTrips();
  const { cities, loading: citiesLoading, fetchCities } = useCities();

  useEffect(() => {
    fetchTrips({ limit: 4 });
    fetchCities({ sort: 'popularity_score:desc', limit: 6 });
  }, [fetchTrips, fetchCities]);

  const totalSpent = trips.reduce((sum, t) => sum + parseFloat(t.totalBudget || 0), 0);
  const avgPerTrip = trips.length > 0 ? totalSpent / trips.length : 0;
  const upcoming = trips.filter((t) => new Date(t.start_date) > new Date()).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className={styles.page}>
      {/* Welcome Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerContent}>
          <h1 className={styles.bannerTitle}>{greeting}, {user?.name?.split(' ')[0] || 'Traveler'} ✈️</h1>
          <p className={styles.bannerSub}>Where are we going next? Plan your next adventure.</p>
          <Link to={ROUTES.CREATE_TRIP}>
            <Button size="lg" icon={<span>+</span>}>Plan New Trip</Button>
          </Link>
        </div>
        <div className={styles.bannerDecor}>🗺️</div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <StatCard icon="✈️" label="Total Trips" value={trips.length} color="#2563EB" loading={tripsLoading} />
        <StatCard icon="📅" label="Upcoming" value={upcoming} color="#F59E0B" loading={tripsLoading} />
        <StatCard icon="💰" label="Total Spent" value={formatCurrency(totalSpent)} color="#10B981" loading={tripsLoading} />
        <StatCard icon="📊" label="Avg/Trip" value={formatCurrency(avgPerTrip)} color="#8B5CF6" loading={tripsLoading} />
      </div>

      <div className={styles.dashboardGrid}>
        {/* Main Content */}
        <div className={styles.mainCol}>
          {/* Recent Trips */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Upcoming & Recent Trips</h2>
              <Link to={ROUTES.TRIPS} className={styles.seeAll}>View all trips →</Link>
            </div>
            {tripsLoading ? (
              <div className={styles.tripsGrid}>
                {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : trips.length === 0 ? (
              <EmptyState
                icon="✈️"
                title="No trips yet"
                description="Start planning your first adventure!"
                action={<Link to={ROUTES.CREATE_TRIP}><Button>Plan New Trip</Button></Link>}
              />
            ) : (
              <div className={styles.tripsGrid}>
                {trips.slice(0, 4).map((trip) => <TripCard key={trip.id || trip._id} trip={trip} />)}
              </div>
            )}
          </section>

          {/* Recommended Destinations */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recommended for You</h2>
              <Link to={ROUTES.CITIES} className={styles.seeAll}>Explore all →</Link>
            </div>
            {citiesLoading ? (
              <div className={styles.citiesGrid}>
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className={styles.citiesGrid}>
                {cities.slice(0, 4).map((city) => <CityCard key={city.id || city._id} city={city} />)}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className={styles.sideCol}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Popular Cities</h2>
            <div className={styles.popularList}>
              {citiesLoading ? (
                [...Array(5)].map((_, i) => <div key={i} className={styles.popularItemSkeleton} />)
              ) : (
                cities.map(city => (
                  <div key={city.id} className={styles.popularItem}>
                    <div className={styles.popularIcon}>🏙️</div>
                    <div className={styles.popularInfo}>
                      <p className={styles.popularName}>{city.name}</p>
                      <p className={styles.popularCountry}>{city.country}</p>
                    </div>
                    <Link to={`${ROUTES.CITIES}?search=${city.name}`} className={styles.popularAdd}>+</Link>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className={styles.quickActions}>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            <div className={styles.actionGrid}>
              <Link to={ROUTES.CREATE_TRIP} className={styles.actionCard}>
                <span className={styles.actionIcon}>➕</span>
                <span>New Trip</span>
              </Link>
              <Link to={ROUTES.CITIES} className={styles.actionCard}>
                <span className={styles.actionIcon}>🌍</span>
                <span>Cities</span>
              </Link>
              <Link to={ROUTES.ACTIVITIES} className={styles.actionCard}>
                <span className={styles.actionIcon}>🎭</span>
                <span>Activities</span>
              </Link>
              <Link to={ROUTES.PROFILE} className={styles.actionCard}>
                <span className={styles.actionIcon}>👤</span>
                <span>Profile</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
