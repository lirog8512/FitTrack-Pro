import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image, Modal, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../../context/AppContext';
import MacroRing from '../../components/ui/MacroRing';
import ProgressBar from '../../components/ui/ProgressBar';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { analyzeFood } from '../../services/anthropicService';

const MEAL_CATEGORIES = [
  { id: 'breakfast', label: 'Desayuno', icon: 'sunny', color: COLORS.orange },
  { id: 'lunch', label: 'Almuerzo', icon: 'restaurant', color: COLORS.green },
  { id: 'snack', label: 'Merienda', icon: 'cafe', color: COLORS.yellow },
  { id: 'dinner', label: 'Cena', icon: 'moon', color: COLORS.blue },
];

const SAMPLE_FOODS = [
  { name: 'Pechuga de pollo (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Arroz blanco cocido (100g)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Huevo entero', calories: 70, protein: 6, carbs: 0.5, fat: 5 },
  { name: 'Clara de huevo', calories: 17, protein: 3.6, carbs: 0.2, fat: 0 },
  { name: 'Avena (50g)', calories: 190, protein: 6.5, carbs: 32, fat: 3.5 },
  { name: 'Atún en agua (100g)', calories: 116, protein: 26, carbs: 0, fat: 1 },
  { name: 'Salmón (100g)', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Brócoli (100g)', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { name: 'Banana mediana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: 'Leche desnatada (200ml)', calories: 70, protein: 7, carbs: 10, fat: 0.2 },
  { name: 'Proteína whey (30g)', calories: 120, protein: 25, carbs: 2, fat: 1.5 },
  { name: 'Aguacate (50g)', calories: 80, protein: 1, carbs: 4, fat: 7 },
  { name: 'Queso cottage (100g)', calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  { name: 'Pan integral (1 rebanada)', calories: 80, protein: 4, carbs: 15, fat: 1 },
  { name: 'Aceite de oliva (1 cucharada)', calories: 119, protein: 0, carbs: 0, fat: 14 },
];

export default function NutritionScreen() {
  const { user, totals, dayData, addMeal, removeMeal } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('breakfast');
  const [searchText, setSearchText] = useState('');
  const [tab, setTab] = useState('search');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedFood, setAnalyzedFood] = useState(null);
  const [expandedCat, setExpandedCat] = useState(null);

  const filteredFoods = SAMPLE_FOODS.filter(f => f.name.toLowerCase().includes(searchText.toLowerCase()));

  async function handlePhotoAnalysis() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu galería para analizar la foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });
    if (result.canceled) return;
    setAnalyzing(true);
    setAnalyzedFood(null);
    try {
      const data = await analyzeFood(result.assets[0].base64);
      setAnalyzedFood(data);
    } catch (e) {
      Alert.alert('Error', 'No se pudo analizar la imagen.');
    } finally {
      setAnalyzing(false);
    }
  }

  function addAnalyzedFood() {
    if (!analyzedFood) return;
    addMeal(analyzedFood, activeCategory);
    setAnalyzedFood(null);
    setModalVisible(false);
  }

  function getMealsByCategory(catId) {
    return dayData.meals.filter(m => m.category === catId);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <Text style={styles.title}>Nutrición</Text>

        {/* Macro Summary */}
        <View style={styles.card}>
          <View style={styles.ringRow}>
            <View style={styles.bigRingWrap}>
              <MacroRing value={totals.calories} max={user.calorieGoal} color={COLORS.green} label="" unit="kcal" size={100} strokeWidth={10} />
              <Text style={styles.calorieLabel}>{totals.calories} / {user.calorieGoal}</Text>
              <Text style={styles.calorieSubLabel}>kcal</Text>
            </View>
            <View style={styles.smallRings}>
              <MacroRing value={totals.protein} max={user.proteinGoal} color={COLORS.blue} label="Proteína" unit="g" size={72} />
              <MacroRing value={totals.carbs} max={user.carbsGoal} color={COLORS.green} label="Carbos" unit="g" size={72} />
              <MacroRing value={totals.fat} max={user.fatGoal} color={COLORS.orange} label="Grasas" unit="g" size={72} />
            </View>
          </View>
          <View style={{ marginTop: 16 }}>
            <ProgressBar value={totals.protein} max={user.proteinGoal} colors={[COLORS.blue, '#2563EB']} label={`Proteína ${totals.protein}g`} sublabel={`/${user.proteinGoal}g`} height={6} />
            <View style={{ height: 8 }} />
            <ProgressBar value={totals.carbs} max={user.carbsGoal} colors={[COLORS.green, COLORS.greenDark]} label={`Carbos ${totals.carbs}g`} sublabel={`/${user.carbsGoal}g`} height={6} />
            <View style={{ height: 8 }} />
            <ProgressBar value={totals.fat} max={user.fatGoal} colors={[COLORS.orange, COLORS.orangeDark]} label={`Grasas ${totals.fat}g`} sublabel={`/${user.fatGoal}g`} height={6} />
          </View>
        </View>

        {/* Analyze Photo CTA */}
        <TouchableOpacity onPress={() => { setTab('photo'); setModalVisible(true); }} activeOpacity={0.85}>
          <LinearGradient colors={['#22C55E20', '#3B82F620']} style={styles.aiBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <LinearGradient colors={[COLORS.green, COLORS.blue]} style={styles.aiIconWrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="camera" size={22} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.aiTitle}>Analizar foto con IA</Text>
              <Text style={styles.aiSub}>Saca foto a tu comida y calcula las macros automáticamente</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Meal Categories */}
        {MEAL_CATEGORIES.map(cat => {
          const meals = getMealsByCategory(cat.id);
          const catCals = meals.reduce((s, m) => s + (m.calories || 0), 0);
          const isExpanded = expandedCat === cat.id;
          return (
            <View key={cat.id} style={styles.mealSection}>
              <TouchableOpacity style={styles.mealHeader} onPress={() => setExpandedCat(isExpanded ? null : cat.id)}>
                <View style={[styles.mealIcon, { backgroundColor: cat.color + '20' }]}>
                  <Ionicons name={cat.icon} size={18} color={cat.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.mealTitle}>{cat.label}</Text>
                  <Text style={styles.mealCals}>{catCals} kcal · {meals.length} alimentos</Text>
                </View>
                <TouchableOpacity onPress={() => { setActiveCategory(cat.id); setTab('search'); setModalVisible(true); }} style={[styles.addBtn, { backgroundColor: cat.color + '20' }]}>
                  <Ionicons name="add" size={18} color={cat.color} />
                </TouchableOpacity>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textMuted} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
              {isExpanded && meals.map(meal => (
                <View key={meal.id} style={styles.mealItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mealItemName}>{meal.foodName || meal.name}</Text>
                    <Text style={styles.mealItemMacros}>{meal.calories} kcal · P:{meal.protein}g · C:{meal.carbs}g · G:{meal.fat}g</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeMeal(meal.id)}>
                    <Ionicons name="trash-outline" size={16} color={COLORS.red} />
                  </TouchableOpacity>
                </View>
              ))}
              {isExpanded && meals.length === 0 && (
                <Text style={styles.emptyMeal}>Sin alimentos registrados</Text>
              )}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Food Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Agregar alimento</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.tabRow}>
            <TouchableOpacity style={[styles.tabBtn, tab === 'search' && styles.tabBtnActive]} onPress={() => setTab('search')}>
              <Text style={[styles.tabText, tab === 'search' && styles.tabTextActive]}>Buscar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabBtn, tab === 'photo' && styles.tabBtnActive]} onPress={() => setTab('photo')}>
              <Text style={[styles.tabText, tab === 'photo' && styles.tabTextActive]}>Foto IA</Text>
            </TouchableOpacity>
          </View>

          {tab === 'search' ? (
            <>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar alimento..."
                  placeholderTextColor={COLORS.textMuted}
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>
              <FlatList
                data={filteredFoods}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.foodItem} onPress={() => { addMeal({ ...item, foodName: item.name }, activeCategory); setModalVisible(false); setSearchText(''); }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.foodName}>{item.name}</Text>
                      <Text style={styles.foodMacros}>P:{item.protein}g · C:{item.carbs}g · G:{item.fat}g</Text>
                    </View>
                    <Text style={styles.foodCals}>{item.calories} kcal</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: COLORS.border }} />}
              />
            </>
          ) : (
            <View style={styles.photoTab}>
              {analyzing ? (
                <View style={styles.analyzingState}>
                  <ActivityIndicator size="large" color={COLORS.green} />
                  <Text style={styles.analyzingText}>Analizando con IA...</Text>
                </View>
              ) : analyzedFood ? (
                <View style={styles.resultCard}>
                  <Text style={styles.resultTitle}>{analyzedFood.foodName}</Text>
                  <Text style={styles.resultDesc}>{analyzedFood.description}</Text>
                  <View style={styles.resultMacros}>
                    <MacroRing value={analyzedFood.protein} max={50} color={COLORS.blue} label="Proteína" unit="g" size={72} />
                    <MacroRing value={analyzedFood.carbs} max={100} color={COLORS.green} label="Carbos" unit="g" size={72} />
                    <MacroRing value={analyzedFood.fat} max={40} color={COLORS.orange} label="Grasas" unit="g" size={72} />
                  </View>
                  <Text style={styles.resultCals}>{analyzedFood.calories} kcal</Text>
                  <Text style={styles.confidenceText}>Confianza: {analyzedFood.confidence}</Text>
                  <TouchableOpacity style={styles.confirmBtn} onPress={addAnalyzedFood}>
                    <LinearGradient colors={[COLORS.green, COLORS.greenDark]} style={styles.confirmBtnGrad}>
                      <Text style={styles.confirmBtnText}>Agregar al registro</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setAnalyzedFood(null)} style={{ marginTop: 12, alignItems: 'center' }}>
                    <Text style={{ color: COLORS.textSecondary }}>Analizar otra foto</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.photoPrompt}>
                  <LinearGradient colors={['#22C55E20', '#3B82F620']} style={styles.cameraCircle}>
                    <Ionicons name="camera" size={48} color={COLORS.green} />
                  </LinearGradient>
                  <Text style={styles.photoTitle}>Análisis de comida con IA</Text>
                  <Text style={styles.photoSub}>Saca una foto a tu comida y la IA calculará automáticamente las calorías y macros</Text>
                  <TouchableOpacity style={{ marginTop: 24 }} onPress={handlePhotoAnalysis}>
                    <LinearGradient colors={[COLORS.green, COLORS.blue]} style={styles.photoBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                      <Ionicons name="camera" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.photoBtnText}>Seleccionar foto</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
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
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.base },
  ringRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bigRingWrap: { alignItems: 'center' },
  calorieLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.white, marginTop: 6 },
  calorieSubLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  smallRings: { flexDirection: 'row', gap: 12 },
  aiBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.green + '40', marginBottom: SPACING.base },
  aiIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.white, marginBottom: 2 },
  aiSub: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, lineHeight: 16 },
  mealSection: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  mealHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  mealIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  mealTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold, color: COLORS.white },
  mealCals: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 1 },
  addBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  mealItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  mealItemName: { fontSize: FONTS.sizes.sm, color: COLORS.white, fontWeight: FONTS.weights.medium },
  mealItemMacros: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  emptyMeal: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, padding: SPACING.md, textAlign: 'center' },
  modal: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.white },
  tabRow: { flexDirection: 'row', margin: SPACING.base, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.md },
  tabBtnActive: { backgroundColor: COLORS.green },
  tabText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: FONTS.weights.medium },
  tabTextActive: { color: '#fff', fontWeight: FONTS.weights.bold },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: SPACING.base, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, marginBottom: SPACING.sm },
  searchInput: { flex: 1, color: COLORS.white, fontSize: FONTS.sizes.base },
  foodItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md },
  foodName: { fontSize: FONTS.sizes.sm, color: COLORS.white, fontWeight: FONTS.weights.medium },
  foodMacros: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  foodCals: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.green },
  photoTab: { flex: 1, padding: SPACING.base },
  photoPrompt: { alignItems: 'center', paddingTop: 40 },
  cameraCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  photoTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.white, marginBottom: 8 },
  photoSub: { fontSize: FONTS.sizes.base, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  photoBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 28, paddingVertical: 14, borderRadius: RADIUS.xl },
  photoBtnText: { color: '#fff', fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold },
  analyzingState: { alignItems: 'center', paddingTop: 80 },
  analyzingText: { fontSize: FONTS.sizes.base, color: COLORS.textSecondary, marginTop: 16 },
  resultCard: { alignItems: 'center' },
  resultTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.white, marginBottom: 6 },
  resultDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  resultMacros: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  resultCals: { fontSize: FONTS.sizes['3xl'], fontWeight: FONTS.weights.black, color: COLORS.green },
  confidenceText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginTop: 4, marginBottom: 20 },
  confirmBtn: { width: '100%' },
  confirmBtnGrad: { paddingVertical: 14, borderRadius: RADIUS.lg, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold },
});
