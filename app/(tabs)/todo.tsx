import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Modal } from 'react-native';
import { useAuth } from '@/context/auth-context';
import { todoService, Todo, Location as LocationCoords } from '@/services/todo-service';

export default function TodoScreen() {
  const [fontsLoaded] = useFonts({
    'Comfortaa-Regular': require('../../assets/fonts/Comfortaa-Regular.ttf'),
    'Comfortaa-Medium': require('../../assets/fonts/Comfortaa-Medium.ttf'),
    'Comfortaa-Bold': require('../../assets/fonts/Comfortaa-Bold.ttf'),
  });

  const { token, userEmail } = useAuth();
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(false);
  const [nombreUbicacion, setNombreUbicacion] = useState<string | null>(null);
  const [nombresPorTarea, setNombresPorTarea] = useState<Record<string, string>>({});
  const [editVisible, setEditVisible] = useState(false);
  const [tareaEditando, setTareaEditando] = useState<Todo | null>(null);
  const [tituloEditado, setTituloEditado] = useState('');
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  // cargar tareas
  const cargarTareas = async () => {
    if (!token) return;
    try {
      const tareas = await todoService.getTodos(token);
      setTasks(tareas);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las tareas');
    }
  };

  // pedir permisos
  const pedirPermisos = async () => {
    await ImagePicker.requestCameraPermissionsAsync();
    await Location.requestForegroundPermissionsAsync();
  };

  // tomar foto
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

  // obtener ubicación
  const obtenerUbicacion = async () => {
    const permiso = await Location.requestForegroundPermissionsAsync();
    if (permiso.status !== 'granted') {
      Alert.alert('Error', 'Se necesita permiso para la ubicación');
      return;
    }

    try {
      const ubicacion = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: ubicacion.coords.latitude,
        longitude: ubicacion.coords.longitude,
      };
      setLocation(coords);

      // obtener nombre de la ciudad
      try {
        const resultados = await Location.reverseGeocodeAsync(coords);
        if (resultados.length > 0) {
          const r = resultados[0];
          const partes = [r.name, r.street, r.city, r.region, r.country].filter(Boolean);
          const nombre = (partes.slice(0, 2).join(', ') || 'Ubicación');
          setNombreUbicacion(nombre);
          Alert.alert('Listo', `Ubicación guardada: ${nombre}`);
          return;
        }
      } catch (e) {
        // si falla, no pasa nada
      }
      setNombreUbicacion(null);
      Alert.alert('Listo', 'Ubicación guardada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    }
  };

  // agregar tarea
  const agregarTarea = async () => {
    if (!text || !token) {
      Alert.alert('Error', 'Añade un título a la tarea');
      return;
    }

    setLoading(true);
    try {
      const nuevaTarea = await todoService.createTodo(token, {
        title: text,
        completed: false,
        location: location || undefined,
        photoUri: image || undefined,
      });

      setTasks([...tasks, nuevaTarea]);
      setText('');
      setImage(null);
      setLocation(null);
      setNombreUbicacion(null);
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la tarea');
    } finally {
      setLoading(false);
    }
  };

  // marcar completada
  const marcarCompletada = async (id: string, completed: boolean) => {
    if (!token) return;
    try {
      const tareaActualizada = await todoService.updateTodo(token, id, {
        completed: !completed,
      });

      setTasks(tasks.map(t => t.id === id ? tareaActualizada : t));
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la tarea');
    }
  };

  // eliminar tarea
  const eliminarTarea = async (id: string) => {
    if (!token) return;
    try {
      await todoService.deleteTodo(token, id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la tarea');
    }
  };

  // abrir modal de edición
  const abrirEdicion = (item: Todo) => {
    setTareaEditando(item);
    setTituloEditado(item.title);
    setEditVisible(true);
  };

  // cancelar edición
  const cancelarEdicion = () => {
    setEditVisible(false);
    setTareaEditando(null);
    setTituloEditado('');
  };

  // guardar edición
  const guardarEdicion = async () => {
    if (!token || !tareaEditando) return;
    const nuevoTitulo = tituloEditado.trim();
    if (!nuevoTitulo) {
      Alert.alert('Validación', 'El título no puede estar vacío.');
      return;
    }
    setGuardandoEdicion(true);
    try {
      const actualizada = await todoService.updateTodo(token, tareaEditando.id, { title: nuevoTitulo });
      setTasks(prev => prev.map(t => (t.id === actualizada.id ? actualizada : t)));
      cancelarEdicion();
      Alert.alert('Éxito', 'Tarea modificada');
    } catch (e) {
      Alert.alert('Error', 'No se pudo modificar la tarea');
    } finally {
      setGuardandoEdicion(false);
    }
  };

  useEffect(() => {
    cargarTareas();
    pedirPermisos();
  }, [token]);

  useEffect(() => {
    const cargarNombres = async () => {
      const pendientes = tasks.filter(t => t.location && !nombresPorTarea[t.id]);
      if (!pendientes.length) return;

      const entradas = await Promise.all(
        pendientes.map(async (t) => {
          const loc = t.location as { latitude: number; longitude: number };
          try {
            const resultados = await Location.reverseGeocodeAsync(loc);
            if (resultados.length > 0) {
              const r = resultados[0];
              const partes = [r.name, r.street, r.city, r.region, r.country].filter(Boolean);
              const nombre = (partes.slice(0, 2).join(', ') || 'Ubicación');
              return [t.id, nombre] as const;
            }
          } catch (e) {
            // Ignorar
          }
          return [t.id, ''] as const;
        })
      );

      setNombresPorTarea((prev) => {
        const next = { ...prev };
        for (const [id, nombre] of entradas) {
          if (nombre) next[id] = nombre;
        }
        return next;
      });
    };
    cargarNombres();
  }, [tasks]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
    >
      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={cancelarEdicion}>
        <View style={styles.modalFondo}>
          <View style={styles.modalCaja}>
            <Text style={styles.modalTitulo}>Editar tarea</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nuevo título"
              placeholderTextColor="#FFB6D9"
              value={tituloEditado}
              onChangeText={setTituloEditado}
              editable={!guardandoEdicion}
            />
            <View style={styles.modalBotonera}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancelar]} onPress={cancelarEdicion} disabled={guardandoEdicion}>
                <Text style={styles.modalBtnTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGuardar, { opacity: guardandoEdicion ? 0.6 : 1 }]} onPress={guardarEdicion} disabled={guardandoEdicion}>
                {guardandoEdicion ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.modalBtnTexto, { color: '#FFFFFF' }]}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Mis Tareas</Text>
        <Text style={styles.userText}>{userEmail}</Text>
      </View>

      {/* form nueva tarea */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nueva tarea..."
          placeholderTextColor="#FFB6D9"
          value={text}
          onChangeText={setText}
          editable={!loading}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={tomarFoto} style={styles.iconButton} disabled={loading}>
            <Ionicons name="camera-outline" size={20} color="#FF69B4" />
            <Text style={styles.iconButtonText}>Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={obtenerUbicacion} style={styles.iconButton} disabled={loading}>
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
            <Text style={styles.statusText}>
              {nombreUbicacion ?? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.addButton, { opacity: (!text || loading) ? 0.5 : 1 }]}
          onPress={agregarTarea}
          disabled={!text || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.addButtonText}>AGREGAR TAREA</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* lista de tareas */}
      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkbox-outline" size={60} color="#FFB6D9" />
          <Text style={styles.emptyText}>No hay tareas aún</Text>
        </View>
      ) : (
        tasks.map((item) => (
          <View key={item.id} style={[styles.card, item.completed && styles.cardCompleted]}>
            <View style={styles.cardContent}>
              {item.photoUri && <Image source={{ uri: item.photoUri }} style={styles.taskImage} />}
              <View style={{ marginLeft: item.photoUri ? 10 : 0, flex: 1 }}>
                <Text style={[styles.taskTitle, item.completed && styles.textCompleted]}>
                  {item.title}
                </Text>
                {item.location && (
                  <View style={styles.locationContainer}>
                    <Ionicons name="location" size={12} color="#FFB6D9" />
                    <Text style={styles.taskSub}>
                      {nombresPorTarea[item.id] ?? `${item.location.latitude.toFixed(2)}, ${item.location.longitude.toFixed(2)}`}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => abrirEdicion(item)}
                style={styles.actionButton}
              >
                <Ionicons name="pencil-outline" size={24} color="#FFB6D9" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => marcarCompletada(item.id, item.completed)}
                style={styles.actionButton}
              >
                <Ionicons
                  name={item.completed ? 'arrow-undo-outline' : 'checkmark-circle-outline'}
                  size={24}
                  color="#FF69B4"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => eliminarTarea(item.id)}
                style={styles.actionButton}
              >
                <Ionicons name="trash-outline" size={24} color="#FF1493" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFF0F5',
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontFamily: 'Comfortaa-Bold',
    color: '#FF1493',
  },
  userText: {
    fontSize: 14,
    fontFamily: 'Comfortaa-Regular',
    color: '#FFB6D9',
    marginTop: 5,
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
    flex: 1,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Comfortaa-Regular',
    color: '#FFB6D9',
    marginTop: 10,
  },
  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCaja: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFB6D9',
    padding: 16,
  },
  modalTitulo: {
    fontSize: 18,
    fontFamily: 'Comfortaa-Bold',
    color: '#FF1493',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#FFB6D9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FF1493',
    fontFamily: 'Comfortaa-Regular',
  },
  modalBotonera: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  modalBtnCancelar: {
    borderColor: '#FFB6D9',
  },
  modalBtnGuardar: {
    backgroundColor: '#FF69B4',
    borderColor: '#FF69B4',
  },
  modalBtnTexto: {
    color: '#FF69B4',
    fontFamily: 'Comfortaa-Bold',
  },
});