import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

const defaultUser = {
  name: 'Lenin',
  age: 40,
  weight: 79,
  goalWeight: 74,
  height: 178,
  calories: 1900,
  protein: 160,
  carbs: 190,
  fat: 60,
  waterGoal: 3000,
  injuries: ['Tendones bíceps', 'Protrusión L4-L5'],
  apiKey: '',
  lastBodyAnalysis: '',
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(defaultUser);
  const [todayMeals, setTodayMeals] = useState([]);
  const [hydration, setHydration] = useState(0);
  const [completedWorkouts, setCompletedWorkouts] = useState({});
  const [weightHistory, setWeightHistory] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState({});

  useEffect(() => {
    AsyncStorage.getItem('fittrack_data').then(raw => {
      if (!raw) return;
      try {
        const d = JSON.parse(raw);
        if (d.user) setUser({ ...defaultUser, ...d.user });
        if (d.todayMeals) setTodayMeals(d.todayMeals);
        if (d.hydration) setHydration(d.hydration);
        if (d.completedWorkouts) setCompletedWorkouts(d.completedWorkouts);
        if (d.weightHistory) setWeightHistory(d.weightHistory);
        if (d.workoutHistory) setWorkoutHistory(d.workoutHistory);
      } catch (e) {}
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('fittrack_data', JSON.stringify({
      user, todayMeals, hydration, completedWorkouts, weightHistory, workoutHistory
    }));
  }, [user, todayMeals, hydration, completedWorkouts, weightHistory, workoutHistory]);

  const totals = todayMeals.reduce(
    (acc, m) => ({ calories: acc.calories + m.calories, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  function addMeal(meal) { setTodayMeals(prev => [...prev, { ...meal, id: Date.now() }]); }
  function removeMeal(id) { setTodayMeals(prev => prev.filter(m => m.id !== id)); }
  function addWater(ml) { setHydration(prev => prev + ml); }
  function completeWorkout(name) {
    const today = new Date().toISOString().split('T')[0];
    setCompletedWorkouts(prev => ({ ...prev, [today]: name }));
  }
  function addWeight(weight) {
    const date = new Date().toLocaleDateString('es-ES');
    setWeightHistory(prev => [{ weight, date }, ...prev]);
    setUser(prev => ({ ...prev, weight }));
  }
  function updateUser(fields) { setUser(prev => ({ ...prev, ...fields })); }
  function logWorkoutSets(date, exerciseName, sets) {
    setWorkoutHistory(prev => ({
      ...prev,
      [date]: { ...(prev[date] || {}), [exerciseName]: sets }
    }));
  }
  function getExerciseHistory(exerciseName) {
    const dates = Object.keys(workoutHistory).sort().reverse();
    const history = [];
    for (const date of dates) {
      if (workoutHistory[date][exerciseName]) {
        history.push({ date, sets: workoutHistory[date][exerciseName] });
        if (history.length >= 4) break;
      }
    }
    return history;
  }

  return (
    <AppContext.Provider value={{ user, todayMeals, totals, hydration, completedWorkouts, weightHistory, workoutHistory, addMeal, removeMeal, addWater, completeWorkout, addWeight, updateUser, logWorkoutSets, getExerciseHistory }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
