import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeState } from './src/services/stateService';
import { LanguageProvider } from './src/i18n/LanguageContext';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startApp = async () => {
      await initializeState();
      setLoading(false);
    };
    startApp();
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
      <LanguageProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#fbf8f3" />
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </LanguageProvider>
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
