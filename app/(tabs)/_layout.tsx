import { FontAwesome } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Tabs, useLocalSearchParams } from 'expo-router';
import LogoutButton from '../LogoutButton';

export default function TabLayout() {
  // cargar fuentes
  const [fontsLoaded] = useFonts({
    'Comfortaa-Medium': require('../../assets/fonts/Comfortaa-Medium.ttf'),
  });

  const { userEmail } = useLocalSearchParams();
  
  // useremail a string
  const emailString = userEmail ? String(userEmail) : '';

  if (!fontsLoaded) {
    return null;
  }
  
  const headerTheme = {
    headerShown: true, 
    headerStyle: { backgroundColor: '#FFF0F5' }, 
    headerTintColor: '#FF1493',
    headerTitleStyle: { fontFamily: 'Comfortaa-Medium' },
    headerRight: () => <LogoutButton />, 
  };

  return (
    <Tabs 
        screenOptions={{ 
            
            tabBarActiveTintColor: '#FF69B4', // paleta rosa
            tabBarInactiveTintColor: '#FFB6D9',
            tabBarStyle: {
                backgroundColor: '#FFF0F5',
                borderTopColor: '#FFB6D9',
            },
            tabBarLabelStyle: {
                fontFamily: 'Comfortaa-Medium',
            }
        }}
    >
      
      {/* tab de inicio */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          
          ...headerTheme, 
          
          href: { pathname: '/(tabs)', params: { userEmail: emailString } },
          tabBarIcon: ({ color }) => <FontAwesome name="home" color={color} size={24} />,
        }}
      />

      {/* tab de to-do list */}
      <Tabs.Screen
        name="todo"
        options={{
          title: 'To-Do List',
          
          ...headerTheme, 
          
          href: { pathname: '/(tabs)/todo', params: { userEmail: emailString } },
          tabBarIcon: ({ color }) => <FontAwesome name="list" color={color} size={24} />,
        }}
      />

      {/* tab perfil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          
          ...headerTheme, 
          
          href: { pathname: '/(tabs)/profile', params: { userEmail: emailString } },
          tabBarIcon: ({ color }) => <FontAwesome name="user" color={color} size={24} />,
        }}
      />
      
    </Tabs>
  );
}
