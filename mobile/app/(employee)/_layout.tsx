import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function EmployeeLayout() {
  usePushNotifications();
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarStyle: { height: 64, paddingBottom: 10, paddingTop: 10 },
      tabBarActiveTintColor: '#5BA3F5',
      tabBarInactiveTintColor: '#8A9BB5',
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' }
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Actions',
          tabBarIcon: ({ color, size }) => <Ionicons name="apps" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="history" 
        options={{ 
          title: 'History',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="summary" 
        options={{ 
          title: 'Insights',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />
        }} 
      />
    </Tabs>
  );
}
