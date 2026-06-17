import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext(null);

const DEFAULT_USER = {
  name: 'Lenin',
  age: 40,
  gender: 'male',
  weight: 79,
  height: 175,
  bodyFat: 22,
  waist: 88,
  chest: 100,
  thigh: 58,
  goalWeight: 74,
  goal: 'lose',
  tmb: 1835,
  calorieGoal: 1900,
  proteinGoal: 160,
  carbsGoal: 190,
  fatGoal: 60,
  waterGoal: 2765,
  injuries: ['biceps', 'l4l5'],
  avatar: null,
  setupComplete: true,
};

const TODAY_KEY = () => new Date().toISOString().split('T')[0];

const DEFAULT_DAY_DATA = () => ({
  date: TODAY_KEY(),
  meals: [],
  waterGlasses: 0,
  workoutCompleted: false,
  workoutId: null,
});

const MOCK_WEIGHT_HISTORY = [
  { date: '2025-04-01', weight: 83.5 },
  { date: '2025-04-08', weight: 83.0 },
  { date: '2025-04-15', weight: 82.2 },
  { date: '2025-04-22', weight: 81.8 },
  { date: '2025-05-01', weight: 81.0 },
  { date: '2025-05-08', weight: 80.5 },
  { date: '2025-05-15', weight: 80.1 },
  { date: '2025-05-22', weight: 79.8 },
  { date: '2025-06-01', weight: 79.5 },
  { date: '2025-06-08', weight: 79.2 },
  { date: '2025-06-15', weight: 79.0 },
];

export function AppProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER);
  const [dayData, setDayData] = useState(DEFAULT_DAY_DATA());
  const [weightHistory, setWeightHistory] = useState(MOCK_WEIGHT_HISTORY);
  const [streak, setStreak] = useState(7);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [savedUser, savedDay, savedWeight, savedStreak] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem(`day_${TODAY_KEY()}`),
        AsyncStorage.getItem('weightHistory'),
        AsyncStorage.getItem('streak'),
      ]);
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedDay) setDayData(JSON.parse(savedDay));
      if (savedWeight) setWeightHistory(JSON.parse(savedWeight));
      if (savedStreak) setStreak(JSON.parse(savedStreak));
    } catch (e) {
      console.error('Load error:', e);
    } finally {
      setIsLoaded(true);
    }
  }

  const saveUser = useCallback(async (newUser) => {
    setUser(newUser);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
  }, []);

  const updateDayData = useCallback(async (updater) => {
    setDayData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      AsyncStorage.setItem(`day_${TODAY_KEY()}`, JSON.stringify(next));
      return next;
    });
  }, []);

  const addMeal = useCallback((meal, category) => {
    updateDayData(prev => ({
      ...prev,
      meals: [...prev.meals, { ...meal, category, id: Date.now().toString(), time: new Date().toISOString() }],
    }));
  }, [updateDayData]);

  const removeMeal = useCallback((mealId) => {
    updateDayData(prev => ({
      ...prev,
      meals: prev.meals.filter(m => m.id !== mealId),
    }));
  }, [updateDayData]);

  const updateWater = useCallback((glasses) => {
    updateDayData(prev => ({ ...prev, waterGlasses: glasses }));
  }, [updateDayData]);

  const completeWorkout = useCallback((workoutId) => {
    updateDayData(prev => ({ ...prev, workoutCompleted: true, workoutId }));
    setStreak(s => {
      const next = s + 1;
      AsyncStorage.setItem('streak', JSON.stringify(next));
      return next;
    });
  }, [updateDayData]);

  const logWeight = useCallback(async (weight) => {
    const entry = { date: TODAY_KEY(), weight };
    setWeightHistory(prev => {
      const filtered = prev.filter(w => w.date !== entry.date);
      const next = [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date));
      AsyncStorage.setItem('weightHistory', JSON.stringify(next));
      return next;
    });
    saveUser({ ...user, weight });
  }, [user, saveUser]);

  const totalCalories = dayData.meals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalProtein = dayData.meals.reduce((s, m) => s + (m.protein || 0), 0);
  const totalCarbs = dayData.meals.reduce((s, m) => s + (m.carbs || 0), 0);
  const totalFat = dayData.meals.reduce((s, m) => s + (m.fat || 0), 0);

  return (
    <AppContext.Provider value={{
      user, saveUser,
      dayData, addMeal, removeMeal, updateWater, completeWorkout,
      weightHistory, logWeight,
      streak,
      isLoaded,
      totals: { calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat },
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
