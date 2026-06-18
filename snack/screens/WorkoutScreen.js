import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, Image } from 'react-native';
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

const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const EXERCISE_IMAGES = {
  'Press de banca plano':                    BASE+'0006/0.jpg',
  'Press inclinado con mancuernas':          BASE+'0198/0.jpg',
  'Aperturas en polea baja':                 BASE+'0060/0.jpg',
  'Press militar mancuernas sentado':        BASE+'0313/0.jpg',
  'Elevaciones laterales':                   BASE+'0032/0.jpg',
  'Fondos en banco (asistido)':              BASE+'0076/0.jpg',
  'Extensión tríceps polea':                 BASE+'0128/0.jpg',
  'Remo con barra en T (apoyado)':           BASE+'0046/0.jpg',
  'Jalones polea al pecho (agarre ancho)':   BASE+'0094/0.jpg',
  'Remo en polea baja sentado':              BASE+'0086/0.jpg',
  'Pullover con mancuerna':                  BASE+'0222/0.jpg',
  'Face pulls en polea':                     BASE+'0385/0.jpg',
  'Curl martillo con mancuernas':            BASE+'0052/0.jpg',
  'Curl en polea baja':                      BASE+'0064/0.jpg',
  'Prensa de piernas 45°':                   BASE+'0101/0.jpg',
  'Extensión de cuádriceps en máquina':      BASE+'0103/0.jpg',
  'Curl femoral tumbado':                    BASE+'0102/0.jpg',
  'Hip thrust con barra':                    BASE+'0355/0.jpg',
  'Zancadas caminando (sin peso)':           BASE+'0108/0.jpg',
  'Elevación de gemelos de pie':             BASE+'0115/0.jpg',
  'Dead bug':                                BASE+'0172/0.jpg',
  'Plancha frontal':                         BASE+'0172/0.jpg',
  'Bird dog':                                BASE+'0173/0.jpg',
  'Plancha lateral':                         BASE+'0173/0.jpg',
  'Crunch en polea':                         BASE+'0070/0.jpg',
  'Prensa de piernas (ligero)':              BASE+'0101/0.jpg',
  'Remo en máquina':                         BASE+'0086/0.jpg',
  'Press en máquina pecho':                  BASE+'0006/0.jpg',
  'Plancha + variaciones':                   BASE+'0172/0.jpg',
};

