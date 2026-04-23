import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { HabitsProvider } from './src/context/HabitsContext';

import HomeScreen from './src/screens/HomeScreen';
import HabitsScreen from './src/screens/HabitsScreen';
import AddHabitScreen from './src/screens/AddHabitScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import StatsScreen from './src/screens/StatsScreen';
import EditHabitScreen from './src/screens/EditHabitScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Hoy') iconName = 'home-outline';
          else if (route.name === 'Hábitos') iconName = 'list-outline';
          else if (route.name === 'Agregar') iconName = 'add-circle-outline';
          else if (route.name === 'Agenda') iconName = 'calendar-outline';
          else if (route.name === 'Stats') iconName = 'bar-chart-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2ecc71',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingHorizontal: 0 },
        tabBarItemStyle: { flex: 1 },
      })}
    >
      <Tab.Screen name="Hoy" component={HomeScreen} />
      <Tab.Screen name="Hábitos" component={HabitsScreen} />
      <Tab.Screen name="Agregar" component={AddHabitScreen} />
      <Tab.Screen name="Agenda" component={CalendarScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <HabitsProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="Editar" component={EditHabitScreen} options={{ title: 'Editar hábito' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </HabitsProvider>
  );
}
