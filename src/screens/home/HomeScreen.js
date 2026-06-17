import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import BigCalorieRing from '../../components/ui/BigCalorieRing';
import MacroRing from '../../components/ui/MacroRing';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { formatDate, getWeekDates, getShortDay, getTodayDayKey } from '../../utils/calculations';
import { WORKOUT_PLAN, MOTIVATIONAL_QUOTES } from '../../constants/workoutData';

export default function HomeScreen({ navigation }) {
  const { user, totals, dayData, updateWater, streak } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekDates = getWeekDates();
  const todayKey = getTodayDayKey();
  const todayWorkout = todayKey ? WORKOUT_PLAN[todayKey] : null;
  const quote = MOTIVATIONAL_QUOTES[new Date().getDay() % MOTIVATIONAL_QUOTES.length];
  const waterGoal = Math.ceil(user.waterGoal / 250);
  const glasses = dayData.waterGlasses;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dateText}>{formatDate().toUpperCase()}</Text>
            <Text style={styles.greeting}>Hola, {user.name} 👋</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.streakBadge}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={styles.streakNum}>{streak}</Text>
            </View>
            <LinearGradient colors={[COLORS.blue, COLORS.green]} style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name[0]}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Week Calendar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekScroll}>
          {weekDates.map((date, i) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            return (
              <TouchableOpacity key={i} onPress={() => setSelectedDate(date)} style={styles.dayItem}>
                <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{getShortDay(date).toUpperCase()}</Text>
                {isSelected ? (
                  <LinearGradient colors={[COLORS.blue, COLORS.green]} style={styles.dayCircleActive}>
                    <Text style={styles.dayNumActive}>{date.getDate()}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.dayCircle, isToday && styles.dayCircleToday]}>
                    <Text style={[styles.dayNum, isToday && styles.dayNumToday]}>{date.getDate()}</Text>
                  </View>
                )}
                <View style={[styles.dot, isToday && styles.dotActive]} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Calories Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Calorías de hoy</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Nutrition')}>
              <Text style={styles.cardLink}>Nutrición →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.calorieCenter}>
            <BigCalorieRing consumed={totals.calories} goal={user.calorieGoal} size={190} />
          </View>
          <View style={styles.macrosRow}>
            <MacroRing value={totals.protein} max={user.proteinGoal} color={COLORS.blue} label="Proteína" unit="g" size={80} />
            <MacroRing value={totals.carbs} max={user.carbsGoal} color={COLORS.green} label="Carbos" unit="g" size={80} />
            <MacroRing value={totals.fat} max={user.fatGoal} color={COLORS.orange} label="Grasas" unit="g" size={80} />
          </View>
          <View style={styles.macroLabels}>
            <Text style={styles.macroGoal}>/{user.proteinGoal}g</Text>
            <Text style={styles.macroGoal}>/{user.carbsGoal}g</Text>
            <Text style={styles.macroGoal}>/{user.fatGoal}g</Text>
          </View>
        </View>

        {/* Workout Card */}
        {todayWorkout ? (
          <TouchableOpacity onPress={() => navigation.navigate('Workout')} activeOpacity={0.9}>
            <LinearGradient
              colors={['#1A1A24', '#0A0A0F']}
              style={[styles.workoutCard, { borderColor: todayWorkout.color + '40' }]}
            >
              <LinearGradient colors={todayWorkout.gradient} style={styles.workoutBadge}>
                <Text style={styles.workoutBadgeText}>ENTRENO DE HOY</Text>
              </LinearGradient>
              <View style={styles.workoutBody}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.workoutName, { color: todayWorkout.color }]}>{todayWorkout.name}</Text>
                  <Text style={styles.workoutMeta}>
                    {todayWorkout.exercises.length} ejercicios · {todayWorkout.exercises.reduce((s, e) => s + e.sets, 0)} series
                  </Text>
                  <Text style={styles.workoutTip}>{todayWorkout.tip}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('ActiveWorkout', { dayKey: todayKey })}>
                  <LinearGradient colors={todayWorkout.gradient} style={styles.startBtn}>
                    <Ionicons name="play" size={16} color="#fff" />
                    <Text style={styles.startBtnText}>Iniciar</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              {dayData.workoutCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
                  <Text style={styles.completedText}>Completado</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.restCard}>
            <Text style={styles.restEmoji}>🌟</Text>
            <Text style={styles.restTitle}>Día de descanso</Text>
            <Text style={styles.restSub}>Recuperación activa y buena hidratación</Text>
          </View>
        )}

        {/* Water + Weight Row */}
        <View style={styles.row2}>
          {/* Water */}
          <View style={[styles.halfCard, { marginRight: 8 }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle2}>HIDRATACIÓN</Text>
              <Ionicons name="water" size={16} color={COLORS.blue} />
            </View>
            <Text style={styles.waterCount}>{glasses * 250}<Text style={styles.waterUnit}> ml</Text></Text>
            <Text style={styles.waterGoalText}>de {user.waterGoal} ml</Text>
            <View style={styles.glassesRow}>
              {Array.from({ length: 8 }).map((_, i) => (
                <TouchableOpacity key={i} onPress={() => updateWater(i + 1 === glasses ? i : i + 1)}>
                  <Ionicons
                    name={i < glasses ? 'water' : 'water-outline'}
                    size={20}
                    color={i < glasses ? COLORS.blue : COLORS.border}
                    style={{ margin: 2 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weight */}
          <View style={[styles.halfCard, { marginLeft: 8 }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle2}>PESO ACTUAL</Text>
              <Ionicons name="trending-down" size={16} color={COLORS.green} />
            </View>
            <Text style={styles.weightValue}>{user.weight}<Text style={styles.weightUnit}>kg</Text></Text>
            <Text style={styles.weightGoal}>Obj: {user.goalWeight} kg</Text>
            <View style={styles.weightProgress}>
              <LinearGradient
                colors={[COLORS.green, COLORS.blue]}
                style={[styles.weightBar, { width: `${Math.min(((user.weight - user.goalWeight) / (user.weight - user.goalWeight + 5)) * 100, 100)}%` }]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.weightDiff}>Faltan {(user.weight - user.goalWeight).toFixed(1)} kg</Text>
          </View>
        </View>

        {/* Motivation */}
        <LinearGradient colors={['#1A1A24', '#12121A']} style={styles.quoteCard}>
          <Ionicons name="star" size={20} color={COLORS.yellow} style={{ marginBottom: 8 }} />
          <Text style={styles.quoteText}>"{quote.text}"</Text>
        </LinearGradient>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.base },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.md, marginBottom: SPACING.lg },
  dateText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold, letterSpacing: 1 },
  greeting: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.black, color: COLORS.white, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.orange + '20', paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.full },
  streakFire: { fontSize: 16 },
  streakNum: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.orange, marginLeft: 4 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
  weekScroll: { marginBottom: SPACING.base },
  dayItem: { alignItems: 'center', marginRight: 16, paddingVertical: 4 },
  dayLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold, marginBottom: 6 },
  dayLabelToday: { color: COLORS.green },
  dayCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  dayCircleActive: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  dayCircleToday: { borderColor: COLORS.green },
  dayNum: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold, color: COLORS.textSecondary },
  dayNumActive: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: '#fff' },
  dayNumToday: { color: COLORS.green },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'transparent', marginTop: 4 },
  dotActive: { backgroundColor: COLORS.green },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.base },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  cardTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold, color: COLORS.white },
  cardLink: { fontSize: FONTS.sizes.sm, color: COLORS.blue, fontWeight: FONTS.weights.semibold },
  calorieCenter: { alignItems: 'center', marginVertical: SPACING.sm },
  macrosRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: SPACING.md },
  macroLabels: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 },
  macroGoal: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, width: 80, textAlign: 'center' },
  workoutCard: { borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, marginBottom: SPACING.base },
  workoutBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, marginBottom: 10 },
  workoutBadgeText: { fontSize: FONTS.sizes.xs, color: '#fff', fontWeight: FONTS.weights.bold, letterSpacing: 1 },
  workoutBody: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  workoutName: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.black, marginBottom: 4 },
  workoutMeta: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: 6 },
  workoutTip: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, lineHeight: 16 },
  startBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.lg, gap: 6 },
  startBtnText: { color: '#fff', fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.base },
  completedBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 4 },
  completedText: { fontSize: FONTS.sizes.sm, color: COLORS.green, fontWeight: FONTS.weights.semibold },
  restCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.base },
  restEmoji: { fontSize: 40, marginBottom: 8 },
  restTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.white, marginBottom: 4 },
  restSub: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center' },
  row2: { flexDirection: 'row', marginBottom: SPACING.base },
  halfCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  cardTitle2: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: FONTS.weights.bold, letterSpacing: 1 },
  waterCount: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.black, color: COLORS.white, marginTop: 8 },
  waterUnit: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  waterGoalText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginBottom: 8 },
  glassesRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  weightValue: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.black, color: COLORS.white, marginTop: 8 },
  weightUnit: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  weightGoal: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginBottom: 8 },
  weightProgress: { height: 6, backgroundColor: COLORS.surface, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: 6 },
  weightBar: { height: 6, borderRadius: RADIUS.full },
  weightDiff: { fontSize: FONTS.sizes.xs, color: COLORS.green, fontWeight: FONTS.weights.semibold },
  quoteCard: { borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  quoteText: { fontSize: FONTS.sizes.base, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, fontStyle: 'italic' },
  yellow: { color: COLORS.yellow },
});
