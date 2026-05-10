import { useEffect, useState, useCallback } from 'react';
import useCities from '../../hooks/useCities';
import usePagination from '../../hooks/usePagination';
import useTrips from '../../hooks/useTrips';
import { createStopApi } from '../../api/stop.api';
import { REGIONS } from '../../constants/app.constants';
import { SkeletonCard } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import styles from './CitySearchPage.module.css';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

const CityCard = ({ city, onAddToTrip }) => (
  <div className={styles.card}>
    <div className={styles.imageContainer}>
      {city.image_url ? (
        <img src={city.image_url} alt={city.name} className={styles.image} />
      ) : (
        <div className={styles.imagePlaceholder}>🌆</div>
      )}
      {city.popularity_badge && (
        <div className={styles.popBadge}>
          <Badge variant="primary">✨ {city.popularity_badge}</Badge>
        </div>
      )}
    </div>
    <div className={styles.cardBody}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <h3 className={styles.cityName}>{city.name}</h3>
          <p className={styles.cityCountry}>{city.country}</p>
        </div>
        {city.cost_index && <div className={styles.costIndex}>{city.cost_index}</div>}
      </div>
      {city.description && <p className={styles.cityDesc}>{city.description}</p>}
      <div className={styles.cardMeta}>
        {city.region && <Badge variant="neutral">{city.region}</Badge>}
        {city.popularity_score > 0 && <span className={styles.score}>⭐ {city.popularity_score/10 || '4.5'}</span>}
      </div>
      <Button variant="secondary" size="sm" fullWidth onClick={() => onAddToTrip(city)} className={styles.addBtn}>
        + Add to Trip
      </Button>
    </div>
  </div>
);

const CitySearchPage = () => {
  const { cities, loading, pagination, fetchCities } = useCities();
  const { trips, fetchTrips } = useTrips();
  const { page, goToPage, resetPage } = usePagination();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [costIndex, setCostIndex] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [addingToTrip, setAddingToTrip] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [stopDates, setStopDates] = useState({ startDate: '', endDate: '' });
  const [isSavingStop, setIsSavingStop] = useState(false);

  useEffect(() => {
    fetchCities({ page, search: debouncedSearch, region, country, cost_index: costIndex, limit: 12 });
  }, [page, debouncedSearch, region, country, costIndex, fetchCities]);

  useEffect(() => {
    fetchTrips({ limit: 100 });
  }, [fetchTrips]);

  const handleSearchChange = (e) => { setSearch(e.target.value); resetPage(); };
  const handleRegionChange = (e) => { setRegion(e.target.value); resetPage(); };

  const handleAddToTrip = (city) => {
    setAddingToTrip(city);
    setSelectedTrip('');
    setStopDates({ startDate: '', endDate: '' });
  };

  const handleSaveToTrip = async () => {
    if (!selectedTrip || !stopDates.startDate || !stopDates.endDate) {
      toast.error('Please select a trip and set dates');
      return;
    }
    setIsSavingStop(true);
    try {
      await createStopApi(selectedTrip, {
        city_id: addingToTrip.id || addingToTrip._id,
        start_date: stopDates.startDate,
        end_date: stopDates.endDate,
        order_index: 1,
      });
      toast.success(`${addingToTrip.name} added to trip!`);
      setAddingToTrip(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add stop');
    } finally {
      setIsSavingStop(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className="page-header">
        <h1 className="page-title">Discover Cities</h1>
        <p className="page-subtitle">Find your next destination</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Search cities..." className={styles.searchInput} value={search} onChange={handleSearchChange} />
        </div>
        <select className={styles.filter} value={region} onChange={handleRegionChange}>
          <option value="">All Regions</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <select className={styles.filter} value={country} onChange={(e) => { setCountry(e.target.value); resetPage(); }}>
          <option value="">All Countries</option>
          <option value="france">France</option>
          <option value="japan">Japan</option>
          <option value="usa">USA</option>
          <option value="italy">Italy</option>
          <option value="spain">Spain</option>
        </select>

        <select className={styles.filter} value={costIndex} onChange={(e) => { setCostIndex(e.target.value); resetPage(); }}>
          <option value="">All Budgets</option>
          <option value="€">Budget (€)</option>
          <option value="€€">Moderate (€€)</option>
          <option value="€€€">Expensive (€€€)</option>
          <option value="€€€€">Ultra-Luxury (€€€€)</option>
        </select>
      </div>

      {loading ? (
        <div className={styles.grid}>{[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : cities.length === 0 ? (
        <EmptyState icon="🌍" title="No cities found" description="Try a different search or region" />
      ) : (
        <>
          <div className={styles.grid}>
            {cities.map((city) => <CityCard key={city.id || city._id} city={city} onAddToTrip={handleAddToTrip} />)}
          </div>
          <Pagination page={page} totalPages={pagination.totalPages} onPageChange={goToPage} />
        </>
      )}

      {/* Add to Trip Modal */}
      <Modal isOpen={!!addingToTrip} onClose={() => setAddingToTrip(null)} title={`Add ${addingToTrip?.name} to Trip`} size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Trip</label>
            <select
              value={selectedTrip}
              onChange={(e) => setSelectedTrip(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
            >
              <option value="">-- Choose a trip --</option>
              {trips.map((t) => (
                <option key={t.id || t._id} value={t.id || t._id}>{t.name}</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Arrival</label>
              <input
                type="date"
                value={stopDates.startDate}
                onChange={(e) => setStopDates((p) => ({ ...p, startDate: e.target.value }))}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Departure</label>
              <input
                type="date"
                value={stopDates.endDate}
                onChange={(e) => setStopDates((p) => ({ ...p, endDate: e.target.value }))}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="ghost" onClick={() => setAddingToTrip(null)}>Cancel</Button>
            <Button onClick={handleSaveToTrip} loading={isSavingStop} disabled={!selectedTrip}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CitySearchPage;
