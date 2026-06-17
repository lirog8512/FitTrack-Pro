import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS, FONTS } from '../../constants/theme';

export default function BigCalorieRing({ consumed = 0, goal = 1900, size = 200, strokeWidth = 16 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(consumed / Math.max(goal, 1), 1);
  const strokeDashoffset = circumference * (1 - pct);
  const remaining = Math.max(goal - consumed, 0);
  const pctText = Math.round(pct * 100);

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <LinearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#22C55E" />
            <Stop offset="100%" stopColor="#3B82F6" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#1A1A24" strokeWidth={strokeWidth} fill="none"
        />
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="url(#calGrad)" strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={styles.calories}>{consumed}</Text>
        <Text style={styles.kcal}>KCAL</Text>
        <Text style={styles.of}>de {goal}</Text>
        <View style={[styles.badge, pct >= 1 && styles.badgeOver]}>
          <Text style={styles.badgeText}>{pctText}%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  calories: { fontSize: FONTS.sizes['4xl'], fontWeight: FONTS.weights.black, color: COLORS.white },
  kcal: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.textSecondary, letterSpacing: 2 },
  of: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginTop: 2 },
  badge: { marginTop: 8, backgroundColor: COLORS.green + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  badgeOver: { backgroundColor: COLORS.orange + '20' },
  badgeText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.green },
});
