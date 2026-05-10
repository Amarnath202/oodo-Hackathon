import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useStops from '../../hooks/useStops';
import useActivities from '../../hooks/useActivities';
import useCities from '../../hooks/useCities';
import useSocket from '../../hooks/useSocket';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDateRange } from '../../utils/formatDate.util';
import { formatCurrency } from '../../utils/formatCurrency.util';
import { SOCKET_EVENTS } from '../../constants/app.constants';
import styles from './ItineraryBuilderPage.module.css';

const ItineraryBuilderPage = () => {
  const { tripId } = useParams();
  const { stops, loading: stopsLoading, fetchStops, addStop, deleteStop, reorderStops, appendStop, removeStop } = useStops(tripId);
  const { activities, stopActivities, loading: actLoading, fetchActivities, fetchStopActivities, addToStop, removeFromStop, appendActivity, removeActivity } = useActivities();
  const { cities, fetchCities } = useCities();
  const { joinRoom, leaveRoom, on, off } = useSocket();

  const [activeStop, setActiveStop] = useState(null);
  const [addStopOpen, setAddStopOpen] = useState(false);
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [actSearch, setActSearch] = useState('');
  const [deletingStop, setDeletingStop] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [stopDates, setStopDates] = useState({ startDate: '', endDate: '' });
  const [addingStop, setAddingStop] = useState(false);

  useEffect(() => {
    fetchStops();
    joinRoom(`trip:${tripId}`);
    return () => leaveRoom(`trip:${tripId}`);
  }, [tripId, fetchStops, joinRoom, leaveRoom]);

  // Real-time socket events
  useEffect(() => {
    on(SOCKET_EVENTS.STOP_ADDED, (stop) => appendStop(stop));
    on(SOCKET_EVENTS.STOP_DELETED, ({ stopId }) => removeStop(stopId));
    on(SOCKET_EVENTS.ACTIVITY_ADDED, (act) => appendActivity(act));
    on(SOCKET_EVENTS.ACTIVITY_REMOVED, ({ activityId }) => removeActivity(activityId));
    return () => {
      off(SOCKET_EVENTS.STOP_ADDED);
      off(SOCKET_EVENTS.STOP_DELETED);
      off(SOCKET_EVENTS.ACTIVITY_ADDED);
      off(SOCKET_EVENTS.ACTIVITY_REMOVED);
    };
  }, [on, off, appendStop, removeStop, appendActivity, removeActivity]);

  useEffect(() => {
    if (activeStop) {
      fetchStopActivities(tripId, activeStop.id || activeStop._id);
    }
  }, [activeStop, tripId, fetchStopActivities]);

  useEffect(() => {
    if (addStopOpen) fetchCities({ search: citySearch, limit: 20 });
  }, [citySearch, addStopOpen, fetchCities]);

  useEffect(() => {
    if (addActivityOpen && activeStop) {
      const cityId = activeStop.city_id || activeStop.cityId || activeStop.city?.id;
      fetchActivities({ search: actSearch, limit: 20, city_id: cityId });
    }
  }, [actSearch, addActivityOpen, activeStop, fetchActivities]);

  const handleAddStop = async () => {
    if (!selectedCity) {
      toast.error('Please select a city');
      return;
    }
    if (!stopDates.startDate || !stopDates.endDate) {
      toast.error('Please set dates for this stop');
      return;
    }
    setAddingStop(true);
    try {
      const stop = await addStop({
        cityId: selectedCity.id || selectedCity._id,
        cityName: selectedCity.name,
        ...stopDates,
      });
      setAddStopOpen(false);
      setSelectedCity(null);
      setStopDates({ startDate: '', endDate: '' });
      setActiveStop(stop);
    } finally {
      setAddingStop(false);
    }
  };

  const handleAddActivity = async (activity) => {
    if (!activeStop) return;
    try {
      await addToStop(tripId, activeStop.id || activeStop._id, { activity_id: activity.id || activity._id });
      toast.success(`${activity.name} added ✓`);
      setAddActivityOpen(false);
    } catch {}
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('dragIndex', index);
  };

  const handleDrop = (e, index) => {
    const from = parseInt(e.dataTransfer.getData('dragIndex'));
    if (from === index) return;
    const newOrder = [...stops];
    const [moved] = newOrder.splice(from, 1);
    newOrder.splice(index, 0, moved);
    reorderStops(newOrder.map((s) => s.id || s._id));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className="page-title">Itinerary Builder</h1>
          <p className="page-subtitle">{stops.length} stop{stops.length !== 1 ? 's' : ''} planned</p>
        </div>
        <Button onClick={() => setAddStopOpen(true)} icon={<span>+</span>}>Add Stop</Button>
      </div>

      <div className={styles.layout}>
        {/* Left: Stops */}
        <div className={styles.stopList}>
          {stopsLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} height={80} className={styles.stopSkeleton} />)
          ) : stops.length === 0 ? (
            <EmptyState icon="📍" title="No stops yet" description="Add cities to your trip" />
          ) : (
            stops.map((stop, index) => (
              <div
                key={stop.id || stop._id}
                className={[styles.stopCard, activeStop?.id === stop.id || activeStop?._id === stop._id ? styles.activeStop : ''].join(' ')}
                onClick={() => setActiveStop(stop)}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className={styles.stopOrder}>{index + 1}</div>
                <div className={styles.stopInfo}>
                  <p className={styles.stopCity}>{stop.cityName || stop.city?.name}</p>
                  <p className={styles.stopDates}>{formatDateRange(stop.start_date, stop.end_date)}</p>
                </div>
                <button
                  className={styles.stopDelete}
                  onClick={(e) => { e.stopPropagation(); setDeletingStop(stop.id || stop._id); }}
                  title="Remove stop"
                >×</button>
              </div>
            ))
          )}
        </div>

        {/* Right: Activities */}
        <div className={styles.activityPanel}>
          {!activeStop ? (
            <EmptyState icon="👈" title="Select a stop" description="Click a stop on the left to see its activities" />
          ) : (
            <>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>{activeStop.cityName || activeStop.city?.name}</h2>
                  <p className={styles.panelSub}>{formatDateRange(activeStop.start_date, activeStop.end_date)}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setAddActivityOpen(true)}>
                  + Add Activity
                </Button>
              </div>
              <div className={styles.activities}>
                {actLoading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} height={64} />)
                ) : stopActivities.length === 0 ? (
                  <EmptyState icon="🎭" title="No activities" description="Add things to do in this city" />
                ) : (
                  stopActivities.map((act) => (
                    <div key={act.id || act._id} className={styles.activityItem}>
                      <div className={styles.activityInfo}>
                        <p className={styles.activityName}>{act.name}</p>
                        <div className={styles.activityMeta}>
                          {act.type && <Badge variant="info">{act.type}</Badge>}
                          {act.cost > 0 && <span className={styles.actCost}>{formatCurrency(act.cost)}</span>}
                          {act.duration && <span className={styles.actDuration}>{act.duration}h</span>}
                        </div>
                      </div>
                      <button
                        className={styles.removeAct}
                        onClick={() => removeFromStop(tripId, activeStop.id || activeStop._id, act.id || act._id)}
                        title="Remove"
                      >×</button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Stop Modal */}
      <Modal isOpen={addStopOpen} onClose={() => setAddStopOpen(false)} title="Add Stop" size="md">
        <div className={styles.modalForm}>
          <input
            className={styles.modalSearch}
            placeholder="Search cities..."
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
          />
          <div className={styles.cityList}>
            {cities.map((city) => (
              <div
                key={city.id || city._id}
                className={[styles.cityOption, selectedCity?.id === city.id ? styles.selectedCity : ''].join(' ')}
                onClick={() => setSelectedCity(city)}
              >
                <span className={styles.cityOptionName}>{city.name}</span>
                <span className={styles.cityOptionCountry}>{city.country}</span>
              </div>
            ))}
          </div>
          {selectedCity && (
            <div className={styles.dateRow}>
              <div className={styles.dateField}>
                <label>Arrival</label>
                <input type="date" value={stopDates.startDate} onChange={(e) => setStopDates((p) => ({ ...p, startDate: e.target.value }))} className={styles.dateInput} />
              </div>
              <div className={styles.dateField}>
                <label>Departure</label>
                <input type="date" value={stopDates.endDate} onChange={(e) => setStopDates((p) => ({ ...p, endDate: e.target.value }))} className={styles.dateInput} />
              </div>
            </div>
          )}
          <div className={styles.modalActions}>
            <Button variant="ghost" onClick={() => setAddStopOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStop} loading={addingStop} disabled={!selectedCity}>Add Stop</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={addActivityOpen} onClose={() => setAddActivityOpen(false)} title="Add Activity" size="md">
        <div className={styles.modalForm}>
          <input
            className={styles.modalSearch}
            placeholder="Search activities..."
            value={actSearch}
            onChange={(e) => setActSearch(e.target.value)}
          />
          <div className={styles.cityList}>
            {activities.length === 0 && actSearch === '' ? (
              <p style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>No activities found in this city.</p>
            ) : null}
            {activities.map((act) => (
              <div
                key={act.id || act._id}
                className={styles.cityOption}
                onClick={() => handleAddActivity(act)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <span className={styles.cityOptionName}>{act.name}</span>
                  {act.type && <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '8px' }}>{act.type}</span>}
                </div>
                {act.cost > 0 && <span className={styles.cityOptionCountry}>{formatCurrency(act.cost)}</span>}
              </div>
            ))}
          </div>
          <div className={styles.modalActions}>
            <Button variant="ghost" onClick={() => setAddActivityOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingStop}
        onClose={() => setDeletingStop(null)}
        onConfirm={async () => { await deleteStop(deletingStop); setDeletingStop(null); if (activeStop?.id === deletingStop || activeStop?._id === deletingStop) setActiveStop(null); }}
        title="Remove stop?"
        message="This will remove the stop and all its activities."
        confirmLabel="Remove"
      />
    </div>
  );
};

export default ItineraryBuilderPage;
