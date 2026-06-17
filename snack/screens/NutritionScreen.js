import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

const C = {
  bg: '#0A0A0F', card: '#13131A', green: '#22C55E',
  blue: '#3B82F6', orange: '#F97316', text: '#FFFFFF',
  muted: '#9CA3AF', border: '#1F2937',
};

const QUICK_FOODS = [
  { name: 'Pechuga de pollo (150g)', calories: 248, protein: 46, carbs: 0, fat: 5 },
  { name: 'Arroz cocido (100g)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Huevos (2 unidades)', calories: 156, protein: 12, carbs: 0, fat: 11 },
  { name: 'Avena (60g)', calories: 228, protein: 8, carbs: 39, fat: 4 },
  { name: 'Atún en lata (120g)', calories: 132, protein: 28, carbs: 0, fat: 1.5 },
  { name: 'Plátano mediano', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: 'Yogur griego (200g)', calories: 146, protein: 20, carbs: 8, fat: 4 },
  { name: 'Almendras (30g)', calories: 174, protein: 6, carbs: 6, fat: 15 },
  { name: 'Brócoli (200g)', calories: 68, protein: 5.7, carbs: 11, fat: 0.8 },
  { name: 'Batata (150g)', calories: 129, protein: 3, carbs: 30, fat: 0.2 },
  { name: 'Salmón (150g)', calories: 280, protein: 39, carbs: 0, fat: 13 },
  { name: 'Proteína whey (30g)', calories: 120, protein: 24, carbs: 3, fat: 1.5 },
];

const MEALS_TYPES = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Snack'];

