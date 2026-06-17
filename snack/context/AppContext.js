import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

const TODAY = new Date().toISOString().split('T')[0];

const DEFAULT_USER = {
  name: 'Lenin',
  age: 40,
  weight: 79,
  goalWeight: 74,
  height: 175,
  calories: 1900,
  protein: 160,
  carbs: 190,
  fat: 60,
  waterGoal: 3000,
  injuries: ['Tendones bíceps', 'Protrusión L4-L5'],
};

const DEFAULT_STATE = {
  user: DEFAULT_USER,
  todayMeals: [],
  hydration: 0,
  completedWorkouts: {},
  weightHistory: [
    { date: '2025-01-01', weight: 82 },
    { date: '2025-02-01', weight: 81 },
    { date: '2025-03-01', weight: 80 },
    { date: '2025-04-01', weight: 79.5 },
    { date: '2025-05-01', weight: 79 },
  ],
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER);
  const [todayMeals, setTodayMeals] = useState([]);
  const [hydration, setHydration] = useState(0);
  const [completedWorkouts, setCompletedWorkouts] = useState({});
  const [weightHistory, setWeightHistory] = useState(DEFAULT_STATE.weightHistory);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const stored = await AsyncStorage.getItem('fittrack_data');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.user) setUser(data.user);
        if (data.weightHistory) setWeightHistory(data.weightHistory);
        if (data.completedWorkouts) setCompletedWorkouts(data.completedWorkouts);
        const todayKey = `meals_${TODAY}`;
        if (data[todayKey]) setTodayMeals(data[todayKey]);
        const hydKey = `hydration_${TODAY}`;
        if (data[hydKey]) setHydration(data[hydKey]);
      }
    } catch (e) {}
  }

  async function saveData(patch) {
    try {
      const stored = await AsyncStorage.getItem('fittrack_data');
      const existing = stored ? JSON.parse(stored) : {};
      await AsyncStorage.setItem('fittrack_data', JSON.stringify({ ...existing, ...patch }));
    } catch (e) {}
  }

  function addMeal(meal) {
    const newMeals = [...todayMeals, { ...meal, id: Date.now().toString() }];
    setTodayMeals(newMeals);
    saveData({ [`meals_${TODAY}`]: newMeals });
  }

  function removeMeal(id) {
    const newMeals = todayMeals.filter(m => m.id !== id);
    setTodayMeals(newMeals);
    saveData({ [`meals_${TODAY}`]: newMeals });
  }

  function addWater(ml) {
    const newVal = Math.min(hydration + ml, user.waterGoal);
    setHydration(newVal);
    saveData({ [`hydration_${TODAY}`]: newVal });
  }

  function completeWorkout(day) {
    const updated = { ...completedWorkouts, [TODAY]: day };
    setCompletedWorkouts(updated);
    saveData({ completedWorkouts: updated });
  }

  function addWeight(weight) {
    const newHistory = [...weightHistory, { date: TODAY, weight }];
    setWeightHistory(newHistory);
    setUser(u => ({ ...u, weight }));
    saveData({ weightHistory: newHistory, user: { ...user, weight } });
  }

  function updateUser(updates) {
    const updated = { ...user, ...updates };
    setUser(updated);
    saveData({ user: updated });
  }

  const totals = todayMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <AppContext.Provider value={{
      user, todayMeals, hydration, completedWorkouts, weightHistory,
      totals, addMeal, removeMeal, addWater, completeWorkout, addWeight, updateUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
