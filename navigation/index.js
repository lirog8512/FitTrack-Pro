import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../src/constants/theme';

import WelcomeScreen from '../src/screens/onboarding/WelcomeScreen';
import HomeScreen from '../src/screens/home/HomeScreen';
import NutritionScreen from '../src/screens/nutrition/NutritionScreen';
import WorkoutScreen from '../src/screens/workout/WorkoutScreen';
import ActiveWorkoutScreen from '../src/screens/workout/ActiveWorkoutScreen';
import ProgressScreen from '../src/screens/progress/ProgressScreen';
import ProfileScreen from '../src/screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const NAV_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: COLORS.card,
    text: COLORS.white,
    border: COLORS.border,
  },
};

function CustomTabBar({ state, descriptors, navigation }) {
  const tabs = [
    { name: 'Inicio', icon: 'home', iconOutline: 'home-outline' },
    { name: 'Nutrition', icon: 'restaurant', iconOutline: 'restaurant-outline' },
    { name: 'Workout', icon: 'barbell', iconOutline: 'barbell-outline' },
    { name: 'Progreso', icon: 'trending-up', iconOutline: 'trending-up-outline' },
    { name: 'Perfil', icon: 'person', iconOutline: 'person-outline' },
  ];
  const labels = ['Inicio', 'Nutrición', 'Entreno', 'Progreso', 'Perfil'];

  return (
    <View style={tabStyles.container}>
      <View style={tabStyles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tab = tabs[index];
          const label = labels[index];
          const color = isFocused ? COLORS.green : COLORS.textMuted;

          return (
            <View key={route.key} style={tabStyles.tabItem}>
              {isFocused && (
                <LinearGradient
                  colors={[COLORS.green + '25', COLORS.green + '05']}
                  style={tabStyles.activeIndicator}
                />
              )}
              <View
                style={tabStyles.tabInner}
                onStartShouldSetResponder={() => true}
                onResponderRelease={() => {
                  const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
                }}
              >
                <Ionicons name={isFocused ? tab.icon : tab.iconOutline} size={22} color={color} />
                <View style={[tabStyles.label, isFocused && tabStyles.labelActive]}>
                  <View style={tabStyles.dot} />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} />
      <Tab.Screen name="Workout" component={WorkoutScreen} />
      <Tab.Screen name="Progreso" component={ProgressScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer theme={NAV_THEME}>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: COLORS.background } }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 20,
    paddingTop: 8,
  },
  bar: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    left: 4,
    right: 4,
    height: 48,
    borderRadius: 16,
  },
  tabInner: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  label: { marginTop: 4, width: 4, height: 4 },
  labelActive: {},
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.green },
});
