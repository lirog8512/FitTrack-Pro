import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import Svg, { Circle } from 'react-native-svg';

const C = {
  bg: '#0A0A0F', card: '#13131A', green: '#22C55E',
  blue: '#3B82F6', orange: '#F97316', text: '#FFFFFF',
  muted: '#9CA3AF', border: '#1F2937',
};

function Ring({ size, strokeWidth, progress, color, children }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(progress, 1));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size/2} cy={size/2} r={r} stroke="#1F2937" strokeWidth={strokeWidth} fill="none" />
        <Circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={strokeWidth}
          fill="none" strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      </Svg>
      {children}
    </View>
  );
}

function MacroBar({ label, current, goal, color }) {
  const pct = Math.min(current / goal, 1);
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600' }}>{label}</Text>
        <Text style={{ color: C.text, fontSize: 11, fontWeight: '700' }}>{current}g</Text>
      </View>
      <View style={{ height: 6, backgroundColor: '#1F2937', borderRadius: 3 }}>
        <View style={{ width: `${pct * 100}%`, height: 6, backgroundColor: color, borderRadius: 3 }} />
      </View>
      <Text style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>/{goal}g</Text>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, totals, hydration, completedWorkouts } = useApp();
  const calPct = totals.calories / user.calories;
  const hydPct = hydration / user.waterGoal;
  const today = new Date().toISOString().split('T')[0];
  const todayWorkout = completedWorkouts[today];
  const remaining = user.calories - totals.calories;
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dayName = days[new Date().getDay()];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <LinearGradient colors={['#13131A', '#0A0A0F']} style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={{ color: C.muted, fontSize: 13 }}>{dayName}, {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</Text>
          <Text style={{ color: C.text, fontSize: 24, fontWeight: '800', marginTop: 2 }}>Hola, {user.name} 👋</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={{ color: C.green, fontSize: 20, fontWeight: '800' }}>{user.name[0]}</Text>
        </View>
      </LinearGradient>

      <View style={{ padding: 16, gap: 16 }}>
        {/* Calorie Ring */}
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 24 }]}>
          <Ring size={180} strokeWidth={14} progress={calPct} color={calPct > 1 ? C.orange : C.green}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: C.text, fontSize: 36, fontWeight: '900' }}>{totals.calories}</Text>
              <Text style={{ color: C.muted, fontSize: 12 }}>kcal consumidas</Text>
              <View style={{ height: 1, width: 60, backgroundColor: C.border, marginVertical: 6 }} />
              <Text style={{ color: remaining >= 0 ? C.green : C.orange, fontSize: 14, fontWeight: '700' }}>
                {remaining >= 0 ? remaining : Math.abs(remaining)} kcal {remaining >= 0 ? 'restantes' : 'exceso'}
              </Text>
            </View>
          </Ring>
          <Text style={{ color: C.muted, marginTop: 8 }}>Meta: {user.calories} kcal</Text>
        </View>

        {/* Macros */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Macronutrientes</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <MacroBar label="PROTEÍNA" current={totals.protein} goal={user.protein} color={C.blue} />
            <MacroBar label="CARBOS" current={totals.carbs} goal={user.carbs} color={C.orange} />
            <MacroBar label="GRASA" current={totals.fat} goal={user.fat} color="#A855F7" />
          </View>
        </View>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* Hydration */}
          <View style={[styles.card, { flex: 1, alignItems: 'center', paddingVertical: 20 }]}>
            <Ring size={80} strokeWidth={8} progress={hydPct} color={C.blue}>
              <Ionicons name="water" size={22} color={C.blue} />
            </Ring>
            <Text style={{ color: C.text, fontSize: 16, fontWeight: '800', marginTop: 8 }}>
              {(hydration / 1000).toFixed(1)}L
            </Text>
            <Text style={{ color: C.muted, fontSize: 11 }}>de {user.waterGoal / 1000}L</Text>
          </View>

          {/* Weight progress */}
          <View style={[styles.card, { flex: 1, alignItems: 'center', paddingVertical: 20 }]}>
            <View style={styles.weightCircle}>
              <Ionicons name="scale" size={22} color={C.orange} />
            </View>
            <Text style={{ color: C.text, fontSize: 16, fontWeight: '800', marginTop: 8 }}>{user.weight} kg</Text>
            <Text style={{ color: C.green, fontSize: 11 }}>Meta: {user.goalWeight} kg</Text>
            <Text style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>
              Faltan {(user.weight - user.goalWeight).toFixed(1)} kg
            </Text>
          </View>
        </View>

        {/* Today's Workout Status */}
        <LinearGradient
          colors={todayWorkout ? ['#22C55E22', '#13131A'] : ['#3B82F622', '#13131A']}
          style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: 16 }]}
        >
          <View style={[styles.workoutIcon, { backgroundColor: todayWorkout ? C.green + '33' : C.blue + '33' }]}>
            <Ionicons name={todayWorkout ? 'checkmark-circle' : 'barbell'} size={28} color={todayWorkout ? C.green : C.blue} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontSize: 16, fontWeight: '800' }}>
              {todayWorkout ? '¡Entreno completado!' : 'Entreno de hoy'}
            </Text>
            <Text style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>
              {todayWorkout ? `${todayWorkout} terminado 💪` : 'Ve a la pestaña Entreno'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={C.muted} />
        </LinearGradient>

        {/* Quick tips */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 Consejo del día</Text>
          <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 8 }}>
            Con tu protrusión L4-L5, evita ejercicios con carga axial en la columna. Prioriza el core y los ejercicios de tracción horizontal para fortalecer sin comprimir.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#22C55E22', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#22C55E' },
  card: { backgroundColor: '#13131A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1F2937' },
  cardTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  weightCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F9731622', alignItems: 'center', justifyContent: 'center' },
  workoutIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
