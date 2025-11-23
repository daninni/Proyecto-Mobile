import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// interfaz tarea
interface Task {
  id: string;
  title: string;
  imageUri: string | null;
  location: string | null;
  completed: boolean;
}

export default function TodoScreen() {
  // cargar fuentes
  const [fontsLoaded] = useFonts({
    'Comfortaa-Regular': require('../../assets/fonts/Comfortaa-Regular.ttf'),
    'Comfortaa-Medium': require('../../assets/fonts/Comfortaa-Medium.ttf'),
    'Comfortaa-Bold': require('../../assets/fonts/Comfortaa-Bold.ttf'),
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('');

  // carga al usuario y las tareas
  const cargarDatos = async () => {
    const usuario = await AsyncStorage.getItem('usuario_actual');
    if (usuario) {
      setCurrentUser(usuario);
      const tareasGuardadas = await AsyncStorage.getItem(`tasks_${usuario}`);
      if (tareasGuardadas) {
        setTasks(JSON.parse(tareasGuardadas));
      }
    }
  };

  // pedir permisos
  const pedirPermisos = async () => {
    await ImagePicker.requestCameraPermissionsAsync();
    await Location.requestForegroundPermissionsAsync();
  };

  // guardar tareas
  const guardarTareas = async (nuevasTareas: Task[]) => {
    await AsyncStorage.setItem(`tasks_${currentUser}`, JSON.stringify(nuevasTareas));
  };

  // foto
  const tomarFoto = async () => {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (permiso.status !== 'granted') {
      Alert.alert('Error', 'Se necesita permiso para la cámara');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      cameraType: ImagePicker.CameraType.back,
    });

    if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
      setImage(resultado.assets[0].uri);
    }
  };

  // ubicacion
  const obtenerUbicacion = async () => {
    const permiso = await Location.requestForegroundPermissionsAsync();
    if (permiso.status !== 'granted') {
      Alert.alert('Error', 'Se necesita permiso para la ubicación');
      return;
    }

    const ubicacion = await Location.getCurrentPositionAsync({});
    
    // nombre ciudad en vez de coordenadas
    const direccion = await Location.reverseGeocodeAsync({
      latitude: ubicacion.coords.latitude,
      longitude: ubicacion.coords.longitude
    });

    if (direccion && direccion.length > 0) {
      const ciudad = direccion[0].city || direccion[0].region || 'Ubicación desconocida';
      const pais = direccion[0].country || '';
      setLocation(`${ciudad}, ${pais}`);
    } else {
      setLocation('Ubicación obtenida');
    }
    
    Alert.alert("Listo", "Ubicación guardada");
  };

  const agregarTarea = () => {
    if (!text) {
      Alert.alert("Error", "Añade un título a la tarea");
      return;
    }
    
    const nuevaTarea: Task = {
      id: Date.now().toString(),
      title: text,
      imageUri: image,
      location: location || "Ubicación no especificada",
      completed: false
    };

    const listaNueva = [...tasks, nuevaTarea];
    setTasks(listaNueva);
    guardarTareas(listaNueva);
    
    setText('');
    setImage(null);
    setLocation(null);
  };

  // check
  const marcarCompletada = (id: string) => {
    const nuevaLista = tasks.map(tarea => {
      if (tarea.id === id) {
        return { ...tarea, completed: !tarea.completed };
      }
      return tarea;
    });
    setTasks(nuevaLista);
    guardarTareas(nuevaLista);
  };

  // eliminar
  const eliminarTarea = (id: string) => {
    const nuevaLista = tasks.filter(tarea => tarea.id !== id);
    setTasks(nuevaLista);
    guardarTareas(nuevaLista);
  };

  useEffect(() => {
    cargarDatos();
    pedirPermisos();
  }, []);

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Tareas de {currentUser || 'Cargando...'}</Text>
      </View>

      {/* form nueva tarea */}
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Nueva tarea..." 
          placeholderTextColor="#FFB6D9"
          value={text}
          onChangeText={setText}
        />
        
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={tomarFoto} style={styles.iconButton}>
            <Ionicons name="camera-outline" size={20} color="#FF69B4" />
            <Text style={styles.iconButtonText}>Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={obtenerUbicacion} style={styles.iconButton}>
            <Ionicons name="location-outline" size={20} color="#FF69B4" />
            <Text style={styles.iconButtonText}>Ubicación</Text>
          </TouchableOpacity>
        </View>
        
        {image && (
          <View style={styles.statusRow}>
            <Ionicons name="checkmark-circle" size={20} color="#FF69B4" />
            <Text style={styles.statusText}>Imagen lista!</Text>
          </View>
        )}
        {location && (
          <View style={styles.statusRow}>
            <Ionicons name="checkmark-circle" size={20} color="#FF69B4" />
            <Text style={styles.statusText}>Ubicación lista!</Text>
          </View>
        )}

        <TouchableOpacity style={styles.addButton} onPress={agregarTarea}>
          <Text style={styles.addButtonText}>AGREGAR TAREA</Text>
        </TouchableOpacity>
      </View>

      {/* lista de tareas */}
      {tasks.map((item) => (
        <View key={item.id} style={[styles.card, item.completed && styles.cardCompleted]}>
          <View style={styles.cardContent}>
            {item.imageUri && (
              <Image source={{ uri: item.imageUri }} style={styles.taskImage} />
            )}
            <View style={{flex: 1, marginLeft: 10}}>
              <Text style={[styles.taskTitle, item.completed && styles.textCompleted]}>{item.title}</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={14} color="#FFB6D9" />
                <Text style={styles.taskSub}>{item.location}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => marcarCompletada(item.id)} style={styles.actionButton}>
              <Ionicons 
                name={item.completed ? "arrow-undo-outline" : "checkmark-circle-outline"} 
                size={24} 
                color="#FF69B4" 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => eliminarTarea(item.id)} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={24} color="#FF1493" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    backgroundColor: '#FFF0F5', 
    flexGrow: 1 
  },
  headerContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  header: { 
    fontSize: 28, 
    fontFamily: 'Comfortaa-Bold',
    color: '#FF1493', 
    textAlign: 'right',
  },
  userText: {
    fontSize: 14,
    fontFamily: 'Comfortaa-Regular',
    color: '#FFB6D9',
    textAlign: 'right',
    marginBottom: 5,
  },
  inputContainer: { 
    backgroundColor: '#FFFFFF',
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFB6D9',
  },
  input: { 
    borderBottomWidth: 1, 
    borderColor: '#FFB6D9',
    marginBottom: 12, 
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 15,
    fontFamily: 'Comfortaa-Regular',
    color: '#FF1493',
  },
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12,
    gap: 8,
  },
  iconButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#FFB6D9',
    flex: 1,
    gap: 6,
  },
  iconButtonText: {
    color: '#FF69B4',
    fontFamily: 'Comfortaa-Bold',
    fontSize: 13,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    color: '#FF69B4',
    marginLeft: 6,
    fontFamily: 'Comfortaa-Medium',
    fontSize: 13,
  },
  addButton: { 
    backgroundColor: '#FF69B4',
    paddingVertical: 10, 
    paddingHorizontal: 15,
    borderRadius: 6, 
    alignItems: 'center',
    shadowColor: '#FF1493',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: { 
    color: '#FFFFFF',
    fontFamily: 'Comfortaa-Bold',
    fontSize: 15,
  },
  card: { 
    backgroundColor: '#FFFFFF',
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFE4F1',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  cardCompleted: { 
    opacity: 0.6,
    backgroundColor: '#FFF8FC',
    borderColor: '#FFE4F1',
  },
  cardContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  taskImage: { 
    width: 55, 
    height: 55, 
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFE4F1',
  },
  taskTitle: { 
    fontSize: 15, 
    fontFamily: 'Comfortaa-Bold',
    color: '#FF1493',
    marginBottom: 4,
  },
  textCompleted: { 
    textDecorationLine: 'line-through',
    color: '#FFB6D9', 
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  taskSub: { 
    fontSize: 12, 
    fontFamily: 'Comfortaa-Regular',
    color: '#FFB6D9',
  },
  cardActions: { 
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: { 
    padding: 5,
  },
});