import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline, Circle as SvgCircle, Line, Text as SvgText } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../../context/AppContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { analyzeBodyProgress } from '../../services/anthropicService';
import { calculateBMI, getBMICategory } from '../../utils/calculations';

export default function ProgressScreen() {
  const { user, weightHistory, logWeight } = useApp();
  const [newWeight, setNewWeight] = useState(user.weight.toString());
  const [newWaist, setNewWaist] = useState(user.waist?.toString() || '');
  const [newChest, setNewChest] = useState(user.chest?.toString() || '');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);

  const bmi = calculateBMI(user.weight, user.height);
  const bmiCat = getBMICategory(parseFloat(bmi));

  async function handleLogWeight() {
    const w = parseFloat(newWeight);
    if (!w || w < 30 || w > 300) { Alert.alert('Error', 'Introduce un peso válido'); return; }
    await logWeight(w);
    Alert.alert('✅ Registrado', `Peso ${w} kg guardado correctamente.`);
  }

  async function handleAnalyzeBody() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permiso necesario', 'Necesitamos acceso a tu galería.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, base64: true, quality: 0.7 });
    if (result.canceled) return;
    setAnalyzing(true);
    try {
      const data = await analyzeBodyProgress(result.assets[0].base64);
      setAiResult(data);
      setShowAiModal(true);
    } catch { Alert.alert('Error', 'No se pudo analizar la imagen.'); }
    finally { setAnalyzing(false); }
  }

  // Chart
  const chartData = weightHistory.slice(-10);
  const chartW = 320, chartH = 120, padL = 30, padB = 20, padT = 10;
  const innerW = chartW - padL - 10;
  const innerH = chartH - padB - padT;
  const weights = chartData.map(d => d.weight);
  const minW = Math.min(...weights, user.goalWeight) - 1;
  const maxW = Math.max(...weights) + 1;
  const points = chartData.map((d, i) => {
    const x = padL + (i / Math.max(chartData.length - 1, 1)) * innerW;
    const y = padT + ((maxW - d.weight) / (maxW - minW)) * innerH;
    return `${x},${y}`;
  }).join(' ');
  const goalY = padT + ((maxW - user.goalWeight) / (maxW - minW)) * innerH;

  const totalLost = weightHistory.length > 0 ? (weightHistory[0].weight - user.weight).toFixed(1) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Progreso</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <LinearGradient colors={['#22C55E20', '#22C55E10']} style={styles.statCard}>
            <Text style={styles.statVal}>{user.weight}</Text>
            <Text style={styles.statUnit}>kg</Text>
            <Text style={styles.statLabel}>Peso actual</Text>
          </LinearGradient>
          <LinearGradient colors={['#3B82F620', '#3B82F610']} style={styles.statCard}>
            <Text style={styles.statVal}>{user.goalWeight}</Text>
            <Text style={styles.statUnit}>kg</Text>
            <Text style={styles.statLabel}>Objetivo</Text>
          </LinearGradient>
          <LinearGradient colors={['#F9731620', '#F9731610']} style={styles.statCard}>
            <Text style={styles.statVal}>{totalLost > 0 ? `-${totalLost}` : '0'}</Text>
            <Text style={styles.statUnit}>kg</Text>
            <Text style={styles.statLabel}>Perdidos</Text>
          </LinearGradient>
        </View>

        {/* BMI */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>IMC (Índice de Masa Corporal)</Text>
          <View style={styles.bmiRow}>
            <Text style={[styles.bmiValue, { color: bmiCat.color }]}>{bmi}</Text>
            <View style={[styles.bmiLabel, { backgroundColor: bmiCat.color + '20' }]}>
              <Text style={[styles.bmiLabelText, { color: bmiCat.color }]}>{bmiCat.label}</Text>
            </View>
          </View>
          <View style={styles.bmiBar}>
            {[{ color: '#3B82F6', w: '25%' }, { color: '#22C55E', w: '25%' }, { color: '#EAB308', w: '25%' }, { color: '#EF4444', w: '25%' }].map((s, i) => (
              <View key={i} style={[styles.bmiSegment, { backgroundColor: s.color, width: s.w }]} />
            ))}
          </View>
          <View style={styles.bmiLegend}>
            {['Bajo', 'Normal', 'Sobrepeso', 'Obesidad'].map(l => <Text key={l} style={styles.bmiLegendText}>{l}</Text>)}
          </View>
        </View>

        {/* Weight Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Evolución del peso</Text>
          <View style={{ alignItems: 'center', marginVertical: 8 }}>
            <Svg width={chartW} height={chartH}>
              {/* Goal line */}
              <Line x1={padL} y1={goalY} x2={chartW - 10} y2={goalY} stroke={COLORS.green + '60'} strokeWidth={1.5} strokeDasharray="4,4" />
              <SvgText x={chartW - 8} y={goalY - 4} fontSize="9" fill={COLORS.green} textAnchor="end">{user.goalWeight}kg</SvgText>
              {/* Weight line */}
              {chartData.length > 1 && (
                <Polyline points={points} fill="none" stroke={COLORS.blue} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              )}
              {/* Points */}
              {chartData.map((d, i) => {
                const x = padL + (i / Math.max(chartData.length - 1, 1)) * innerW;
                const y = padT + ((maxW - d.weight) / (maxW - minW)) * innerH;
                return <SvgCircle key={i} cx={x} cy={y} r={4} fill={COLORS.blue} stroke="#0A0A0F" strokeWidth={2} />;
              })}
              {/* Labels */}
              {chartData.map((d, i) => {
                const x = padL + (i / Math.max(chartData.length - 1, 1)) * innerW;
                const y = padT + ((maxW - d.weight) / (maxW - minW)) * innerH;
                return i % 3 === 0 ? <SvgText key={i} x={x} y={y - 8} fontSize="9" fill={COLORS.textMuted} textAnchor="middle">{d.weight}</SvgText> : null;
              })}
            </Svg>
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.blue }]} /><Text style={styles.legendText}>Peso real</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.green }]} /><Text style={styles.legendText}>Objetivo</Text></View>
          </View>
        </View>

        {/* Log Weight */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Registrar medidas</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Peso (kg)</Text>
              <TextInput style={styles.input} value={newWeight} onChangeText={setNewWeight} keyboardType="decimal-pad" placeholderTextColor={COLORS.textMuted} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cintura (cm)</Text>
              <TextInput style={styles.input} value={newWaist} onChangeText={setNewWaist} keyboardType="decimal-pad" placeholderTextColor={COLORS.textMuted} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pecho (cm)</Text>
              <TextInput style={styles.input} value={newChest} onChangeText={setNewChest} keyboardType="decimal-pad" placeholderTextColor={COLORS.textMuted} />
            </View>
          </View>
          <TouchableOpacity onPress={handleLogWeight}>
            <LinearGradient colors={[COLORS.green, COLORS.greenDark]} style={styles.logBtn}>
              <Ionicons name="save-outline" size={18} color="#fff" />
              <Text style={styles.logBtnText}>Guardar medidas</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* AI Body Analysis */}
        <TouchableOpacity onPress={handleAnalyzeBody} disabled={analyzing} activeOpacity={0.85}>
          <LinearGradient colors={['#A855F720', '#7C3AED20']} style={styles.aiCard}>
            {analyzing ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <ActivityIndicator size="large" color={COLORS.purple} />
                <Text style={[styles.aiCardTitle, { marginTop: 12 }]}>Analizando con IA...</Text>
              </View>
            ) : (
              <>
                <View style={styles.aiIconWrap}>
                  <LinearGradient colors={[COLORS.purple, '#7C3AED']} style={styles.aiIcon}>
                    <Ionicons name="body" size={24} color="#fff" />
                  </LinearGradient>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.aiCardTitle}>Análisis corporal con IA</Text>
                  <Text style={styles.aiCardSub}>Sube una foto corporal y recibe análisis visual de tu progreso</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Injuries Reminder */}
        <View style={[styles.card, { borderColor: COLORS.orange + '40' }]}>
          <View style={styles.injuryHeader}>
            <Ionicons name="medical" size={18} color={COLORS.orange} />
            <Text style={[styles.cardTitle, { color: COLORS.orange }]}>Lesiones activas</Text>
          </View>
          <View style={{ gap: 6 }}>
            <View style={styles.injuryItem}>
              <Ionicons name="alert-circle" size={14} color={COLORS.orange} />
              <Text style={styles.injuryText}>Tendones del bíceps — Ambos brazos. Evitar supinación forzada.</Text>
            </View>
            <View style={styles.injuryItem}>
              <Ionicons name="alert-circle" size={14} color={COLORS.orange} />
              <Text style={styles.injuryText}>Protrusión L4-L5 — Evitar flexión lumbar bajo carga. Siempre espalda neutra.</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* AI Result Modal */}
      <Modal visible={showAiModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAiModal(false)}>
        <View style={styles.aiModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAiModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Análisis IA</Text>
            <View style={{ width: 24 }} />
          </View>
          {aiResult && (
            <ScrollView contentContainerStyle={{ padding: SPACING.base }}>
              <LinearGradient colors={['#A855F720', '#7C3AED20']} style={styles.analysisCard}>
                <Ionicons name="sparkles" size={24} color={COLORS.purple} style={{ marginBottom: 12 }} />
                <Text style={styles.analysisText}>{aiResult.analysis}</Text>
              </LinearGradient>
              <Text style={styles.sectionTitle}>✅ Puntos fuertes</Text>
              {aiResult.strengths?.map((s, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
                  <Text style={styles.bulletText}>{s}</Text>
                </View>
              ))}
              <Text style={styles.sectionTitle}>📋 Sugerencias</Text>
              {aiResult.suggestions?.map((s, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Ionicons name="arrow-forward-circle" size={16} color={COLORS.blue} />
                  <Text style={styles.bulletText}>{s}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.base, paddingTop: SPACING.base },
  title: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.black, color: COLORS.white, marginBottom: SPACING.base },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.base },
  statCard: { flex: 1, borderRadius: RADIUS.xl, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.black, color: COLORS.white },
  statUnit: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.base },
  cardTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.white, marginBottom: SPACING.sm },
  bmiRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  bmiValue: { fontSize: FONTS.sizes['3xl'], fontWeight: FONTS.weights.black },
  bmiLabel: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full },
  bmiLabelText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
  bmiBar: { flexDirection: 'row', height: 8, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: 4 },
  bmiSegment: { flex: 1 },
  bmiLegend: { flexDirection: 'row', justifyContent: 'space-between' },
  bmiLegendText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  chartLegend: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.base },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginBottom: 4 },
  input: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.sm, color: COLORS.white, fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, borderWidth: 1, borderColor: COLORS.border },
  logBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: RADIUS.lg, gap: 8 },
  logBtnText: { color: '#fff', fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold },
  aiCard: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.purple + '40', marginBottom: SPACING.base },
  aiIconWrap: {},
  aiIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  aiCardTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.white, marginBottom: 2 },
  aiCardSub: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, lineHeight: 16 },
  injuryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm },
  injuryItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  injuryText: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 18 },
  aiModal: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.white },
  analysisCard: { borderRadius: RADIUS.xl, padding: SPACING.base, marginBottom: SPACING.base, borderWidth: 1, borderColor: COLORS.purple + '30', alignItems: 'center' },
  analysisText: { fontSize: FONTS.sizes.base, color: COLORS.textSecondary, lineHeight: 22, textAlign: 'center' },
  sectionTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.white, marginBottom: SPACING.sm, marginTop: SPACING.md },
  bulletItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: SPACING.sm },
  bulletText: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },
});
