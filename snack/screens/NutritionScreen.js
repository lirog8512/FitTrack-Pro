import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../Context/AppContext';
import { analyzeFoodImage } from '../utils/api';

const C = { bg:'#0A0A0F',card:'#13131A',green:'#22C55E',blue:'#3B82F6',orange:'#F97316',text:'#FFFFFF',muted:'#6B7280',border:'#1F2937',purple:'#A855F7' };

const QUICK_FOODS = [
  { name:'Pechuga de pollo (150g)', calories:248, protein:46, carbs:0, fat:5 },
  { name:'Arroz cocido (100g)', calories:130, protein:2.7, carbs:28, fat:0.3 },
  { name:'Huevos (2 unidades)', calories:156, protein:12, carbs:0, fat:11 },
  { name:'Avena (60g)', calories:228, protein:8, carbs:39, fat:4 },
  { name:'Atún en lata (120g)', calories:132, protein:28, carbs:0, fat:1.5 },
  { name:'Plátano mediano', calories:105, protein:1.3, carbs:27, fat:0.4 },
  { name:'Yogur griego (200g)', calories:146, protein:20, carbs:8, fat:4 },
  { name:'Almendras (30g)', calories:174, protein:6, carbs:6, fat:15 },
  { name:'Brócoli (200g)', calories:68, protein:5.7, carbs:11, fat:0.8 },
  { name:'Batata (150g)', calories:129, protein:3, carbs:30, fat:0.2 },
  { name:'Salmón (150g)', calories:280, protein:39, carbs:0, fat:13 },
  { name:'Proteína whey (30g)', calories:120, protein:24, carbs:3, fat:1.5 },
];

