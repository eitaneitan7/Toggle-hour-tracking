import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HoursProvider } from './context/HoursContext';
import HomeScreen from './components/HomeScreen';
import ManageDays from './components/ManageDays';
import SettingsScreen from './components/SettingsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'react-native';


const Tab = createBottomTabNavigator();

export default function App() {
  const [togglApiKey, setTogglApiKey] = useState('');
  const [togglWorkspaceId, setTogglWorkspaceId] = useState('');

  useEffect(() => {
    // Load Toggl API key and workspace ID from AsyncStorage on app start
    const loadSettings = async () => {
      try {
        const apiKey = await AsyncStorage.getItem('togglApiKey');
        const workspaceId = await AsyncStorage.getItem('togglWorkspaceId');
        if (apiKey && workspaceId) {
          setTogglApiKey(apiKey);
          setTogglWorkspaceId(workspaceId);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  return (
    <HoursProvider togglApiKey={togglApiKey} togglWorkspaceId={togglWorkspaceId}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = 'home';
              } else if (route.name === 'Manage Days') {
                iconName = 'calendar';
              } else if (route.name === 'Settings') {
                iconName = 'settings';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: { display: 'flex' },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Manage Days" component={ManageDays} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </HoursProvider>
  );
}
