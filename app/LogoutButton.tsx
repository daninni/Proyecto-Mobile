import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
    button: {
        marginRight: 15, 
    },
});

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = () => {
        router.replace('/login');
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Ionicons name="exit-outline" size={28} color="#FF1493" />
        </TouchableOpacity>
    );
}