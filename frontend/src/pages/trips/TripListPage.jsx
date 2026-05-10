import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useTrips from '../../hooks/useTrips';
import usePagination from '../../hooks/usePagination';
import { SkeletonCard } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import { ROUTES } from '../../constants/routes.constants';
import { SORT_OPTIONS, PAGE_SIZE } from '../../constants/app.constants';
import { formatDateRange, getDurationDays } from '../../utils/formatDate.util';
import { formatCurrency } from '../../utils/formatCurrency.util';
import styles from './TripListPage.module.css';

const TripCard = ({ trip, onDelete }) => {
  const id = trip.id || trip._id;
  const isPast = trip.end_date && new Date(trip.end_date) < new Date();
  const isUpcoming = trip.start_date && new Date(trip.start_date) > new Date();

  return (
    <div className={styles.card}>
      <div className={styles.imageSection}>
        <div 
          className={styles.coverImage} 
          style={{ backgroundImage: (trip.cover_image || trip.cover_photo) ? `url(${trip.cover_image || trip.cover_photo})` : undefined }}
        >
          {!(trip.cover_image || trip.cover_photo) && <div className={styles.imagePlaceholder}>🌍</div>}
        </div>
        <Badge variant={isPast ? 'neutral' : isUpcoming ? 'success' : 'info'} className={styles.statusBadge}>
          {isPast ? 'Completed' : isUpcoming ? 'Upcoming' : 'Active'}
        </Badge>
      </div>
      <div className={styles.cardInfo}>
        <h3 className={styles.tripName}>{trip.name}</h3>
        <p className={styles.tripDates}>📅 {formatDateRange(trip.start_date, trip.end_date)}</p>
        <div className={styles.tripStats}>
          <span className={styles.statItem}>🌍 {trip.stopCount || 0} destinations</span>
          <span className={styles.statItem}>💰 {formatCurrency(trip.totalBudget || 0)}</span>
        </div>
      </div>
      <div className={styles.cardActions}>
        <Link to={ROUTES.TRIP_DETAIL_PATH(id)} className={styles.actionBtn}>View</Link>
        <Link to={ROUTES.ITINERARY_BUILDER_PATH(id)} className={styles.actionBtn}>Edit</Link>
        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => onDelete(id)}>Delete</button>
      </div>
    </div>
  );
};

const TripListPage = () => {
  const { trips, loading, pagination, fetchTrips, deleteTrip } = useTrips();
  const { page, goToPage, resetPage } = usePagination();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt:desc');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const [sortField, sortOrder] = sort.split(':');
    fetchTrips({ page, limit: PAGE_SIZE, search, sortField, sortOrder });
  }, [page, search, sort, fetchTrips]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    resetPage();
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteTrip(deletingId);
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className="page-header">
        <h1 className="page-title">My Trips</h1>
        <p className="page-subtitle">Plan, manage, and explore your travel adventures</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text"
            placeholder="Search trips..."
            className={styles.searchInput}
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className={styles.toolbarRight}>
          <select className={styles.sortSelect} value={sort} onChange={(e) => { setSort(e.target.value); resetPage(); }}>
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="start_date:asc">Upcoming First</option>
            <option value="start_date:desc">Past Trips</option>
            <option value="total_budget:desc">Budget: High to Low</option>
            <option value="total_budget:asc">Budget: Low to High</option>
          </select>
          <Button onClick={() => navigate(ROUTES.CREATE_TRIP)}>+ Plan New Trip</Button>
        </div>
      </div>

      {loading ? (
        <div className={styles.grid}>{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : trips.length === 0 ? (
        <EmptyState
          icon="🗺️"
          title={search ? 'No trips found' : 'No trips yet'}
          description={search ? 'Try a different search term' : 'Start planning your first trip!'}
          action={!search && <Button onClick={() => navigate(ROUTES.CREATE_TRIP)}>Plan New Trip</Button>}
        />
      ) : (
        <>
          <div className={styles.grid}>
            {trips.map((trip) => (
              <TripCard key={trip.id || trip._id} trip={trip} onDelete={setDeletingId} />
            ))}
          </div>
          <Pagination page={page} totalPages={pagination.totalPages} onPageChange={goToPage} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete trip?"
        message="This will permanently delete the trip and all its data. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default TripListPage;
