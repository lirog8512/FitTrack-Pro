import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useApp } from '../Context/AppContext';

const { width } = Dimensions.get('window');
const C = { bg:'#0A0A0F', card:'#13131A', green:'#22C55E', blue:'#3B82F6', orange:'#F97316', text:'#FFFFFF', muted:'#6B7280', border:'#1F2937', purple:'#A855F7', pink:'#EC4899' };

function GradientRing({ size, strokeWidth, progress, colors, children }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(progress, 1));
  const id = `grad_${size}`;
  return (
    <View style={{ width:size, height:size, alignItems:'center', justifyContent:'center' }}>
      <Svg width={size} height={size} style={{ position:'absolute' }}>
        <Defs>
          <SvgGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors[0]} />
            <Stop offset="100%" stopColor={colors[1]} />
          </SvgGradient>
        </Defs>
        <Circle cx={size/2} cy={size/2} r={r} stroke="#1F2937" strokeWidth={strokeWidth} fill="none" />
        <Circle cx={size/2} cy={size/2} r={r} stroke={`url(#${id})`} strokeWidth={strokeWidth}
          fill="none" strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      </Svg>
      {children}
    </View>
  );
}

function WeekCalendar() {
  const today = new Date();
  const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const week = Array.from({length:7}, (_,i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return { day: days[d.getDay()], num: d.getDate(), isToday: d.toDateString()===today.toDateString() };
  });
  return (
    <View style={calStyles.container}>
      {week.map((d,i) => (
        <TouchableOpacity key={i} style={[calStyles.dayBtn, d.isToday && calStyles.todayBtn]} activeOpacity={0.7}>
          <Text style={[calStyles.dayName, d.isToday && { color: C.bg }]}>{d.day}</Text>
          <Text style={[calStyles.dayNum, d.isToday && { color: C.bg, fontWeight:'900' }]}>{d.num}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const calStyles = StyleSheet.create({
  container: { flexDirection:'row', justifyContent:'space-between', paddingHorizontal:4 },
  dayBtn: { alignItems:'center', paddingVertical:8, paddingHorizontal:6, borderRadius:12, minWidth:38 },
  todayBtn: { backgroundColor: C.green },
  dayName: { color:C.muted, fontSize:10, fontWeight:'600', marginBottom:4 },
  dayNum: { color:C.text, fontSize:15, fontWeight:'700' },
});

function StatCard({ icon, label, value, sub, color, gradient }) {
  return (
    <LinearGradient colors={gradient||[color+'22','#13131A']} style={statStyles.card}>
      <View style={[statStyles.iconWrap, { backgroundColor:color+'33' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
      {sub && <Text style={statStyles.sub}>{sub}</Text>}
    </LinearGradient>
  );
}

const statStyles = StyleSheet.create({
  card: { flex:1, borderRadius:16, padding:14, borderWidth:1, borderColor:'#1F2937', alignItems:'center', gap:4 },
  iconWrap: { width:40, height:40, borderRadius:12, alignItems:'center', justifyContent:'center', marginBottom:4 },
  value: { fontSize:20, fontWeight:'900' },
  label: { color:'#6B7280', fontSize:10, fontWeight:'600', textAlign:'center' },
  sub: { color:'#4B5563', fontSize:9, textAlign:'center' },
});

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, totals, hydration, completedWorkouts, weightHistory } = useApp();
  const calPct = totals.calories / user.calories;
  const hydPct = hydration / user.waterGoal;
  const today = new Date().toISOString().split('T')[0];
  const todayWorkout = completedWorkouts[today];
  const remaining = user.calories - totals.calories;
  const streak = Object.keys(completedWorkouts).length;
  const weightLost = weightHistory.length > 0 ? (weightHistory[0].weight - user.weight).toFixed(1) : 0;
  const imc = (user.weight / ((user.height/100)**2)).toFixed(1);

  return (
    <ScrollView style={{ flex:1, backgroundColor:C.bg }} contentContainerStyle={{ paddingBottom:100 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#13131A','#0A0A0F']} style={[styles.header, { paddingTop:insets.top+12 }]}>
        <View style={{ flex:1 }}>
          <Text style={{ color:C.muted, fontSize:12, fontWeight:'500' }}>
            {new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}
          </Text>
          <Text style={{ color:C.text, fontSize:26, fontWeight:'900', marginTop:2 }}>
            Hola, {user.name} 👋
          </Text>
        </View>
        <View style={{ alignItems:'flex-end', gap:6 }}>
          <View style={styles.avatar}>
            <Text style={{ color:C.green, fontSize:22, fontWeight:'900' }}>{user.name[0]}</Text>
          </View>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={11} color="#F97316" />
              <Text style={{ color:'#F97316', fontSize:10, fontWeight:'800' }}>{streak} días</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <View style={{ padding:16, gap:14 }}>
        {/* Weekly Calendar */}
        <View style={styles.card}>
          <WeekCalendar />
        </View>

        {/* Main Calorie Card */}
        <LinearGradient colors={['#1A2A1A','#13131A']} style={[styles.card, { alignItems:'center', paddingVertical:24 }]}>
          <GradientRing size={200} strokeWidth={16} progress={calPct} colors={calPct>1?[C.orange,'#EF4444']:[C.green,'#16A34A']}>
            <View style={{ alignItems:'center' }}>
              <Text style={{ color:C.muted, fontSize:11, marginBottom:2 }}>consumidas</Text>
              <Text style={{ color:C.text, fontSize:42, fontWeight:'900', lineHeight:46 }}>{totals.calories}</Text>
              <Text style={{ color:C.muted, fontSize:11 }}>kcal</Text>
              <View style={{ height:1, width:60, backgroundColor:C.border, marginVertical:8 }} />
              <Text style={{ color:remaining>=0?C.green:C.orange, fontSize:15, fontWeight:'800' }}>
                {Math.abs(remaining)} {remaining>=0?'restantes':'exceso'}
              </Text>
            </View>
          </GradientRing>

          {/* Macro circles row */}
          <View style={{ flexDirection:'row', gap:20, marginTop:16 }}>
            {[
              { label:'Proteína', val:Math.round(totals.protein), goal:user.protein, color:C.blue },
              { label:'Carbos', val:Math.round(totals.carbs), goal:user.carbs, color:C.orange },
              { label:'Grasa', val:Math.round(totals.fat), goal:user.fat, color:C.purple },
            ].map((m,i) => (
              <View key={i} style={{ alignItems:'center', gap:6 }}>
                <GradientRing size={64} strokeWidth={6} progress={m.val/m.goal} colors={[m.color, m.color+'88']}>
                  <Text style={{ color:m.color, fontSize:12, fontWeight:'800' }}>{m.val}</Text>
                </GradientRing>
                <Text style={{ color:C.muted, fontSize:10 }}>{m.label}</Text>
                <Text style={{ color:C.muted, fontSize:9 }}>/{m.goal}g</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Stats row */}
        <View style={{ flexDirection:'row', gap:10 }}>
          <StatCard icon="water" label="Hidratación" value={`${(hydration/1000).toFixed(1)}L`}
            sub={`de ${user.waterGoal/1000}L`} color={C.blue} />
          <StatCard icon="scale" label="Peso actual" value={`${user.weight}kg`}
            sub={`Meta: ${user.goalWeight}kg`} color={C.orange} />
          <StatCard icon="trending-down" label="Perdido" value={`${weightLost}kg`}
            sub="desde inicio" color={C.green} />
        </View>

        {/* Body Overview */}
        <LinearGradient colors={['#0F1A2A','#13131A']} style={styles.card}>
          <Text style={[styles.sectionTitle, { marginBottom:14 }]}>Body Overview</Text>
          <View style={{ flexDirection:'row', justifyContent:'space-around' }}>
            {[
              { label:'Altura', value:`${user.height}cm`, icon:'resize', color:C.blue },
              { label:'Peso', value:`${user.weight}kg`, icon:'scale', color:C.green },
              { label:'IMC', value:imc, icon:'analytics', color:C.orange },
              { label:'Objetivo', value:`${user.goalWeight}kg`, icon:'flag', color:C.purple },
            ].map((s,i) => (
              <View key={i} style={{ alignItems:'center', gap:6 }}>
                <View style={{ width:44, height:44, borderRadius:14, backgroundColor:s.color+'22', alignItems:'center', justifyContent:'center' }}>
                  <Ionicons name={s.icon} size={18} color={s.color} />
                </View>
                <Text style={{ color:s.color, fontSize:15, fontWeight:'900' }}>{s.value}</Text>
                <Text style={{ color:C.muted, fontSize:10 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Today's Summary */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { marginBottom:12 }]}>Resumen de hoy</Text>
          <View style={{ flexDirection:'row', gap:10 }}>
            <View style={styles.summaryItem}>
              <Ionicons name="flame" size={18} color={C.orange} />
              <Text style={{ color:C.text, fontWeight:'800' }}>{totals.calories}</Text>
              <Text style={{ color:C.muted, fontSize:10 }}>Calorías</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="barbell" size={18} color={C.blue} />
              <Text style={{ color:C.text, fontWeight:'800' }}>{Math.round(totals.protein)}g</Text>
              <Text style={{ color:C.muted, fontSize:10 }}>Proteína</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="water" size={18} color={C.blue} />
              <Text style={{ color:C.text, fontWeight:'800' }}>{(hydration/1000).toFixed(1)}L</Text>
              <Text style={{ color:C.muted, fontSize:10 }}>Agua</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name={todayWorkout?'checkmark-circle':'close-circle'} size={18} color={todayWorkout?C.green:'#4B5563'} />
              <Text style={{ color:C.text, fontWeight:'800' }}>{todayWorkout?'✓':'–'}</Text>
              <Text style={{ color:C.muted, fontSize:10 }}>Entreno</Text>
            </View>
          </View>
        </View>

        {/* Workout CTA */}
        <LinearGradient
          colors={todayWorkout?['#22C55E33','#13131A']:['#3B82F633','#13131A']}
          style={[styles.card, { flexDirection:'row', alignItems:'center', gap:14 }]}
        >
          <LinearGradient
            colors={todayWorkout?[C.green,'#16A34A']:[C.blue,'#2563EB']}
            style={{ width:52, height:52, borderRadius:16, alignItems:'center', justifyContent:'center' }}
          >
            <Ionicons name={todayWorkout?'checkmark-circle':'barbell'} size={26} color="#fff" />
          </LinearGradient>
          <View style={{ flex:1 }}>
            <Text style={{ color:C.text, fontSize:16, fontWeight:'800' }}>
              {todayWorkout?'¡Entreno completado!':'Tu entreno de hoy'}
            </Text>
            <Text style={{ color:C.muted, fontSize:12, marginTop:2 }}>
              {todayWorkout?`${todayWorkout} · ¡Sigue así! 💪`:'Toca para ver tu plan de hoy'}
            </Text>
          </View>
          <View style={{ width:32, height:32, borderRadius:10, backgroundColor:'#ffffff11', alignItems:'center', justifyContent:'center' }}>
            <Ionicons name="chevron-forward" size={18} color={C.muted} />
          </View>
        </LinearGradient>

        {/* Injury reminder */}
        <LinearGradient colors={['#F9731611','#13131A']} style={[styles.card, { flexDirection:'row', gap:12 }]}>
          <View style={{ width:36, height:36, borderRadius:10, backgroundColor:'#F9731622', alignItems:'center', justifyContent:'center' }}>
            <Ionicons name="shield-checkmark" size:16 color={C.orange} />
          </View>
          <View style={{ flex:1 }}>
            <Text style={{ color:C.orange, fontWeight:'700', fontSize:12, marginBottom:3 }}>Plan adaptado a tus lesiones</Text>
            <Text style={{ color:C.muted, fontSize:11, lineHeight:17 }}>
              Tendones bíceps · Protrusión L4-L5 — todos los ejercicios están optimizados.
            </Text>
          </View>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal:16, paddingBottom:16, flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start' },
  avatar: { width:46, height:46, borderRadius:23, backgroundColor:'#22C55E22', alignItems:'center', justifyContent:'center', borderWidth:2, borderColor:'#22C55E' },
  streakBadge: { flexDirection:'row', gap:3, alignItems:'center', backgroundColor:'#F9731622', paddingHorizontal:8, paddingVertical:3, borderRadius:20 },
  card: { backgroundColor:'#13131A', borderRadius:18, padding:16, borderWidth:1, borderColor:'#1F2937' },
  sectionTitle: { color:'#FFFFFF', fontSize:16, fontWeight:'800' },
  summaryItem: { flex:1, alignItems:'center', gap:4, backgroundColor:'#1F293780', borderRadius:12, paddingVertical:10 },
});
