import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { calculateBMI } from '../../utils/calculations';

export default function ProfileScreen() {
  const { user, saveUser, streak } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...user });
  const bmi = calculateBMI(user.weight, user.height);

  function save() {
    saveUser(form);
    setEditing(false);
    Alert.alert('✅', 'Perfil actualizado correctamente.');
  }

  const GOAL_LABELS = { lose: 'Perder grasa', maintain: 'Mantener peso', gain: 'Ganar músculo' };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header Avatar */}
        <LinearGradient colors={['#1A1A24', '#0A0A0F']} style={styles.profileHeader}>
          <LinearGradient colors={[COLORS.blue, COLORS.green]} style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name[0]}</Text>
          </LinearGradient>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileAge}>{user.age} años · {user.height} cm</Text>
          <View style={styles.profileBadges}>
            <View style={styles.streakBadge}>
              <Text>🔥</Text>
              <Text style={styles.badgeText}>{streak} días racha</Text>
            </View>
            <View style={styles.goalBadge}>
              <Text style={styles.badgeText}>{GOAL_LABELS[user.goal]}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Peso', value: `${user.weight} kg`, icon: 'scale', color: COLORS.blue },
            { label: 'Objetivo', value: `${user.goalWeight} kg`, icon: 'flag', color: COLORS.green },
            { label: 'TMB', value: `${user.tmb} kcal`, icon: 'flame', color: COLORS.orange },
            { label: 'IMC', value: bmi, icon: 'body', color: COLORS.purple },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { borderColor: s.color + '30' }]}>
              <Ionicons name={s.icon} size={20} color={s.color} />
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Calorie & Macro Goals */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Objetivos diarios</Text>
          <View style={styles.goalRow}>
            <View style={styles.goalItem}>
              <LinearGradient colors={['#22C55E20', '#22C55E10']} style={styles.goalIcon}>
                <Ionicons name="flame" size={20} color={COLORS.green} />
              </LinearGradient>
              <Text style={styles.goalVal}>{user.calorieGoal}</Text>
              <Text style={styles.goalLabel}>kcal/día</Text>
            </View>
            <View style={styles.goalItem}>
              <LinearGradient colors={['#3B82F620', '#3B82F610']} style={styles.goalIcon}>
                <Text style={{ fontSize: 18 }}>🥩</Text>
              </LinearGradient>
              <Text style={styles.goalVal}>{user.proteinGoal}g</Text>
              <Text style={styles.goalLabel}>Proteína</Text>
            </View>
            <View style={styles.goalItem}>
              <LinearGradient colors={['#EAB30820', '#EAB30810']} style={styles.goalIcon}>
                <Text style={{ fontSize: 18 }}>🍚</Text>
              </LinearGradient>
              <Text style={styles.goalVal}>{user.carbsGoal}g</Text>
              <Text style={styles.goalLabel}>Carbos</Text>
            </View>
            <View style={styles.goalItem}>
              <LinearGradient colors={['#F9731620', '#F9731610']} style={styles.goalIcon}>
                <Text style={{ fontSize: 18 }}>🥑</Text>
              </LinearGradient>
              <Text style={styles.goalVal}>{user.fatGoal}g</Text>
              <Text style={styles.goalLabel}>Grasas</Text>
            </View>
          </View>
        </View>

        {/* Edit Profile */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Datos personales</Text>
            <TouchableOpacity onPress={() => editing ? save() : setEditing(true)}>
              <LinearGradient colors={editing ? [COLORS.green, COLORS.greenDark] : [COLORS.surface, COLORS.surface]} style={styles.editBtn}>
                <Ionicons name={editing ? 'checkmark' : 'pencil'} size={16} color={editing ? '#fff' : COLORS.textSecondary} />
                <Text style={[styles.editBtnText, editing && { color: '#fff' }]}>{editing ? 'Guardar' : 'Editar'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {[
            { label: 'Nombre', key: 'name', type: 'default' },
            { label: 'Edad', key: 'age', type: 'number-pad' },
            { label: 'Peso (kg)', key: 'weight', type: 'decimal-pad' },
            { label: 'Altura (cm)', key: 'height', type: 'decimal-pad' },
            { label: '% Grasa corporal', key: 'bodyFat', type: 'decimal-pad' },
          ].map(field => (
            <View key={field.key} style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              {editing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={form[field.key]?.toString()}
                  onChangeText={v => setForm(p => ({ ...p, [field.key]: field.type !== 'default' ? parseFloat(v) || 0 : v }))}
                  keyboardType={field.type}
                  placeholderTextColor={COLORS.textMuted}
                />
              ) : (
                <Text style={styles.fieldValue}>{user[field.key]}{field.key === 'bodyFat' ? '%' : ''}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Injuries */}
        <View style={[styles.card, { borderColor: COLORS.orange + '40' }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="medical" size={18} color={COLORS.orange} />
            <Text style={[styles.cardTitle, { color: COLORS.orange, marginLeft: 8 }]}>Lesiones activas</Text>
          </View>
          <View style={styles.injuryList}>
            <View style={styles.injuryItem}>
              <View style={[styles.injuryDot, { backgroundColor: COLORS.orange }]} />
              <Text style={styles.injuryText}>Tendones bíceps — Ambos brazos</Text>
            </View>
            <View style={styles.injuryItem}>
              <View style={[styles.injuryDot, { backgroundColor: COLORS.orange }]} />
              <Text style={styles.injuryText}>Protrusión L4-L5 — Columna lumbar</Text>
            </View>
          </View>
          <View style={styles.injuryTip}>
            <Ionicons name="information-circle" size={14} color={COLORS.blue} />
            <Text style={styles.injuryTipText}>Los ejercicios de riesgo están marcados con ⚠️ en la pantalla de entrenamiento.</Text>
          </View>
        </View>

        {/* Personal Records */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Records personales</Text>
          {[
            { exercise: 'Prensa piernas', weight: '120 kg', reps: '15 reps' },
            { exercise: 'Hip Thrust', weight: '80 kg', reps: '12 reps' },
            { exercise: 'Press banca', weight: '50 kg', reps: '10 reps' },
          ].map((pr, i) => (
            <View key={i} style={styles.prRow}>
              <Text style={styles.prEmoji}>🏆</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.prExercise}>{pr.exercise}</Text>
                <Text style={styles.prSub}>{pr.reps}</Text>
              </View>
              <Text style={styles.prWeight}>{pr.weight}</Text>
            </View>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>FitTrack Pro</Text>
          <Text style={styles.appVersion}>Versión 1.0.0</Text>
          <Text style={styles.appTagline}>Transforma tu cuerpo. Domina tu mente.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.base, paddingTop: SPACING.base },
  profileHeader: { borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.base },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: FONTS.sizes['3xl'], fontWeight: FONTS.weights.black, color: '#fff' },
  profileName: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.black, color: COLORS.white, marginBottom: 4 },
  profileAge: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: 12 },
  profileBadges: { flexDirection: 'row', gap: 8 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.orange + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full, gap: 4 },
  goalBadge: { backgroundColor: COLORS.green + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full },
  badgeText: { fontSize: FONTS.sizes.sm, color: COLORS.white, fontWeight: FONTS.weights.semibold },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: SPACING.base },
  statCard: { width: '47%', backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.md, alignItems: 'center', borderWidth: 1, gap: 4 },
  statVal: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black, color: COLORS.white },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.base },
  cardTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.white, marginBottom: SPACING.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  goalItem: { alignItems: 'center', flex: 1 },
  goalIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  goalVal: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.white },
  goalLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  editBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.lg, gap: 4 },
  editBtnText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: FONTS.weights.semibold },
  fieldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  fieldLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  fieldValue: { fontSize: FONTS.sizes.sm, color: COLORS.white, fontWeight: FONTS.weights.semibold },
  fieldInput: { fontSize: FONTS.sizes.sm, color: COLORS.white, fontWeight: FONTS.weights.semibold, backgroundColor: COLORS.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.sm, minWidth: 80, textAlign: 'right' },
  injuryList: { gap: 8, marginBottom: SPACING.sm },
  injuryItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  injuryDot: { width: 8, height: 8, borderRadius: 4 },
  injuryText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  injuryTip: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: COLORS.blue + '10', borderRadius: RADIUS.md, padding: SPACING.sm },
  injuryTipText: { flex: 1, fontSize: FONTS.sizes.xs, color: COLORS.blue, lineHeight: 16 },
  prRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  prEmoji: { fontSize: 20 },
  prExercise: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.white },
  prSub: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  prWeight: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.black, color: COLORS.green },
  appInfo: { alignItems: 'center', padding: SPACING.lg },
  appName: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.textMuted },
  appVersion: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 4 },
  appTagline: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 4, fontStyle: 'italic' },
});
