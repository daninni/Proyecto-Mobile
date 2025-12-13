import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/auth-context';

// componente pantalla de login
export default function LoginScreen() {
    // cargar fuentes
    const [fontsLoaded] = useFonts({
        'Comfortaa-Regular': require('../assets/fonts/Comfortaa-Regular.ttf'),
        'Comfortaa-Medium': require('../assets/fonts/Comfortaa-Medium.ttf'),
        'Comfortaa-Bold': require('../assets/fonts/Comfortaa-Bold.ttf'),
    });
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { login, loading } = useAuth();

    //  iniciar sesión
    const handleLogin = async () => {
        setError('');
        try {
            await login(email, password);
            router.replace({ pathname: '/(tabs)', params: { userEmail: email } });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
        }
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
    <View style={styles.container}>
        <View style={styles.headerRow}>
            <Text style={styles.welcomeText}>Bienvenido</Text>
            <Ionicons name="rose-outline" size={60} color="#FF69B4" />
        </View>

        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        <View style={styles.formContainer}>
            {/* email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
                style={styles.input}
                placeholder="usuario@email.com"
                placeholderTextColor="#FFB6D9"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                editable={!loading}
            />

            {/* password */}
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
                style={styles.input}
                placeholder="********"
                placeholderTextColor="#FFB6D9"
                secureTextEntry 
                value={password}
                onChangeText={setPassword}
                editable={!loading}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}


            <TouchableOpacity
                style={[styles.loginButton, { opacity: (!email || !password || loading) ? 0.5 : 1 }]}
                onPress={handleLogin}
                disabled={!email || !password || loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                )}
            </TouchableOpacity>
    
        </View>
    </View>
    );
}

// estilos
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF0F5', 
        padding: 20,
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginTop: 60,
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 32,
        fontFamily: 'Comfortaa-Bold',
        color: '#FF69B4',
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Comfortaa-Regular',
        color: '#FFB6D9',
        marginBottom: 30,
        textAlign: 'center',
    },
    formContainer: {
        alignItems: 'center',
        width: '100%',
    },
    input: {
        height: 50,
        borderColor: '#FFB6D9', 
        borderWidth: 2,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderRadius: 12,
        backgroundColor: '#FFFFFF', 
        color: '#FF1493',
        fontFamily: 'Comfortaa-Regular',
        width: '100%',
        maxWidth: 400,
    },
    errorText: {
        color: '#FF1493',
        textAlign: 'center',
        marginBottom: 15,
        fontFamily: 'Comfortaa-Medium',
    },
    loginButton: {
        backgroundColor: '#FF69B4', 
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
        shadowColor: '#FF1493',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        width: '100%',
        maxWidth: 400,
    },
    loginButtonText: {
        color: '#FFFFFF', 
        fontSize: 18,
        fontFamily: 'Comfortaa-Bold',
    },
    label: { 
        fontSize: 16,
        color: '#FF1493', 
        marginBottom: 5,
        fontFamily: 'Comfortaa-Medium',
        letterSpacing: 0.5,
        width: '100%',
        maxWidth: 400,
    },
    footerText: {
        fontSize: 14,
        fontFamily: 'Comfortaa-Regular',
        color: '#FFB6D9',
        textAlign: 'center',
        marginTop: 20,
    },

});