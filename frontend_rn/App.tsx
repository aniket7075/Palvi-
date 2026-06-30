import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeState } from './src/services/stateService';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { ThemeProvider } from './src/theme/ThemeContext';
import NotificationManager from './src/services/NotificationManager';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startApp = async () => {
      await initializeState();
      try {
        const role = await AsyncStorage.getItem('role');
        const outletId = await AsyncStorage.getItem('outletId');
        if (role) {
          await NotificationManager.subscribeToRoleTopic(role, outletId || undefined);
        }
      } catch (e) {
        console.error('FCM init subscription error:', e);
      }
      setLoading(false);
    };
    startApp();

    // Initialize FCM notifications
    const unsubscribe = NotificationManager.initialize();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#704235" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#fbf8f3" />
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fbf8f3',
  },
});

export default App;
