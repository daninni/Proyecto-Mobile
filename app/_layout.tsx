import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/auth-context';

export default function RootLayout() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}