const PLAN = [
  { day:'Lunes', name:'Empuje', full:'Pecho · Hombros · Tríceps', icon:'fitness', color:'#3B82F6', duration:'55 min',
    exercises:[
      { name:'Press de banca plano', sets:4, repsTarget:'10-12', rest:'90s', category:'chest', muscles:['Pecho','Tríceps'],
        note:'⚠️ Evita grip muy cerrado', tips:['Espalda pegada al banco todo el movimiento','Baja la barra controlado hasta tocar el pecho','Codos a 45° — no abrir en exceso','Exhala al empujar, inhala al bajar'] },
      { name:'Press inclinado con mancuernas', sets:3, repsTarget:'12', rest:'90s', category:'chest', muscles:['Pecho superior','Bíceps'],
        note:'Rango parcial si molesta el bícep', tips:['Banco a 30-45° de inclinación','Mancuernas alineadas con el pecho','No bloquees los codos arriba del todo','Movimiento controlado, 2s subir 3s bajar'] },
      { name:'Aperturas en polea baja', sets:3, repsTarget:'15', rest:'60s', category:'chest', muscles:['Pecho','Core'],
        note:'Control excéntrico lento', tips:['Ligera inclinación del torso hacia adelante','Traza un arco amplio con los brazos','Squeeze fuerte en el pico del movimiento','No balances el torso, trabaja solo el pecho'] },
      { name:'Press militar mancuernas sentado', sets:4, repsTarget:'10-12', rest:'90s', category:'shoulders', muscles:['Deltoides','Tríceps'],
        note:'Espalda apoyada, evita lumbar', tips:['Siéntate con respaldo para proteger la lumbar','Mancuernas a nivel de las orejas al bajar','Empuja en línea recta hacia arriba','No arquees la espalda baja en ningún momento'] },
      { name:'Elevaciones laterales', sets:3, repsTarget:'15-20', rest:'60s', category:'shoulders', muscles:['Deltoides lateral'],
        note:'Peso ligero, codo ligeramente flexionado', tips:['Codo ligeramente flexionado durante todo el mov.','Sube hasta que los brazos estén paralelos al suelo','Control total en la bajada — 3 segundos','No uses inercia ni momentum con el torso'] },
      { name:'Fondos en banco (asistido)', sets:3, repsTarget:'15', rest:'60s', category:'arms', muscles:['Tríceps','Pecho'],
        note:'Sin bajar demasiado para el bícep', tips:['Manos cerca del cuerpo, dedos hacia adelante','Baja hasta que los codos lleguen a 90°','No vayas más abajo — protege el bícep','Empuja exclusivamente con los tríceps'] },
      { name:'Extensión tríceps polea', sets:3, repsTarget:'15', rest:'60s', category:'arms', muscles:['Tríceps'],
        note:'Ideal para no forzar bíceps', tips:['Codos pegados al cuerpo en todo momento','Extiende completamente los brazos abajo','Control al subir — no dejes caer el peso','Mantén postura erecta y core activado'] },
    ]
  },
  { day:'Martes', name:'Tracción', full:'Espalda · Bíceps suave', icon:'body', color:'#22C55E', duration:'55 min',
    exercises:[
      { name:'Remo con barra en T (apoyado)', sets:4, repsTarget:'10-12', rest:'90s', category:'back', muscles:['Espalda media','Bíceps'],
        note:'✅ Ideal para L4-L5 – pecho apoyado', tips:['Pecho apoyado sobre el pad en todo momento','Lleva los codos hacia arriba y atrás','Squeeze en la espalda media en el pico','Control al bajar — no dejes caer el peso'] },
      { name:'Jalones polea al pecho (agarre ancho)', sets:4, repsTarget:'12', rest:'90s', category:'back', muscles:['Dorsal','Bíceps'],
        note:'No tirar del cuello, espalda recta', tips:['Ligera inclinación del torso hacia atrás','Jala la barra hasta las clavículas','Lleva los codos hacia las caderas y abajo','Squeeze del dorsal antes de soltar'] },
      { name:'Remo en polea baja sentado', sets:3, repsTarget:'12', rest:'90s', category:'back', muscles:['Espalda media','Romboides'],
        note:'No curvar lumbar al tirar', tips:['Espalda en posición neutra durante todo el mov.','Tira el mango hacia el ombligo','Codos junto al cuerpo — no abiertos','No te balancees con el torso al tirar'] },
      { name:'Pullover con mancuerna', sets:3, repsTarget:'12-15', rest:'60s', category:'back', muscles:['Dorsal','Serrato'],
        note:'Excelente para espalda sin carga lumbar', tips:['Tumbado transversal sobre un banco plano','Mantén arco natural de la espalda','Baja la mancuerna con control detrás de la cabeza','No dejes caer los codos — mantén el arco'] },
      { name:'Face pulls en polea', sets:3, repsTarget:'15', rest:'60s', category:'shoulders', muscles:['Deltoides posterior','Manguito'],
        note:'Salud de hombros y postura', tips:['Polea a la altura de la cara o ligeramente superior','Codos altos — a la altura de los hombros','Tira hacia tu frente abriendo los codos','Rotación externa de hombro al final del movimiento'] },
      { name:'Curl martillo con mancuernas', sets:3, repsTarget:'12', rest:'60s', category:'arms', muscles:['Bíceps','Braquial'],
        note:'⚠️ Solo si no hay molestia en tendón', tips:['Codos pegados al cuerpo sin moverse','Agarre neutro (martillo) en todo el movimiento','Sube controlado hasta la contracción máxima','Baja lento en 3 segundos — fase excéntrica'] },
      { name:'Curl en polea baja', sets:2, repsTarget:'15', rest:'60s', category:'arms', muscles:['Bíceps'],
        note:'Alternativa más segura para bíceps', tips:['Codos fijos al cuerpo durante todo el movimiento','Contracción completa en la parte superior','Tensión constante gracias a la polea','Usa peso ligero-moderado para proteger el tendón'] },
    ]
  },
  { day:'Miércoles', name:'Piernas', full:'Cuádriceps · Isquios · Glúteos', icon:'walk', color:'#F97316', duration:'60 min',
    exercises:[
      { name:'Prensa de piernas 45°', sets:4, repsTarget:'12-15', rest:'90s', category:'legs', muscles:['Cuádriceps','Glúteos'],
        note:'✅ Mejor que squat para L4-L5', tips:['Pies a anchura de hombros en la plataforma','Rodillas alineadas con los pies al bajar','No bloquees las rodillas al extender','Control total en la fase de bajada'] },
      { name:'Extensión de cuádriceps en máquina', sets:3, repsTarget:'15', rest:'60s', category:'legs', muscles:['Cuádriceps'],
        note:'Rango completo, sin peso excesivo', tips:['Ajusta el rodillo justo sobre el empeine','Extiende completamente las piernas arriba','Pausa de 1 segundo en la contracción','Baja controlado — 3 segundos de bajada'] },
      { name:'Curl femoral tumbado', sets:3, repsTarget:'12-15', rest:'60s', category:'legs', muscles:['Isquiotibiales'],
        note:'Control en la bajada', tips:['Cadera pegada al pad en todo momento','Curl hasta que las piernas lleguen a 90°','No levantes las caderas al subir','Baja lento — fase excéntrica importante'] },
      { name:'Hip thrust con barra', sets:4, repsTarget:'12', rest:'90s', category:'legs', muscles:['Glúteos','Isquios'],
        note:'✅ Glúteo sin carga lumbar directa', tips:['Hombros apoyados en un banco bajo','Coloca pad acolchado entre barra y cadera','Empuja con los talones — no con punta del pie','Squeeze del glúteo máximo arriba del movimiento'] },
      { name:'Zancadas caminando (sin peso)', sets:3, repsTarget:'20 pasos', rest:'60s', category:'legs', muscles:['Cuádriceps','Glúteos'],
        note:'Si molesta la espalda, hacerlas estáticas', tips:['Da un paso largo hacia adelante','Rodilla trasera casi toca el suelo','Mantén el torso completamente erecto','Empuja con el pie delantero para avanzar'] },
      { name:'Elevación de gemelos de pie', sets:4, repsTarget:'20', rest:'45s', category:'legs', muscles:['Gastrocnemio','Sóleo'],
        note:'Rango completo, pausa arriba', tips:['Punta de pies en el borde de un escalón','Baja completamente estirando el gemelo','Sube en 1 segundo hasta la máxima contracción','Pausa de 1 segundo arriba antes de bajar'] },
    ]
  },
  { day:'Jueves', name:'Core + Movilidad', full:'Core · Estabilidad', icon:'aperture', color:'#A855F7', duration:'40 min',
    exercises:[
      { name:'Dead bug', sets:3, repsTarget:'10/lado', rest:'45s', category:'core', muscles:['Core','Transverso'],
        note:'✅ Excelente para L4-L5, protege disco', tips:['Lumbar completamente pegada al suelo siempre','Extiende brazo derecho + pierna izquierda juntos','Exhala lentamente al extender — 3 segundos','Vuelve al centro y alterna el lado'] },
      { name:'Plancha frontal', sets:3, repsTarget:'45s', rest:'45s', category:'core', muscles:['Core','Hombros'],
        note:'Cuerpo recto como tabla', tips:['Codos directamente debajo de los hombros','Caderas niveladas — ni arriba ni abajo','Contrae glúteos y abdomen todo el tiempo','Respira normalmente — no aguantes el aliento'] },
      { name:'Bird dog', sets:3, repsTarget:'10/lado', rest:'45s', category:'core', muscles:['Lumbar','Glúteos'],
        note:'✅ Fortalece lumbar de forma segura', tips:['En cuadrupedia — manos bajo hombros, rodillas bajo caderas','Extiende brazo y pierna opuestos simultáneamente','Mantén la cadera completamente nivelada','Vuelve lento al centro — control total'] },
      { name:'Plancha lateral', sets:3, repsTarget:'30s/lado', rest:'45s', category:'core', muscles:['Oblicuos','Core lateral'],
        note:'Progresión: apoya rodilla si hace falta', tips:['Codo directamente bajo el hombro','Caderas levantadas — cuerpo en línea recta','No dejes caer la cadera hacia el suelo','Activa el oblicuo — aprieta fuerte'] },
      { name:'Crunch en polea', sets:3, repsTarget:'15', rest:'45s', category:'core', muscles:['Recto abdominal'],
        note:'Carga moderada, técnica correcta', tips:['Polea alta, de rodillas frente a ella','Flexiona desde la cintura — no desde el cuello','Lleva los codos hacia las rodillas','No tires con los brazos — todo abdomen'] },
    ]
  },
  { day:'Viernes', name:'Full Body', full:'Fuerza + Funcional', icon:'flash', color:'#EC4899', duration:'60 min',
    exercises:[
      { name:'Prensa de piernas (ligero)', sets:3, repsTarget:'15', rest:'60s', category:'legs', muscles:['Piernas completo'],
        note:'Peso 20% menos que miércoles', tips:['Foco total en la técnica perfecta','Rango completo de movimiento','Ritmo constante y controlado','Recuperación activa — no descanses demasiado'] },
      { name:'Remo en máquina', sets:3, repsTarget:'12', rest:'60s', category:'back', muscles:['Espalda','Bíceps'],
        note:'Alternativa segura sin carga libre', tips:['Pecho contra el pad de soporte','Lleva los codos hacia atrás y arriba','Squeeze de la espalda en el pico','Baja controlado — 3 segundos'] },
      { name:'Press en máquina pecho', sets:3, repsTarget:'12', rest:'60s', category:'chest', muscles:['Pecho','Tríceps'],
        note:'Máquina más segura que libre', tips:['Ajusta el asiento a la altura correcta','Empuja horizontalmente con control','No bloquees los codos completamente','Control total en la fase excéntrica'] },
      { name:'Elevaciones laterales', sets:3, repsTarget:'15', rest:'60s', category:'shoulders', muscles:['Deltoides'],
        note:'Peso ligero alta repetición', tips:['Codo ligeramente flexionado','Sube hasta paralelo al suelo','No uses inercia ni momentum','Concentración muscular en deltoides'] },
      { name:'Plancha + variaciones', sets:3, repsTarget:'40s', rest:'45s', category:'core', muscles:['Core completo'],
        note:'Alterna frontal lateral bird dog', tips:['Activa todo el core desde el inicio','Respira de forma natural y constante','No aguantes el aliento en ningún momento','Progresión gradual cada semana'] },
    ]
  },
];

