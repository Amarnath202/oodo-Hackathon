import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useChecklist from '../../hooks/useChecklist';
import { CHECKLIST_CATEGORIES } from '../../constants/app.constants';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import styles from './ChecklistPage.module.css';

const ChecklistPage = () => {
  const { tripId } = useParams();
  const { items, loading, packed, total, fetchChecklist, addItem, toggleItem, deleteItem, resetAll } = useChecklist(tripId);
  const [activeCategory, setActiveCategory] = useState('All');
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState(CHECKLIST_CATEGORIES[0]);
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => { fetchChecklist(); }, [fetchChecklist]);

  const handleAdd = async () => {
    if (!newItem.trim()) { setAddError('Item name is required'); return; }
    setAddError('');
    setAdding(true);
    try {
      await addItem({ name: newItem.trim(), category: newCategory, packed: false });
      setNewItem('');
    } finally {
      setAdding(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try { await resetAll(); } finally { setResetting(false); setConfirmReset(false); }
  };

  const filtered = activeCategory === 'All' ? items : items.filter((i) => i.category === activeCategory);
  const progress = total > 0 ? (packed / total) * 100 : 0;
  const categories = ['All', ...CHECKLIST_CATEGORIES];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className="page-title">Packing Checklist</h1>
          <p className="page-subtitle">{packed} of {total} items packed</p>
        </div>
        {total > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setConfirmReset(true)}>
            Reset All
          </Button>
        )}
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.progressText}>{Math.round(progress)}% packed</span>
        </div>
      )}

      {/* Add Item */}
      <div className={styles.addSection}>
        <div className={styles.addForm}>
          <input
            type="text"
            placeholder="Add item..."
            className={styles.addInput}
            value={newItem}
            onChange={(e) => { setNewItem(e.target.value); setAddError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <select className={styles.catSelect} value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
            {CHECKLIST_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button onClick={handleAdd} loading={adding} disabled={adding}>Add</Button>
        </div>
        {addError && <ErrorMessage message={addError} />}
      </div>

      {/* Category Tabs */}
      <div className={styles.tabs}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={[styles.tab, activeCategory === cat ? styles.activeTab : ''].join(' ')}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
            {cat !== 'All' && (
              <span className={styles.tabCount}>{items.filter((i) => i.category === cat).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Items */}
      {loading ? (
        <div className={styles.center}><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📦" title="No items" description={activeCategory === 'All' ? 'Start adding items to your packing list' : `No ${activeCategory} items yet`} />
      ) : (
        <div className={styles.itemList}>
          {filtered.map((item) => (
            <div key={item.id || item._id} className={[styles.item, item.packed ? styles.packed : ''].join(' ')}>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={item.packed}
                  onChange={(e) => toggleItem(item.id || item._id, e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.itemName}>{item.name}</span>
              </label>
              <span className={styles.itemCategory}>{item.category}</span>
              <button
                className={styles.deleteBtn}
                onClick={() => deleteItem(item.id || item._id)}
                title="Delete"
              >×</button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={handleReset}
        title="Reset checklist?"
        message="All items will be marked as unpacked. This cannot be undone."
        confirmLabel="Reset All"
        loading={resetting}
      />
    </div>
  );
};

export default ChecklistPage;
