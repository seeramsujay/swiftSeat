import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { MessageSquare, Map as MapIcon, ShoppingBag, User } from 'lucide-react-native';
import { Theme } from './constants/Theme';

// Screens
import ConciergeScreen from './screens/ConciergeScreen';
import LiveMapScreen from './screens/LiveMapScreen';
import OrdersScreen from './screens/OrdersScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            borderTopWidth: 0,
            backgroundColor: 'rgba(16, 20, 26, 0.9)',
            height: 80,
            paddingBottom: 20,
          },
          tabBarActiveTintColor: Theme.colors.primary,
          tabBarInactiveTintColor: Theme.colors.textVariant,
          tabBarBackground: () => (
            <BlurView intensity={80} tint="dark" style={{ flex: 1 }} />
          ),
          tabBarIcon: ({ color, size }) => {
            switch (route.name) {
              case 'Concierge':
                return <MessageSquare size={size} color={color} />;
              case 'Map':
                return <MapIcon size={size} color={color} />;
              case 'Orders':
                return <ShoppingBag size={size} color={color} />;
              case 'Profile':
                return <User size={size} color={color} />;
              default:
                return null;
            }
          },
        })}
      >
        <Tab.Screen name="Concierge" component={ConciergeScreen} />
        <Tab.Screen name="Map" component={LiveMapScreen} />
        <Tab.Screen name="Orders" component={OrdersScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
