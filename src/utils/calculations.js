export function calculateTMB(weight, height, age, gender = 'male') {
  if (gender === 'male') {
    return Math.round(88.362 + 13.397 * weight + 4.799 * height - 5.677 * age);
  }
  return Math.round(447.593 + 9.247 * weight + 3.098 * height - 4.330 * age);
}

export function calculateCalorieGoal(tmb, goal, activityLevel = 1.375) {
  const tdee = tmb * activityLevel;
  if (goal === 'lose') return Math.round(tdee - 400);
  if (goal === 'gain') return Math.round(tdee + 300);
  return Math.round(tdee);
}

export function calculateMacros(calories, goal) {
  let proteinPct, carbsPct, fatPct;
  if (goal === 'lose') {
    proteinPct = 0.35; carbsPct = 0.40; fatPct = 0.25;
  } else if (goal === 'gain') {
    proteinPct = 0.30; carbsPct = 0.45; fatPct = 0.25;
  } else {
    proteinPct = 0.30; carbsPct = 0.40; fatPct = 0.30;
  }
  return {
    protein: Math.round((calories * proteinPct) / 4),
    carbs: Math.round((calories * carbsPct) / 4),
    fat: Math.round((calories * fatPct) / 9),
  };
}

export function calculateBMI(weight, height) {
  const heightM = height / 100;
  return (weight / (heightM * heightM)).toFixed(1);
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Bajo peso', color: '#3B82F6' };
  if (bmi < 25) return { label: 'Peso normal', color: '#22C55E' };
  if (bmi < 30) return { label: 'Sobrepeso', color: '#EAB308' };
  return { label: 'Obesidad', color: '#EF4444' };
}

export function getWaterGoal(weight) {
  return Math.round(weight * 35);
}

export function formatDate(date = new Date()) {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
}

export function getWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function getTodayDayKey() {
  const dayMap = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday' };
  return dayMap[new Date().getDay()] || null;
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function getShortDay(date) {
  return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()];
}
