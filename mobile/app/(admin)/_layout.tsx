import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { CustomTabBar, TAB_BAR_HEIGHT } from '@/components/CustomTabBar';

export default function AdminLayout() {
  usePushNotifications();
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...(props as any)} />}
      screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="employees"
        options={{
          title: 'Directory',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="corrections"
        options={{
          title: 'Corrections',
          tabBarIcon: ({ color, size }) => <Ionicons name="checkmark-circle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="leave-approvals"
        options={{
          href: null,
          title: 'Leaves',
          tabBarIcon: ({ color, size }) => <Ionicons name="airplane" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />,
        }}
      />
      {/* Hidden route — accessed via tapping button in Directory */}
      <Tabs.Screen
        name="create-employee"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="shift-settings"
        options={{ href: null }}
      />
    </Tabs>
  );
}
