import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  navy: '#0F1D3A',
  white: '#FFFFFF',
  accent: '#5BA3F5',
  inactive: '#8A9BB5',
  barBg: '#FFFFFF',
  barBorder: '#E2E8F2',       // subtle border so bar lifts off the page
};

// ── Geometry ──────────────────────────────────────────────────────────────────
const SCREEN_W = Dimensions.get('window').width;
const H_PAD = 10;
const BAR_W = SCREEN_W - H_PAD * 2;
const BAR_H = 66;
const BAR_R = 12;
const CIRCLE_R = 24;  // accent circle radius

// Circle sits just slightly above bar top — close, not floating high
const LIFT = 4;                    // px the circle centre rises above bar top
const ARC_R = CIRCLE_R + 12;       // 36 — generous visible gap around the circle inside the notch
const NOTCH_W = ARC_R * 2;          // mouth width = diameter of arc

// Safe horizontal range for the notch centre — keeps U clear of the rounded corners
const NOTCH_MIN_X = BAR_R + ARC_R + 1;
const NOTCH_MAX_X = BAR_W - BAR_R - ARC_R - 1;

// ── Exported height so screens can add matching paddingBottom ─────────────────
export const TAB_BAR_HEIGHT = BAR_H + 48;  // extra buffer so content never hides under bar

// ── Color that shows through the SVG notch — must contrast with barBg white ──
const NOTCH_BG = 'transparent';

// ── SVG path — perfect U using SVG arc command ────────────────────────────────
// Bezier curves always produce V-shapes at the valley because the tangent
// becomes vertical. An SVG arc (A command) is a literal circle segment —
// guaranteed smooth U with zero tuning required.
function buildPath(cx: number): string {
  const w = BAR_W;
  const h = BAR_H;
  const r = BAR_R;
  const hw = NOTCH_W / 2;  // = ARC_R

  // Clamp so nL >= r and nR <= w-r — notch never fights the rounded corners
  const safeCx = Math.max(NOTCH_MIN_X, Math.min(NOTCH_MAX_X, cx));
  const nL = safeCx - hw;
  const nR = safeCx + hw;

  return (
    `M ${r} 0 ` +
    `L ${nL} 0 ` +
    // Arc: radius=ARC_R, x-rotation=0, large-arc=0, sweep=0 (curves downward)
    `A ${ARC_R} ${ARC_R} 0 0 0 ${nR} 0 ` +
    `L ${w - r} 0 ` +
    `Q ${w} 0 ${w} ${r} ` +
    `L ${w} ${h - r} ` +
    `Q ${w} ${h} ${w - r} ${h} ` +
    `L ${r} ${h} ` +
    `Q 0 ${h} 0 ${h - r} ` +
    `L 0 ${r} ` +
    `Q 0 0 ${r} 0 Z`
  );
}

// ── AnimatedSvgBar ────────────────────────────────────────────────────────────
// Use a ref to the SVG Path node and update it via setNativeProps — zero React
// re-renders, zero flicker. The notchX listener fires on the JS thread each
// frame and directly mutates the native path attribute.
const AnimatedPath = Animated.createAnimatedComponent(Path);

function AnimatedSvgBar({ notchX }: { notchX: Animated.Value }) {
  const pathRef = useRef<any>(null);

  useEffect(() => {
    const id = notchX.addListener(({ value }) => {
      pathRef.current?.setNativeProps({ d: buildPath(value) });
    });
    return () => notchX.removeListener(id);
  }, [notchX]);

  const initialPath = buildPath((notchX as any).__getValue());

  return (
    <Svg width={BAR_W} height={BAR_H} style={StyleSheet.absoluteFill}>
      <Path
        ref={pathRef}
        d={initialPath}
        fill={C.barBg}
        stroke="#D1DCF0"
        strokeWidth={1.5}
      />
    </Svg>
  );
}

// ── Floating active circle ────────────────────────────────────────────────────
function FloatingCircle({
  translateX,
  iconNode,
}: {
  translateX: Animated.Value;
  iconNode: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 200 }),
    ]).start();
  }, [iconNode]);

  const size = CIRCLE_R * 2;
  // Arc is a semicircle with radius ARC_R, lowest point at y=ARC_R from bar top.
  // Circle centre sits at y = ARC_R - CIRCLE_R - LIFT (slightly above arc floor).
  // Circle top edge = centre_y - CIRCLE_R = ARC_R - CIRCLE_R*2 - LIFT
  // Negative value = above bar top = floats up. Positive = sits inside notch.
  const centrY = ARC_R - CIRCLE_R - LIFT;  // relative to bar top (can be negative)
  const top = centrY - CIRCLE_R;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        left: -CIRCLE_R,
        width: size,
        height: size,
        borderRadius: CIRCLE_R,
        transform: [{ translateX }, { scale }],
      }}
    >
      <View style={{
        width: size,
        height: size,
        borderRadius: CIRCLE_R,
        backgroundColor: C.accent,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: C.accent,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.45,
        shadowRadius: 10,
        elevation: 14,
      }}>
        {iconNode}
      </View>
    </Animated.View>
  );
}

