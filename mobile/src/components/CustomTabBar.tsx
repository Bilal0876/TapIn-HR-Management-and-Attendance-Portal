import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const C = {
  navy: '#0F1D3A',
  accent: '#5BA3F5',
  teal: '#1DB8A0',
  inactive: '#8A9BB5',
};

function TabItem({
  isFocused,
  label,
  iconNode,
  onPress,
}: {
  isFocused: boolean;
  label: string;
  iconNode: React.ReactNode;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pillOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const pillScale = useRef(new Animated.Value(isFocused ? 1 : 0.7)).current;
  const labelOpacity = useRef(new Animated.Value(isFocused ? 1 : 0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(pillScale, {
        toValue: isFocused ? 1 : 0.7,
        useNativeDriver: true,
        friction: 7,
        tension: 180,
      }),
      Animated.timing(pillOpacity, {
        toValue: isFocused ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(labelOpacity, {
        toValue: isFocused ? 1 : 0.45,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 200,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
      style={styles.tabItem}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
    >
      <Animated.View style={{ alignItems: 'center', transform: [{ scale: scaleAnim }] }}>
        {/* Pill background */}
        <Animated.View
          style={[
            styles.pill,
            {
              opacity: pillOpacity,
              transform: [{ scaleX: pillScale }, { scaleY: pillScale }],
            },
          ]}
        />

        {/* Icon — renders on top of pill */}
        <View style={styles.iconWrap}>{iconNode}</View>

        {/* Label */}
        <Animated.Text
          style={[
            styles.label,
            {
              color: isFocused ? C.accent : C.inactive,
              fontWeight: isFocused ? '700' : '500',
              opacity: labelOpacity,
            },
          ]}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Filter out Expo Router screens declared with href:null (hidden routes)
  const visibleRoutes = state.routes.filter(
    (route) => (descriptors[route.key].options as any).href !== null
  );

  return (
    <View style={[styles.outerWrap, { paddingBottom: insets.bottom > 0 ? insets.bottom - 4 : 12 }]}>
      <View style={styles.bar}>
        {visibleRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
              ? options.title
              : route.name;

          const isFocused = state.routes[state.index]?.key === route.key;
          const iconColor = isFocused ? C.accent : C.inactive;

          const iconNode = options.tabBarIcon?.({
            color: iconColor,
            size: 22,
            focused: isFocused,
          });

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              label={label}
              iconNode={iconNode}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingVertical: 10,
    paddingHorizontal: 4,
    shadowColor: '#0F1D3A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 28,
    elevation: 18,
    borderWidth: 1,
    borderColor: 'rgba(15,29,58,0.06)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  pill: {
    position: 'absolute',
    width: 52,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(91,163,245,0.13)',
    top: 0,
  },
  iconWrap: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    fontSize: 10.5,
    letterSpacing: 0.2,
    marginTop: 1,
  },
});
