import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

const C = {
  bg: '#0A0A0F', card: '#13131A', green: '#22C55E',
  blue: '#3B82F6', orange: '#F97316', text: '#FFFFFF',
  muted: '#9CA3AF', border: '#1F2937',
};

function EditModal({ visible, title, value, onClose, onSave, keyboardType = 'default', unit = '' }) {
  const [val, setVal] = useState(String(value));
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={{ color: C.text, fontSize: 18, fontWeight: '800', marginBottom: 20 }}>Editar {title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={val}
              onChangeText={setVal}
              keyboardType={keyboardType}
              autoFocus
            />
            {unit ? <Text style={{ color: C.muted, fontSize: 16 }}>{unit}</Text> : null}
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <TouchableOpacity onPress={onClose} style={[styles.btn, { flex: 1, backgroundColor: '#1F2937' }]}>
              <Text style={{ color: C.muted, fontWeight: '700' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onSave(val); onClose(); }} style={[styles.btn, { flex: 1, backgroundColor: C.green }]}>
              <Text style={{ color: C.bg, fontWeight: '800' }}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Row({ icon, label, value, color = C.text, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row} activeOpacity={0.7}>
      <View style={[styles.rowIcon, { backgroundColor: (color || C.green) + '22' }]}>
        <Ionicons name={icon} size={18} color={color || C.green} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.muted, fontSize: 11 }}>{label}</Text>
        <Text style={{ color: C.text, fontSize: 14, fontWeight: '600', marginTop: 1 }}>{value}</Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color={C.muted} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useApp();
  const [editing, setEditing] = useState(null);

  const imc = (user.weight / ((user.height / 100) ** 2)).toFixed(1);

  function openEdit(field) {
    setEditing(field);
  }

  const editFields = {
    name: { title: 'Nombre', keyboardType: 'default', unit: '', transform: v => v },
    age: { title: 'Edad', keyboardType: 'numeric', unit: 'años', transform: Number },
    weight: { title: 'Peso actual', keyboardType: 'decimal-pad', unit: 'kg', transform: parseFloat },
    goalWeight: { title: 'Peso objetivo', keyboardType: 'decimal-pad', unit: 'kg', transform: parseFloat },
    height: { title: 'Altura', keyboardType: 'numeric', unit: 'cm', transform: Number },
    calories: { title: 'Calorías diarias', keyboardType: 'numeric', unit: 'kcal', transform: Number },
    protein: { title: 'Proteína diaria', keyboardType: 'numeric', unit: 'g', transform: Number },
    carbs: { title: 'Carbohidratos', keyboardType: 'numeric', unit: 'g', transform: Number },
    fat: { title: 'Grasas', keyboardType: 'numeric', unit: 'g', transform: Number },
    waterGoal: { title: 'Meta de agua', keyboardType: 'numeric', unit: 'ml', transform: Number },
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <LinearGradient colors={['#22C55E33', '#13131A', '#0A0A0F']} style={[styles.headerBg, { paddingTop: insets.top + 20 }]}>
          <View style={styles.avatarLarge}>
            <Text style={{ color: C.green, fontSize: 36, fontWeight: '900' }}>{user.name[0]}</Text>
          </View>
          <Text style={{ color: C.text, fontSize: 24, fontWeight: '800', marginTop: 12 }}>{user.name}</Text>
          <Text style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{user.age} años · IMC {imc}</Text>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
            <View style={styles.statPill}>
              <Text style={{ color: C.text, fontWeight: '800' }}>{user.weight} kg</Text>
              <Text style={{ color: C.muted, fontSize: 11 }}>Actual</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={{ color: C.green, fontWeight: '800' }}>{user.goalWeight} kg</Text>
              <Text style={{ color: C.muted, fontSize: 11 }}>Objetivo</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={{ color: C.blue, fontWeight: '800' }}>{user.height} cm</Text>
              <Text style={{ color: C.muted, fontSize: 11 }}>Altura</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={{ padding: 16, gap: 14 }}>
          {/* Personal info */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 8 }]}>Información personal</Text>
            <Row icon="person" label="Nombre" value={user.name} color={C.green} onPress={() => openEdit('name')} />
            <Row icon="calendar" label="Edad" value={`${user.age} años`} color={C.blue} onPress={() => openEdit('age')} />
            <Row icon="scale" label="Peso actual" value={`${user.weight} kg`} color={C.orange} onPress={() => openEdit('weight')} />
            <Row icon="flag" label="Peso objetivo" value={`${user.goalWeight} kg`} color={C.green} onPress={() => openEdit('goalWeight')} />
            <Row icon="resize" label="Altura" value={`${user.height} cm`} color="#A855F7" onPress={() => openEdit('height')} />
          </View>

          {/* Nutrition goals */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 8 }]}>Metas nutricionales</Text>
            <Row icon="flame" label="Calorías diarias" value={`${user.calories} kcal`} color={C.orange} onPress={() => openEdit('calories')} />
            <Row icon="barbell" label="Proteína" value={`${user.protein} g/día`} color={C.blue} onPress={() => openEdit('protein')} />
            <Row icon="fast-food" label="Carbohidratos" value={`${user.carbs} g/día`} color={C.orange} onPress={() => openEdit('carbs')} />
            <Row icon="water" label="Grasas" value={`${user.fat} g/día`} color="#A855F7" onPress={() => openEdit('fat')} />
            <Row icon="water-outline" label="Meta de agua" value={`${(user.waterGoal / 1000).toFixed(1)} L/día`} color={C.blue} onPress={() => openEdit('waterGoal')} />
          </View>

          {/* Injuries */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 12 }]}>⚠️ Lesiones registradas</Text>
            {user.injuries.map((inj, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 10, paddingVertical: 8, borderBottomWidth: i < user.injuries.length - 1 ? 1 : 0, borderBottomColor: C.border }}>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#F9731622', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="bandage" size={14} color={C.orange} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={{ color: C.text, fontWeight: '600' }}>{inj}</Text>
                </View>
              </View>
            ))}
            <Text style={{ color: C.muted, fontSize: 12, marginTop: 10, lineHeight: 18 }}>
              Los ejercicios de tu plan están adaptados a estas lesiones. Consulta siempre con tu médico antes de cambiar la intensidad.
            </Text>
          </View>

          {/* Macro split visual */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Distribución de macros</Text>
            {(() => {
              const totalCals = user.protein * 4 + user.carbs * 4 + user.fat * 9;
              const protPct = Math.round((user.protein * 4 / totalCals) * 100);
              const carbPct = Math.round((user.carbs * 4 / totalCals) * 100);
              const fatPct = Math.round((user.fat * 9 / totalCals) * 100);
              return (
                <View style={{ marginTop: 12, gap: 10 }}>
                  {[
                    { label: 'Proteína', pct: protPct, g: user.protein, color: C.blue },
                    { label: 'Carbohidratos', pct: carbPct, g: user.carbs, color: C.orange },
                    { label: 'Grasas', pct: fatPct, g: user.fat, color: '#A855F7' },
                  ].map((m, i) => (
                    <View key={i}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ color: C.muted, fontSize: 12 }}>{m.label}</Text>
                        <Text style={{ color: m.color, fontWeight: '700', fontSize: 12 }}>{m.g}g · {m.pct}%</Text>
                      </View>
                      <View style={{ height: 8, backgroundColor: '#1F2937', borderRadius: 4 }}>
                        <View style={{ width: `${m.pct}%`, height: 8, backgroundColor: m.color, borderRadius: 4 }} />
                      </View>
                    </View>
                  ))}
                  <Text style={{ color: C.muted, fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                    Total calculado: {totalCals} kcal
                  </Text>
                </View>
              );
            })()}
          </View>
        </View>
      </ScrollView>

      {/* Edit modals */}
      {editing && editFields[editing] && (
        <EditModal
          visible={!!editing}
          title={editFields[editing].title}
          value={user[editing]}
          keyboardType={editFields[editing].keyboardType}
          unit={editFields[editing].unit}
          onClose={() => setEditing(null)}
          onSave={val => updateUser({ [editing]: editFields[editing].transform(val) })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerBg: { alignItems: 'center', paddingBottom: 24, paddingHorizontal: 16 },
  avatarLarge: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#22C55E22', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#22C55E' },
  statPill: { backgroundColor: '#1F2937', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
  card: { backgroundColor: '#13131A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1F2937' },
  cardTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1F2937' },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#13131A', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  input: { backgroundColor: '#0A0A0F', borderRadius: 12, padding: 14, color: '#FFFFFF', fontSize: 18, fontWeight: '700', borderWidth: 1, borderColor: '#1F2937' },
  btn: { padding: 14, borderRadius: 12, alignItems: 'center' },
});
