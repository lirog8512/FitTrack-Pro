import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../Context/AppContext';

const C = { bg:'#0A0A0F', card:'#13131A', green:'#22C55E', blue:'#3B82F6', orange:'#F97316', text:'#FFFFFF', muted:'#6B7280', border:'#1F2937', purple:'#A855F7', red:'#EF4444', pink:'#EC4899' };

const CAT = {
  chest:     { grad:['#3B82F6','#1D4ED8'], emoji:'🏋️', label:'Pecho' },
  back:      { grad:['#22C55E','#15803D'], emoji:'💪', label:'Espalda' },
  shoulders: { grad:['#A855F7','#7E22CE'], emoji:'⚡', label:'Hombros' },
  legs:      { grad:['#F97316','#C2410C'], emoji:'🦵', label:'Piernas' },
  arms:      { grad:['#EC4899','#BE185D'], emoji:'💪', label:'Brazos' },
  core:      { grad:['#F59E0B','#B45309'], emoji:'🔥', label:'Core' },
};

const PLAN = [
  { day:'Lunes', name:'Empuje', full:'Pecho · Hombros · Tríceps', icon:'fitness', color:'#3B82F6', duration:'55 min',
    exercises:[
      { name:'Press de banca plano', sets:4, repsTarget:'10-12', rest:'90s', category:'chest', muscles:['Pecho','Tríceps'],
        note:'⚠️ Evita grip muy cerrado', tips:['Espalda pegada al banco','Baja controlado al pecho','Codos 45° del cuerpo','Exhala al empujar'] },
      { name:'Press inclinado con mancuernas', sets:3, repsTarget:'12', rest:'90s', category:'chest', muscles:['Pecho superior','Bíceps'],
        note:'Rango parcial si molesta el bícep', tips:['Banco a 30-45°','Mancuernas alineadas con pecho','No bloquees codos','Movimiento controlado'] },
      { name:'Aperturas en polea baja', sets:3, repsTarget:'15', rest:'60s', category:'chest', muscles:['Pecho','Core'],
        note:'Control excéntrico lento', tips:['Ligera inclinación adelante','Arco en el movimiento','Squeeze en el pico','No balances el torso'] },
      { name:'Press militar mancuernas sentado', sets:4, repsTarget:'10-12', rest:'90s', category:'shoulders', muscles:['Deltoides','Tríceps'],
        note:'Espalda apoyada, evita lumbar', tips:['Sentado con respaldo','Mancuernas a nivel de orejas','Empuja en línea recta','No hiperextiendas lumbar'] },
      { name:'Elevaciones laterales', sets:3, repsTarget:'15-20', rest:'60s', category:'shoulders', muscles:['Deltoides lateral'],
        note:'Peso ligero, codo ligeramente flexionado', tips:['Ligera flexión de codo','Sube hasta paralelo','Control en la bajada','No uses momentum'] },
      { name:'Fondos en banco (asistido)', sets:3, repsTarget:'15', rest:'60s', category:'arms', muscles:['Tríceps','Pecho'],
        note:'Sin bajar demasiado para el bícep', tips:['Manos cerca del cuerpo','Baja hasta 90°','No vayas más abajo','Empuja con tríceps'] },
      { name:'Extensión tríceps polea', sets:3, repsTarget:'15', rest:'60s', category:'arms', muscles:['Tríceps'],
        note:'Ideal para no forzar bíceps', tips:['Codos pegados al cuerpo','Extiende completamente','Control al subir','Postura erecta'] },
    ]
  },
  { day:'Martes', name:'Tracción', full:'Espalda · Bíceps suave', icon:'body', color:'#22C55E', duration:'55 min',
    exercises:[
      { name:'Remo con barra en T (apoyado)', sets:4, repsTarget:'10-12', rest:'90s', category:'back', muscles:['Espalda media','Bíceps'],
        note:'✅ Ideal para L4-L5 – pecho apoyado', tips:['Pecho sobre el pad','Codos hacia arriba','Squeeze en el pico','Control al bajar'] },
      { name:'Jalones polea al pecho (agarre ancho)', sets:4, repsTarget:'12', rest:'90s', category:'back', muscles:['Dorsal','Bíceps'],
        note:'No tirar del cuello, espalda recta', tips:['Ligera inclinación atrás','Jala hasta clavículas','Codos hacia caderas','Squeeze dorsal'] },
      { name:'Remo en polea baja sentado', sets:3, repsTarget:'12', rest:'90s', category:'back', muscles:['Espalda media','Romboides'],
        note:'No curvar lumbar al tirar', tips:['Espalda neutra','Tira hacia ombligo','Codos junto al cuerpo','No te balancees'] },
      { name:'Pullover con mancuerna', sets:3, repsTarget:'12-15', rest:'60s', category:'back', muscles:['Dorsal','Serrato'],
        note:'Excelente para espalda sin carga lumbar', tips:['Tumbado transversal en banco','Arco natural de espalda','Baja con control','No dejes caer los codos'] },
      { name:'Face pulls en polea', sets:3, repsTarget:'15', rest:'60s', category:'shoulders', muscles:['Deltoides posterior','Manguito'],
        note:'Salud de hombros y postura', tips:['Polea a altura de cara','Codos altos','Tira hacia la frente','Rotación externa al final'] },
      { name:'Curl martillo con mancuernas', sets:3, repsTarget:'12', rest:'60s', category:'arms', muscles:['Bíceps','Braquial'],
        note:'⚠️ Solo si no hay molestia en tendón', tips:['Codos pegados al cuerpo','Agarre neutro (martillo)','Sube controlado','Baja lento 3 segundos'] },
      { name:'Curl en polea baja', sets:2, repsTarget:'15', rest:'60s', category:'arms', muscles:['Bíceps'],
        note:'Alternativa más segura para bíceps', tips:['Codos fijos al cuerpo','Contracción completa arriba','Tensión constante','Peso ligero-moderado'] },
    ]
  },
  { day:'Miércoles', name:'Piernas', full:'Cuádriceps · Isquios · Glúteos', icon:'walk', color:'#F97316', duration:'60 min',
    exercises:[
      { name:'Prensa de piernas 45°', sets:4, repsTarget:'12-15', rest:'90s', category:'legs', muscles:['Cuádriceps','Glúteos'],
        note:'✅ Mejor que squat para L4-L5', tips:['Pies a anchura de hombros','Rodillas alineadas con pies','No bloquees rodillas','Control en la bajada'] },
      { name:'Extensión de cuádriceps en máquina', sets:3, repsTarget:'15', rest:'60s', category:'legs', muscles:['Cuádriceps'],
        note:'Rango completo, sin peso excesivo', tips:['Rodillo sobre empeine','Extiende completamente','Pausa 1s arriba','Baja controlado'] },
      { name:'Curl femoral tumbado', sets:3, repsTarget:'12-15', rest:'60s', category:'legs', muscles:['Isquiotibiales'],
        note:'Control en la bajada', tips:['Cadera pegada al pad','Curl hasta 90°','No levantes caderas','Baja lento'] },
      { name:'Hip thrust con barra', sets:4, repsTarget:'12', rest:'90s', category:'legs', muscles:['Glúteos','Isquios'],
        note:'✅ Glúteo sin carga lumbar directa', tips:['Hombros en banco bajo','Barra sobre cadera con pad','Empuja con talones','Squeeze glúteo arriba'] },
      { name:'Zancadas caminando (sin peso)', sets:3, repsTarget:'20 pasos', rest:'60s', category:'legs', muscles:['Cuádriceps','Glúteos'],
        note:'Si molesta la espalda, hacerlas estáticas', tips:['Paso largo adelante','Rodilla trasera casi toca suelo','Torso erecto','Empuja con pie delantero'] },
      { name:'Elevación de gemelos de pie', sets:4, repsTarget:'20', rest:'45s', category:'legs', muscles:['Gastrocnemio','Sóleo'],
        note:'Rango completo, pausa arriba', tips:['Punta de pies en escalón','Baja completamente','Sube en 1s, baja en 3s','Pausa 1s arriba'] },
    ]
  },
  { day:'Jueves', name:'Core + Movilidad', full:'Core · Estabilidad', icon:'aperture', color:'#A855F7', duration:'40 min',
    exercises:[
      { name:'Dead bug', sets:3, repsTarget:'10/lado', rest:'45s', category:'core', muscles:['Core','Transverso'],
        note:'✅ Excelente para L4-L5, protege disco', tips:['Lumbar pegada al suelo','Extiende brazo y pierna opuesta','Exhala al extender','Movimiento lento'] },
      { name:'Plancha frontal', sets:3, repsTarget:'45s', rest:'45s', category:'core', muscles:['Core','Hombros'],
        note:'Cuerpo recto como tabla', tips:['Codos bajo los hombros','Caderas niveladas','Contrae glúteos y abdomen','Respira normalmente'] },
      { name:'Bird dog', sets:3, repsTarget:'10/lado', rest:'45s', category:'core', muscles:['Lumbar','Glúteos'],
        note:'✅ Fortalece lumbar de forma segura', tips:['En cuadrupedia','Extiende brazo y pierna opuestos','Mantén cadera nivelada','Control total'] },
      { name:'Plancha lateral', sets:3, repsTarget:'30s/lado', rest:'45s', category:'core', muscles:['Oblicuos','Core lateral'],
        note:'Progresión: apoya rodilla si hace falta', tips:['Codo bajo el hombro','Caderas levantadas','Cuerpo en línea recta','No dejes caer la cadera'] },
      { name:'Crunch en polea', sets:3, repsTarget:'15', rest:'45s', category:'core', muscles:['Recto abdominal'],
        note:'Carga moderada, técnica correcta', tips:['Polea alta, arrodillado','Flexiona desde la cintura','Lleva codos a rodillas','No tires con brazos'] },
    ]
  },
  { day:'Viernes', name:'Full Body', full:'Fuerza + Funcional', icon:'flash', color:'#EC4899', duration:'60 min',
    exercises:[
      { name:'Prensa de piernas (ligero)', sets:3, repsTarget:'15', rest:'60s', category:'legs', muscles:['Piernas completo'],
        note:'Peso 20% menos que miércoles', tips:['Foco en la técnica','Rango completo','Ritmo constante','Recuperación activa'] },
      { name:'Remo en máquina', sets:3, repsTarget:'12', rest:'60s', category:'back', muscles:['Espalda','Bíceps'],
        note:'Alternativa segura sin carga libre', tips:['Pecho contra el pad','Codos hacia atrás','Squeeze espalda','Baja controlado'] },
      { name:'Press en máquina pecho', sets:3, repsTarget:'12', rest:'60s', category:'chest', muscles:['Pecho','Tríceps'],
        note:'Máquina más segura que libre', tips:['Ajusta el asiento','Empuja horizontal','No bloquees codos','Control total'] },
      { name:'Elevaciones laterales', sets:3, repsTarget:'15', rest:'60s', category:'shoulders', muscles:['Deltoides'],
        note:'Peso ligero, alta repetición', tips:['Codo ligeramente flexionado','Sube hasta paralelo','No uses inercia','Concentración muscular'] },
      { name:'Plancha + variaciones', sets:3, repsTarget:'40s', rest:'45s', category:'core', muscles:['Core completo'],
        note:'Alterna frontal, lateral, bird dog', tips:['Activa todo el core','Respira normalmente','No aguantes el aliento','Progresión gradual'] },
    ]
  },
];

