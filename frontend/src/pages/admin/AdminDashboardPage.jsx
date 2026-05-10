import { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import useAdmin from '../../hooks/useAdmin';
import usePagination from '../../hooks/usePagination';
import { Skeleton } from '../../components/common/Skeleton';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import { formatNumber } from '../../utils/formatCurrency.util';
import { formatDate } from '../../utils/formatDate.util';
import styles from './AdminDashboardPage.module.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'cities', label: 'Manage Cities', icon: '🌆' },
  { id: 'activities', label: 'Manage Activities', icon: '🎭' },
];

const AdminDashboardPage = () => {
  const { 
    stats, users, cities, activities, loading, pagination, 
    fetchStats, fetchUsers, banUser, deleteUser,
    fetchCities, createCity, updateCity, deleteCity,
    fetchActivities, createActivity, updateActivity, deleteActivity
  } = useAdmin();
  
  const { page, goToPage } = usePagination();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Generic action state
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(null); // 'ban', 'deleteUser', 'deleteCity', 'deleteActivity'
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal states for City/Activity
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => { 
    if (activeTab === 'overview') {
      fetchStats();
      fetchUsers({ page: 1, limit: 5 }); // Just a preview for overview
    } else if (activeTab === 'cities') {
      fetchCities();
    } else if (activeTab === 'activities') {
      fetchActivities();
      fetchCities(); // Needed for city selection in activity modal
    }
  }, [activeTab, fetchStats, fetchUsers, fetchCities, fetchActivities]);

  useEffect(() => {
    if (activeTab === 'overview') fetchUsers({ page, limit: 10 });
  }, [page, activeTab, fetchUsers]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (actionType === 'ban') await banUser(actionTarget);
      if (actionType === 'deleteUser') await deleteUser(actionTarget);
      if (actionType === 'deleteCity') await deleteCity(actionTarget);
      if (actionType === 'deleteActivity') await deleteActivity(actionTarget);
    } finally {
      setActionLoading(false);
      setActionTarget(null);
      setActionType(null);
    }
  };

  const handleCitySubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingItem) {
        await updateCity(editingItem.id, formData);
      } else {
        await createCity(formData);
      }
      setIsCityModalOpen(false);
      setEditingItem(null);
      setFormData({});
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingItem) {
        await updateActivity(editingItem.id, formData);
      } else {
        await createActivity(formData);
      }
      setIsActivityModalOpen(false);
      setEditingItem(null);
      setFormData({});
    } finally {
      setActionLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'var(--color-primary)' },
    { label: 'Total Trips', value: stats?.totalTrips || 0, icon: '✈️', color: 'var(--color-accent)' },
    { label: 'Total Cities', value: stats?.totalCities || 0, icon: '🌆', color: 'var(--color-success)' },
    { label: 'Total Activities', value: stats?.totalActivities || 0, icon: '🎭', color: '#8B5CF6' },
  ];

  const cityChartData = stats?.topCities || [];

  return (
    <div className={styles.page}>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Platform management and platform health</p>
          </div>
          <div className={styles.tabList}>
            {TABS.map(tab => (
              <button 
                key={tab.id}
                className={`${styles.tabItem} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => { setActiveTab(tab.id); goToPage(1); }}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats */}
          <div className={styles.statsGrid}>
            {loading && !stats ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} height={100} borderRadius="var(--radius-lg)" />)
            ) : (
              statCards.map((s) => (
                <div key={s.label} className={styles.statCard}>
                  <div className={styles.statIcon} style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
                  <div>
                    <p className={styles.statValue}>{formatNumber(s.value)}</p>
                    <p className={styles.statLabel}>{s.label}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Charts Row */}
          <div className={styles.chartsRow}>
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Top Cities (Usage)</h3>
              {cityChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={cityChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className={styles.noData}>No data yet</p>}
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Top Activities</h3>
              <div className={styles.activityList}>
                {(stats?.topActivities || []).map((act, i) => (
                  <div key={i} className={styles.activityItem}>
                    <span className={styles.actRank}>{i + 1}</span>
                    <span className={styles.actName}>{act.name}</span>
                    <span className={styles.actCount}>{act.count} uses</span>
                  </div>
                ))}
                {(!stats?.topActivities || stats.topActivities.length === 0) && <p className={styles.noData}>No data yet</p>}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h3 className={styles.chartTitle}>Recent Users</h3>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && users.length === 0 ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}><td colSpan={6}><Skeleton height={44} /></td></tr>
                    ))
                  ) : users.map((u) => (
                    <tr key={u.id}>
                      <td className={styles.userCell}>
                        <Avatar name={u.name} src={u.profile_photo || u.photo} size="sm" />
                        <span>{u.name}</span>
                      </td>
                      <td>{u.email}</td>
                      <td><Badge variant={u.role === 'admin' ? 'primary' : 'neutral'}>{u.role}</Badge></td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td><Badge variant={u.banned ? 'error' : 'success'}>{u.banned ? 'Banned' : 'Active'}</Badge></td>
                      <td>
                        <div className={styles.rowActions}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setActionTarget(u.id); setActionType('ban'); }}
                            disabled={u.role === 'admin'}
                          >
                            {u.banned ? 'Unban' : 'Ban'}
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => { setActionTarget(u.id); setActionType('deleteUser'); }}
                            disabled={u.role === 'admin'}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={pagination.totalPages} onPageChange={goToPage} />
          </div>
        </>
      )}

      {activeTab === 'cities' && (
        <div className={styles.tableCard}>
          <div className={styles.tableHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className={styles.chartTitle} style={{ margin: 0 }}>Cities</h3>
            <Button size="sm" onClick={() => { setEditingItem(null); setFormData({}); setIsCityModalOpen(true); }}>
              + Add City
            </Button>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>City</th>
                  <th>Country</th>
                  <th>Region</th>
                  <th>Cost Index</th>
                  <th>Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && cities.length === 0 ? (
                  [...Array(5)].map((_, i) => <tr key={i}><td colSpan={6}><Skeleton height={44} /></td></tr>)
                ) : cities.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.country}</td>
                    <td><Badge variant="neutral">{c.region}</Badge></td>
                    <td>{c.cost_index || '-'}</td>
                    <td>{c.popularity_score}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <Button variant="ghost" size="sm" onClick={() => { setEditingItem(c); setFormData(c); setIsCityModalOpen(true); }}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => { setActionTarget(c.id); setActionType('deleteCity'); }}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'activities' && (
        <div className={styles.tableCard}>
          <div className={styles.tableHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className={styles.chartTitle} style={{ margin: 0 }}>Activities</h3>
            <Button size="sm" onClick={() => { setEditingItem(null); setFormData({}); setIsActivityModalOpen(true); }}>
              + Add Activity
            </Button>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>City</th>
                  <th>Type</th>
                  <th>Cost</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && activities.length === 0 ? (
                  [...Array(5)].map((_, i) => <tr key={i}><td colSpan={6}><Skeleton height={44} /></td></tr>)
                ) : activities.map(a => (
                  <tr key={a.id}>
                    <td><strong>{a.name}</strong></td>
                    <td>{a.city?.name || 'Unknown'}</td>
                    <td><Badge variant="secondary">{a.type}</Badge></td>
                    <td>{formatNumber(a.cost)}</td>
                    <td>{a.duration_minutes}m</td>
                    <td>
                      <div className={styles.rowActions}>
                        <Button variant="ghost" size="sm" onClick={() => { setEditingItem(a); setFormData({ ...a, city_id: a.city_id }); setIsActivityModalOpen(true); }}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => { setActionTarget(a.id); setActionType('deleteActivity'); }}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!actionTarget}
        onClose={() => { setActionTarget(null); setActionType(null); }}
        onConfirm={handleAction}
        title="Are you sure?"
        message={`This action (${actionType}) is permanent and cannot be undone.`}
        confirmLabel="Confirm Action"
        loading={actionLoading}
      />

      {/* City Modal */}
      <Modal 
        isOpen={isCityModalOpen} 
        onClose={() => setIsCityModalOpen(false)} 
        title={editingItem ? 'Edit City' : 'Add New City'}
      >
        <form onSubmit={handleCitySubmit} className={styles.modalForm}>
          <div className={styles.formGrid}>
            <Input label="City Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            <Input label="Country" value={formData.country || ''} onChange={(e) => setFormData({...formData, country: e.target.value})} required />
            <Input label="Region" value={formData.region || ''} onChange={(e) => setFormData({...formData, region: e.target.value})} />
            <Select 
              label="Cost Index" 
              value={formData.cost_index || ''} 
              onChange={(e) => setFormData({...formData, cost_index: e.target.value})}
              options={[
                { value: '€', label: 'Budget (€)' },
                { value: '€€', label: 'Moderate (€€)' },
                { value: '€€€', label: 'Expensive (€€€)' },
                { value: '€€€€', label: 'Ultra-Luxury (€€€€)' },
              ]}
            />
            <Input label="Popularity Badge" placeholder="e.g. Popular, Must-Visit" value={formData.popularity_badge || ''} onChange={(e) => setFormData({...formData, popularity_badge: e.target.value})} />
            <Input label="Popularity Score (0-100)" type="number" value={formData.popularity_score || ''} onChange={(e) => setFormData({...formData, popularity_score: e.target.value})} />
            <Input label="Image URL" value={formData.image_url || ''} onChange={(e) => setFormData({...formData, image_url: e.target.value})} />
          </div>
          <Textarea label="Description" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          <div className={styles.modalActions}>
            <Button type="button" variant="ghost" onClick={() => setIsCityModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={actionLoading}>{editingItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {/* Activity Modal */}
      <Modal 
        isOpen={isActivityModalOpen} 
        onClose={() => setIsActivityModalOpen(false)} 
        title={editingItem ? 'Edit Activity' : 'Add New Activity'}
      >
        <form onSubmit={handleActivitySubmit} className={styles.modalForm}>
          <div className={styles.formGrid}>
            <Select 
              label="City" 
              value={formData.city_id || ''} 
              onChange={(e) => setFormData({...formData, city_id: e.target.value})} 
              required
              options={cities.map(c => ({ value: c.id, label: `${c.name}, ${c.country}` }))}
            />
            <Input label="Activity Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            <Select 
              label="Type" 
              value={formData.type || ''} 
              onChange={(e) => setFormData({...formData, type: e.target.value})} 
              required
              options={[
                { value: 'sightseeing', label: 'Sightseeing' },
                { value: 'food', label: 'Food & Dining' },
                { value: 'adventure', label: 'Adventure' },
                { value: 'shopping', label: 'Shopping' },
                { value: 'culture', label: 'Culture' },
                { value: 'wellness', label: 'Wellness' },
              ]}
            />
            <Input label="Cost (₹)" type="number" value={formData.cost || ''} onChange={(e) => setFormData({...formData, cost: e.target.value})} required />
            <Input label="Duration (hours)" type="number" step="0.5" value={formData.duration || ''} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
            <Input label="Image URL" value={formData.image_url || ''} onChange={(e) => setFormData({...formData, image_url: e.target.value})} />
          </div>
          <Textarea label="Description" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          <div className={styles.modalActions}>
            <Button type="button" variant="ghost" onClick={() => setIsActivityModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={actionLoading}>{editingItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
