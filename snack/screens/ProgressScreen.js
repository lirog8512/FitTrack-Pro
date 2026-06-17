import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polyline, Line, Circle, Text as SvgText } from 'react-native-svg';
import { useApp } from '../context/AppContext';

const C = {
  bg: '#0A0A0F', card: '#13131A', green: '#22C55E',
  blue: '#3B82F6', orange: '#F97316', text: '#FFFFFF',
  muted: '#9CA3AF', border: '#1F2937',
};

function WeightChart({ data, width = 300, height = 140 }) {
  if (!data || data.length < 2) return null;
  const weights = data.map(d => d.weight);
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;
  const padL = 32, padR = 12, padT = 12, padB = 24;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const pts = data.map((d, i) => {
    const x = padL + (i / (data.length - 1)) * chartW;
    const y = padT + (1 - (d.weight - minW) / (maxW - minW)) * chartH;
    return { x, y, ...d };
  });

  const pointsStr = pts.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <Svg width={width} height={height}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = padT + t * chartH;
        const val = (maxW - t * (maxW - minW)).toFixed(1);
        return (
          <React.Fragment key={i}>
            <Line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#1F2937" strokeWidth={1} />
            <SvgText x={padL - 4} y={y + 4} fill="#9CA3AF" fontSize={9} textAnchor="end">{val}</SvgText>
          </React.Fragment>
        );
      })}
      {/* Line */}
      <Polyline points={pointsStr} fill="none" stroke={C.green} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Points */}
      {pts.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={4} fill={C.green} stroke={C.bg} strokeWidth={2} />
      ))}
      {/* X labels */}
      {pts.map((p, i) => {
        if (data.length > 6 && i % 2 !== 0) return null;
        const label = p.date ? p.date.slice(5) : '';
        return <SvgText key={i} x={p.x} y={height - 4} fill="#9CA3AF" fontSize={9} textAnchor="middle">{label}</SvgText>;
      })}
    </Svg>
  );
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { user, weightHistory, completedWorkouts, addWeight } = useApp();
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  const totalLost = weightHistory.length > 0
    ? (weightHistory[0].weight - user.weight).toFixed(1)
    : 0;
  const toGoal = (user.weight - user.goalWeight).toFixed(1);
  const progressPct = Math.min(
    ((weightHistory[0]?.weight - user.weight) / (weightHistory[0]?.weight - user.goalWeight)) * 100,
    100
  );

  const workoutDays = Object.keys(completedWorkouts).length;

  function handleAddWeight() {
    const w = parseFloat(newWeight);
    if (!w || w < 30 || w > 300) {
      Alert.alert('Error', 'Introduce un peso válido');
      return;
    }
    addWeight(w);
    setNewWeight('');
    setShowWeightModal(false);
  }

  const stats = [
    { label: 'Peso inicial', value: `${weightHistory[0]?.weight || user.weight} kg`, color: C.muted, icon: 'scale-outline' },
    { label: 'Peso actual', value: `${user.weight} kg`, color: C.text, icon: 'scale' },
    { label: 'Objetivo', value: `${user.goalWeight} kg`, color: C.green, icon: 'flag' },
    { label: 'Perdido', value: `${totalLost} kg`, color: C.orange, icon: 'trending-down' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <LinearGradient colors={['#13131A', '#0A0A0F']} style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View>
            <Text style={{ color: C.muted, fontSize: 13 }}>Tu evolución</Text>
            <Text style={{ color: C.text, fontSize: 22, fontWeight: '800' }}>Progreso 📈</Text>
          </View>
          <TouchableOpacity onPress={() => setShowWeightModal(true)} style={styles.addBtn}>
            <Ionicons name="add" size={24} color={C.bg} />
          </TouchableOpacity>
        </LinearGradient>

        <View style={{ padding: 16, gap: 14 }}>
          {/* Goal progress */}
          <LinearGradient colors={['#22C55E22', '#13131A']} style={styles.card}>
            <Text style={styles.cardTitle}>Progreso hacia el objetivo</Text>
            <View style={{ marginTop: 16, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: C.muted, fontSize: 12 }}>Inicio: {weightHistory[0]?.weight} kg</Text>
                <Text style={{ color: C.green, fontSize: 12, fontWeight: '700' }}>
                  {Math.max(0, progressPct).toFixed(0)}% completado
                </Text>
                <Text style={{ color: C.muted, fontSize: 12 }}>Meta: {user.goalWeight} kg</Text>
              </View>
              <View style={{ height: 12, backgroundColor: '#1F2937', borderRadius: 6 }}>
                <LinearGradient
                  colors={[C.green, '#16A34A']}
                  style={{ width: `${Math.max(0, progressPct)}%`, height: 12, borderRadius: 6 }}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 8 }}>
              <Ionicons name="flag" size={14} color={C.orange} />
              <Text style={{ color: C.orange, fontWeight: '700' }}>Faltan {toGoal} kg para tu objetivo</Text>
            </View>
          </LinearGradient>

          {/* Stats grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {stats.map((s, i) => (
              <View key={i} style={[styles.statCard, { width: '47%' }]}>
                <Ionicons name={s.icon} size={20} color={s.color} />
                <Text style={{ color: s.color, fontSize: 22, fontWeight: '900', marginTop: 6 }}>{s.value}</Text>
                <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Weight chart */}
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={styles.cardTitle}>Historial de peso</Text>
              <TouchableOpacity onPress={() => setShowWeightModal(true)}>
                <Text style={{ color: C.green, fontWeight: '700', fontSize: 13 }}>+ Registrar</Text>
              </TouchableOpacity>
            </View>
            <WeightChart data={weightHistory} width={320} height={140} />
            <View style={{ marginTop: 12, gap: 6 }}>
              {[...weightHistory].reverse().slice(0, 5).map((entry, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#1F2937' }}>
                  <Text style={{ color: C.muted, fontSize: 13 }}>{entry.date}</Text>
                  <Text style={{ color: C.text, fontWeight: '700', fontSize: 13 }}>{entry.weight} kg</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Workout consistency */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Consistencia de entrenos</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <View style={[styles.statCard, { flex: 1 }]}>
                <Ionicons name="barbell" size={24} color={C.orange} />
                <Text style={{ color: C.orange, fontSize: 28, fontWeight: '900', marginTop: 6 }}>{workoutDays}</Text>
                <Text style={{ color: C.muted, fontSize: 11 }}>Días entrenados</Text>
              </View>
              <View style={[styles.statCard, { flex: 1 }]}>
                <Ionicons name="flame" size={24} color="#EC4899" />
                <Text style={{ color: '#EC4899', fontSize: 28, fontWeight: '900', marginTop: 6 }}>
                  {workoutDays > 0 ? Math.round((workoutDays / 30) * 100) : 0}%
                </Text>
                <Text style={{ color: C.muted, fontSize: 11 }}>Adherencia mensual</Text>
              </View>
            </View>
          </View>

          {/* IMC */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Índice de Masa Corporal</Text>
            <View style={{ marginTop: 12 }}>
              {(() => {
                const imc = (user.weight / ((user.height / 100) ** 2)).toFixed(1);
                const imcGoal = (user.goalWeight / ((user.height / 100) ** 2)).toFixed(1);
                let category = imc < 18.5 ? 'Bajo peso' : imc < 25 ? 'Peso normal' : imc < 30 ? 'Sobrepeso' : 'Obesidad';
                let catColor = imc < 18.5 ? C.blue : imc < 25 ? C.green : imc < 30 ? C.orange : '#EF4444';
                return (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ color: catColor, fontSize: 32, fontWeight: '900' }}>{imc}</Text>
                      <Text style={{ color: catColor, fontSize: 12, fontWeight: '700' }}>{category}</Text>
                      <Text style={{ color: C.muted, fontSize: 11 }}>IMC actual</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: C.border }} />
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ color: C.green, fontSize: 32, fontWeight: '900' }}>{imcGoal}</Text>
                      <Text style={{ color: C.green, fontSize: 12, fontWeight: '700' }}>Peso normal</Text>
                      <Text style={{ color: C.muted, fontSize: 11 }}>IMC objetivo</Text>
                    </View>
                  </View>
                );
              })()}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add weight modal */}
      <Modal visible={showWeightModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ color: C.text, fontSize: 18, fontWeight: '800', marginBottom: 4 }}>Registrar peso</Text>
            <Text style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Peso actual: {user.weight} kg</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 78.5"
              placeholderTextColor={C.muted}
              value={newWeight}
              onChangeText={setNewWeight}
              keyboardType="decimal-pad"
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity onPress={() => setShowWeightModal(false)} style={[styles.btn, { flex: 1, backgroundColor: '#1F2937' }]}>
                <Text style={{ color: C.muted, fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddWeight} style={[styles.btn, { flex: 1, backgroundColor: C.green }]}>
                <Text style={{ color: C.bg, fontWeight: '800' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#13131A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1F2937' },
  cardTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  statCard: { backgroundColor: '#1F2937', borderRadius: 14, padding: 14, alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#13131A', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  input: { backgroundColor: '#0A0A0F', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 20, fontWeight: '700', borderWidth: 1, borderColor: '#1F2937', textAlign: 'center' },
  btn: { padding: 14, borderRadius: 12, alignItems: 'center' },
});
