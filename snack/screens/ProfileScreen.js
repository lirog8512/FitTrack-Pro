import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../Context/AppContext';

const C = { bg:'#0A0A0F',card:'#13131A',green:'#22C55E',blue:'#3B82F6',orange:'#F97316',text:'#FFFFFF',muted:'#6B7280',border:'#1F2937',purple:'#A855F7' };

function EditModal({ visible, title, value, onClose, onSave, keyboardType='default', unit='', secure=false, placeholder='' }) {
  const [val, setVal] = useState(String(value||''));
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={{ color:C.text, fontSize:18, fontWeight:'900', marginBottom:20 }}>Editar {title}</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <TextInput
              style={[styles.input,{flex:1}]} value={val} onChangeText={setVal}
              keyboardType={keyboardType} autoFocus secureTextEntry={secure}
              placeholder={placeholder} placeholderTextColor='#4B5563'
            />
            {unit ? <Text style={{ color:C.muted, fontSize:16 }}>{unit}</Text> : null}
          </View>
          <View style={{ flexDirection:'row', gap:10, marginTop:16 }}>
            <TouchableOpacity onPress={onClose} style={[styles.btn,{flex:1,backgroundColor:'#1F2937'}]}>
              <Text style={{ color:C.muted, fontWeight:'700' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onSave(val); onClose(); }} style={[styles.btn,{flex:1,backgroundColor:C.green}]}>
              <Text style={{ color:C.bg, fontWeight:'900' }}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Row({ icon, label, value, color=C.green, onPress, masked=false }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row} activeOpacity={onPress?0.7:1}>
      <View style={[styles.rowIcon, { backgroundColor:(color)+'22' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex:1 }}>
        <Text style={{ color:C.muted, fontSize:11 }}>{label}</Text>
        <Text style={{ color:C.text, fontSize:14, fontWeight:'600', marginTop:1 }}>
          {masked && value ? '••••••••••••' + value.slice(-4) : (value || 'No configurado')}
        </Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color={C.muted} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useApp();
  const [editing, setEditing] = useState(null);
  const imc = (user.weight / ((user.height/100)**2)).toFixed(1);
  const totalCals = user.protein*4 + user.carbs*4 + user.fat*9;

  const fields = {
    name:      { title:'Nombre',            keyboardType:'default',     unit:'',     transform:v=>v },
    age:       { title:'Edad',              keyboardType:'numeric',     unit:'años', transform:Number },
    weight:    { title:'Peso actual',       keyboardType:'decimal-pad', unit:'kg',   transform:parseFloat },
    goalWeight:{ title:'Peso objetivo',     keyboardType:'decimal-pad', unit:'kg',   transform:parseFloat },
    height:    { title:'Altura',            keyboardType:'numeric',     unit:'cm',   transform:Number },
    calories:  { title:'Calorías diarias',  keyboardType:'numeric',     unit:'kcal', transform:Number },
    protein:   { title:'Proteína diaria',   keyboardType:'numeric',     unit:'g',    transform:Number },
    carbs:     { title:'Carbohidratos',     keyboardType:'numeric',     unit:'g',    transform:Number },
    fat:       { title:'Grasas',            keyboardType:'numeric',     unit:'g',    transform:Number },
    waterGoal: { title:'Meta de agua',      keyboardType:'numeric',     unit:'ml',   transform:Number },
    apiKey:       { title:'API Key Anthropic', keyboardType:'default', unit:'', transform:v=>v, secure:true, placeholder:'sk-ant-...' },
    unsplashKey:  { title:'API Key Unsplash',  keyboardType:'default', unit:'', transform:v=>v, secure:true, placeholder:'Tu Access Key de Unsplash' },
    pixabayKey:   { title:'API Key Pixabay',   keyboardType:'default', unit:'', transform:v=>v, secure:true, placeholder:'Tu API Key de Pixabay' },
  };

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom:100 }} showsVerticalScrollIndicator={false}>
        {/* Hero header */}
        <LinearGradient colors={['#22C55E44','#22C55E11','#0A0A0F']} style={[styles.headerBg, { paddingTop:insets.top+24 }]}>
          <View style={styles.avatarLarge}>
            <Text style={{ color:C.green, fontSize:38, fontWeight:'900' }}>{user.name[0]}</Text>
          </View>
          <Text style={{ color:C.text, fontSize:26, fontWeight:'900', marginTop:14 }}>{user.name}</Text>
          <Text style={{ color:C.muted, fontSize:13, marginTop:4 }}>{user.age} años · {user.height}cm · IMC {imc}</Text>
          <View style={{ flexDirection:'row', gap:12, marginTop:16 }}>
            {[
              { v:`${user.weight}kg`, l:'Actual', c:C.text },
              { v:`${user.goalWeight}kg`, l:'Objetivo', c:C.green },
              { v:`${(user.weight-user.goalWeight).toFixed(1)}kg`, l:'Por perder', c:C.orange },
            ].map((s,i) => (
              <View key={i} style={styles.statPill}>
                <Text style={{ color:s.c, fontWeight:'900', fontSize:15 }}>{s.v}</Text>
                <Text style={{ color:C.muted, fontSize:10 }}>{s.l}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={{ padding:16, gap:14 }}>
          {/* AI Integration */}
          <LinearGradient colors={['#22C55E22','#13131A']} style={[styles.card, { borderColor:user.apiKey?C.green+'44':'#1F2937' }]}>
            <View style={{ flexDirection:'row', gap:10, alignItems:'center', marginBottom:12 }}>
              <View style={{ width:38, height:38, borderRadius:12, backgroundColor:C.green+'33', alignItems:'center', justifyContent:'center' }}>
                <Ionicons name="sparkles" size={18} color={C.green} />
              </View>
              <View style={{ flex:1 }}>
                <Text style={{ color:C.text, fontWeight:'800', fontSize:14 }}>Funciones de IA</Text>
                <Text style={{ color:C.muted, fontSize:12 }}>
                  {user.apiKey ? '✅ API Key configurada' : '⚠️ Requiere API Key de Anthropic'}
                </Text>
              </View>
            </View>
            <Row icon="key" label="API Key de Anthropic" value={user.apiKey} color={C.green} onPress={() => setEditing('apiKey')} masked={true} />
            <Row icon="image" label="Pixabay (fotos ejercicios · acceso inmediato)" value={user.pixabayKey} color={C.blue} onPress={() => setEditing('pixabayKey')} masked={true} />
            <Row icon="image-outline" label="Unsplash (fotos ejercicios · pendiente aprobación)" value={user.unsplashKey} color={C.purple} onPress={() => setEditing('unsplashKey')} masked={true} />
            {(!user.apiKey || !user.pixabayKey) && (
              <View style={{ backgroundColor:'#22C55E11', borderRadius:10, padding:10, marginTop:8, gap:6 }}>
                {!user.apiKey && <Text style={{ color:C.muted, fontSize:11, lineHeight:18 }}>
                  🤖 Anthropic: console.anthropic.com → Scanner comida · Análisis corporal
                </Text>}
                {!user.pixabayKey && <Text style={{ color:C.muted, fontSize:11, lineHeight:18 }}>
                  📸 Pixabay GRATIS (sin espera): pixabay.com/api/docs → Get API Key → acceso inmediato
                </Text>}
              </View>
            )}
          </LinearGradient>

          {/* Personal info */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle,{marginBottom:8}]}>Información personal</Text>
            <Row icon="person" label="Nombre" value={user.name} color={C.green} onPress={()=>setEditing('name')} />
            <Row icon="calendar" label="Edad" value={`${user.age} años`} color={C.blue} onPress={()=>setEditing('age')} />
            <Row icon="scale" label="Peso actual" value={`${user.weight} kg`} color={C.orange} onPress={()=>setEditing('weight')} />
            <Row icon="flag" label="Peso objetivo" value={`${user.goalWeight} kg`} color={C.green} onPress={()=>setEditing('goalWeight')} />
            <Row icon="resize" label="Altura" value={`${user.height} cm`} color={C.purple} onPress={()=>setEditing('height')} />
          </View>

          {/* Nutrition goals */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle,{marginBottom:8}]}>Metas nutricionales</Text>
            <Row icon="flame" label="Calorías diarias" value={`${user.calories} kcal`} color={C.orange} onPress={()=>setEditing('calories')} />
            <Row icon="barbell" label="Proteína" value={`${user.protein} g/día`} color={C.blue} onPress={()=>setEditing('protein')} />
            <Row icon="fast-food" label="Carbohidratos" value={`${user.carbs} g/día`} color={C.orange} onPress={()=>setEditing('carbs')} />
            <Row icon="water" label="Grasas" value={`${user.fat} g/día`} color={C.purple} onPress={()=>setEditing('fat')} />
            <Row icon="water-outline" label="Meta de agua" value={`${(user.waterGoal/1000).toFixed(1)} L/día`} color={C.blue} onPress={()=>setEditing('waterGoal')} />
          </View>

          {/* Macro distribution */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle,{marginBottom:14}]}>Distribución de macros</Text>
            {[
              { label:'Proteína', pct:Math.round((user.protein*4/totalCals)*100), g:user.protein, color:C.blue },
              { label:'Carbohidratos', pct:Math.round((user.carbs*4/totalCals)*100), g:user.carbs, color:C.orange },
              { label:'Grasas', pct:Math.round((user.fat*9/totalCals)*100), g:user.fat, color:C.purple },
            ].map((m,i) => (
              <View key={i} style={{ marginBottom:10 }}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:5 }}>
                  <Text style={{ color:C.muted, fontSize:12 }}>{m.label}</Text>
                  <Text style={{ color:m.color, fontWeight:'700', fontSize:12 }}>{m.g}g · {m.pct}%</Text>
                </View>
                <View style={{ height:8, backgroundColor:'#1F2937', borderRadius:4, overflow:'hidden' }}>
                  <LinearGradient colors={[m.color, m.color+'66']} style={{ width:`${m.pct}%`, height:8, borderRadius:4 }} start={{x:0,y:0}} end={{x:1,y:0}} />
                </View>
              </View>
            ))}
            <Text style={{ color:C.muted, fontSize:11, textAlign:'center', marginTop:4 }}>Total: {totalCals} kcal</Text>
          </View>

          {/* Injuries */}
          <LinearGradient colors={['#F9731611','#13131A']} style={styles.card}>
            <Text style={[styles.cardTitle,{marginBottom:12}]}>⚠️ Lesiones registradas</Text>
            {user.injuries?.map((inj,i) => (
              <View key={i} style={{ flexDirection:'row', gap:10, paddingVertical:10, borderBottomWidth:i<user.injuries.length-1?1:0, borderBottomColor:C.border }}>
                <View style={{ width:32, height:32, borderRadius:10, backgroundColor:'#F9731622', alignItems:'center', justifyContent:'center' }}>
                  <Ionicons name="bandage" size={14} color={C.orange} />
                </View>
                <View style={{ flex:1, justifyContent:'center' }}>
                  <Text style={{ color:C.text, fontWeight:'600' }}>{inj}</Text>
                </View>
              </View>
            ))}
            <Text style={{ color:C.muted, fontSize:11, marginTop:10, lineHeight:18 }}>
              El plan de entreno y las recomendaciones de la IA consideran estas lesiones en todo momento.
            </Text>
          </LinearGradient>

          {/* Last AI analysis */}
          {user.lastBodyAnalysis && (
            <LinearGradient colors={['#A855F711','#13131A']} style={styles.card}>
              <View style={{ flexDirection:'row', gap:8, alignItems:'center', marginBottom:8 }}>
                <Ionicons name="sparkles" size={16} color={C.purple} />
                <Text style={{ color:C.purple, fontWeight:'700' }}>Último análisis de IA</Text>
              </View>
              <Text style={{ color:C.muted, fontSize:12, lineHeight:18 }}>{user.lastBodyAnalysis}</Text>
            </LinearGradient>
          )}
        </View>
      </ScrollView>

      {editing && fields[editing] && (
        <EditModal
          visible={!!editing}
          title={fields[editing].title}
          value={user[editing]}
          keyboardType={fields[editing].keyboardType}
          unit={fields[editing].unit}
          secure={fields[editing].secure}
          placeholder={fields[editing].placeholder}
          onClose={() => setEditing(null)}
          onSave={val => updateUser({ [editing]: fields[editing].transform(val) })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerBg: { alignItems:'center', paddingBottom:28, paddingHorizontal:16 },
  avatarLarge: { width:96, height:96, borderRadius:48, backgroundColor:'#22C55E22', alignItems:'center', justifyContent:'center', borderWidth:3, borderColor:'#22C55E' },
  statPill: { backgroundColor:'#1F2937', paddingHorizontal:16, paddingVertical:8, borderRadius:20, alignItems:'center', borderWidth:1, borderColor:'#2D3748' },
  card: { backgroundColor:'#13131A', borderRadius:18, padding:16, borderWidth:1, borderColor:'#1F2937' },
  cardTitle: { color:'#FFFFFF', fontSize:15, fontWeight:'800' },
  row: { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#1F2937' },
  rowIcon: { width:36, height:36, borderRadius:10, alignItems:'center', justifyContent:'center' },
  modalOverlay: { flex:1, backgroundColor:'#000000DD', justifyContent:'flex-end' },
  modalContent: { backgroundColor:'#13131A', borderTopLeftRadius:24, borderTopRightRadius:24, padding:24 },
  input: { backgroundColor:'#0A0A0F', borderRadius:12, padding:14, color:'#FFFFFF', fontSize:16, fontWeight:'600', borderWidth:1, borderColor:'#1F2937' },
  btn: { padding:14, borderRadius:12, alignItems:'center' },
});
