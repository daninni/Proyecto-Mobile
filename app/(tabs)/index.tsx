import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  // cargar fuentes
  const [fontsLoaded] = useFonts({
    'Comfortaa-Bold': require('../../assets/fonts/Comfortaa-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido de vuelta</Text>
      <Ionicons name="rose-outline" size={100} color="#FF69B4" />
    </View>
  );
}

// estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF0F5', 
  },
  title: {
    fontSize: 32,
    fontFamily: 'Comfortaa-Bold',
    color: '#FF1493', 
    textAlign: 'center',
    marginBottom: 30,
  }
});
