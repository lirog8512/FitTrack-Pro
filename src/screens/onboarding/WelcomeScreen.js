import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/ui/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.safe}>
      <LinearGradient colors={['#0A0A0F', '#0D1520', '#0A0A0F']} style={styles.bg}>

        {/* Decorative circles */}
        <View style={[styles.circle, { width: 300, height: 300, top: -100, right: -80, backgroundColor: COLORS.green + '08' }]} />
        <View style={[styles.circle, { width: 200, height: 200, bottom: 100, left: -50, backgroundColor: COLORS.blue + '08' }]} />

        {/* Logo */}
        <View style={styles.logoSection}>
          <LinearGradient colors={[COLORS.green, COLORS.blue]} style={styles.logoIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="barbell" size={36} color="#fff" />
          </LinearGradient>
          <LinearGradient colors={[COLORS.green, COLORS.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.logoTextGrad}>
            <Text style={styles.logoText}>FitTrack Pro</Text>
          </LinearGradient>
          <Text style={styles.tagline}>Transforma tu cuerpo.{'\n'}Domina tu mente.</Text>
        </View>

        {/* Feature Pills */}
        <View style={styles.features}>
          {[
            { icon: 'nutrition', text: 'Nutrición con IA', color: COLORS.green },
            { icon: 'barbell', text: 'Plan personalizado', color: COLORS.blue },
            { icon: 'trending-up', text: 'Progreso visual', color: COLORS.orange },
            { icon: 'water', text: 'Hidratación', color: COLORS.purple },
          ].map(f => (
            <View key={f.text} style={[styles.featureChip, { borderColor: f.color + '40' }]}>
              <Ionicons name={f.icon} size={14} color={f.color} />
              <Text style={[styles.featureText, { color: f.color }]}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { num: '1900', label: 'kcal objetivo' },
            { num: '5', label: 'días/semana' },
            { num: '160g', label: 'proteína' },
          ].map(s => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statNum}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <Button
            title="Comenzar ahora"
            onPress={() => navigation.replace('Main')}
            variant="primary"
            icon="arrow-forward"
            style={styles.primaryBtn}
          />
          <Button
            title="Personalizar perfil"
            onPress={() => navigation.navigate('ProfileSetup')}
            variant="outline"
            style={styles.secondaryBtn}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  bg: { flex: 1, paddingHorizontal: SPACING.xl, justifyContent: 'center' },
  circle: { position: 'absolute', borderRadius: 9999 },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoIcon: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: COLORS.green, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20 },
  logoTextGrad: { borderRadius: 4 },
  logoText: { fontSize: FONTS.sizes['4xl'], fontWeight: FONTS.weights.black, color: '#fff', paddingHorizontal: 4 },
  tagline: { fontSize: FONTS.sizes.xl, color: COLORS.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 30, fontWeight: FONTS.weights.medium },
  features: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 32 },
  featureChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.surface, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1 },
  featureText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.base, marginBottom: 32, borderWidth: 1, borderColor: COLORS.border },
  stat: { alignItems: 'center' },
  statNum: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.black, color: COLORS.white },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  buttons: { gap: 12 },
  primaryBtn: {},
  secondaryBtn: {},
});
