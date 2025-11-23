import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  // cargar fuentes
  const [fontsLoaded] = useFonts({
    'Comfortaa-Regular': require('../../assets/fonts/Comfortaa-Regular.ttf'),
    'Comfortaa-Medium': require('../../assets/fonts/Comfortaa-Medium.ttf'),
    'Comfortaa-Bold': require('../../assets/fonts/Comfortaa-Bold.ttf'),
  });
  
  const params = useLocalSearchParams();

  // obtener usermail 
  const userEmail = params.userEmail || 'Email no encontrado';

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cuenta</Text>
      
      {/* icono usuario */}
      <View style={styles.iconContainer}>
        <Ionicons name="person" size={80} color="#FF69B4" />
      </View>

      {/* email */}
      <View style={styles.infoRow}>
        <Ionicons name="send-outline" size={24} color="#FF69B4" />
        <View style={styles.textContainer}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.emailText}>{userEmail}</Text>
        </View>
      </View>
      
    </View>
  );
}

// estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF0F5', 
  },
  header: {
    fontSize: 28,
    fontFamily: 'Comfortaa-Bold',
    marginBottom: 20,
    color: '#FF1493', 
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', 
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF69B4', 
    shadowColor: '#FFB6D9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    marginLeft: 15,
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Comfortaa-Regular',
    color: '#FFB6D9', 
    marginBottom: 3,
  },
  emailText: {
    fontSize: 18,
    fontFamily: 'Comfortaa-Medium',
    color: '#FF1493', 
  },
});
