import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, FONTS } from '../../constants/theme';

export default function MacroRing({ value = 0, max = 100, color = COLORS.green, label = '', unit = 'g', size = 80, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / Math.max(max, 1), 1);
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color + '30'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={[styles.value, { color }]}>{Math.round(value)}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  center: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  value: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, lineHeight: 18 },
  unit: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  label: { marginTop: 6, fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: FONTS.weights.medium },
});
