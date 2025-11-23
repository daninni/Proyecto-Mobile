import { Stack } from 'expo-router';

export default function RootLayout() {
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