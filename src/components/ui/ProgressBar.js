import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';

export default function ProgressBar({ value = 0, max = 100, colors = [COLORS.green, COLORS.greenDark], label, sublabel, height = 8 }) {
  const pct = Math.min(value / Math.max(max, 1), 1) * 100;
  return (
    <View>
      {(label || sublabel) && (
        <View style={styles.header}>
          {label && <Text style={styles.label}>{label}</Text>}
          {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <LinearGradient
          colors={colors}
          style={[styles.fill, { width: `${pct}%`, height }]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  sublabel: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
  track: { backgroundColor: COLORS.surface, borderRadius: RADIUS.full, overflow: 'hidden' },
  fill: { borderRadius: RADIUS.full },
});