function ExerciseModal({ exercise, dayDate, visible, onClose }) {
  const { logWorkoutSets, getExerciseHistory } = useApp();
  const [sets, setSets] = useState(() =>
    Array.from({ length: exercise?.sets || 3 }, (_, i) => ({ set: i+1, weight:'', reps:'' }))
  );
  const [showTips, setShowTips] = useState(false);
  const history = exercise ? getExerciseHistory(exercise.name) : [];
  const lastSession = history[0];

  if (!exercise) return null;
  const cat = CAT[exercise.category] || CAT.core;

  function updateSet(index, field, value) {
    setSets(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  }

  function parseTarget(repsTarget) {
    const match = String(repsTarget).match(/\d+/);
    return match ? parseInt(match[0]) : 10;
  }

  function isSetGood(set) {
    if (!set.reps) return null;
    return parseInt(set.reps) >= parseTarget(exercise.repsTarget);
  }

  function saveAndClose() {
    const filled = sets.filter(s => s.weight || s.reps);
    if (filled.length > 0) logWorkoutSets(dayDate, exercise.name, sets);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={exStyles.overlay}>
        <View style={exStyles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <LinearGradient colors={[cat.grad[0]+'33','#13131A']} style={exStyles.header}>
              <View style={{ flexDirection:'row', gap:14, alignItems:'center' }}>
                <LinearGradient colors={cat.grad} style={{ width:90, height:90, borderRadius:18, alignItems:'center', justifyContent:'center' }}>
                  <Text style={{ fontSize:42 }}>{cat.emoji}</Text>
                  <Text style={{ color:'#fff', fontSize:10, fontWeight:'800', marginTop:2 }}>{cat.label}</Text>
                </LinearGradient>
                <View style={{ flex:1 }}>
                  <Text style={{ color:C.text, fontSize:16, fontWeight:'900', lineHeight:22 }}>{exercise.name}</Text>
                  <View style={{ flexDirection:'row', flexWrap:'wrap', gap:4, marginTop:6 }}>
                    {exercise.muscles.map((m,i) => (
                      <View key={i} style={{ backgroundColor:cat.grad[0]+'33', paddingHorizontal:8, paddingVertical:3, borderRadius:20 }}>
                        <Text style={{ color:cat.grad[0], fontSize:10, fontWeight:'700' }}>{m}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={{ color:C.muted, fontSize:11, marginTop:6, lineHeight:16 }}>{exercise.note}</Text>
                </View>
              </View>
              <View style={{ flexDirection:'row', gap:8, marginTop:14 }}>
                {[
                  { icon:'layers-outline', val:`${exercise.sets} series` },
                  { icon:'repeat', val:exercise.repsTarget+' reps' },
                  { icon:'timer-outline', val:exercise.rest+' desc.' },
                ].map((s,i) => (
                  <View key={i} style={{ flex:1, backgroundColor:'#1F293780', borderRadius:10, padding:8, alignItems:'center', gap:3 }}>
                    <Ionicons name={s.icon} size={14} color={C.muted} />
                    <Text style={{ color:C.text, fontSize:11, fontWeight:'700', textAlign:'center' }}>{s.val}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>

            <TouchableOpacity onPress={() => setShowTips(!showTips)} style={exStyles.tipsToggle}>
              <Ionicons name="bulb-outline" size={14} color={C.orange} />
              <Text style={{ color:C.orange, fontSize:12, fontWeight:'700', flex:1 }}>Técnica correcta</Text>
              <Ionicons name={showTips?'chevron-up':'chevron-down'} size={14} color={C.muted} />
            </TouchableOpacity>
            {showTips && (
              <View style={{ paddingHorizontal:16, paddingBottom:12, gap:6 }}>
                {exercise.tips.map((tip,i) => (
                  <View key={i} style={{ flexDirection:'row', gap:8, alignItems:'flex-start' }}>
                    <View style={{ width:20, height:20, borderRadius:10, backgroundColor:C.orange+'22', alignItems:'center', justifyContent:'center', marginTop:1 }}>
                      <Text style={{ color:C.orange, fontSize:10, fontWeight:'900' }}>{i+1}</Text>
                    </View>
                    <Text style={{ color:C.muted, fontSize:12, flex:1, lineHeight:18 }}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {lastSession && (
              <View style={{ marginHorizontal:16, marginBottom:12, backgroundColor:'#1F293780', borderRadius:14, padding:12 }}>
                <Text style={{ color:C.muted, fontSize:11, marginBottom:8 }}>📊 Última sesión · {lastSession.date}</Text>
                <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6 }}>
                  {lastSession.sets.map((s,i) => (
                    <View key={i} style={{ backgroundColor:'#0A0A0F', borderRadius:8, paddingHorizontal:10, paddingVertical:5 }}>
                      <Text style={{ color:C.blue, fontSize:12, fontWeight:'700' }}>
                        S{s.set}: {s.weight||'?'}kg × {s.reps||'?'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={{ paddingHorizontal:16, marginBottom:16 }}>
              <Text style={{ color:C.text, fontWeight:'800', fontSize:14, marginBottom:10 }}>📝 Registrar series</Text>
              <View style={{ flexDirection:'row', marginBottom:8, paddingHorizontal:4 }}>
                <Text style={{ color:C.muted, fontSize:10, width:36 }}>Serie</Text>
                <Text style={{ color:C.muted, fontSize:10, width:70 }}>Objetivo</Text>
                <Text style={{ color:C.muted, fontSize:10, flex:1, textAlign:'center' }}>Peso (kg)</Text>
                <Text style={{ color:C.muted, fontSize:10, flex:1, textAlign:'center' }}>Reps</Text>
                <Text style={{ color:C.muted, fontSize:10, width:30, textAlign:'center' }}>✓</Text>
              </View>
              {sets.map((s, i) => {
                const good = isSetGood(s);
                const prevSet = lastSession?.sets?.[i];
                const prevWeight = prevSet?.weight ? parseFloat(prevSet.weight) : null;
                const currWeight = s.weight ? parseFloat(s.weight) : null;
                const delta = (prevWeight && currWeight) ? (currWeight - prevWeight) : null;
                return (
                  <View key={i} style={{ marginBottom:6 }}>
                    <View style={[exStyles.setRow, good===true && { borderColor:C.green+'66' }, good===false && { borderColor:C.red+'66' }]}>
                      <LinearGradient colors={cat.grad} style={exStyles.setNum}>
                        <Text style={{ color:'#fff', fontWeight:'900', fontSize:13 }}>{s.set}</Text>
                      </LinearGradient>
                      <Text style={{ color:C.muted, fontSize:11, width:70 }}>{exercise.repsTarget}</Text>
                      <TextInput
                        style={exStyles.input} value={s.weight}
                        onChangeText={v => updateSet(i, 'weight', v)}
                        keyboardType="decimal-pad" placeholder="kg"
                        placeholderTextColor='#374151'
                      />
                      <TextInput
                        style={exStyles.input} value={s.reps}
                        onChangeText={v => updateSet(i, 'reps', v)}
                        keyboardType="numeric" placeholder="reps"
                        placeholderTextColor='#374151'
                      />
                      <View style={{ width:30, alignItems:'center' }}>
                        {good===true && <Ionicons name="checkmark-circle" size={22} color={C.green} />}
                        {good===false && <Ionicons name="close-circle" size={22} color={C.red} />}
                        {good===null && <View style={{ width:20, height:20, borderRadius:10, borderWidth:1.5, borderColor:C.border }} />}
                      </View>
                    </View>
                    {delta !== null && (
                      <Text style={{ color: delta > 0 ? C.green : delta < 0 ? C.red : C.muted, fontSize:10, marginLeft:44, marginTop:2 }}>
                        {delta > 0 ? `↑ +${delta}kg vs última sesión` : delta < 0 ? `↓ ${delta}kg vs última sesión` : '= mismo peso que última vez'}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>

          <View style={{ flexDirection:'row', gap:10, padding:16, borderTopWidth:1, borderTopColor:C.border }}>
            <TouchableOpacity onPress={onClose} style={[exStyles.btn, { flex:1, backgroundColor:'#1F2937' }]}>
              <Text style={{ color:C.muted, fontWeight:'700' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveAndClose} style={[exStyles.btn, { flex:2, backgroundColor:cat.grad[0] }]}>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={{ color:'#fff', fontWeight:'900' }}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const exStyles = StyleSheet.create({
  overlay: { flex:1, backgroundColor:'#000000EE', justifyContent:'flex-end' },
  container: { backgroundColor:C.bg, borderTopLeftRadius:28, borderTopRightRadius:28, maxHeight:'92%' },
  header: { padding:16, borderTopLeftRadius:28, borderTopRightRadius:28 },
  tipsToggle: { flexDirection:'row', alignItems:'center', gap:8, marginHorizontal:16, marginVertical:8, backgroundColor:'#F9731611', borderRadius:12, padding:12 },
  setRow: { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#13131A', borderRadius:12, padding:10, borderWidth:1, borderColor:C.border },
  setNum: { width:28, height:28, borderRadius:8, alignItems:'center', justifyContent:'center' },
  input: { flex:1, backgroundColor:'#0A0A0F', borderRadius:8, padding:8, color:C.text, fontSize:14, fontWeight:'700', textAlign:'center', borderWidth:1, borderColor:C.border },
  btn: { flexDirection:'row', gap:6, padding:14, borderRadius:14, alignItems:'center', justifyContent:'center' },
});

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { completedWorkouts, completeWorkout, workoutHistory } = useApp();
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const today = new Date().toISOString().split('T')[0];
  const todayName = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][new Date().getDay()];
  const dayDate = today;

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom:100 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#13131A','#0A0A0F']} style={{ paddingTop:insets.top+16, paddingBottom:16, paddingHorizontal:16 }}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
            <View>
              <Text style={{ color:C.text, fontSize:24, fontWeight:'900' }}>Entrenamiento 💪</Text>
              <Text style={{ color:C.muted, fontSize:13, marginTop:2 }}>Plan 5 días · lesiones consideradas</Text>
            </View>
            <View style={{ backgroundColor:'#F9731622', borderRadius:12, paddingHorizontal:10, paddingVertical:6, flexDirection:'row', gap:6, alignItems:'center' }}>
              <Ionicons name="shield-checkmark" size={14} color={C.orange} />
              <Text style={{ color:C.orange, fontSize:11, fontWeight:'700' }}>Adaptado</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={{ padding:16, gap:12 }}>
          <LinearGradient colors={['#F9731611','#13131A']} style={styles.injuryBanner}>
            <Text style={{ color:C.orange, fontWeight:'700', fontSize:12, marginBottom:4 }}>⚠️ Lesiones consideradas en todos los ejercicios</Text>
            <Text style={{ color:C.muted, fontSize:11, lineHeight:17 }}>
              Tendones de bíceps — Sin supinación forzada ni cargas excéntricas pesadas{'\n'}
              Protrusión L4-L5 — Sin cargas axiales en columna, core prioritario
            </Text>
          </LinearGradient>

          {PLAN.map((plan, i) => {
            const isToday = plan.day.startsWith(todayName);
            const isCompleted = !!completedWorkouts[today] && completedWorkouts[today] === plan.name;
            const isOpen = selectedDay === i;
            const doneExercises = PLAN[i].exercises.filter(e => workoutHistory[dayDate]?.[e.name]).length;

            return (
              <View key={i}>
                <TouchableOpacity onPress={() => setSelectedDay(isOpen ? null : i)} activeOpacity={0.8}>
                  <LinearGradient
                    colors={isToday ? [plan.color+'33','#13131A'] : ['#13131A','#0D0D14']}
                    style={[styles.dayCard, isToday && { borderColor:plan.color+'55' }]}
                  >
                    <View style={[styles.dayIcon, { backgroundColor:plan.color+'22' }]}>
                      <Ionicons name={plan.icon} size={22} color={plan.color} />
                    </View>
                    <View style={{ flex:1 }}>
                      <View style={{ flexDirection:'row', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                        <Text style={{ color:isToday?plan.color:C.muted, fontSize:12, fontWeight:'700' }}>{plan.day}</Text>
                        {isToday && <View style={{ backgroundColor:plan.color, borderRadius:6, paddingHorizontal:6, paddingVertical:1 }}>
                          <Text style={{ color:'#fff', fontSize:9, fontWeight:'900' }}>HOY</Text>
                        </View>}
                        {isCompleted && <Ionicons name="checkmark-circle" size={14} color={C.green} />}
                      </View>
                      <Text style={{ color:C.text, fontSize:15, fontWeight:'800' }}>{plan.name}</Text>
                      <Text style={{ color:C.muted, fontSize:11, marginTop:1 }}>{plan.full}</Text>
                      <View style={{ flexDirection:'row', gap:12, marginTop:6 }}>
                        <Text style={{ color:C.muted, fontSize:10 }}>⏱ {plan.duration}</Text>
                        <Text style={{ color:C.muted, fontSize:10 }}>🏋️ {plan.exercises.length} ejercicios</Text>
                        {isOpen && doneExercises > 0 && (
                          <Text style={{ color:C.green, fontSize:10 }}>✓ {doneExercises}/{plan.exercises.length} listos</Text>
                        )}
                      </View>
                    </View>
                    <Ionicons name={isOpen?'chevron-up':'chevron-down'} size={20} color={C.muted} />
                  </LinearGradient>
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.exerciseList}>
                    {plan.exercises.map((ex, j) => {
                      const isDone = !!workoutHistory[dayDate]?.[ex.name];
                      const cat = CAT[ex.category] || CAT.core;
                      const savedSets = workoutHistory[dayDate]?.[ex.name] || [];
                      const totalReps = savedSets.reduce ? savedSets.reduce((acc, s) => acc + (parseInt(s.reps)||0), 0) : 0;
                      const maxWeight = savedSets.reduce ? savedSets.reduce((max, s) => Math.max(max, parseFloat(s.weight)||0), 0) : 0;
                      return (
                        <TouchableOpacity key={j} onPress={() => setSelectedExercise(ex)} activeOpacity={0.8}>
                          <View style={[styles.exRow, isDone && { borderColor:C.green+'55', backgroundColor:'#052005' }]}>
                            <LinearGradient colors={cat.grad} style={styles.exIcon}>
                              <Text style={{ fontSize:18 }}>{cat.emoji}</Text>
                            </LinearGradient>
                            <View style={{ flex:1 }}>
                              <Text style={{ color:C.text, fontWeight:'700', fontSize:13 }}>{ex.name}</Text>
                              <Text style={{ color:C.muted, fontSize:11, marginTop:2 }}>
                                {ex.sets} × {ex.repsTarget} · {ex.rest}
                              </Text>
                              {isDone && (
                                <Text style={{ color:C.green, fontSize:10, marginTop:2 }}>
                                  ✓ {totalReps} reps totales · máx {maxWeight}kg
                                </Text>
                              )}
                            </View>
                            <View style={{ alignItems:'center', gap:4 }}>
                              {isDone
                                ? <Ionicons name="checkmark-circle" size={24} color={C.green} />
                                : <View style={{ width:24, height:24, borderRadius:12, borderWidth:1.5, borderColor:C.border }} />
                              }
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}

                    <TouchableOpacity
                      onPress={() => {
                        completeWorkout(plan.name);
                        Alert.alert('💪 ¡Entreno completado!', `${plan.name} registrado.\n¡Excelente trabajo, Lenin!`);
                      }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient colors={[plan.color, plan.color+'99']} style={styles.completeBtn}>
                        <Ionicons name="trophy" size={18} color="#fff" />
                        <Text style={{ color:'#fff', fontWeight:'900', fontSize:14 }}>Finalizar {plan.name}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <ExerciseModal
        exercise={selectedExercise}
        dayDate={dayDate}
        visible={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  injuryBanner: { borderRadius:16, padding:14, borderWidth:1, borderColor:'#F9731633' },
  dayCard: { borderRadius:18, padding:14, flexDirection:'row', alignItems:'center', gap:12, borderWidth:1, borderColor:C.border },
  dayIcon: { width:48, height:48, borderRadius:14, alignItems:'center', justifyContent:'center' },
  exerciseList: { backgroundColor:'#0D0D14', marginTop:2, borderRadius:16, padding:12, gap:6, borderWidth:1, borderColor:C.border },
  exRow: { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#13131A', borderRadius:12, padding:12, borderWidth:1, borderColor:C.border },
  exIcon: { width:42, height:42, borderRadius:12, alignItems:'center', justifyContent:'center' },
  completeBtn: { flexDirection:'row', gap:8, alignItems:'center', justifyContent:'center', padding:14, borderRadius:14, marginTop:4 },
});
