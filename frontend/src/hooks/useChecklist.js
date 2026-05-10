import { useState, useCallback } from 'react';
import { getChecklistApi, addChecklistItemApi, updateChecklistItemApi, deleteChecklistItemApi, resetChecklistApi } from '../api/checklist.api';
import { DEMO_CHECKLIST } from '../constants/mockData';
import { parseError } from '../utils/errorParser.util';
import toast from 'react-hot-toast';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const useChecklist = (tripId) => {
  const [items, setItems] = useState(IS_DEMO ? DEMO_CHECKLIST : []);
  const [loading, setLoading] = useState(false);

  const fetchChecklist = useCallback(async () => {
    if (!tripId) return;
    if (IS_DEMO) {
      setItems(DEMO_CHECKLIST);
      return;
    }
    setLoading(true);
    try {
      const { data: response } = await getChecklistApi(tripId);
      const checklistItems = response.data?.checklist?.items || response.items || [];
      setItems(Array.isArray(checklistItems) ? checklistItems : []);
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  const addItem = useCallback(async (itemData) => {
    if (IS_DEMO) {
      const newItem = { ...itemData, id: `cl-${Date.now()}` };
      setItems((prev) => [...prev, newItem]);
      return newItem;
    }
    try {
      const payload = {
        name: itemData.name,
        category: itemData.category,
      };
      const { data: response } = await addChecklistItemApi(tripId, payload);
      const created = response.data?.item || response.item || response;
      setItems((prev) => [...prev, created]);
      return created;
    } catch (err) {
      toast.error(parseError(err));
      throw err;
    }
  }, [tripId]);

  const toggleItem = useCallback(async (itemId, checked) => {
    setItems((prev) => Array.isArray(prev) ? prev.map((i) => (i.id === itemId || i._id === itemId ? { ...i, packed: checked } : i)) : []);
    if (!IS_DEMO) {
      try {
        await updateChecklistItemApi(tripId, itemId, { is_packed: checked });
      } catch (err) {
        setItems((prev) => Array.isArray(prev) ? prev.map((i) => (i.id === itemId || i._id === itemId ? { ...i, packed: !checked } : i)) : []);
        toast.error(parseError(err));
      }
    }
  }, [tripId]);

  const deleteItem = useCallback(async (itemId) => {
    setItems((prev) => Array.isArray(prev) ? prev.filter((i) => i.id !== itemId && i._id !== itemId) : []);
    if (!IS_DEMO) {
      try {
        await deleteChecklistItemApi(tripId, itemId);
      } catch (err) {
        toast.error(parseError(err));
        throw err;
      }
    }
  }, [tripId]);

  const resetAll = useCallback(async () => {
    setItems((prev) => Array.isArray(prev) ? prev.map((i) => ({ ...i, packed: false })) : []);
    toast.success('Checklist reset');
    if (!IS_DEMO) {
      try {
        await resetChecklistApi(tripId);
      } catch (err) {
        toast.error(parseError(err));
        throw err;
      }
    }
  }, [tripId]);

  const packed = Array.isArray(items) ? items.filter((i) => i.packed || i.is_packed).length : 0;
  const total = Array.isArray(items) ? items.length : 0;

  return { items, loading, packed, total, fetchChecklist, addItem, toggleItem, deleteItem, resetAll };
};

export default useChecklist;
