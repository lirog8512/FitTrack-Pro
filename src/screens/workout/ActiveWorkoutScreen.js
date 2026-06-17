import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { WORKOUT_PLAN } from '../../constants/workoutData';
import { useApp } from '../../context/AppContext';
import { formatTime } from '../../utils/calculations';

export default function ActiveWorkoutScreen({ route, navigation }) {
  const { dayKey } = route.params;
  const workout = WORKOUT_PLAN[dayKey];
  const { completeWorkout } = useApp();

  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  const [weights, setWeights] = useState({});
  const [resting, setResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [sensation, setSensation] = useState(3);
  const timerRef = useRef(null);
  const restRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (resting && restTime > 0) {
      restRef.current = setInterval(() => {
        setRestTime(t => {
          if (t <= 1) { setResting(false); clearInterval(restRef.current); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(restRef.current);
  }, [resting]);

  const currentEx = workout.exercises[currentExIdx];
  const totalSets = currentEx.sets;
  const doneSetsForCurrent = (completedSets[currentEx.id] || []).length;

  function toggleSet(setIdx) {
    setCompletedSets(prev => {
      const current = prev[currentEx.id] || [];
      let next;
      if (current.includes(setIdx)) {
        next = current.filter(s => s !== setIdx);
      } else {
        next = [...current, setIdx];
        if (next.length === totalSets) {
          // All sets done — start rest timer
          setResting(true);
          setRestTime(currentEx.rest || 60);
        } else if (currentEx.rest > 0) {
          setResting(true);
          setRestTime(currentEx.rest);
        }
      }
      return { ...prev, [currentEx.id]: next };
    });
  }

  function finishWorkout() {
    clearInterval(timerRef.current);
    completeWorkout(dayKey);
    setShowSummary(true);
  }

  const totalVolume = workout.exercises.reduce((total, ex) => {
    const sets = completedSets[ex.id] || [];
    const w = parseFloat(weights[ex.id]) || 0;
    return total + sets.length * (typeof ex.reps === 'string' ? parseInt(ex.reps) || 10 : ex.reps) * w;
  }, 0);

  const completedExercises = workout.exercises.filter(ex => (completedSets[ex.id] || []).length === ex.sets).length;

  // Rest timer ring
  const restMax = currentEx.rest || 60;
  const restPct = restTime / restMax;
  const ringSize = 120;
  const r = 50;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - restPct);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={workout.gradient} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => Alert.alert('¿Salir?', '¿Quieres terminar la sesión?', [
            { text: 'Continuar', style: 'cancel' },
            { text: 'Salir', onPress: () => navigation.goBack() },
          ])}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{workout.name}</Text>
            <Text style={styles.headerTimer}>⏱ {formatTime(elapsed)}</Text>
          </View>
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>{currentExIdx + 1}/{workout.exercises.length}</Text>
          </View>
        </View>
        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((completedExercises) / workout.exercises.length) * 100}%` }]} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Current Exercise */}
        <View style={styles.exerciseCard}>
          <View style={styles.exTop}>
            <View>
              <Text style={styles.exName}>{currentEx.name}</Text>
              <Text style={styles.exMeta}>{currentEx.sets} series × {currentEx.reps} · Descanso {currentEx.rest}s</Text>
              <Text style={styles.exMuscle}>{currentEx.muscleGroup}</Text>
            </View>
            <View style={[styles.exNumBadge, { backgroundColor: workout.color + '20' }]}>
              <Text style={[styles.exNum, { color: workout.color }]}>{currentExIdx + 1}</Text>
            </View>
          </View>

          {currentEx.warning && (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={14} color={COLORS.orange} />
              <Text style={styles.warningText}>{currentEx.warningText}</Text>
            </View>
          )}

          {/* Weight Input */}
          <View style={styles.weightRow}>
            <Ionicons name="barbell-outline" size={18} color={COLORS.textMuted} />
            <Text style={styles.weightLabel}>Peso usado:</Text>
            <TextInput
              style={styles.weightInput}
              value={weights[currentEx.id] || ''}
              onChangeText={v => setWeights(p => ({ ...p, [currentEx.id]: v }))}
              placeholder="kg"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
            />
            <Text style={styles.weightUnit}>kg</Text>
          </View>

          {/* Set Checklist */}
          <Text style={styles.setsTitle}>Series:</Text>
          <View style={styles.setsGrid}>
            {Array.from({ length: totalSets }).map((_, i) => {
              const done = (completedSets[currentEx.id] || []).includes(i);
              return (
                <TouchableOpacity key={i} onPress={() => toggleSet(i)}>
                  <LinearGradient
                    colors={done ? workout.gradient : ['#1A1A24', '#1A1A24']}
                    style={[styles.setCircle, !done && { borderWidth: 2, borderColor: COLORS.border }]}
                  >
                    {done ? (
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    ) : (
                      <Text style={styles.setNum}>{i + 1}</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.setsDone}>{doneSetsForCurrent}/{totalSets} series completadas</Text>
        </View>

        {/* Rest Timer */}
        {resting && (
          <View style={styles.restCard}>
            <Text style={styles.restTitle}>Descanso</Text>
            <View style={{ alignItems: 'center', marginVertical: 12 }}>
              <Svg width={ringSize} height={ringSize} style={{ transform: [{ rotate: '-90deg' }] }}>
                <Circle cx={60} cy={60} r={r} stroke="#1A1A24" strokeWidth={10} fill="none" />
                <Circle cx={60} cy={60} r={r} stroke={workout.color} strokeWidth={10} fill="none"
                  strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
              </Svg>
              <Text style={[styles.restTimeText, { position: 'absolute', top: 40 }]}>{formatTime(restTime)}</Text>
            </View>
            <TouchableOpacity onPress={() => { setResting(false); setRestTime(0); }} style={styles.skipRest}>
              <Text style={styles.skipRestText}>Saltar descanso</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Exercise Navigator */}
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={() => setCurrentExIdx(i => Math.max(0, i - 1))}
            disabled={currentExIdx === 0}
            style={[styles.navBtn, currentExIdx === 0 && { opacity: 0.3 }]}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.textSecondary} />
            <Text style={styles.navText}>Anterior</Text>
          </TouchableOpacity>

          {currentExIdx < workout.exercises.length - 1 ? (
            <TouchableOpacity onPress={() => setCurrentExIdx(i => i + 1)}>
              <LinearGradient colors={workout.gradient} style={styles.nextBtn}>
                <Text style={styles.nextBtnText}>Siguiente</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={finishWorkout}>
              <LinearGradient colors={[COLORS.green, COLORS.greenDark]} style={styles.nextBtn}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.nextBtnText}>Terminar</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* All exercises mini list */}
        <Text style={styles.allExTitle}>Todos los ejercicios</Text>
        {workout.exercises.map((ex, i) => {
          const done = (completedSets[ex.id] || []).length === ex.sets;
          const isCurrent = i === currentExIdx;
          return (
            <TouchableOpacity key={ex.id} onPress={() => setCurrentExIdx(i)} style={[styles.miniEx, isCurrent && { borderColor: workout.color }]}>
              <View style={[styles.miniNum, done && { backgroundColor: COLORS.green }]}>
                {done ? <Ionicons name="checkmark" size={12} color="#fff" /> : <Text style={styles.miniNumText}>{i + 1}</Text>}
              </View>
              <Text style={[styles.miniName, isCurrent && { color: workout.color }]}>{ex.name}</Text>
              <Text style={styles.miniSets}>{ex.sets}×{ex.reps}</Text>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Summary Modal */}
      <Modal visible={showSummary} animationType="slide" transparent>
        <View style={styles.summaryOverlay}>
          <LinearGradient colors={['#1A1A24', '#0A0A0F']} style={styles.summaryCard}>
            <Text style={styles.summaryEmoji}>🏆</Text>
            <Text style={styles.summaryTitle}>¡Sesión completada!</Text>
            <Text style={styles.summaryWorkout}>{workout.emoji} {workout.name}</Text>

            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatVal}>{formatTime(elapsed)}</Text>
                <Text style={styles.summaryStatLabel}>Tiempo</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatVal}>{completedExercises}</Text>
                <Text style={styles.summaryStatLabel}>Ejercicios</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatVal}>{Math.round(totalVolume)}</Text>
                <Text style={styles.summaryStatLabel}>Vol. kg</Text>
              </View>
            </View>

            <Text style={styles.sensationLabel}>¿Cómo te has sentido?</Text>
            <View style={styles.sensationRow}>
              {['😴', '😐', '💪', '🔥', '⚡'].map((emoji, i) => (
                <TouchableOpacity key={i} onPress={() => setSensation(i + 1)} style={[styles.sensationBtn, sensation === i + 1 && { backgroundColor: workout.color + '30' }]}>
                  <Text style={{ fontSize: 28 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={() => { setShowSummary(false); navigation.goBack(); }}>
              <LinearGradient colors={[COLORS.green, COLORS.greenDark]} style={styles.summaryBtn}>
                <Text style={styles.summaryBtnText}>Guardar y salir</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: SPACING.sm, paddingHorizontal: SPACING.base, paddingBottom: SPACING.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: '#fff' },
  headerTimer: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  progressBadge: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  progressBadgeText: { fontSize: FONTS.sizes.sm, color: '#fff', fontWeight: FONTS.weights.bold },
  progressTrack: { height: 4, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: RADIUS.full, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: RADIUS.full },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.base, paddingTop: SPACING.base },
  exerciseCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.base },
  exTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  exName: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.white, marginBottom: 4 },
  exMeta: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: 4 },
  exMuscle: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  exNumBadge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  exNum: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black },
  warningBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.orange + '15', borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.md, gap: 6, borderWidth: 1, borderColor: COLORS.orange + '30' },
  warningText: { flex: 1, fontSize: FONTS.sizes.xs, color: COLORS.orange, lineHeight: 16 },
  weightRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.sm, marginBottom: SPACING.md, gap: 8 },
  weightLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, flex: 1 },
  weightInput: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.white, width: 60, textAlign: 'right' },
  weightUnit: { fontSize: FONTS.sizes.base, color: COLORS.textMuted },
  setsTitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: FONTS.weights.semibold, marginBottom: SPACING.sm },
  setsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: SPACING.sm },
  setCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  setNum: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.textSecondary },
  setsDone: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
  restCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', marginBottom: SPACING.base },
  restTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.white },
  restTimeText: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.black, color: COLORS.white },
  skipRest: { paddingVertical: SPACING.sm },
  skipRestText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.base },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: SPACING.sm },
  navText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  nextBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: RADIUS.lg, gap: 6 },
  nextBtnText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: '#fff' },
  allExTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  miniEx: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.sm, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  miniNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  miniNumText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold, color: COLORS.textMuted },
  miniName: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: FONTS.weights.medium },
  miniSets: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  summaryOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: SPACING.base },
  summaryCard: { borderRadius: RADIUS['2xl'], padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  summaryEmoji: { fontSize: 64, marginBottom: 8 },
  summaryTitle: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.black, color: COLORS.white, marginBottom: 4 },
  summaryWorkout: { fontSize: FONTS.sizes.base, color: COLORS.textSecondary, marginBottom: 24 },
  summaryStats: { flexDirection: 'row', gap: 24, marginBottom: 24 },
  summaryStat: { alignItems: 'center' },
  summaryStatVal: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.black, color: COLORS.white },
  summaryStatLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  sensationLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: 12 },
  sensationRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  sensationBtn: { padding: 8, borderRadius: RADIUS.md },
  summaryBtn: { paddingVertical: 14, paddingHorizontal: 48, borderRadius: RADIUS.xl },
  summaryBtnText: { color: '#fff', fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold },
});
