import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useStops from '../../hooks/useStops';
import { DEMO_ACTIVITIES, DEMO_TRIPS } from '../../constants/mockData';
import { getStopActivitiesApi } from '../../api/activity.api';
import Badge from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { formatDateRange } from '../../utils/formatDate.util';
import { formatCurrency } from '../../utils/formatCurrency.util';
import styles from './ItineraryViewPage.module.css';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const ItineraryViewPage = ({ readOnly = false, trip: tripProp }) => {
  const { tripId } = useParams();
  const effectiveTripId = tripId || tripProp?.id || tripProp?._id;
  const { stops, loading: stopsLoading, fetchStops } = useStops(effectiveTripId);
  const [view, setView] = useState('list');
  const [stopActivitiesMap, setStopActivitiesMap] = useState({});

  // Use passed trip or find from demo data
  const trip = tripProp || (IS_DEMO ? DEMO_TRIPS.find((t) => t.id === effectiveTripId) || DEMO_TRIPS[0] : null);

  useEffect(() => {
    if (effectiveTripId) fetchStops();
  }, [effectiveTripId, fetchStops]);

  useEffect(() => {
    if (!stops.length) return;
    stops.forEach(async (stop) => {
      const sid = stop.id || stop._id;
      if (stopActivitiesMap[sid]) return;
      if (IS_DEMO) {
        const acts = DEMO_ACTIVITIES.filter((a) => a.stopId === sid);
        setStopActivitiesMap((prev) => ({ ...prev, [sid]: acts.length > 0 ? acts : DEMO_ACTIVITIES.slice(0, 2) }));
      } else {
        try {
          const { data } = await getStopActivitiesApi(effectiveTripId, sid);
          setStopActivitiesMap((prev) => ({ ...prev, [sid]: data.activities || data.data || [] }));
        } catch {}
      }
    });
  }, [stops, effectiveTripId]);

  if (stopsLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}><Skeleton height={32} width="200px" /></div>
        {[...Array(3)].map((_, i) => <Skeleton key={i} height={120} />)}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className="page-title">Itinerary View</h1>
          {trip && <p className="page-subtitle">{formatDateRange(trip.startDate, trip.endDate)}</p>}
        </div>
        <div className={styles.toggleGroup}>
          <button className={[styles.toggleBtn, view === 'list' ? styles.activeToggle : ''].join(' ')} onClick={() => setView('list')}>📋 List</button>
          <button className={[styles.toggleBtn, view === 'calendar' ? styles.activeToggle : ''].join(' ')} onClick={() => setView('calendar')}>📅 Calendar</button>
        </div>
      </div>

      {stops.length === 0 ? (
        <EmptyState icon="📍" title="No stops planned" description="Go to the builder to add cities and activities" />
      ) : (
        <div className={styles.timeline}>
          {stops.map((stop, idx) => {
            const sid = stop.id || stop._id;
            const acts = stopActivitiesMap[sid] || [];
            return (
              <div key={sid} className={styles.stopBlock}>
                <div className={styles.timelineLine}>
                  <div className={styles.timelineDot}>{idx + 1}</div>
                  {idx < stops.length - 1 && <div className={styles.timelineTrack} />}
                </div>
                <div className={styles.stopContent}>
                  <div className={styles.stopHeader}>
                    <div>
                      <h2 className={styles.stopCity}>{stop.cityName || stop.city?.name}</h2>
                      <p className={styles.stopDates}>{formatDateRange(stop.startDate, stop.endDate)}</p>
                    </div>
                  </div>
                  <div className={styles.activitiesGrid}>
                    {acts.length === 0 ? (
                      <p className={styles.noActs}>No activities for this stop</p>
                    ) : acts.map((act) => (
                      <div key={act.id || act._id} className={styles.actCard}>
                        <div className={styles.actTop}>
                          <p className={styles.actName}>{act.name}</p>
                          {act.type && <Badge variant="info">{act.type}</Badge>}
                        </div>
                        <div className={styles.actDetails}>
                          {act.cost > 0 && <span>💰 {formatCurrency(act.cost)}</span>}
                          {act.duration && <span>⏱ {act.duration}h</span>}
                          {act.time && <span>🕐 {act.time}</span>}
                        </div>
                        {act.description && <p className={styles.actDesc}>{act.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ItineraryViewPage;
