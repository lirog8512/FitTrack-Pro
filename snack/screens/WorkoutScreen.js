import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

const C = {
  bg: '#0A0A0F', card: '#13131A', green: '#22C55E',
  blue: '#3B82F6', orange: '#F97316', text: '#FFFFFF',
  muted: '#9CA3AF', border: '#1F2937',
};

const WORKOUT_PLAN = [
  {
    day: 'Lunes',
    name: 'Empuje (Pecho · Hombros · Tríceps)',
    icon: 'fitness',
    color: C.blue,
    duration: '55 min',
    exercises: [
      { name: 'Press de banca plano', sets: '4', reps: '10-12', rest: '90s', note: '⚠️ Evita grip muy cerrado (bíceps)' },
      { name: 'Press inclinado con mancuernas', sets: '3', reps: '12', rest: '90s', note: 'Rango parcial si molesta el bícep' },
      { name: 'Aperturas en polea baja', sets: '3', reps: '15', rest: '60s', note: 'Control excéntrico lento' },
      { name: 'Press militar mancuernas sentado', sets: '4', reps: '10-12', rest: '90s', note: 'Espalda apoyada, evita arquear lumbar' },
      { name: 'Elevaciones laterales', sets: '3', reps: '15-20', rest: '60s', note: 'Peso ligero, codo ligeramente flexionado' },
      { name: 'Fondos en banco (asistido)', sets: '3', reps: '12-15', rest: '60s', note: 'Sin bajar demasiado para el bícep' },
      { name: 'Extensión tríceps polea', sets: '3', reps: '15', rest: '60s', note: 'Ideal para no forzar bíceps' },
    ],
  },
  {
    day: 'Martes',
    name: 'Tracción (Espalda · Bíceps suave)',
    icon: 'body',
    color: C.green,
    duration: '55 min',
    exercises: [
      { name: 'Remo con barra en T (apoyado)', sets: '4', reps: '10-12', rest: '90s', note: '✅ Ideal para L4-L5 — pecho apoyado' },
      { name: 'Jalones polea al pecho (agarre ancho)', sets: '4', reps: '12', rest: '90s', note: 'No tirar del cuello, espalda recta' },
      { name: 'Remo en polea baja sentado', sets: '3', reps: '12', rest: '90s', note: 'No curvar lumbar al tirar' },
      { name: 'Pullover con mancuerna', sets: '3', reps: '12-15', rest: '60s', note: 'Excelente para espalda sin carga lumbar' },
      { name: 'Face pulls en polea', sets: '3', reps: '15-20', rest: '60s', note: 'Salud de hombros y postura' },
      { name: 'Curl martillo con mancuernas', sets: '3', reps: '12', rest: '60s', note: '⚠️ Solo si no hay molestia en tendón' },
      { name: 'Curl en polea baja', sets: '2', reps: '15', rest: '60s', note: 'Alternativa más segura para bíceps' },
    ],
  },
  {
    day: 'Miércoles',
    name: 'Piernas (Cuádriceps · Isquios · Glúteos)',
    icon: 'walk',
    color: C.orange,
    duration: '60 min',
    exercises: [
      { name: 'Prensa de piernas 45°', sets: '4', reps: '12-15', rest: '90s', note: '✅ Mejor que squat para L4-L5' },
      { name: 'Extensión de cuádriceps en máquina', sets: '3', reps: '15', rest: '60s', note: 'Rango completo, sin peso excesivo' },
      { name: 'Curl femoral tumbado', sets: '3', reps: '12-15', rest: '60s', note: 'Control en la bajada' },
      { name: 'Hip thrust con barra', sets: '4', reps: '12', rest: '90s', note: '✅ Glúteo sin carga lumbar directa' },
      { name: 'Zancadas caminando (sin peso)', sets: '3', reps: '20 pasos', rest: '60s', note: 'Si molesta la espalda, hacerlas estáticas' },
      { name: 'Elevación de gemelos de pie', sets: '4', reps: '20', rest: '45s', note: 'Rango completo, pausa arriba' },
      { name: 'Abductores en máquina', sets: '3', reps: '20', rest: '45s', note: 'Estabilidad de rodilla y cadera' },
    ],
  },
  {
    day: 'Jueves',
    name: 'Core & Movilidad (Recuperación activa)',
    icon: 'body',
    color: '#A855F7',
    duration: '40 min',
    exercises: [
      { name: 'Plancha frontal', sets: '3', reps: '30-45 seg', rest: '45s', note: '✅ Excelente para L4-L5 — sin carga axial' },
      { name: 'Plancha lateral', sets: '3', reps: '20-30 seg/lado', rest: '45s', note: 'Mantén cadera elevada y recta' },
      { name: 'Dead bug', sets: '3', reps: '10/lado', rest: '45s', note: '✅ Ejercicio rehabilitador lumbar' },
      { name: 'Bird dog', sets: '3', reps: '10/lado', rest: '45s', note: 'Movimiento lento y controlado' },
      { name: 'Puente de glúteos', sets: '3', reps: '15-20', rest: '45s', note: 'Aprieta glúteo arriba, no hiperextiendas' },
      { name: 'Estiramiento de psoas (lunge)', sets: '2', reps: '30 seg/lado', rest: '30s', note: '✅ Clave para protrusión lumbar' },
      { name: 'Estiramiento piriforme', sets: '2', reps: '30 seg/lado', rest: '30s', note: 'Alivia presión en ciático' },
    ],
  },
  {
    day: 'Viernes',
    name: 'Full Body (Fuerza funcional)',
    icon: 'flash',
    color: '#EC4899',
    duration: '55 min',
    exercises: [
      { name: 'Sentadilla goblet (kettlebell)', sets: '4', reps: '12', rest: '90s', note: '✅ Carga frontal, menos estrés lumbar' },
      { name: 'Remo con mancuerna 1 brazo', sets: '3', reps: '12/lado', rest: '60s', note: 'Espalda neutra, no rotar la cadera' },
      { name: 'Press Arnold mancuernas', sets: '3', reps: '12', rest: '75s', note: 'Rango completo, despacio' },
      { name: 'Step-up con mancuernas', sets: '3', reps: '12/pierna', rest: '60s', note: 'Banco no muy alto, rodilla alineada' },
      { name: 'Superman en suelo', sets: '3', reps: '12-15', rest: '45s', note: '✅ Fortalece erector sin compresión' },
      { name: 'Farmer carry (30m)', sets: '3', reps: '30 metros', rest: '75s', note: 'Peso moderado, core activo' },
      { name: 'Plancha con rotación', sets: '2', reps: '10/lado', rest: '45s', note: 'Control total, sin hundirse' },
    ],
  },
];

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { completedWorkouts, completeWorkout } = useApp();
  const [selectedDay, setSelectedDay] = useState(null);
  const today = new Date().toISOString().split('T')[0];
  const todayDayIndex = new Date().getDay();
  const dayMap = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };
  const todayWorkoutIndex = dayMap[todayDayIndex] ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <LinearGradient colors={['#13131A', '#0A0A0F']} style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View>
            <Text style={{ color: C.muted, fontSize: 13 }}>Plan 5 días adaptado</Text>
            <Text style={{ color: C.text, fontSize: 22, fontWeight: '800' }}>Entrenamiento 💪</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={14} color={C.orange} />
            <Text style={{ color: C.orange, fontSize: 11, fontWeight: '700' }}>Lesiones adaptadas</Text>
          </View>
        </LinearGradient>

        <View style={{ padding: 16, gap: 12 }}>
          {/* Injury warning */}
          <LinearGradient colors={['#F9731622', '#13131A']} style={[styles.card, { flexDirection: 'row', gap: 12, alignItems: 'flex-start' }]}>
            <Ionicons name="warning" size={20} color={C.orange} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.orange, fontWeight: '700', marginBottom: 4 }}>Lesiones consideradas</Text>
              <Text style={{ color: C.muted, fontSize: 12, lineHeight: 18 }}>
                ⚠️ Tendones de bíceps — Sin supinación forzada ni cargas excéntricas pesadas{'\n'}
                ⚠️ Protrusión L4-L5 — Sin cargas axiales en columna, priorizar core
              </Text>
            </View>
          </LinearGradient>

          {WORKOUT_PLAN.map((workout, index) => {
            const isCompleted = completedWorkouts[today] === workout.day;
            const isToday = todayWorkoutIndex === index;
            return (
              <TouchableOpacity key={index} onPress={() => setSelectedDay(workout)} activeOpacity={0.8}>
                <LinearGradient
                  colors={isCompleted ? [workout.color + '33', '#13131A'] : isToday ? [workout.color + '22', '#13131A'] : ['#13131A', '#13131A']}
                  style={[styles.card, { borderColor: isToday ? workout.color + '66' : '#1F2937' }]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={[styles.dayIcon, { backgroundColor: workout.color + '22' }]}>
                      <Ionicons name={workout.icon} size={24} color={workout.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ color: workout.color, fontSize: 12, fontWeight: '700' }}>{workout.day}</Text>
                        {isToday && <View style={[styles.chip, { backgroundColor: workout.color }]}><Text style={{ color: C.bg, fontSize: 9, fontWeight: '800' }}>HOY</Text></View>}
                        {isCompleted && <Ionicons name="checkmark-circle" size={16} color={C.green} />}
                      </View>
                      <Text style={{ color: C.text, fontSize: 14, fontWeight: '700' }}>{workout.name}</Text>
                      <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>
                        {workout.exercises.length} ejercicios · {workout.duration}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={C.muted} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Workout Detail Modal */}
      <Modal visible={!!selectedDay} animationType="slide" transparent>
        {selectedDay && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ color: selectedDay.color, fontWeight: '700' }}>{selectedDay.day}</Text>
                <TouchableOpacity onPress={() => setSelectedDay(null)}>
                  <Ionicons name="close" size={24} color={C.muted} />
                </TouchableOpacity>
              </View>
              <Text style={{ color: C.text, fontSize: 18, fontWeight: '800', marginBottom: 4 }}>{selectedDay.name}</Text>
              <Text style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>
                {selectedDay.exercises.length} ejercicios · {selectedDay.duration}
              </Text>
              <ScrollView style={{ maxHeight: 420 }}>
                {selectedDay.exercises.map((ex, i) => (
                  <View key={i} style={styles.exerciseRow}>
                    <View style={styles.exNum}>
                      <Text style={{ color: selectedDay.color, fontWeight: '800', fontSize: 13 }}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: C.text, fontWeight: '700', fontSize: 14 }}>{ex.name}</Text>
                      <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                        {ex.sets} series × {ex.reps} · Descanso {ex.rest}
                      </Text>
                      {ex.note && (
                        <Text style={{ color: ex.note.startsWith('⚠️') ? C.orange : C.green, fontSize: 11, marginTop: 4 }}>
                          {ex.note}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => {
                  completeWorkout(selectedDay.day);
                  setSelectedDay(null);
                }}
                style={[styles.completeBtn, { backgroundColor: selectedDay.color }]}
              >
                <Ionicons name="checkmark-circle" size={20} color={C.bg} />
                <Text style={{ color: C.bg, fontWeight: '800', fontSize: 15 }}>Marcar como completado</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: '#F9731622', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  card: { backgroundColor: '#13131A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1F2937' },
  dayIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  chip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  modalOverlay: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#13131A', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  exerciseRow: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1F2937' },
  exNum: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  completeBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 14, padding: 16, marginTop: 16 },
});
