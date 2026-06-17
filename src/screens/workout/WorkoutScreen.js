import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { WORKOUT_PLAN, DAYS_ORDER } from '../../constants/workoutData';
import { useApp } from '../../context/AppContext';
import Button from '../../components/ui/Button';

const DAY_LABELS = { monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié', thursday: 'Jue', friday: 'Vie' };

export default function WorkoutScreen({ navigation }) {
  const { dayData } = useApp();
  const today = new Date().getDay();
  const todayKeyMap = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday' };
  const defaultDay = todayKeyMap[today] || 'monday';
  const [selectedDay, setSelectedDay] = useState(defaultDay);
  const [expandedExercise, setExpandedExercise] = useState(null);

  const workout = WORKOUT_PLAN[selectedDay];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Entrenamiento</Text>

        {/* Day Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
          {DAYS_ORDER.map(dayKey => {
            const w = WORKOUT_PLAN[dayKey];
            const isSelected = selectedDay === dayKey;
            const isToday = todayKeyMap[today] === dayKey;
            return (
              <TouchableOpacity key={dayKey} onPress={() => setSelectedDay(dayKey)} style={{ marginRight: 10 }}>
                {isSelected ? (
                  <LinearGradient colors={w.gradient} style={styles.dayChipActive}>
                    <Text style={styles.dayChipTextActive}>{DAY_LABELS[dayKey]}</Text>
                    <Text style={styles.dayChipEmojiActive}>{w.emoji}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.dayChip, isToday && { borderColor: w.color }]}>
                    <Text style={[styles.dayChipText, isToday && { color: w.color }]}>{DAY_LABELS[dayKey]}</Text>
                    <Text style={styles.dayChipEmoji}>{w.emoji}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Workout Header */}
        <LinearGradient colors={workout.gradient} style={styles.workoutHeader}>
          <View style={styles.workoutHeaderContent}>
            <View>
              <Text style={styles.workoutDay}>{workout.day}</Text>
              <Text style={styles.workoutName}>{workout.emoji} {workout.name}</Text>
              <Text style={styles.workoutMeta}>{workout.exercises.length} ejercicios · {workout.exercises.reduce((s, e) => s + e.sets, 0)} series totales</Text>
            </View>
            <Text style={styles.workoutHeaderEmoji}>{workout.emoji}</Text>
          </View>
          <View style={styles.workoutTipBox}>
            <Ionicons name="bulb-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.workoutTip}>{workout.tip}</Text>
          </View>
          {dayData.workoutCompleted && selectedDay === defaultDay && (
            <View style={styles.completedBanner}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
              <Text style={styles.completedText}>Sesión completada hoy</Text>
            </View>
          )}
        </LinearGradient>

        {/* Exercise List */}
        {workout.exercises.map((ex, index) => (
          <TouchableOpacity key={ex.id} onPress={() => setExpandedExercise(expandedExercise === ex.id ? null : ex.id)} activeOpacity={0.85}>
            <View style={styles.exerciseCard}>
              <View style={styles.exerciseTop}>
                <View style={styles.exerciseNum}>
                  <Text style={styles.exerciseNumText}>{index + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.exerciseTitleRow}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    {ex.warning && (
                      <View style={styles.warningBadge}>
                        <Ionicons name="warning" size={12} color={COLORS.orange} />
                        <Text style={styles.warningBadgeText}>Lesión</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.exerciseMeta}>
                    <View style={styles.metaChip}>
                      <Ionicons name="layers-outline" size={12} color={COLORS.textMuted} />
                      <Text style={styles.metaText}>{ex.sets} series</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Ionicons name="repeat-outline" size={12} color={COLORS.textMuted} />
                      <Text style={styles.metaText}>{ex.reps} reps</Text>
                    </View>
                    {ex.rest > 0 && (
                      <View style={styles.metaChip}>
                        <Ionicons name="timer-outline" size={12} color={COLORS.textMuted} />
                        <Text style={styles.metaText}>{ex.rest}s</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.muscleChip, { backgroundColor: workout.color + '20' }]}>
                    <Text style={[styles.muscleText, { color: workout.color }]}>{ex.muscleGroup}</Text>
                  </View>
                </View>
                <Ionicons name={expandedExercise === ex.id ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textMuted} />
              </View>

              {expandedExercise === ex.id && (
                <View style={styles.exerciseDetail}>
                  {ex.warning && (
                    <View style={styles.warningBox}>
                      <Text style={styles.warningText}>{ex.warningText}</Text>
                    </View>
                  )}
                  <View style={styles.equipmentRow}>
                    <Ionicons name="barbell-outline" size={14} color={COLORS.blue} />
                    <Text style={styles.equipmentText}>{ex.equipment}</Text>
                  </View>
                  <Text style={styles.techniqueTitle}>Técnica:</Text>
                  <Text style={styles.techniqueText}>{ex.technique}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 16 }} />

        <Button
          title={dayData.workoutCompleted && selectedDay === defaultDay ? '✓ Sesión completada' : 'Iniciar Sesión'}
          onPress={() => navigation.navigate('ActiveWorkout', { dayKey: selectedDay })}
          variant={dayData.workoutCompleted && selectedDay === defaultDay ? 'outline' : 'primary'}
          icon="play"
          style={{ marginBottom: SPACING.xl }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.base, paddingTop: SPACING.base },
  title: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.black, color: COLORS.white, marginBottom: SPACING.base },
  dayScroll: { marginBottom: SPACING.base },
  dayChip: { alignItems: 'center', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border },
  dayChipActive: { alignItems: 'center', borderRadius: RADIUS.lg, paddingHorizontal: 16, paddingVertical: 10 },
  dayChipText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: FONTS.weights.semibold },
  dayChipTextActive: { fontSize: FONTS.sizes.sm, color: '#fff', fontWeight: FONTS.weights.bold },
  dayChipEmoji: { fontSize: 18, marginTop: 2 },
  dayChipEmojiActive: { fontSize: 18, marginTop: 2 },
  workoutHeader: { borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.base },
  workoutHeaderContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  workoutDay: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.7)', fontWeight: FONTS.weights.semibold },
  workoutName: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.black, color: '#fff', marginVertical: 4 },
  workoutMeta: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)' },
  workoutHeaderEmoji: { fontSize: 48, opacity: 0.5 },
  workoutTipBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: RADIUS.md, padding: SPACING.sm, gap: 6 },
  workoutTip: { flex: 1, fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.8)', lineHeight: 16 },
  completedBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: RADIUS.md, padding: SPACING.sm, marginTop: SPACING.sm, gap: 6 },
  completedText: { fontSize: FONTS.sizes.sm, color: COLORS.green, fontWeight: FONTS.weights.semibold },
  exerciseCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  exerciseTop: { flexDirection: 'row', alignItems: 'flex-start', padding: SPACING.md, gap: 12 },
  exerciseNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  exerciseNumText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.textSecondary },
  exerciseTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' },
  exerciseName: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.white },
  warningBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.orange + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full, gap: 3 },
  warningBadgeText: { fontSize: FONTS.sizes.xs, color: COLORS.orange, fontWeight: FONTS.weights.semibold },
  exerciseMeta: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  muscleChip: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  muscleText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.semibold },
  exerciseDetail: { borderTopWidth: 1, borderTopColor: COLORS.border, padding: SPACING.md },
  warningBox: { backgroundColor: COLORS.orange + '15', borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.orange + '40' },
  warningText: { fontSize: FONTS.sizes.xs, color: COLORS.orange, lineHeight: 16 },
  equipmentRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  equipmentText: { fontSize: FONTS.sizes.sm, color: COLORS.blue },
  techniqueTitle: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.textSecondary, marginBottom: 6 },
  techniqueText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },
});
