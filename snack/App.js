import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './context/AppContext';
import HomeScreen from './screens/HomeScreen';
import NutritionScreen from './screens/NutritionScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import ProgressScreen from './screens/ProgressScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const COLORS = {
  bg: '#0A0A0F',
  card: '#13131A',
  green: '#22C55E',
  blue: '#3B82F6',
  orange: '#F97316',
  text: '#FFFFFF',
  muted: '#9CA3AF',
  border: '#1F2937',
};

function CustomTabBar({ state, descriptors, navigation }) {
  const tabs = [
    { name: 'Home', icon: 'home', label: 'Inicio' },
    { name: 'Nutrition', icon: 'nutrition', label: 'Nutrición' },
    { name: 'Workout', icon: 'barbell', label: 'Entreno' },
    { name: 'Progress', icon: 'trending-up', label: 'Progreso' },
    { name: 'Profile', icon: 'person', label: 'Perfil' },
  ];

  return (
    <View style={tabStyles.container}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tab = tabs[index];
        const color = isFocused
          ? index === 1 ? COLORS.green : index === 2 ? COLORS.orange : index === 3 ? COLORS.blue : COLORS.green
          : COLORS.muted;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={tabStyles.tab}
            activeOpacity={0.7}
          >
            <View style={[tabStyles.iconWrap, isFocused && { backgroundColor: color + '22' }]}>
              <Ionicons name={isFocused ? tab.icon : tab.icon + '-outline'} size={22} color={color} />
            </View>
            <Text style={[tabStyles.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#13131A',
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    paddingBottom: 20,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  iconWrap: { borderRadius: 10, padding: 5 },
  label: { fontSize: 10, fontWeight: '600' },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Nutrition" component={NutritionScreen} />
            <Tab.Screen name="Workout" component={WorkoutScreen} />
            <Tab.Screen name="Progress" component={ProgressScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
