import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import useBudget from '../../hooks/useBudget';
import useSocket from '../../hooks/useSocket';
import { BUDGET_CATEGORIES, SOCKET_EVENTS } from '../../constants/app.constants';
import { formatCurrency } from '../../utils/formatCurrency.util';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';
import styles from './BudgetPage.module.css';

const COLORS = ['#2563EB', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4'];

const BudgetPage = () => {
  const { tripId } = useParams();
  const { budget, loading, fetchBudget, updateBudget, updateBudgetInState } = useBudget(tripId);
  const { joinRoom, leaveRoom, on, off } = useSocket();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBudget();
    joinRoom(`trip:${tripId}`);
    return () => leaveRoom(`trip:${tripId}`);
  }, [tripId, fetchBudget, joinRoom, leaveRoom]);

  useEffect(() => {
    on(SOCKET_EVENTS.BUDGET_UPDATED, (data) => updateBudgetInState(data));
    on(SOCKET_EVENTS.BUDGET_ALERT, (data) => {
      toast.error(`⚠️ Budget alert: ${data.message || 'Over budget!'}`);
    });
    return () => {
      off(SOCKET_EVENTS.BUDGET_UPDATED);
      off(SOCKET_EVENTS.BUDGET_ALERT);
    };
  }, [on, off, updateBudgetInState]);

  useEffect(() => {
    if (budget) {
      const init = {};
      BUDGET_CATEGORIES.forEach((cat) => {
        init[cat.toLowerCase()] = budget.breakdown?.[cat.toLowerCase()] || 0;
      });
      setForm({ ...init, limit: budget.limit || 0 });
    }
  }, [budget]);

  const total = budget ? Object.values(budget.breakdown || {}).reduce((a, b) => a + b, 0) : 0;
  const limit = budget?.limit || 0;
  const isOverBudget = limit > 0 && total > limit;
  const avgPerDay = budget?.daysCount > 0 ? total / budget.daysCount : 0;

  const pieData = BUDGET_CATEGORIES
    .map((cat) => ({ name: cat, value: budget?.breakdown?.[cat.toLowerCase()] || 0 }))
    .filter((d) => d.value > 0);

  const barData = budget?.dailyCosts || [];

  const handleSave = async () => {
    setSaving(true);
    try {
      const breakdown = {};
      BUDGET_CATEGORIES.forEach((cat) => { breakdown[cat.toLowerCase()] = parseFloat(form[cat.toLowerCase()]) || 0; });
      await updateBudget({ breakdown, limit: parseFloat(form.limit) || 0 });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.center}><Spinner size="lg" /></div>;

  return (
    <div className={styles.page}>
      <div className="page-header">
        <h1 className="page-title">Trip Budget</h1>
        <p className="page-subtitle">Track your spending and stay within budget</p>
      </div>

      {isOverBudget && (
        <div className={styles.alert}>
          ⚠️ You're <strong>{formatCurrency(total - limit)}</strong> over your budget limit!
        </div>
      )}

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Total Spent</p>
          <p className={[styles.summaryValue, isOverBudget ? styles.overBudget : ''].join(' ')}>{formatCurrency(total)}</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Budget Limit</p>
          <p className={styles.summaryValue}>{limit > 0 ? formatCurrency(limit) : '—'}</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Remaining</p>
          <p className={[styles.summaryValue, isOverBudget ? styles.overBudget : styles.remaining].join(' ')}>
            {limit > 0 ? formatCurrency(limit - total) : '—'}
          </p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Avg per Day</p>
          <p className={styles.summaryValue}>{avgPerDay > 0 ? formatCurrency(avgPerDay) : '—'}</p>
        </div>
      </div>

      <div className={styles.chartsRow}>
        {/* Pie Chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Breakdown by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className={styles.noData}>No budget data yet</p>}
        </div>

        {/* Bar Chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Cost per Day</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="amount" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className={styles.noData}>Daily cost data will appear here</p>}
        </div>
      </div>

      {/* Breakdown table */}
      <div className={styles.breakdownCard}>
        <div className={styles.breakdownHeader}>
          <h3 className={styles.chartTitle}>Cost Breakdown</h3>
          <Button variant="secondary" size="sm" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit Costs'}
          </Button>
        </div>
        <div className={styles.breakdownTable}>
          {BUDGET_CATEGORIES.map((cat, i) => {
            const val = budget?.breakdown?.[cat.toLowerCase()] || 0;
            const pct = total > 0 ? (val / total) * 100 : 0;
            return (
              <div key={cat} className={styles.breakdownRow}>
                <div className={styles.catColor} style={{ background: COLORS[i % COLORS.length] }} />
                <span className={styles.catName}>{cat}</span>
                {editing ? (
                  <input
                    type="number"
                    className={styles.catInput}
                    value={form[cat.toLowerCase()] || ''}
                    onChange={(e) => setForm((p) => ({ ...p, [cat.toLowerCase()]: e.target.value }))}
                    placeholder={cat === 'Activities' ? 'Auto-calculated' : '0'}
                    disabled={cat === 'Activities'}
                    title={cat === 'Activities' ? 'Activity costs are automatically calculated from your scheduled itinerary' : ''}
                  />
                ) : (
                  <span className={styles.catAmount}>{formatCurrency(val)}</span>
                )}
                <div className={styles.catBar}><div className={styles.catFill} style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} /></div>
                <span className={styles.catPct}>{pct.toFixed(0)}%</span>
              </div>
            );
          })}
          {editing && (
            <div className={styles.limitRow}>
              <span className={styles.catName}>Budget Limit</span>
              <input type="number" className={styles.catInput} value={form.limit || ''} onChange={(e) => setForm((p) => ({ ...p, limit: e.target.value }))} placeholder="0" />
            </div>
          )}
        </div>
        {editing && (
          <div className={styles.saveRow}>
            <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetPage;