function MacroPill({ label, value, goal, color }) {
  const pct = Math.min((value / goal) * 100, 100);
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color, fontSize: 18, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: C.muted, fontSize: 10 }}>/{goal}g</Text>
      <View style={{ width: '80%', height: 4, backgroundColor: '#1F2937', borderRadius: 2, marginTop: 4 }}>
        <View style={{ width: `${pct}%`, height: 4, backgroundColor: color, borderRadius: 2 }} />
      </View>
      <Text style={{ color: C.muted, fontSize: 9, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const { user, todayMeals, totals, addMeal, removeMeal, addWater, hydration } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('Desayuno');
  const [customMode, setCustomMode] = useState(false);
  const [customFood, setCustomFood] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  const calLeft = user.calories - totals.calories;

  function handleQuickAdd(food) {
    addMeal({ ...food, type: selectedMealType, time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) });
    setShowAddModal(false);
  }

  function handleCustomAdd() {
    if (!customFood.name || !customFood.calories) {
      Alert.alert('Error', 'Introduce al menos nombre y calorías');
      return;
    }
    addMeal({
      name: customFood.name,
      calories: Number(customFood.calories),
      protein: Number(customFood.protein) || 0,
      carbs: Number(customFood.carbs) || 0,
      fat: Number(customFood.fat) || 0,
      type: selectedMealType,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    });
    setCustomFood({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    setShowAddModal(false);
  }

  const mealsByType = MEALS_TYPES.reduce((acc, type) => {
    acc[type] = todayMeals.filter(m => m.type === type);
    return acc;
  }, {});

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <LinearGradient colors={['#13131A', '#0A0A0F']} style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View>
            <Text style={{ color: C.muted, fontSize: 13 }}>Seguimiento diario</Text>
            <Text style={{ color: C.text, fontSize: 22, fontWeight: '800' }}>Nutrición 🥗</Text>
          </View>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addBtn}>
            <Ionicons name="add" size={24} color={C.bg} />
          </TouchableOpacity>
        </LinearGradient>

        <View style={{ padding: 16, gap: 14 }}>
          {/* Calorie Summary */}
          <LinearGradient colors={['#22C55E22', '#13131A']} style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.cardTitle}>Calorías hoy</Text>
              <Text style={{ color: calLeft >= 0 ? C.green : C.orange, fontWeight: '700', fontSize: 13 }}>
                {calLeft >= 0 ? `${calLeft} restantes` : `${Math.abs(calLeft)} exceso`}
              </Text>
            </View>
            <View style={{ height: 8, backgroundColor: '#1F2937', borderRadius: 4, marginBottom: 16 }}>
              <View style={{
                width: `${Math.min((totals.calories / user.calories) * 100, 100)}%`,
                height: 8,
                backgroundColor: totals.calories > user.calories ? C.orange : C.green,
                borderRadius: 4
              }} />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: C.text, fontSize: 22, fontWeight: '900' }}>{totals.calories}</Text>
                <Text style={{ color: C.muted, fontSize: 11 }}>consumidas</Text>
              </View>
              <View style={{ width: 1, backgroundColor: C.border }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: C.text, fontSize: 22, fontWeight: '900' }}>{user.calories}</Text>
                <Text style={{ color: C.muted, fontSize: 11 }}>meta</Text>
              </View>
              <View style={{ width: 1, backgroundColor: C.border }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: C.green, fontSize: 22, fontWeight: '900' }}>{Math.round(totals.calories * 0.239)}</Text>
                <Text style={{ color: C.muted, fontSize: 11 }}>quemadas est.</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Macros */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 12 }]}>Macros</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <MacroPill label="PROTEÍNA" value={Math.round(totals.protein)} goal={user.protein} color={C.blue} />
              <View style={{ width: 1, backgroundColor: C.border }} />
              <MacroPill label="CARBOS" value={Math.round(totals.carbs)} goal={user.carbs} color={C.orange} />
              <View style={{ width: 1, backgroundColor: C.border }} />
              <MacroPill label="GRASA" value={Math.round(totals.fat)} goal={user.fat} color="#A855F7" />
            </View>
          </View>

          {/* Hydration */}
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.cardTitle}>💧 Hidratación</Text>
              <Text style={{ color: C.blue, fontWeight: '700' }}>{(hydration / 1000).toFixed(1)}L / {user.waterGoal / 1000}L</Text>
            </View>
            <View style={{ height: 8, backgroundColor: '#1F2937', borderRadius: 4, marginBottom: 12 }}>
              <View style={{ width: `${Math.min((hydration / user.waterGoal) * 100, 100)}%`, height: 8, backgroundColor: C.blue, borderRadius: 4 }} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[250, 500, 750].map(ml => (
                <TouchableOpacity key={ml} onPress={() => addWater(ml)} style={styles.waterBtn}>
                  <Ionicons name="water" size={14} color={C.blue} />
                  <Text style={{ color: C.blue, fontWeight: '700', fontSize: 12 }}>+{ml}ml</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Meals by type */}
          {MEALS_TYPES.map(type => {
            const meals = mealsByType[type];
            if (meals.length === 0) return null;
            const typeTotal = meals.reduce((a, m) => a + m.calories, 0);
            return (
              <View key={type} style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={styles.cardTitle}>{type}</Text>
                  <Text style={{ color: C.green, fontWeight: '700' }}>{typeTotal} kcal</Text>
                </View>
                {meals.map(meal => (
                  <View key={meal.id} style={styles.mealRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: C.text, fontWeight: '600', fontSize: 13 }}>{meal.name}</Text>
                      <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>
                        P:{meal.protein}g · C:{meal.carbs}g · G:{meal.fat}g · {meal.time}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={{ color: C.text, fontWeight: '700' }}>{meal.calories} kcal</Text>
                      <TouchableOpacity onPress={() => removeMeal(meal.id)}>
                        <Ionicons name="trash-outline" size={16} color={C.muted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}

          {todayMeals.length === 0 && (
            <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
              <Ionicons name="restaurant-outline" size={48} color={C.muted} />
              <Text style={{ color: C.muted, marginTop: 12, fontSize: 15 }}>Sin comidas registradas</Text>
              <Text style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>Toca + para agregar tu primera comida</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Meal Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: C.text, fontSize: 18, fontWeight: '800' }}>Añadir comida</Text>
              <TouchableOpacity onPress={() => { setShowAddModal(false); setCustomMode(false); }}>
                <Ionicons name="close" size={24} color={C.muted} />
              </TouchableOpacity>
            </View>

            {/* Meal type selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {MEALS_TYPES.map(type => (
                <TouchableOpacity key={type} onPress={() => setSelectedMealType(type)}
                  style={[styles.typeChip, selectedMealType === type && { backgroundColor: C.green + '33', borderColor: C.green }]}>
                  <Text style={{ color: selectedMealType === type ? C.green : C.muted, fontWeight: '600', fontSize: 12 }}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Toggle */}
            <View style={{ flexDirection: 'row', marginBottom: 12, backgroundColor: '#1F2937', borderRadius: 8, padding: 3 }}>
              <TouchableOpacity onPress={() => setCustomMode(false)}
                style={[styles.toggleBtn, !customMode && { backgroundColor: C.green }]}>
                <Text style={{ color: !customMode ? C.bg : C.muted, fontWeight: '700', fontSize: 12 }}>Rápido</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCustomMode(true)}
                style={[styles.toggleBtn, customMode && { backgroundColor: C.green }]}>
                <Text style={{ color: customMode ? C.bg : C.muted, fontWeight: '700', fontSize: 12 }}>Manual</Text>
              </TouchableOpacity>
            </View>

            {!customMode ? (
              <ScrollView style={{ maxHeight: 320 }}>
                {QUICK_FOODS.map((food, i) => (
                  <TouchableOpacity key={i} onPress={() => handleQuickAdd(food)} style={styles.foodItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: C.text, fontWeight: '600', fontSize: 13 }}>{food.name}</Text>
                      <Text style={{ color: C.muted, fontSize: 11 }}>P:{food.protein}g · C:{food.carbs}g · G:{food.fat}g</Text>
                    </View>
                    <Text style={{ color: C.green, fontWeight: '700' }}>{food.calories} kcal</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={{ gap: 8 }}>
                {[
                  { key: 'name', label: 'Nombre del alimento', placeholder: 'Ej: Pechuga de pollo' },
                  { key: 'calories', label: 'Calorías (kcal)', placeholder: '0', keyboardType: 'numeric' },
                  { key: 'protein', label: 'Proteína (g)', placeholder: '0', keyboardType: 'numeric' },
                  { key: 'carbs', label: 'Carbohidratos (g)', placeholder: '0', keyboardType: 'numeric' },
                  { key: 'fat', label: 'Grasa (g)', placeholder: '0', keyboardType: 'numeric' },
                ].map(field => (
                  <View key={field.key}>
                    <Text style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>{field.label}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={field.placeholder}
                      placeholderTextColor={C.muted}
                      value={customFood[field.key]}
                      onChangeText={v => setCustomFood(p => ({ ...p, [field.key]: v }))}
                      keyboardType={field.keyboardType || 'default'}
                    />
                  </View>
                ))}
                <TouchableOpacity onPress={handleCustomAdd} style={styles.saveBtn}>
                  <Text style={{ color: C.bg, fontWeight: '800', fontSize: 15 }}>Añadir</Text>
                </TouchableOpacity>
              </View>
            )}
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
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#1F2937' },
  waterBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#3B82F622', borderRadius: 8, paddingVertical: 8, borderWidth: 1, borderColor: '#3B82F633' },
  modalOverlay: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#13131A', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  typeChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#1F2937', marginRight: 8 },
  toggleBtn: { flex: 1, paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  foodItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1F2937', gap: 8 },
  input: { backgroundColor: '#0A0A0F', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#1F2937' },
  saveBtn: { backgroundColor: '#22C55E', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
});
