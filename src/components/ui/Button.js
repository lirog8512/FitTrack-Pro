import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants/theme';

export default function Button({ title, onPress, variant = 'primary', loading = false, icon, style, textStyle, disabled }) {
  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={loading || disabled} activeOpacity={0.85} style={style}>
        <LinearGradient colors={[COLORS.green, COLORS.greenDark]} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <View style={styles.row}>
              {icon && <Ionicons name={icon} size={18} color="#fff" style={{ marginRight: 6 }} />}
              <Text style={[styles.primaryText, textStyle]}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  if (variant === 'blue') {
    return (
      <TouchableOpacity onPress={onPress} disabled={loading || disabled} activeOpacity={0.85} style={style}>
        <LinearGradient colors={[COLORS.blue, COLORS.blueDark]} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <View style={styles.row}>
              {icon && <Ionicons name={icon} size={18} color="#fff" style={{ marginRight: 6 }} />}
              <Text style={[styles.primaryText, textStyle]}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  if (variant === 'orange') {
    return (
      <TouchableOpacity onPress={onPress} disabled={loading || disabled} activeOpacity={0.85} style={style}>
        <LinearGradient colors={[COLORS.orange, COLORS.orangeDark]} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <View style={styles.row}>
              {icon && <Ionicons name={icon} size={18} color="#fff" style={{ marginRight: 6 }} />}
              <Text style={[styles.primaryText, textStyle]}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  if (variant === 'outline') {
    return (
      <TouchableOpacity onPress={onPress} disabled={loading || disabled} activeOpacity={0.85} style={[styles.outlineBtn, style]}>
        {loading ? <ActivityIndicator color={COLORS.green} /> : (
          <View style={styles.row}>
            {icon && <Ionicons name={icon} size={18} color={COLORS.green} style={{ marginRight: 6 }} />}
            <Text style={[styles.outlineText, textStyle]}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity onPress={onPress} disabled={loading || disabled} activeOpacity={0.85} style={[styles.ghostBtn, style]}>
      <View style={styles.row}>
        {icon && <Ionicons name={icon} size={18} color={COLORS.textSecondary} style={{ marginRight: 6 }} />}
        <Text style={[styles.ghostText, textStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold },
  outlineBtn: { borderRadius: RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.green },
  outlineText: { color: COLORS.green, fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold },
  ghostBtn: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, alignItems: 'center' },
  ghostText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.base },
});