function ExerciseModal({ exercise, dayDate, visible, onClose }) {
  const { logWorkoutSets, getExerciseHistory } = useApp();
  const [sets, setSets] = useState([]);
  const [showTips, setShowTips] = useState(true);
  const [imgError, setImgError] = useState(false);

  React.useEffect(() => {
    if (exercise) {
      setSets(Array.from({ length: exercise.sets }, (_, i) => ({ set:i+1, weight:'', reps:'' })));
      setShowTips(true);
      setImgError(false);
    }
  }, [exercise?.name]);

  const history = exercise ? getExerciseHistory(exercise.name) : [];
  const lastSession = history[0];
  if (!exercise) return null;
  const cat = CAT[exercise.category] || CAT.core;
  const imageUrl = EXERCISE_IMAGES[exercise.name];

  function updateSet(index, field, value) {
    setSets(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  }

  function parseTarget(t) {
    const m = String(t).match(/\d+/);
    return m ? parseInt(m[0]) : 10;
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

            {/* Exercise photo with technique overlaid */}
            <View style={{ borderTopLeftRadius:28, borderTopRightRadius:28, overflow:'hidden' }}>
              {imageUrl && !imgError ? (
                <View>
                  <Image
                    source={{ uri: imageUrl }}
                    style={{ width:'100%', height:240 }}
                    resizeMode="cover"
                    onError={() => setImgError(true)}
                  />
                  {/* Gradient overlay bottom */}
                  <LinearGradient
                    colors={['transparent','rgba(10,10,15,0.85)','#0A0A0F']}
                    style={{ position:'absolute', bottom:0, left:0, right:0, height:120 }}
                  />
                  {/* Muscle tags over image */}
                  <View style={{ position:'absolute', top:12, left:12, flexDirection:'row', gap:6, flexWrap:'wrap' }}>
                    {exercise.muscles.map((m,i) => (
                      <View key={i} style={{ backgroundColor:'#000000AA', paddingHorizontal:10, paddingVertical:4, borderRadius:20, borderWidth:1, borderColor:cat.grad[0]+'88' }}>
                        <Text style={{ color:cat.grad[0], fontSize:11, fontWeight:'800' }}>{m}</Text>
                      </View>
                    ))}
                  </View>
                  {/* Exercise name over image */}
                  <View style={{ position:'absolute', bottom:14, left:14, right:14 }}>
                    <Text style={{ color:C.text, fontSize:18, fontWeight:'900', lineHeight:24 }}>{exercise.name}</Text>
                    <Text style={{ color:C.muted, fontSize:11, marginTop:2 }}>{exercise.note}</Text>
                  </View>
                </View>
              ) : (
                <LinearGradient colors={[cat.grad[0]+'44','#0A0A0F']} style={{ height:180, alignItems:'center', justifyContent:'center', padding:20 }}>
                  <Text style={{ fontSize:56 }}>{cat.emoji}</Text>
                  <Text style={{ color:C.text, fontSize:18, fontWeight:'900', marginTop:10, textAlign:'center' }}>{exercise.name}</Text>
                  <Text style={{ color:C.muted, fontSize:12, marginTop:4, textAlign:'center' }}>{exercise.note}</Text>
                </LinearGradient>
              )}
            </View>

            {/* Stats row */}
            <View style={{ flexDirection:'row', gap:8, padding:14, paddingTop:8 }}>
              {[
                { icon:'layers-outline', val:`${exercise.sets} series`, color:cat.grad[0] },
                { icon:'repeat', val:exercise.repsTarget+' reps', color:C.green },
                { icon:'timer-outline', val:exercise.rest+' desc.', color:C.orange },
              ].map((s,i) => (
                <LinearGradient key={i} colors={[s.color+'22','#13131A']} style={{ flex:1, borderRadius:12, padding:10, alignItems:'center', gap:4, borderWidth:1, borderColor:s.color+'33' }}>
                  <Ionicons name={s.icon} size={15} color={s.color} />
                  <Text style={{ color:C.text, fontSize:11, fontWeight:'800', textAlign:'center' }}>{s.val}</Text>
                </LinearGradient>
              ))}
            </View>

            {/* Technique guide with numbered points */}
            <TouchableOpacity onPress={() => setShowTips(!showTips)} style={exStyles.tipsToggle}>
              <View style={{ width:28, height:28, borderRadius:8, backgroundColor:C.orange+'22', alignItems:'center', justifyContent:'center' }}>
                <Ionicons name="bulb" size={15} color={C.orange} />
              </View>
              <Text style={{ color:C.orange, fontSize:13, fontWeight:'800', flex:1 }}>Técnica correcta</Text>
              <Ionicons name={showTips?'chevron-up':'chevron-down'} size={16} color={C.muted} />
            </TouchableOpacity>
            {showTips && (
              <View style={{ paddingHorizontal:14, paddingBottom:14, gap:8 }}>
                {exercise.tips.map((tip,i) => (
                  <View key={i} style={{ flexDirection:'row', gap:10, backgroundColor:'#13131A', borderRadius:12, padding:12, borderWidth:1, borderColor:C.border }}>
                    <View style={{ width:24, height:24, borderRadius:8, backgroundColor:cat.grad[0]+'33', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Text style={{ color:cat.grad[0], fontSize:11, fontWeight:'900' }}>{i+1}</Text>
                    </View>
                    <Text style={{ color:C.text, fontSize:12, flex:1, lineHeight:19 }}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Last session */}
            {lastSession && (
              <View style={{ marginHorizontal:14, marginBottom:14, backgroundColor:'#1F293780', borderRadius:14, padding:12 }}>
                <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:8 }}>
                  <Ionicons name="trending-up" size={14} color={C.blue} />
                  <Text style={{ color:C.blue, fontSize:12, fontWeight:'700' }}>Última sesión · {lastSession.date}</Text>
                </View>
                <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6 }}>
                  {lastSession.sets.map((s,i) => (
                    <View key={i} style={{ backgroundColor:'#0A0A0F', borderRadius:8, paddingHorizontal:10, paddingVertical:6, borderWidth:1, borderColor:C.blue+'33' }}>
                      <Text style={{ color:C.blue, fontSize:12, fontWeight:'700' }}>S{s.set}: {s.weight||'?'}kg × {s.reps||'?'}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Set logger */}
            <View style={{ paddingHorizontal:14, marginBottom:14, gap:10 }}>
              <Text style={{ color:C.text, fontWeight:'900', fontSize:15 }}>📝 Registrar series</Text>
              {sets.map((s, i) => {
                const good = isSetGood(s);
                const prevSet = lastSession?.sets?.[i];
                const prevW = prevSet?.weight ? parseFloat(prevSet.weight) : null;
                const currW = s.weight ? parseFloat(s.weight) : null;
                const delta = (prevW && currW) ? Math.round((currW - prevW) * 10) / 10 : null;
                return (
                  <View key={i} style={[exStyles.setCard,
                    good===true && { borderColor:C.green+'88', backgroundColor:'#052005' },
                    good===false && { borderColor:C.red+'66' }
                  ]}>
                    {/* Set header */}
                    <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                      <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                        <LinearGradient colors={cat.grad} style={{ width:30, height:30, borderRadius:9, alignItems:'center', justifyContent:'center' }}>
                          <Text style={{ color:'#fff', fontWeight:'900', fontSize:14 }}>{s.set}</Text>
                        </LinearGradient>
                        <Text style={{ color:C.muted, fontSize:12 }}>
                          Objetivo: <Text style={{ color:C.text, fontWeight:'700' }}>{exercise.repsTarget} reps</Text>
                        </Text>
                      </View>
                      {good===true && <View style={{ flexDirection:'row', gap:4, alignItems:'center' }}>
                        <Ionicons name="checkmark-circle" size={22} color={C.green} />
                        <Text style={{ color:C.green, fontSize:11, fontWeight:'700' }}>¡Logrado!</Text>
                      </View>}
                      {good===false && <View style={{ flexDirection:'row', gap:4, alignItems:'center' }}>
                        <Ionicons name="close-circle" size={22} color={C.red} />
                        <Text style={{ color:C.red, fontSize:11, fontWeight:'700' }}>
                          Faltan {parseTarget(exercise.repsTarget) - (parseInt(s.reps)||0)}
                        </Text>
                      </View>}
                      {good===null && <View style={{ width:22, height:22, borderRadius:11, borderWidth:1.5, borderColor:C.border }} />}
                    </View>
                    {/* Inputs */}
                    <View style={{ flexDirection:'row', gap:10 }}>
                      <View style={{ flex:1 }}>
                        <Text style={{ color:C.muted, fontSize:10, fontWeight:'700', textAlign:'center', marginBottom:6, letterSpacing:1 }}>PESO (kg)</Text>
                        <TextInput
                          style={exStyles.input}
                          value={s.weight}
                          onChangeText={v => updateSet(i, 'weight', v)}
                          keyboardType="decimal-pad"
                          placeholder={prevW ? String(prevW) : '0'}
                          placeholderTextColor='#374151'
                        />
                        {delta !== null && (
                          <Text style={{ color:delta>0?C.green:delta<0?C.red:C.muted, fontSize:11, textAlign:'center', marginTop:5, fontWeight:'700' }}>
                            {delta>0?`↑ +${delta}kg`:delta<0?`↓ ${delta}kg`:'= igual que antes'}
                          </Text>
                        )}
                      </View>
                      <View style={{ width:1, backgroundColor:C.border }} />
                      <View style={{ flex:1 }}>
                        <Text style={{ color:C.muted, fontSize:10, fontWeight:'700', textAlign:'center', marginBottom:6, letterSpacing:1 }}>REPS HECHAS</Text>
                        <TextInput
                          style={exStyles.input}
                          value={s.reps}
                          onChangeText={v => updateSet(i, 'reps', v)}
                          keyboardType="numeric"
                          placeholder={prevSet?.reps || '0'}
                          placeholderTextColor='#374151'
                        />
                        {s.reps && (
                          <Text style={{ color:good?C.green:C.orange, fontSize:11, textAlign:'center', marginTop:5, fontWeight:'700' }}>
                            {good ? '✓ Objetivo cumplido' : `${parseInt(s.reps)}/${parseTarget(exercise.repsTarget)} reps`}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          <View style={{ flexDirection:'row', gap:10, padding:14, borderTopWidth:1, borderTopColor:C.border }}>
            <TouchableOpacity onPress={onClose} style={[exStyles.btn,{flex:1,backgroundColor:'#1F2937'}]}>
              <Text style={{ color:C.muted, fontWeight:'700' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveAndClose} style={[exStyles.btn,{flex:2,backgroundColor:cat.grad[0]}]}>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={{ color:'#fff', fontWeight:'900' }}>Guardar series</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const exStyles = StyleSheet.create({
  overlay: { flex:1, backgroundColor:'#000000EE', justifyContent:'flex-end' },
  container: { backgroundColor:C.bg, borderTopLeftRadius:28, borderTopRightRadius:28, maxHeight:'94%' },
  tipsToggle: { flexDirection:'row', alignItems:'center', gap:10, marginHorizontal:14, marginBottom:10, backgroundColor:'#F9731611', borderRadius:14, padding:12, borderWidth:1, borderColor:'#F9731622' },
  setCard: { backgroundColor:'#13131A', borderRadius:16, padding:14, borderWidth:1, borderColor:C.border },
  input: { backgroundColor:'#0A0A0F', borderRadius:12, padding:14, color:C.text, fontSize:22, fontWeight:'900', textAlign:'center', borderWidth:1, borderColor:C.border },
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
            const isCompleted = completedWorkouts[today] === plan.name;
            const isOpen = selectedDay === i;
            const doneCount = plan.exercises.filter(e => workoutHistory[dayDate]?.[e.name]).length;

            return (
              <View key={i}>
                <TouchableOpacity onPress={() => setSelectedDay(isOpen ? null : i)} activeOpacity={0.8}>
                  <LinearGradient
                    colors={isToday?[plan.color+'33','#13131A']:['#13131A','#0D0D14']}
                    style={[styles.dayCard, isToday && { borderColor:plan.color+'55' }]}
                  >
                    <View style={[styles.dayIcon, { backgroundColor:plan.color+'22' }]}>
                      <Ionicons name={plan.icon} size={22} color={plan.color} />
                    </View>
                    <View style={{ flex:1 }}>
                      <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
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
                        {isOpen && doneCount > 0 && <Text style={{ color:C.green, fontSize:10, fontWeight:'700' }}>✓ {doneCount}/{plan.exercises.length}</Text>}
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
                      const saved = workoutHistory[dayDate]?.[ex.name] || [];
                      const totalReps = saved.reduce ? saved.reduce((a,s) => a+(parseInt(s.reps)||0), 0) : 0;
                      const maxWeight = saved.reduce ? saved.reduce((a,s) => Math.max(a, parseFloat(s.weight)||0), 0) : 0;
                      const imgUrl = EXERCISE_IMAGES[ex.name];
                      return (
                        <TouchableOpacity key={j} onPress={() => setSelectedExercise(ex)} activeOpacity={0.8}>
                          <View style={[styles.exRow, isDone && { borderColor:C.green+'55', backgroundColor:'#031503' }]}>
                            {imgUrl ? (
                              <Image source={{ uri: imgUrl }} style={styles.exThumb} resizeMode="cover" />
                            ) : (
                              <LinearGradient colors={cat.grad} style={styles.exThumb}>
                                <Text style={{ fontSize:20 }}>{cat.emoji}</Text>
                              </LinearGradient>
                            )}
                            <View style={{ flex:1 }}>
                              <Text style={{ color:C.text, fontWeight:'700', fontSize:13 }}>{ex.name}</Text>
                              <Text style={{ color:C.muted, fontSize:11, marginTop:2 }}>{ex.sets} × {ex.repsTarget} · {ex.rest}</Text>
                              {isDone && <Text style={{ color:C.green, fontSize:10, marginTop:3, fontWeight:'700' }}>✓ {totalReps} reps · máx {maxWeight}kg</Text>}
                            </View>
                            {isDone
                              ? <Ionicons name="checkmark-circle" size={24} color={C.green} />
                              : <Ionicons name="chevron-forward" size={18} color={C.muted} />
                            }
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                    <TouchableOpacity
                      onPress={() => { completeWorkout(plan.name); Alert.alert('💪 ¡Entreno completado!', `${plan.name} guardado.\n¡Excelente trabajo, Lenin!`); }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient colors={[plan.color, plan.color+'88']} style={styles.completeBtn}>
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
  exerciseList: { backgroundColor:'#0D0D14', marginTop:2, borderRadius:16, padding:10, gap:6, borderWidth:1, borderColor:C.border },
  exRow: { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#13131A', borderRadius:12, padding:10, borderWidth:1, borderColor:C.border },
  exThumb: { width:56, height:56, borderRadius:10, alignItems:'center', justifyContent:'center', overflow:'hidden' },
  completeBtn: { flexDirection:'row', gap:8, alignItems:'center', justifyContent:'center', padding:14, borderRadius:14, marginTop:4 },
});
