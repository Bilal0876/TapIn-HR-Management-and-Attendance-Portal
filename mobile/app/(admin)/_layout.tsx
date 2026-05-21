import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function AdminLayout() {
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
          title: 'Insights',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="employees" 
        options={{ 
          title: 'Directory',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="corrections" 
        options={{ 
          title: 'Approvals',
          tabBarIcon: ({ color, size }) => <Ionicons name="checkmark-circle" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="reports" 
        options={{ 
          title: 'Reports',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Account',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />
        }} 
      />
    </Tabs>
  );
}
