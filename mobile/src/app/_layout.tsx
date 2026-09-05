import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Inter_500Medium, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { VehicleProvider } from '@/state/vehicle-context';
import { Colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_500Medium, Inter_700Bold });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
      <VehicleProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'slide_from_right',
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="servicio/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="historial/[year]" options={{ presentation: 'card' }} />
          <Stack.Screen name="mapa" options={{ presentation: 'card', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="registrar" options={{ presentation: 'card', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="vehiculo" options={{ presentation: 'card' }} />
          <Stack.Screen name="avisos" options={{ presentation: 'card' }} />
          <Stack.Screen name="onboarding" options={{ presentation: 'card' }} />
          <Stack.Screen name="documentos" options={{ presentation: 'card' }} />
          <Stack.Screen name="proforma" options={{ presentation: 'card' }} />
          <Stack.Screen name="manual" options={{ presentation: 'card' }} />
          <Stack.Screen name="chatbot" options={{ presentation: 'card' }} />
          <Stack.Screen name="reportes" options={{ presentation: 'card' }} />
        </Stack>
      </VehicleProvider>
    </GestureHandlerRootView>
  );
}
