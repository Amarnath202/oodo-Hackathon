import { useState, useCallback } from 'react';
import { getBudgetApi, updateBudgetApi } from '../api/budget.api';
import { DEMO_BUDGET } from '../constants/mockData';
import { parseError } from '../utils/errorParser.util';
import toast from 'react-hot-toast';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const mapBudget = (raw) => {
  if (!raw) return null;
  return {
    limit: parseFloat(raw.budget_limit) || 0,
    breakdown: {
      transport: parseFloat(raw.transport_cost) || 0,
      stay: parseFloat(raw.stay_cost) || 0,
      activities: parseFloat(raw.activity_cost) || 0,
      meals: parseFloat(raw.meal_cost) || 0,
      shopping: 0,
      miscellaneous: 0,
    }
  };
};

const useBudget = (tripId) => {
  const [budget, setBudget] = useState(IS_DEMO ? DEMO_BUDGET : null);
  const [loading, setLoading] = useState(false);

  const fetchBudget = useCallback(async () => {
    if (!tripId) return;
    if (IS_DEMO) {
      setBudget(DEMO_BUDGET);
      return;
    }
    setLoading(true);
    try {
      const { data } = await getBudgetApi(tripId);
      const rawBudget = data.budget || data;
      setBudget(mapBudget(rawBudget));
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  const updateBudget = useCallback(async (budgetData) => {
    if (IS_DEMO) {
      const updated = { ...budget, ...budgetData };
      setBudget(updated);
      toast.success('Budget updated');
      return updated;
    }
    try {
      const payload = {
        transport_cost: budgetData.breakdown?.transport,
        stay_cost: budgetData.breakdown?.stay,
        meal_cost: budgetData.breakdown?.meals,
        budget_limit: budgetData.limit,
      };
      const { data } = await updateBudgetApi(tripId, payload);
      const updatedRaw = data.budget || data;
      const mapped = mapBudget(updatedRaw);
      setBudget(mapped);
      toast.success('Budget updated');
      return mapped;
    } catch (err) {
      toast.error(parseError(err));
      throw err;
    }
  }, [tripId, budget]);

  const updateBudgetInState = useCallback((updates) => {
    // updates typically come from socket: { budget: rawBudget }
    if (updates.budget) {
      setBudget(mapBudget(updates.budget));
    } else {
      setBudget((prev) => (prev ? { ...prev, ...updates } : updates));
    }
  }, []);

  return { budget, loading, fetchBudget, updateBudget, updateBudgetInState };
};

export default useBudget;
