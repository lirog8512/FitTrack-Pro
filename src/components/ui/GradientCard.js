import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export default function GradientCard({ colors = ['#1A1A24', '#12121A'], children, style, ...props }) {
  return (
    <LinearGradient colors={colors} style={[styles.card, style]} {...props}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