// ── Single tab item ───────────────────────────────────────────────────────────
function TabItem({
  route,
  isFocused,
  options,
  onPress,
}: {
  route: any;
  isFocused: boolean;
  options: any;
  onPress: () => void;
}) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const labelOpacity = useRef(new Animated.Value(isFocused ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(labelOpacity, {
      toValue: isFocused ? 0 : 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  const onPressIn = () =>
    Animated.spring(pressScale, { toValue: 0.88, useNativeDriver: true, friction: 8 }).start();
  const onPressOut = () =>
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 200 }).start();

  const label =
    typeof options.tabBarLabel === 'string' ? options.tabBarLabel :
      typeof options.title === 'string' ? options.title :
        route.name;

  // FIX: render null icon when focused — the FloatingCircle handles it
  const iconNode = options.tabBarIcon?.({
    color: isFocused ? 'transparent' : C.inactive,
    size: 22,
    focused: isFocused,
  });

  return (
    <TouchableOpacity
      style={styles.tabTap}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
    >
      <Animated.View style={{ alignItems: 'center', transform: [{ scale: pressScale }] }}>
        {/* Hide icon slot when focused — FloatingCircle shows it instead */}
        <View style={[styles.iconWrap, { opacity: isFocused ? 0 : 1 }]}>
          {iconNode}
        </View>
        <Animated.Text style={[
          styles.label,
          {
            color: isFocused ? C.accent : C.inactive,
            fontWeight: isFocused ? '700' : '500',
            opacity: labelOpacity,
          },
        ]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Main CustomTabBar ─────────────────────────────────────────────────────────
export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Filter out hidden routes like create-employee or request-correction
  // We explicitly define tabBarIcon for valid tabs, so filtering by it is safest
  const visibleRoutes = state.routes.filter(
    (r) => descriptors[r.key].options.tabBarIcon !== undefined
  );

  const tabCount = visibleRoutes.length;
  const tabW = BAR_W / tabCount;
  const focusedKey = state.routes[state.index]?.key;
  const focusedIdx = visibleRoutes.findIndex((r) => r.key === focusedKey);

  const getTabCentreX = (idx: number) => tabW * idx + tabW / 2;
  // Clamp to same safe range used in buildPath so circle & notch always stay in sync
  const rawTargetX = getTabCentreX(focusedIdx);
  const targetX = Math.max(NOTCH_MIN_X, Math.min(NOTCH_MAX_X, rawTargetX));

  const circleX = useRef(new Animated.Value(targetX)).current; // native driver
  const notchX = useRef(new Animated.Value(targetX)).current; // JS thread

  useEffect(() => {
    // Higher tension + friction = snappier, synchronized movement with no overshoot
    const cfg = { friction: 22, tension: 180 };
    Animated.spring(circleX, { toValue: targetX, useNativeDriver: true, ...cfg }).start();
    Animated.spring(notchX, { toValue: targetX, useNativeDriver: false, ...cfg }).start();
  }, [focusedIdx]);

  const activeRoute = visibleRoutes[focusedIdx];
  const activeIconNode = activeRoute
    ? descriptors[activeRoute.key].options.tabBarIcon?.({
      color: C.white, size: 22, focused: true,
    })
    : null;

  return (
    <View style={[
      styles.outer,
      { paddingBottom: insets.bottom > 0 ? insets.bottom - 4 : 12 },
    ]}>

      {/* paddingTop makes room for circle above bar — only needed if centrY < 0 */}
      <View style={{ paddingTop: Math.max(0, -(ARC_R - CIRCLE_R * 2 - LIFT)) + 4, overflow: 'visible' }}>
        <View style={[styles.barWrap, { width: BAR_W, height: BAR_H }]}>



          <View style={[styles.shadow, { borderRadius: BAR_R }]} />

          <AnimatedSvgBar notchX={notchX} />

          <View style={styles.tabsRow}>
            {visibleRoutes.map((route, idx) => {
              const isFocused = focusedIdx === idx;
              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress', target: route.key, canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };
              return (
                <TabItem
                  key={route.key}
                  route={route}
                  isFocused={isFocused}
                  options={descriptors[route.key].options}
                  onPress={onPress}
                />
              );
            })}
          </View>

          <FloatingCircle translateX={circleX} iconNode={activeIconNode} />

        </View>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: H_PAD,
    paddingTop: 8,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },

  barWrap: {
    overflow: 'visible',
  },
  shadow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'transparent',
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 20,
    // Thin top border so the bar visually separates from page bg on Android
    borderTopWidth: 1,
    borderTopColor: C.barBorder,
    borderRadius: BAR_R,
  },
  tabsRow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    flexDirection: 'row',
  },
  tabTap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  iconWrap: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10.5,
    letterSpacing: 0.2,
    marginTop: 1,
  },
});