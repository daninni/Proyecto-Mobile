import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/auth-context';
import { useTodos } from '@/hooks/useTodos';
import { Location as LocationCoords, Todo } from '@/services/todo-service';

export default function TodoScreen() {
  const [fontsLoaded] = useFonts({
    'Comfortaa-Regular': require('../../assets/fonts/Comfortaa-Regular.ttf'),
    'Comfortaa-Medium': require('../../assets/fonts/Comfortaa-Medium.ttf'),
    'Comfortaa-Bold': require('../../assets/fonts/Comfortaa-Bold.ttf'),
  });

  const { token, userEmail } = useAuth();
  const {
    todos,
    loading,
    mutating,
    uploadingImage,
    locationNames,
    uploadedImageUrl,
    uploadedImageUri,
    createTodo,
    toggleCompletion,
    deleteTodo,
    updateTitle,
    capturePhoto,
    requestLocation,
    uploadPhoto,
    clearUploadedImage,
  } = useTodos(token);

  const [text, setText] = useState('');
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [tareaEditando, setTareaEditando] = useState<Todo | null>(null);
  const [tituloEditado, setTituloEditado] = useState('');
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const handlePhoto = async () => {
    try {
      const result = await capturePhoto();
      if (result) {
        await uploadPhoto(result);
      }
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Error al procesar foto');
    }
  };



  const handleLocation = async () => {
    try {
      const { coords, label } = await requestLocation();
      setLocation(coords);
      setLocationLabel(label ?? null);
      Alert.alert('Listo', label ? `Ubicación guardada: ${label}` : 'Ubicación guardada');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo obtener la ubicación');
    }
  };

  const handleAdd = async () => {
    const title = text.trim();
    if (!title) {
      Alert.alert('Error', 'Añade un título a la tarea');
      return;
    }
    if (!token) {
      Alert.alert('Sesión', 'Inicia sesión nuevamente');
      return;
    }

    try {
      await createTodo(title, location);
      setText('');
      setLocation(null);
      setLocationLabel(null);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo crear la tarea');
    }
  };

  const handleToggle = async (item: Todo) => {
    try {
      await toggleCompletion(item);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo actualizar la tarea');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo eliminar la tarea');
    }
  };

  const abrirEdicion = (item: Todo) => {
    setTareaEditando(item);
    setTituloEditado(item.title);
    setEditVisible(true);
  };

  const cancelarEdicion = () => {
    setEditVisible(false);
    setTareaEditando(null);
    setTituloEditado('');
  };

  const guardarEdicion = async () => {
    if (!tareaEditando) return;
    const nuevoTitulo = tituloEditado.trim();
    if (!nuevoTitulo) {
      Alert.alert('Validación', 'El título no puede estar vacío.');
      return;
    }
    setGuardandoEdicion(true);
    try {
      await updateTitle(tareaEditando.id, nuevoTitulo);
      cancelarEdicion();
      Alert.alert('Éxito', 'Tarea modificada');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo modificar la tarea');
    } finally {
      setGuardandoEdicion(false);
    }
  };

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
          editable={!mutating}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={handlePhoto} style={styles.iconButton} disabled={uploadingImage}>
            <Ionicons name="camera-outline" size={20} color="#FF69B4" />
            <Text style={styles.iconButtonText}>Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLocation} style={styles.iconButton} disabled={uploadingImage}>
            <Ionicons name="location-outline" size={20} color="#FF69B4" />
            <Text style={styles.iconButtonText}>Ubicación</Text>
          </TouchableOpacity>
        </View>

        {uploadedImageUrl && (
          <View style={styles.statusRow}>
            <Ionicons name="checkmark-circle" size={20} color="#FF69B4" />
            <Text style={styles.statusText}>✓ Foto subida</Text>
          </View>
        )}
        {location && (
          <View style={styles.statusRow}>
            <Ionicons name="checkmark-circle" size={20} color="#FF69B4" />
            <Text style={styles.statusText}>
              {locationLabel ?? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.addButton, { opacity: (!text || mutating || uploadingImage) ? 0.5 : 1 }]}
          onPress={handleAdd}
          disabled={!text || mutating || uploadingImage}
        >
          {mutating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.addButtonText}>AGREGAR TAREA</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* lista de tareas */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#FF69B4" />
        </View>
      ) : todos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkbox-outline" size={60} color="#FFB6D9" />
          <Text style={styles.emptyText}>No hay tareas aún</Text>
        </View>
      ) : (
        todos.map((item) => (
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
                      {locationNames[item.id] ?? `${item.location.latitude.toFixed(2)}, ${item.location.longitude.toFixed(2)}`}
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
                onPress={() => handleToggle(item)}
                style={styles.actionButton}
              >
                <Ionicons
                  name={item.completed ? 'arrow-undo-outline' : 'checkmark-circle-outline'}
                  size={24}
                  color="#FF69B4"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
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