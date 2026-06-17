import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/context/AppContext';
import Navigation from './navigation/index';

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="light" backgroundColor="#0A0A0F" />
      <Navigation />
    </AppProvider>
  );
}
