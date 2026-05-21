import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { attendanceApi } from '../api';

// ── Types ─────────────────────────────────────────────────────────────────────
export type AttendanceStatus = 'IDLE' | 'PENDING' | 'ON_BREAK' | 'COMPLETE';

export interface CheckInButtonProps {
  status: AttendanceStatus;
  checkinTime?: string | null;
  checkoutTime?: string | null;
  workingHours?: string | null;
  loading?: boolean;
  onRefresh: () => void;
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  navy: '#0F1D3A',
  accentBright: '#5BA3F5',
  teal: '#1DB8A0',
  amber: '#F6A623',
  errorRed: '#E53E3E',
  white: '#FFFFFF',
  subtle: '#8A9BB5',
  border: '#E2E8F0',
};

// ── Sizing constants — single source of truth ─────────────────────────────────
const BTN = 168;   // button diameter
const HALO = BTN + 48;  // soft halo ring diameter
const RING1 = BTN + 80;  // first ripple ring
const RING2 = BTN + 116; // second ripple ring
const CANVAS = RING2 + 8; // container must fit the largest ring

// ── Per-status config ─────────────────────────────────────────────────────────
const CFG = {
  IDLE: {
    label: 'Check In', sublabel: 'Tap to start your day',
    icon: 'finger-print-outline' as const,
    ga: C.accentBright, gb: C.teal,
    halo: 'rgba(91,163,245,0.12)',
    ring: 'rgba(91,163,245,',
  },
  PENDING: {
    label: 'Check Out', sublabel: 'Tap when you leave',
    icon: 'log-out-outline' as const,
    ga: '#E53E3E', gb: '#FC8181',
    halo: 'rgba(229,62,62,0.10)',
    ring: 'rgba(229,62,62,',
  },
  ON_BREAK: {
    label: 'On Break', sublabel: 'End break to continue',
    icon: 'cafe-outline' as const,
    ga: C.amber, gb: '#FBBF24',
    halo: 'rgba(246,166,35,0.10)',
    ring: 'rgba(246,166,35,',
  },
  COMPLETE: {
    label: 'Done', sublabel: 'Great work today!',
    icon: 'checkmark-circle-outline' as const,
    ga: '#48BB78', gb: C.teal,
    halo: 'rgba(72,187,120,0.10)',
    ring: 'rgba(72,187,120,',
  },
} as const;

// ── Single ripple ring ────────────────────────────────────────────────────────
// Rendered inside a CANVAS×CANVAS container — centered via negative margins.
function RippleRing({
  size, delay, color, active,
}: { size: number; delay: number; color: string; active: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) { anim.setValue(0); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1, duration: 2000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, delay]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1] });
  const opacity = anim.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 0.55, 0] });

  // Center absolutely inside the CANVAS container
  const offset = (CANVAS - size) / 2;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: offset, left: offset,
        width: size, height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: `${color}0.7)`,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

// ── Press spring ──────────────────────────────────────────────────────────────
function usePressShrink() {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 40 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  return { scale, onPressIn, onPressOut };
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ icon, label, value, accent }: {
  icon: string; label: string; value: string; accent: string;
}) {
  return (
    <View style={s.pill}>
      <View style={[s.pillIcon, { backgroundColor: `${accent}1A` }]}>
        <Ionicons name={icon as any} size={15} color={accent} />
      </View>
      <View>
        <Text style={s.pillVal}>{value}</Text>
        <Text style={s.pillLbl}>{label}</Text>
      </View>
    </View>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CheckInButton({
  status, checkinTime, checkoutTime, workingHours,
  loading = false, onRefresh,
}: CheckInButtonProps) {
  // Safe status lookup
  const normalized = (CFG[status as keyof typeof CFG] ? status : 'IDLE') as keyof typeof CFG;
  const cfg = CFG[normalized];
  
  const isDisabled = normalized === 'ON_BREAK' || normalized === 'COMPLETE' || loading;
  const ringsOn = !isDisabled && !loading;
  const { scale, onPressIn, onPressOut } = usePressShrink();

  // Fade when status changes
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 380, useNativeDriver: true }).start();
  }, [normalized]);

  const handlePress = useCallback(async () => {
    if (isDisabled) return;
    try {
      if (normalized === 'PENDING') await attendanceApi.checkout();
      else if (normalized === 'IDLE') await attendanceApi.checkin();
      onRefresh();
    } catch (_) { }
  }, [normalized, isDisabled, onRefresh]);

  // Center offset: button sits in the middle of the canvas
  const btnOffset = (CANVAS - BTN) / 2;
  const haloOffset = (CANVAS - HALO) / 2;

  return (
    <Animated.View style={[s.root, { opacity: fade }]}>

      {/* ── Fixed canvas: rings + button all share the same coordinate space ── */}
      <View style={{ width: CANVAS, height: CANVAS }}>

        {/* Soft static halo — always visible */}
        <View style={[s.halo, {
          top: haloOffset, left: haloOffset,
          width: HALO, height: HALO, borderRadius: HALO / 2,
          backgroundColor: cfg.halo,
        }]} />

        {/* Animated ripple rings */}
        <RippleRing size={RING1} delay={0} color={cfg.ring} active={ringsOn} />
        <RippleRing size={RING2} delay={600} color={cfg.ring} active={ringsOn} />

        {/* Button — absolutely centered in canvas */}
        <Animated.View style={[s.btnWrap, {
          top: btnOffset, left: btnOffset,
          transform: [{ scale }],
        }]}>
          <TouchableOpacity
            activeOpacity={1}
            disabled={isDisabled}
            onPress={handlePress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
          >
            <LinearGradient
              colors={[cfg.ga, cfg.gb]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[s.circle, {
                opacity: isDisabled && status !== 'COMPLETE' ? 0.72 : 1,
              }]}
            >
              {loading ? (
                <ActivityIndicator color={C.white} size="large" />
              ) : (
                <>
                  <Ionicons name={cfg.icon} size={34} color={C.white} style={s.btnIcon} />
                  <Text style={s.btnLabel}>{cfg.label}</Text>
                  <Text style={s.btnSub}>{cfg.sublabel}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

      </View>

      {/* ── Stats card ── */}
      <View style={s.statsCard}>
        <StatPill icon="log-in-outline" label="Check In" value={checkinTime ?? '--:--'} accent={C.teal} />
        <View style={s.divider} />
        <StatPill icon="log-out-outline" label="Check Out" value={checkoutTime ?? '--:--'} accent={C.errorRed} />
        <View style={s.divider} />
        <StatPill icon="time-outline" label="Working" value={workingHours ?? '--:--'} accent={C.accentBright} />
      </View>

    </Animated.View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { alignItems: 'center' },

  // halo — static soft background circle
  halo: { position: 'absolute' },

  // button wrapper — position: absolute inside canvas
  btnWrap: {
    position: 'absolute',
    width: BTN,
    height: BTN,
  },

  // gradient button circle
  circle: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 14,
  },
  btnIcon: { marginBottom: 4 },
  btnLabel: { color: C.white, fontSize: 20, fontWeight: '800', letterSpacing: 0.2 },
  btnSub: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 },

  // stats
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 18,
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    gap: 4,
  },
  divider: { width: 1, height: 32, backgroundColor: C.border, marginHorizontal: 8 },
  pill: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  pillIcon: {
    width: 32, height: 32, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  pillVal: { fontSize: 13, fontWeight: '700', color: C.navy, letterSpacing: 0.2 },
  pillLbl: { fontSize: 10, color: C.subtle, marginTop: 1 },
});