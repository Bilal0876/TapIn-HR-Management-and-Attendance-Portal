import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { CustomTabBar } from '@/components/CustomTabBar';

export default function EmployeeLayout() {
  usePushNotifications();
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Actions',
          tabBarIcon: ({ color, size }) => <Ionicons name="apps" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-corrections"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
      {/* Hidden — accessed via tapping a card in History */}
      <Tabs.Screen name="request-correction" options={{ href: null }} />
    </Tabs>
  );
}