const MEAL_TYPES = ['Desayuno','Almuerzo','Merienda','Cena','Snack'];

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const { user, todayMeals, totals, addMeal, removeMeal, addWater, hydration } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [mealType, setMealType] = useState('Desayuno');
  const [mode, setMode] = useState('quick'); // quick | manual | ai
  const [custom, setCustom] = useState({ name:'', calories:'', protein:'', carbs:'', fat:'' });
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [apiKey, setApiKey] = useState(user.apiKey || '');
  const calLeft = user.calories - totals.calories;

  async function handleScanFood() {
    if (!apiKey) {
      Alert.alert('API Key requerida', 'Ve a Perfil y agrega tu API key de Anthropic para usar esta función.');
      return;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
      });
      if (result.canceled) return;
      setAiLoading(true);
      setMode('ai');
      setShowModal(true);
      const analysis = await analyzeFoodImage(result.assets[0].base64, apiKey);
      setAiResult(analysis);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo analizar la imagen');
      setShowModal(false);
    } finally {
      setAiLoading(false);
    }
  }

  async function handlePickFood() {
    if (!apiKey) {
      Alert.alert('API Key requerida', 'Ve a Perfil y agrega tu API key de Anthropic para usar esta función.');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
      });
      if (result.canceled) return;
      setAiLoading(true);
      setMode('ai');
      setShowModal(true);
      const analysis = await analyzeFoodImage(result.assets[0].base64, apiKey);
      setAiResult(analysis);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo analizar la imagen');
      setShowModal(false);
    } finally {
      setAiLoading(false);
    }
  }

  function handleQuickAdd(food) {
    addMeal({ ...food, type:mealType, time:new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}) });
    setShowModal(false);
  }

  function handleAiAdd() {
    if (!aiResult) return;
    addMeal({
      name: aiResult.name + (aiResult.portion ? ` (${aiResult.portion})` : ''),
      calories: aiResult.calories,
      protein: aiResult.protein,
      carbs: aiResult.carbs,
      fat: aiResult.fat,
      type: mealType,
      time: new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}),
      aiAnalyzed: true,
    });
    setAiResult(null);
    setShowModal(false);
  }

  function handleCustomAdd() {
    if (!custom.name || !custom.calories) { Alert.alert('Error','Introduce al menos nombre y calorías'); return; }
    addMeal({ name:custom.name, calories:Number(custom.calories), protein:Number(custom.protein)||0,
      carbs:Number(custom.carbs)||0, fat:Number(custom.fat)||0, type:mealType,
      time:new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}) });
    setCustom({ name:'', calories:'', protein:'', carbs:'', fat:'' });
    setShowModal(false);
  }

  const mealsByType = MEAL_TYPES.reduce((acc, type) => {
    acc[type] = todayMeals.filter(m => m.type === type);
    return acc;
  }, {});

  const calPct = Math.min((totals.calories / user.calories) * 100, 100);

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom:100 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#13131A','#0A0A0F']} style={[styles.header, { paddingTop:insets.top+12 }]}>
          <View>
            <Text style={{ color:C.muted, fontSize:12 }}>Seguimiento diario</Text>
            <Text style={{ color:C.text, fontSize:22, fontWeight:'900' }}>Nutrición 🥗</Text>
          </View>
          <TouchableOpacity onPress={() => { setMode('quick'); setAiResult(null); setShowModal(true); }} style={styles.addBtn}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={{ padding:16, gap:14 }}>
          {/* AI Scan buttons */}
          <View style={{ flexDirection:'row', gap:10 }}>
            <TouchableOpacity onPress={handleScanFood} style={styles.scanBtn} activeOpacity={0.8}>
              <LinearGradient colors={['#22C55E','#16A34A']} style={styles.scanGrad}>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={{ color:'#fff', fontWeight:'800', fontSize:13 }}>Escanear comida</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePickFood} style={styles.scanBtn} activeOpacity={0.8}>
              <LinearGradient colors={['#3B82F6','#2563EB']} style={styles.scanGrad}>
                <Ionicons name="images" size={20} color="#fff" />
                <Text style={{ color:'#fff', fontWeight:'800', fontSize:13 }}>Subir foto</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Calorie progress */}
          <LinearGradient colors={['#22C55E11','#13131A']} style={styles.card}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:10 }}>
              <Text style={styles.cardTitle}>Calorías de hoy</Text>
              <Text style={{ color:calLeft>=0?C.green:C.orange, fontWeight:'700' }}>
                {calLeft>=0?`${calLeft} restantes`:`${Math.abs(calLeft)} exceso`}
              </Text>
            </View>
            <View style={{ height:10, backgroundColor:'#1F2937', borderRadius:5, marginBottom:14, overflow:'hidden' }}>
              <LinearGradient
                colors={totals.calories>user.calories?[C.orange,'#EF4444']:[C.green,'#16A34A']}
                style={{ width:`${calPct}%`, height:10, borderRadius:5 }}
                start={{x:0,y:0}} end={{x:1,y:0}}
              />
            </View>
            <View style={{ flexDirection:'row' }}>
              {[{v:totals.calories,l:'consumidas',c:C.text},{v:user.calories,l:'meta',c:C.muted},{v:Math.round(totals.calories*4.184),l:'kJ totales',c:C.blue}].map((item,i) => (
                <React.Fragment key={i}>
                  {i>0 && <View style={{ width:1, backgroundColor:C.border }} />}
                  <View style={{ flex:1, alignItems:'center' }}>
                    <Text style={{ color:item.c, fontSize:22, fontWeight:'900' }}>{item.v}</Text>
                    <Text style={{ color:C.muted, fontSize:11 }}>{item.l}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </LinearGradient>

          {/* Macros */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom:14 }]}>Macronutrientes</Text>
            <View style={{ gap:10 }}>
              {[
                { label:'Proteína', val:Math.round(totals.protein), goal:user.protein, color:C.blue },
                { label:'Carbohidratos', val:Math.round(totals.carbs), goal:user.carbs, color:C.orange },
                { label:'Grasas', val:Math.round(totals.fat), goal:user.fat, color:C.purple },
              ].map((m,i) => {
                const pct = Math.min((m.val/m.goal)*100, 100);
                return (
                  <View key={i}>
                    <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:5 }}>
                      <Text style={{ color:C.muted, fontSize:12, fontWeight:'600' }}>{m.label}</Text>
                      <Text style={{ color:m.color, fontWeight:'700', fontSize:12 }}>{m.val}g / {m.goal}g</Text>
                    </View>
                    <View style={{ height:8, backgroundColor:'#1F2937', borderRadius:4, overflow:'hidden' }}>
                      <LinearGradient colors={[m.color, m.color+'88']} style={{ width:`${pct}%`, height:8, borderRadius:4 }} start={{x:0,y:0}} end={{x:1,y:0}} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Hydration */}
          <View style={styles.card}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:10 }}>
              <Text style={styles.cardTitle}>💧 Hidratación</Text>
              <Text style={{ color:C.blue, fontWeight:'700' }}>{(hydration/1000).toFixed(1)}L / {user.waterGoal/1000}L</Text>
            </View>
            <View style={{ height:10, backgroundColor:'#1F2937', borderRadius:5, marginBottom:12, overflow:'hidden' }}>
              <LinearGradient colors={[C.blue,'#60A5FA']} style={{ width:`${Math.min((hydration/user.waterGoal)*100,100)}%`, height:10, borderRadius:5 }} start={{x:0,y:0}} end={{x:1,y:0}} />
            </View>
            <View style={{ flexDirection:'row', gap:8 }}>
              {[250,500,750,1000].map(ml => (
                <TouchableOpacity key={ml} onPress={() => addWater(ml)} style={styles.waterBtn}>
                  <Text style={{ color:C.blue, fontWeight:'700', fontSize:11 }}>+{ml<1000?ml+'ml':'1L'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Meals */}
          {MEAL_TYPES.map(type => {
            const meals = mealsByType[type];
            if (!meals.length) return null;
            const typeTotal = meals.reduce((a,m)=>a+m.calories,0);
            return (
              <View key={type} style={styles.card}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:10 }}>
                  <View style={{ flexDirection:'row', gap:8, alignItems:'center' }}>
                    <Text style={styles.cardTitle}>{type}</Text>
                    <View style={{ backgroundColor:C.green+'22', paddingHorizontal:8, paddingVertical:2, borderRadius:10 }}>
                      <Text style={{ color:C.green, fontSize:11, fontWeight:'700' }}>{meals.length} items</Text>
                    </View>
                  </View>
                  <Text style={{ color:C.green, fontWeight:'800' }}>{typeTotal} kcal</Text>
                </View>
                {meals.map(meal => (
                  <View key={meal.id} style={styles.mealRow}>
                    <View style={{ width:34, height:34, borderRadius:10, backgroundColor:meal.aiAnalyzed?C.green+'22':C.blue+'22', alignItems:'center', justifyContent:'center' }}>
                      <Ionicons name={meal.aiAnalyzed?'sparkles':'restaurant'} size={16} color={meal.aiAnalyzed?C.green:C.blue} />
                    </View>
                    <View style={{ flex:1 }}>
                      <Text style={{ color:C.text, fontWeight:'600', fontSize:13 }}>{meal.name}</Text>
                      <Text style={{ color:C.muted, fontSize:11, marginTop:1 }}>P:{meal.protein}g · C:{meal.carbs}g · G:{meal.fat}g · {meal.time}</Text>
                    </View>
                    <View style={{ alignItems:'flex-end', gap:4 }}>
                      <Text style={{ color:C.text, fontWeight:'800', fontSize:13 }}>{meal.calories}</Text>
                      <Text style={{ color:C.muted, fontSize:9 }}>kcal</Text>
                      <TouchableOpacity onPress={() => removeMeal(meal.id)}>
                        <Ionicons name="trash-outline" size={14} color='#4B5563' />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}

          {todayMeals.length===0 && (
            <View style={[styles.card, { alignItems:'center', paddingVertical:40 }]}>
              <View style={{ width:64, height:64, borderRadius:20, backgroundColor:'#1F2937', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                <Ionicons name="restaurant-outline" size={32} color={C.muted} />
              </View>
              <Text style={{ color:C.text, fontSize:16, fontWeight:'700' }}>Sin comidas hoy</Text>
              <Text style={{ color:C.muted, fontSize:12, marginTop:4, textAlign:'center' }}>
                Usa el escáner de IA para analizar{'\n'}tu comida automáticamente
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <Text style={{ color:C.text, fontSize:18, fontWeight:'900' }}>Añadir comida</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); setAiResult(null); }}>
                <Ionicons name="close-circle" size={26} color={C.muted} />
              </TouchableOpacity>
            </View>

            {/* Meal type */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:12 }}>
              {MEAL_TYPES.map(type => (
                <TouchableOpacity key={type} onPress={() => setMealType(type)}
                  style={[styles.typeChip, mealType===type && { backgroundColor:C.green+'33', borderColor:C.green }]}>
                  <Text style={{ color:mealType===type?C.green:C.muted, fontWeight:'700', fontSize:12 }}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Mode tabs */}
            <View style={{ flexDirection:'row', backgroundColor:'#1F2937', borderRadius:10, padding:3, marginBottom:14 }}>
              {[{k:'quick',l:'Rápido'},{k:'ai',l:'🤖 IA'},{k:'manual',l:'Manual'}].map(m => (
                <TouchableOpacity key={m.k} onPress={() => setMode(m.k)} style={[styles.modeBtn, mode===m.k && { backgroundColor:mode==='ai'?C.green:C.green }]}>
                  <Text style={{ color:mode===m.k?C.bg:C.muted, fontWeight:'700', fontSize:11 }}>{m.l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* AI mode */}
            {mode==='ai' && (
              <View style={{ minHeight:200, alignItems:'center', justifyContent:'center' }}>
                {aiLoading ? (
                  <View style={{ alignItems:'center', gap:12 }}>
                    <ActivityIndicator size="large" color={C.green} />
                    <Text style={{ color:C.text, fontWeight:'700' }}>Analizando con IA...</Text>
                    <Text style={{ color:C.muted, fontSize:12 }}>Claude está identificando los macros</Text>
                  </View>
                ) : aiResult ? (
                  <View style={{ width:'100%', gap:12 }}>
                    <LinearGradient colors={['#22C55E22','#13131A']} style={{ borderRadius:14, padding:14, borderWidth:1, borderColor:C.green+'44' }}>
                      <View style={{ flexDirection:'row', gap:8, alignItems:'center', marginBottom:8 }}>
                        <Ionicons name="sparkles" size={18} color={C.green} />
                        <Text style={{ color:C.green, fontWeight:'800', fontSize:14 }}>Análisis completado</Text>
                        <View style={{ backgroundColor:C.green+'33', paddingHorizontal:8, paddingVertical:2, borderRadius:10, marginLeft:'auto' }}>
                          <Text style={{ color:C.green, fontSize:10, fontWeight:'700' }}>Confianza: {aiResult.confidence}</Text>
                        </View>
                      </View>
                      <Text style={{ color:C.text, fontSize:16, fontWeight:'800', marginBottom:4 }}>{aiResult.name}</Text>
                      {aiResult.portion && <Text style={{ color:C.muted, fontSize:12, marginBottom:10 }}>Porción: {aiResult.portion}</Text>}
                      <View style={{ flexDirection:'row', justifyContent:'space-around', backgroundColor:'#0A0A0F', borderRadius:10, padding:10 }}>
                        {[
                          { l:'Calorías', v:aiResult.calories, u:'kcal', c:C.orange },
                          { l:'Proteína', v:aiResult.protein, u:'g', c:C.blue },
                          { l:'Carbos', v:aiResult.carbs, u:'g', c:C.orange },
                          { l:'Grasa', v:aiResult.fat, u:'g', c:C.purple },
                        ].map((s,i) => (
                          <View key={i} style={{ alignItems:'center' }}>
                            <Text style={{ color:s.c, fontSize:18, fontWeight:'900' }}>{s.v}</Text>
                            <Text style={{ color:C.muted, fontSize:9 }}>{s.u}</Text>
                            <Text style={{ color:C.muted, fontSize:9 }}>{s.l}</Text>
                          </View>
                        ))}
                      </View>
                      {aiResult.notes && <Text style={{ color:C.muted, fontSize:11, marginTop:8 }}>💡 {aiResult.notes}</Text>}
                    </LinearGradient>
                    <TouchableOpacity onPress={handleAiAdd} style={{ backgroundColor:C.green, borderRadius:12, padding:14, alignItems:'center' }}>
                      <Text style={{ color:C.bg, fontWeight:'900', fontSize:15 }}>✓ Añadir al registro</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ alignItems:'center', gap:12 }}>
                    <Ionicons name="camera" size={48} color={C.muted} />
                    <Text style={{ color:C.muted, fontSize:13, textAlign:'center' }}>
                      Usa los botones de cámara{'\n'}en la pantalla principal
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Quick mode */}
            {mode==='quick' && (
              <ScrollView style={{ maxHeight:320 }} showsVerticalScrollIndicator={false}>
                {QUICK_FOODS.map((food,i) => (
                  <TouchableOpacity key={i} onPress={() => handleQuickAdd(food)} style={styles.foodItem}>
                    <View style={{ width:36, height:36, borderRadius:10, backgroundColor:C.green+'22', alignItems:'center', justifyContent:'center' }}>
                      <Ionicons name="restaurant" size={16} color={C.green} />
                    </View>
                    <View style={{ flex:1 }}>
                      <Text style={{ color:C.text, fontWeight:'600', fontSize:13 }}>{food.name}</Text>
                      <Text style={{ color:C.muted, fontSize:11 }}>P:{food.protein}g · C:{food.carbs}g · G:{food.fat}g</Text>
                    </View>
                    <Text style={{ color:C.green, fontWeight:'800', fontSize:13 }}>{food.calories}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Manual mode */}
            {mode==='manual' && (
              <View style={{ gap:8 }}>
                {[{k:'name',l:'Nombre',p:'Ej: Pechuga de pollo',t:'default'},
                  {k:'calories',l:'Calorías (kcal)',p:'0',t:'numeric'},
                  {k:'protein',l:'Proteína (g)',p:'0',t:'numeric'},
                  {k:'carbs',l:'Carbohidratos (g)',p:'0',t:'numeric'},
                  {k:'fat',l:'Grasa (g)',p:'0',t:'numeric'},
                ].map(f => (
                  <View key={f.k}>
                    <Text style={{ color:C.muted, fontSize:11, marginBottom:4 }}>{f.l}</Text>
                    <TextInput style={styles.input} placeholder={f.p} placeholderTextColor='#4B5563'
                      value={custom[f.k]} onChangeText={v=>setCustom(p=>({...p,[f.k]:v}))} keyboardType={f.t} />
                  </View>
                ))}
                <TouchableOpacity onPress={handleCustomAdd} style={{ backgroundColor:C.green, borderRadius:12, padding:14, alignItems:'center', marginTop:4 }}>
                  <Text style={{ color:C.bg, fontWeight:'900', fontSize:15 }}>Añadir</Text>
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
  header: { paddingHorizontal:16, paddingBottom:16, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  addBtn: { width:46, height:46, borderRadius:23, backgroundColor:C.green, alignItems:'center', justifyContent:'center' },
  scanBtn: { flex:1, borderRadius:14, overflow:'hidden' },
  scanGrad: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, paddingVertical:14, paddingHorizontal:12 },
  card: { backgroundColor:'#13131A', borderRadius:18, padding:16, borderWidth:1, borderColor:'#1F2937' },
  cardTitle: { color:'#FFFFFF', fontSize:15, fontWeight:'800' },
  mealRow: { flexDirection:'row', alignItems:'center', gap:10, paddingVertical:10, borderTopWidth:1, borderTopColor:'#1F2937' },
  waterBtn: { flex:1, alignItems:'center', backgroundColor:'#3B82F622', borderRadius:8, paddingVertical:8, borderWidth:1, borderColor:'#3B82F633' },
  modalOverlay: { flex:1, backgroundColor:'#000000DD', justifyContent:'flex-end' },
  modalContent: { backgroundColor:'#13131A', borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, maxHeight:'88%' },
  typeChip: { paddingHorizontal:14, paddingVertical:6, borderRadius:20, borderWidth:1, borderColor:'#1F2937', marginRight:8 },
  modeBtn: { flex:1, paddingVertical:7, borderRadius:7, alignItems:'center' },
  foodItem: { flexDirection:'row', alignItems:'center', gap:10, paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#1F2937' },
  input: { backgroundColor:'#0A0A0F', borderRadius:10, padding:12, color:'#FFFFFF', borderWidth:1, borderColor:'#1F2937' },
});
