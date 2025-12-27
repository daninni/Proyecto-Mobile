import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '@/context/auth-context';

function AuthenticatedLayout() {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthScreen = segments[0] === 'login';

    if (!token && !inAuthScreen) {
      router.replace('/login');
    }

    if (token && inAuthScreen) {
      router.replace('/(tabs)');
    }
  }, [loading, token, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false, 
          title: "Iniciar sesión" 
        }} 
      />
      
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false, 
        }} 
      />
      
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthenticatedLayout />
    </AuthProvider>
  );
}