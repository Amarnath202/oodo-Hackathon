import { useEffect, useState } from 'react';
import useActivities from '../../hooks/useActivities';
import usePagination from '../../hooks/usePagination';
import useTrips from '../../hooks/useTrips';
import useStops from '../../hooks/useStops';
import { ACTIVITY_TYPES } from '../../constants/app.constants';
import { SkeletonCard } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatCurrency.util';
import toast from 'react-hot-toast';
import styles from './ActivitySearchPage.module.css';

const useDebounce = (value, delay) => {
  const [dv, setDv] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDv(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return dv;
};

const ActivityCard = ({ activity, onAddToStop }) => {
  const [imgError, setImgError] = useState(false);
  const hasImage = activity.image_url && !imgError;

  const handleAdd = () => {
    onAddToStop(activity);
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {hasImage ? (
          <img
            src={activity.image_url}
            alt={activity.name}
            className={styles.image}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderEmoji}>🎭</span>
            <span className={styles.placeholderLabel}>{activity.type || 'Activity'}</span>
          </div>
        )}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <h3 className={styles.actName}>{activity.name}</h3>
          {activity.type && <Badge variant="secondary" className={styles.badge}>{activity.type}</Badge>}
        </div>
        {activity.description && <p className={styles.actDesc}>{activity.description}</p>}
        <div className={styles.actMeta}>
          <div className={styles.metaMain}>
            {activity.duration && <span>⏱️ {activity.duration} {activity.duration === 1 ? 'hour' : 'hours'}</span>}
            {activity.duration > 0 && activity.cost > 0 && <span className={styles.metaSep}>|</span>}
            {activity.cost >= 0 && <span>₹{activity.cost === 0 ? 'Free' : formatCurrency(activity.cost)}</span>}
          </div>
          {activity.city?.name && <div className={styles.metaLocation}>📍 {activity.city.name}</div>}
        </div>
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={handleAdd}
          className={styles.addBtn}
        >
          + Add to Stop
        </Button>
      </div>
    </div>
  );
};

const ActivitySearchPage = () => {
  const { activities, loading, pagination, fetchActivities, addToStop } = useActivities();
  const { trips, fetchTrips } = useTrips();
  const { page, goToPage, resetPage } = usePagination();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [duration, setDuration] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [addingToStop, setAddingToStop] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [selectedStop, setSelectedStop] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { stops, fetchStops } = useStops(selectedTrip);

  useEffect(() => {
    fetchTrips({ limit: 100 });
  }, [fetchTrips]);

  useEffect(() => {
    if (selectedTrip) {
      fetchStops();
    }
  }, [selectedTrip, fetchStops]);

  useEffect(() => {
    fetchActivities({ page, search: debouncedSearch, type, maxCost: maxCost || undefined, duration, limit: 12 });
  }, [page, debouncedSearch, type, maxCost, duration, fetchActivities]);

  const handleSearchChange = (e) => { setSearch(e.target.value); resetPage(); };
  const handleTypeChange = (e) => { setType(e.target.value); resetPage(); };

  const handleAddToStopClick = (activity) => {
    setAddingToStop(activity);
    setSelectedTrip('');
    setSelectedStop('');
  };

  const handleSaveToStop = async () => {
    if (!selectedTrip || !selectedStop) {
      toast.error('Please select a trip and a stop');
      return;
    }
    setIsSaving(true);
    try {
      await addToStop(selectedTrip, selectedStop, { activity_id: addingToStop.id || addingToStop._id });
      toast.success(`${addingToStop.name} added to stop!`);
      setAddingToStop(null);
    } catch (err) {
      // Error is handled in the hook
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className="page-header">
        <h1 className="page-title">Activities</h1>
        <p className="page-subtitle">Discover things to do at every destination</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Search activities..." className={styles.searchInput} value={search} onChange={handleSearchChange} />
        </div>
        <select className={styles.filter} value={type} onChange={handleTypeChange}>
          <option value="">All Types</option>
          {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        
        <select className={styles.filter} value={duration} onChange={(e) => { setDuration(e.target.value); resetPage(); }}>
          <option value="">All Durations</option>
          <option value="0-2">0-2 hours</option>
          <option value="2-4">2-4 hours</option>
          <option value="4+">4+ hours</option>
          <option value="full">Full day</option>
        </select>

        <div className={styles.costFilter}>
          <span>Max cost: ₹{maxCost || '500+'}</span>
          <input type="range" min="0" max="500" step="10" value={maxCost || 500} onChange={(e) => { setMaxCost(e.target.value === '500' ? '' : e.target.value); resetPage(); }} className={styles.rangeInput} />
        </div>
      </div>

      {loading ? (
        <div className={styles.grid}>{[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : activities.length === 0 ? (
        <EmptyState icon="🎭" title="No activities found" description="Try different filters" />
      ) : (
        <>
          <div className={styles.grid}>
            {activities.map((act) => <ActivityCard key={act.id || act._id} activity={act} onAddToStop={handleAddToStopClick} />)}
          </div>
          <Pagination page={page} totalPages={pagination.totalPages} onPageChange={goToPage} />
        </>
      )}

      {/* Add to Stop Modal */}
      <Modal isOpen={!!addingToStop} onClose={() => setAddingToStop(null)} title={`Add ${addingToStop?.name}`} size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Trip</label>
            <select
              value={selectedTrip}
              onChange={(e) => { setSelectedTrip(e.target.value); setSelectedStop(''); }}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
            >
              <option value="">-- Choose a trip --</option>
              {trips.map((t) => (
                <option key={t.id || t._id} value={t.id || t._id}>{t.name}</option>
              ))}
            </select>
          </div>
          
          {selectedTrip && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Stop</label>
              <select
                value={selectedStop}
                onChange={(e) => setSelectedStop(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
              >
                <option value="">-- Choose a stop --</option>
                {stops.map((s) => (
                  <option key={s.id || s._id} value={s.id || s._id}>
                    {s.cityName || s.city?.name}
                  </option>
                ))}
              </select>
              {stops.length === 0 && <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>This trip has no stops yet.</p>}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="ghost" onClick={() => setAddingToStop(null)}>Cancel</Button>
            <Button onClick={handleSaveToStop} loading={isSaving} disabled={!selectedTrip || !selectedStop}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ActivitySearchPage;
