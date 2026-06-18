import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polyline, Line, Circle, Text as SvgText } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../Context/AppContext';
import { analyzeBodyPhoto } from '../utils/api';

const C = { bg:'#0A0A0F',card:'#13131A',green:'#22C55E',blue:'#3B82F6',orange:'#F97316',text:'#FFFFFF',muted:'#6B7280',border:'#1F2937',purple:'#A855F7' };

function WeightChart({ data, width=300, height=150 }) {
  if (!data || data.length < 2) return null;
  const weights = data.map(d => d.weight);
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;
  const pL=36, pR=12, pT=12, pB=28;
  const cW=width-pL-pR, cH=height-pT-pB;
  const pts = data.map((d,i) => ({
    x: pL + (i/(data.length-1))*cW,
    y: pT + (1-(d.weight-minW)/(maxW-minW))*cH,
    ...d
  }));
  return (
    <Svg width={width} height={height}>
      {[0,0.33,0.66,1].map((t,i) => {
        const y = pT + t*cH;
        return (
          <React.Fragment key={i}>
            <Line x1={pL} y1={y} x2={width-pR} y2={y} stroke="#1F2937" strokeWidth={1} />
            <SvgText x={pL-4} y={y+4} fill="#6B7280" fontSize={9} textAnchor="end">
              {(maxW-t*(maxW-minW)).toFixed(1)}
            </SvgText>
          </React.Fragment>
        );
      })}
      {/* Area fill approximation */}
      <Polyline points={pts.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke={C.green} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p,i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={i===pts.length-1?6:4} fill={i===pts.length-1?C.green:'#22C55E88'} stroke={C.bg} strokeWidth={2} />
      ))}
      {pts.map((p,i) => {
        if (data.length>5 && i%2!==0 && i!==pts.length-1) return null;
        return <SvgText key={i} x={p.x} y={height-6} fill="#6B7280" fontSize={9} textAnchor="middle">{p.date?.slice(5)||''}</SvgText>;
      })}
    </Svg>
  );
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { user, weightHistory, completedWorkouts, addWeight, updateUser } = useApp();
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const totalLost = weightHistory.length > 0 ? (weightHistory[0].weight - user.weight).toFixed(1) : 0;
  const toGoal = (user.weight - user.goalWeight).toFixed(1);
  const progressPct = Math.max(0, Math.min(
    ((weightHistory[0]?.weight - user.weight) / (weightHistory[0]?.weight - user.goalWeight)) * 100, 100
  ));
  const workoutDays = Object.keys(completedWorkouts).length;
  const imc = (user.weight / ((user.height/100)**2)).toFixed(1);
  const imcGoal = (user.goalWeight / ((user.height/100)**2)).toFixed(1);
  const imcCat = imc<18.5?'Bajo peso':imc<25?'Peso normal':imc<30?'Sobrepeso':'Obesidad';
  const imcColor = imc<18.5?C.blue:imc<25?C.green:imc<30?C.orange:'#EF4444';

  async function handleBodyAnalysis() {
    if (!user.apiKey) {
      Alert.alert('API Key requerida', 'Ve a Perfil → API Key y agrega tu clave de Anthropic.');
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
      const analysis = await analyzeBodyPhoto(result.assets[0].base64, user, user.lastBodyAnalysis, user.apiKey);
      setAiAnalysis(analysis);

      // Apply nutrition changes if AI recommends it
      if (analysis.nutritionAdjustment) {
        Alert.alert(
          '🤖 IA recomienda ajuste nutricional',
          `${analysis.reasoning}\n\n¿Aplicar nuevo plan?\n• ${analysis.newCalories} kcal\n• ${analysis.newProtein}g proteína\n• ${analysis.newCarbs}g carbos\n• ${analysis.newFat}g grasa`,
          [
            { text:'No por ahora', style:'cancel' },
            { text:'✓ Aplicar plan', onPress: () => {
              updateUser({
                calories: analysis.newCalories,
                protein: analysis.newProtein,
                carbs: analysis.newCarbs,
                fat: analysis.newFat,
                lastBodyAnalysis: analysis.reasoning,
              });
              Alert.alert('Plan actualizado', '¡Tu plan nutricional ha sido actualizado por la IA!');
            }},
          ]
        );
      } else {
        updateUser({ lastBodyAnalysis: analysis.reasoning });
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo analizar la foto');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleCameraBody() {
    if (!user.apiKey) {
      Alert.alert('API Key requerida', 'Ve a Perfil → API Key y agrega tu clave de Anthropic.');
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
      const analysis = await analyzeBodyPhoto(result.assets[0].base64, user, user.lastBodyAnalysis, user.apiKey);
      setAiAnalysis(analysis);
      if (analysis.nutritionAdjustment) {
        Alert.alert(
          '🤖 Ajuste recomendado',
          `${analysis.reasoning}\n\n¿Aplicar nuevo plan?\n• ${analysis.newCalories} kcal / ${analysis.newProtein}g P / ${analysis.newCarbs}g C / ${analysis.newFat}g G`,
          [
            { text:'No', style:'cancel' },
            { text:'Aplicar', onPress: () => updateUser({ calories:analysis.newCalories, protein:analysis.newProtein, carbs:analysis.newCarbs, fat:analysis.newFat, lastBodyAnalysis:analysis.reasoning }) },
          ]
        );
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo analizar la foto');
    } finally {
      setAiLoading(false);
    }
  }

  function handleAddWeight() {
    const w = parseFloat(newWeight);
    if (!w || w<30 || w>300) { Alert.alert('Error','Introduce un peso válido'); return; }
    addWeight(w);
    setNewWeight('');
    setShowWeightModal(false);
  }

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom:100 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#13131A','#0A0A0F']} style={[styles.header, { paddingTop:insets.top+12 }]}>
          <View>
            <Text style={{ color:C.muted, fontSize:12 }}>Tu evolución</Text>
            <Text style={{ color:C.text, fontSize:22, fontWeight:'900' }}>Progreso 📈</Text>
          </View>
          <TouchableOpacity onPress={() => setShowWeightModal(true)} style={styles.addBtn}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={{ padding:16, gap:14 }}>
          {/* AI Body Analysis buttons */}
          <View style={{ flexDirection:'row', gap:10 }}>
            <TouchableOpacity onPress={handleCameraBody} style={{ flex:1, borderRadius:14, overflow:'hidden' }} activeOpacity={0.8}>
              <LinearGradient colors={['#A855F7','#7C3AED']} style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, paddingVertical:14 }}>
                <Ionicons name="camera" size={18} color="#fff" />
                <Text style={{ color:'#fff', fontWeight:'800', fontSize:12 }}>Foto corporal IA</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleBodyAnalysis} style={{ flex:1, borderRadius:14, overflow:'hidden' }} activeOpacity={0.8}>
              <LinearGradient colors={['#3B82F6','#2563EB']} style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, paddingVertical:14 }}>
                <Ionicons name="sparkles" size={18} color="#fff" />
                <Text style={{ color:'#fff', fontWeight:'800', fontSize:12 }}>Analizar evolución</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* AI Loading */}
          {aiLoading && (
            <LinearGradient colors={['#A855F722','#13131A']} style={[styles.card, { alignItems:'center', paddingVertical:24, gap:12 }]}>
              <ActivityIndicator size="large" color={C.purple} />
              <Text style={{ color:C.text, fontWeight:'700' }}>Analizando tu foto...</Text>
              <Text style={{ color:C.muted, fontSize:12, textAlign:'center' }}>
                Claude está evaluando tu composición corporal y evolución
              </Text>
            </LinearGradient>
          )}

          {/* AI Analysis Result */}
          {aiAnalysis && !aiLoading && (
            <LinearGradient colors={['#A855F722','#13131A']} style={[styles.card, { borderColor:C.purple+'44' }]}>
              <View style={{ flexDirection:'row', gap:8, alignItems:'center', marginBottom:12 }}>
                <Ionicons name="sparkles" size={18} color={C.purple} />
                <Text style={{ color:C.purple, fontWeight:'800', fontSize:15 }}>Análisis corporal IA</Text>
                <TouchableOpacity onPress={() => setAiAnalysis(null)} style={{ marginLeft:'auto' }}>
                  <Ionicons name="close" size={18} color={C.muted} />
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection:'row', gap:10, marginBottom:12 }}>
                <View style={[styles.aiStat, { flex:1 }]}>
                  <Text style={{ color:C.muted, fontSize:10 }}>Grasa corporal</Text>
                  <Text style={{ color:C.orange, fontSize:18, fontWeight:'900' }}>{aiAnalysis.bodyFatEstimate}</Text>
                </View>
                <View style={[styles.aiStat, { flex:1 }]}>
                  <Text style={{ color:C.muted, fontSize:10 }}>Definición</Text>
                  <Text style={{ color:C.blue, fontSize:18, fontWeight:'900', textTransform:'capitalize' }}>{aiAnalysis.muscleDefinition}</Text>
                </View>
                <View style={[styles.aiStat, { flex:1 }]}>
                  <Text style={{ color:C.muted, fontSize:10 }}>Progreso</Text>
                  <Text style={{ color:C.green, fontSize:13, fontWeight:'800', textTransform:'capitalize' }}>{aiAnalysis.progressVsPrevious}</Text>
                </View>
              </View>

              {aiAnalysis.strongAreas?.length > 0 && (
                <View style={{ marginBottom:8 }}>
                  <Text style={{ color:C.green, fontSize:12, fontWeight:'700', marginBottom:4 }}>✅ Puntos fuertes</Text>
                  {aiAnalysis.strongAreas.map((a,i) => <Text key={i} style={{ color:C.muted, fontSize:12 }}>• {a}</Text>)}
                </View>
              )}

              {aiAnalysis.weakAreas?.length > 0 && (
                <View style={{ marginBottom:10 }}>
                  <Text style={{ color:C.orange, fontSize:12, fontWeight:'700', marginBottom:4 }}>🎯 Áreas a mejorar</Text>
                  {aiAnalysis.weakAreas.map((a,i) => <Text key={i} style={{ color:C.muted, fontSize:12 }}>• {a}</Text>)}
                </View>
              )}

              <View style={{ backgroundColor:'#0A0A0F', borderRadius:10, padding:12, marginBottom:8 }}>
                <Text style={{ color:C.muted, fontSize:11, lineHeight:18 }}>{aiAnalysis.reasoning}</Text>
              </View>

              {aiAnalysis.nextFocus && (
                <View style={{ flexDirection:'row', gap:8, alignItems:'flex-start' }}>
                  <Ionicons name="bulb" size={14} color:C.orange style={{ marginTop:2 }} />
                  <Text style={{ color:C.orange, fontSize:12, flex:1, lineHeight:18 }}>{aiAnalysis.nextFocus}</Text>
                </View>
              )}

              {aiAnalysis.motivationalMessage && (
                <View style={{ marginTop:10, backgroundColor:C.green+'11', borderRadius:10, padding:10, borderLeftWidth:3, borderLeftColor:C.green }}>
                  <Text style={{ color:C.green, fontSize:12, lineHeight:18 }}>💪 {aiAnalysis.motivationalMessage}</Text>
                </View>
              )}

              {aiAnalysis.nutritionAdjustment && (
                <View style={{ marginTop:10, backgroundColor:C.purple+'11', borderRadius:10, padding:10 }}>
                  <Text style={{ color:C.purple, fontWeight:'700', marginBottom:4 }}>🤖 Plan ajustado por IA</Text>
                  <Text style={{ color:C.muted, fontSize:12 }}>
                    {aiAnalysis.newCalories} kcal · {aiAnalysis.newProtein}g P · {aiAnalysis.newCarbs}g C · {aiAnalysis.newFat}g G
                  </Text>
                </View>
              )}
            </LinearGradient>
          )}

          {/* Goal progress */}
          <LinearGradient colors={['#22C55E11','#13131A']} style={styles.card}>
            <Text style={styles.cardTitle}>Progreso hacia el objetivo</Text>
            <View style={{ marginTop:14, marginBottom:8 }}>
              <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:8 }}>
                <Text style={{ color:C.muted, fontSize:12 }}>Inicio: {weightHistory[0]?.weight}kg</Text>
                <Text style={{ color:C.green, fontSize:12, fontWeight:'800' }}>{progressPct.toFixed(0)}% completado</Text>
                <Text style={{ color:C.muted, fontSize:12 }}>Meta: {user.goalWeight}kg</Text>
              </View>
              <View style={{ height:12, backgroundColor:'#1F2937', borderRadius:6, overflow:'hidden' }}>
                <LinearGradient colors={[C.green,'#16A34A']} style={{ width:`${progressPct}%`, height:12, borderRadius:6 }} start={{x:0,y:0}} end={{x:1,y:0}} />
              </View>
            </View>
            <View style={{ flexDirection:'row', justifyContent:'center', gap:6, marginTop:10 }}>
              <Ionicons name="flag" size={14} color={C.orange} />
              <Text style={{ color:C.orange, fontWeight:'800' }}>Faltan {toGoal}kg para tu objetivo</Text>
            </View>
          </LinearGradient>

          {/* Stats grid */}
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10 }}>
            {[
              { label:'Peso inicial', value:`${weightHistory[0]?.weight||user.weight}kg`, color:C.muted, icon:'scale-outline' },
              { label:'Peso actual', value:`${user.weight}kg`, color:C.text, icon:'scale' },
              { label:'Objetivo', value:`${user.goalWeight}kg`, color:C.green, icon:'flag' },
              { label:'Perdido', value:`${totalLost}kg`, color:C.orange, icon:'trending-down' },
            ].map((s,i) => (
              <LinearGradient key={i} colors={[s.color+'11','#13131A']} style={[styles.statCard, { width:'47%' }]}>
                <Ionicons name={s.icon} size={22} color={s.color} />
                <Text style={{ color:s.color, fontSize:22, fontWeight:'900', marginTop:6 }}>{s.value}</Text>
                <Text style={{ color:C.muted, fontSize:11, marginTop:2 }}>{s.label}</Text>
              </LinearGradient>
            ))}
          </View>

          {/* Weight chart */}
          <View style={styles.card}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:16 }}>
              <Text style={styles.cardTitle}>Historial de peso</Text>
              <TouchableOpacity onPress={() => setShowWeightModal(true)}>
                <Text style={{ color:C.green, fontWeight:'700' }}>+ Registrar</Text>
              </TouchableOpacity>
            </View>
            <WeightChart data={weightHistory} width={320} height={150} />
            <View style={{ marginTop:12 }}>
              {[...weightHistory].reverse().slice(0,5).map((entry,i) => (
                <View key={i} style={{ flexDirection:'row', justifyContent:'space-between', paddingVertical:7, borderBottomWidth:1, borderBottomColor:'#1F2937' }}>
                  <Text style={{ color:C.muted, fontSize:13 }}>{entry.date}</Text>
                  <Text style={{ color:i===0?C.green:C.text, fontWeight:'700' }}>{entry.weight} kg</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Workout consistency */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom:14 }]}>Consistencia</Text>
            <View style={{ flexDirection:'row', gap:10 }}>
              <LinearGradient colors={['#F9731622','#13131A']} style={[styles.statCard, { flex:1 }]}>
                <Ionicons name="barbell" size={24} color={C.orange} />
                <Text style={{ color:C.orange, fontSize:28, fontWeight:'900', marginTop:6 }}>{workoutDays}</Text>
                <Text style={{ color:C.muted, fontSize:11 }}>Días entrenados</Text>
              </LinearGradient>
              <LinearGradient colors={['#EC489922','#13131A']} style={[styles.statCard, { flex:1 }]}>
                <Ionicons name="flame" size={24} color="#EC4899" />
                <Text style={{ color:'#EC4899', fontSize:28, fontWeight:'900', marginTop:6 }}>
                  {workoutDays>0?Math.round((workoutDays/30)*100):0}%
                </Text>
                <Text style={{ color:C.muted, fontSize:11 }}>Adherencia</Text>
              </LinearGradient>
            </View>
          </View>

          {/* IMC */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom:14 }]}>Índice de Masa Corporal</Text>
            <View style={{ flexDirection:'row', justifyContent:'space-around' }}>
              <View style={{ alignItems:'center' }}>
                <Text style={{ color:imcColor, fontSize:36, fontWeight:'900' }}>{imc}</Text>
                <View style={{ backgroundColor:imcColor+'22', paddingHorizontal:10, paddingVertical:3, borderRadius:20, marginTop:4 }}>
                  <Text style={{ color:imcColor, fontWeight:'700', fontSize:12 }}>{imcCat}</Text>
                </View>
                <Text style={{ color:C.muted, fontSize:11, marginTop:4 }}>IMC actual</Text>
              </View>
              <View style={{ width:1, backgroundColor:C.border }} />
              <View style={{ alignItems:'center' }}>
                <Text style={{ color:C.green, fontSize:36, fontWeight:'900' }}>{imcGoal}</Text>
                <View style={{ backgroundColor:C.green+'22', paddingHorizontal:10, paddingVertical:3, borderRadius:20, marginTop:4 }}>
                  <Text style={{ color:C.green, fontWeight:'700', fontSize:12 }}>Peso normal</Text>
                </View>
                <Text style={{ color:C.muted, fontSize:11, marginTop:4 }}>IMC objetivo</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showWeightModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ color:C.text, fontSize:18, fontWeight:'900', marginBottom:4 }}>Registrar peso</Text>
            <Text style={{ color:C.muted, marginBottom:20 }}>Actual: {user.weight} kg</Text>
            <TextInput style={styles.input} placeholder="Ej: 78.5" placeholderTextColor='#4B5563'
              value={newWeight} onChangeText={setNewWeight} keyboardType="decimal-pad" autoFocus />
            <View style={{ flexDirection:'row', gap:10, marginTop:16 }}>
              <TouchableOpacity onPress={() => setShowWeightModal(false)} style={[styles.btn, { flex:1, backgroundColor:'#1F2937' }]}>
                <Text style={{ color:C.muted, fontWeight:'700' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddWeight} style={[styles.btn, { flex:1, backgroundColor:C.green }]}>
                <Text style={{ color:C.bg, fontWeight:'900' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal:16, paddingBottom:16, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  addBtn: { width:46, height:46, borderRadius:23, backgroundColor:C.green, alignItems:'center', justifyContent:'center' },
  card: { backgroundColor:'#13131A', borderRadius:18, padding:16, borderWidth:1, borderColor:'#1F2937' },
  cardTitle: { color:'#FFFFFF', fontSize:15, fontWeight:'800' },
  statCard: { borderRadius:14, padding:14, alignItems:'center', borderWidth:1, borderColor:'#1F2937' },
  aiStat: { backgroundColor:'#1F2937', borderRadius:10, padding:10, alignItems:'center', gap:4 },
  modalOverlay: { flex:1, backgroundColor:'#000000DD', justifyContent:'flex-end' },
  modalContent: { backgroundColor:'#13131A', borderTopLeftRadius:24, borderTopRightRadius:24, padding:24 },
  input: { backgroundColor:'#0A0A0F', borderRadius:12, padding:16, color:'#FFFFFF', fontSize:20, fontWeight:'700', borderWidth:1, borderColor:'#1F2937', textAlign:'center' },
  btn: { padding:14, borderRadius:12, alignItems:'center' },
});
