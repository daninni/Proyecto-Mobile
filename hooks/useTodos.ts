import { useCallback, useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { imageService } from '@/services/image-service';
import { todoService, Todo, Location as LocationCoords } from '@/services/todo-service';

interface LocationResult {
    coords: LocationCoords;
    label?: string;
}

export function useTodos(token: string | null) {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(false);
    const [mutating, setMutating] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [locationNames, setLocationNames] = useState<Record<string, string>>({});
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [uploadedImageUri, setUploadedImageUri] = useState<string | null>(null);

    const ensureToken = () => {
        if (!token) {
            throw new Error('No hay token de sesión');
        }
    };

    const refresh = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const items = await todoService.getTodos(token);
            setTodos(items);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar tareas');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const uploadPhoto = useCallback(async (localUri: string) => {
        ensureToken();
        setUploadingImage(true);
        setError(null);
        try {
            const imageUploadService = imageService.getImageUploadService({ token: token as string });

            const uriParts = localUri.split('.');
            const fileType = uriParts[uriParts.length - 1];

            const formData = new FormData();
            formData.append('image', {
                uri: localUri,
                name: `photo.${fileType}`,
                type: `image/${fileType}`,
            } as any);

            const url = await imageUploadService.uploadImage(formData);
            setUploadedImageUrl(url);
            setUploadedImageUri(localUri);
            return url;
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Error al subir la imagen';
            setError(message);
            throw new Error(message);
        } finally {
            setUploadingImage(false);
        }
    }, [token]);

    const clearUploadedImage = useCallback(() => {
        setUploadedImageUrl(null);
        setUploadedImageUri(null);
    }, []);

    const createTodo = useCallback(async (title: string, location?: LocationCoords | null) => {
        ensureToken();
        setMutating(true);
        setError(null);
        try {
            const created = await todoService.createTodo(token as string, {
                title,
                completed: false,
                location: location ?? undefined,
                photoUri: uploadedImageUrl || undefined,
            });
            setTodos((prev) => [...prev, created]);
            clearUploadedImage();
            return created;
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Error al crear la tarea';
            setError(message);
            throw new Error(message);
        } finally {
            setMutating(false);
        }
    }, [token, uploadedImageUrl, clearUploadedImage]);

    const toggleCompletion = useCallback(async (todo: Todo) => {
        ensureToken();
        setMutating(true);
        setError(null);
        try {
            const updated = await todoService.updateTodo(token as string, todo.id, {
                completed: !todo.completed,
            });
            setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            return updated;
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Error al actualizar la tarea';
            setError(message);
            throw new Error(message);
        } finally {
            setMutating(false);
        }
    }, [token]);

    const updateTitle = useCallback(async (todoId: string, title: string) => {
        ensureToken();
        setMutating(true);
        setError(null);
        try {
            const updated = await todoService.updateTodo(token as string, todoId, { title });
            setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            return updated;
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Error al actualizar la tarea';
            setError(message);
            throw new Error(message);
        } finally {
            setMutating(false);
        }
    }, [token]);

    const deleteTodo = useCallback(async (todoId: string) => {
        ensureToken();
        setMutating(true);
        setError(null);
        try {
            await todoService.deleteTodo(token as string, todoId);
            setTodos((prev) => prev.filter((t) => t.id !== todoId));
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Error al eliminar la tarea';
            setError(message);
            throw new Error(message);
        } finally {
            setMutating(false);
        }
    }, [token]);

    const capturePhoto = useCallback(async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.status !== 'granted') {
            throw new Error('Permiso de cámara denegado');
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            cameraType: ImagePicker.CameraType.back,
        });

        if (result.canceled || !result.assets?.length) {
            return null;
        }

        return result.assets[0].uri;
    }, []);

    const requestLocation = useCallback(async (): Promise<LocationResult> => {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
            throw new Error('Permiso de ubicación denegado');
        }

        const position = await Location.getCurrentPositionAsync({});
        const coords: LocationCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        };

        let label: string | undefined;
        try {
            const results = await Location.reverseGeocodeAsync(coords);
            if (results.length > 0) {
                const r = results[0];
                const parts = [r.name, r.street, r.city, r.region, r.country].filter(Boolean);
                label = parts.slice(0, 2).join(', ') || undefined;
            }
        } catch {
            // silencioso
        }

        return { coords, label };
    }, []);

    useEffect(() => {
        if (!token) {
            setTodos([]);
            return;
        }
        refresh();
    }, [token, refresh]);

    useEffect(() => {
        const fetchLabels = async () => {
            const pending = todos.filter((t) => t.location && !locationNames[t.id]);
            if (!pending.length) return;

            const entries = await Promise.all(
                pending.map(async (t) => {
                    const loc = t.location as LocationCoords;
                    try {
                        const results = await Location.reverseGeocodeAsync(loc);
                        if (results.length > 0) {
                            const r = results[0];
                            const parts = [r.name, r.street, r.city, r.region, r.country].filter(Boolean);
                            const label = parts.slice(0, 2).join(', ') || '';
                            return [t.id, label] as const;
                        }
                    } catch {
                    }
                    return [t.id, ''] as const;
                })
            );

            setLocationNames((prev) => {
                const next = { ...prev };
                for (const [id, label] of entries) {
                    if (label) {
                        next[id] = label;
                    }
                }
                return next;
            });
        };

        fetchLabels();
    }, [todos, locationNames]);

    return {
        todos,
        loading,
        mutating,
        uploadingImage,
        error,
        locationNames,
        uploadedImageUrl,
        uploadedImageUri,
        refresh,
        createTodo,
        toggleCompletion,
        updateTitle,
        deleteTodo,
        uploadPhoto,
        clearUploadedImage,
        capturePhoto,
        requestLocation,
    };
}
