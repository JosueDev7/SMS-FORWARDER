export interface ThemeColors {
  bg: string;
  bgSoft: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  success: string;
  danger: string;
  warning: string;
  switchTrackOff: string;
  switchThumbOff: string;
  accentButtonText: string;
}

export type ThemeId = 'dark' | 'light' | 'midnight' | 'emerald';

export interface ThemePreset {
  id: ThemeId;
  label: string;
  icon: string;
  colors: ThemeColors;
}

// ─── Dark (original) ────────────────────────────────────────────────────────
const darkColors: ThemeColors = {
  bg: '#04070E',
  bgSoft: '#0A1220',
  card: '#0E1A2E',
  border: '#173155',
  text: '#D7E7FF',
  textMuted: '#7EA3D9',
  accent: '#18C9FF',
  accentSoft: '#0F8EB5',
  success: '#22D3A6',
  danger: '#FF4F7B',
  warning: '#F5A623',
  switchTrackOff: '#31425A',
  switchThumbOff: '#A4B6D4',
  accentButtonText: '#001825',
};

// ─── Light ───────────────────────────────────────────────────────────────────
const lightColors: ThemeColors = {
  bg: '#F4F6FB',
  bgSoft: '#FFFFFF',
  card: '#FFFFFF',
  border: '#D8DEE9',
  text: '#1E293B',
  textMuted: '#64748B',
  accent: '#0284C7',
  accentSoft: '#7DD3FC',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
  switchTrackOff: '#CBD5E1',
  switchThumbOff: '#94A3B8',
  accentButtonText: '#FFFFFF',
};

// ─── Midnight (deep blue-violet) ────────────────────────────────────────────
const midnightColors: ThemeColors = {
  bg: '#0B0D1A',
  bgSoft: '#111427',
  card: '#161A33',
  border: '#2A2F55',
  text: '#E0E4F0',
  textMuted: '#8B8FAE',
  accent: '#A78BFA',
  accentSoft: '#7C5CDB',
  success: '#34D399',
  danger: '#F87171',
  warning: '#FBBF24',
  switchTrackOff: '#2E3354',
  switchThumbOff: '#9396B0',
  accentButtonText: '#0F0B1F',
};

// ─── Emerald (dark green) ───────────────────────────────────────────────────
const emeraldColors: ThemeColors = {
  bg: '#061210',
  bgSoft: '#0A1F1A',
  card: '#0F2924',
  border: '#1A4038',
  text: '#D1FAE5',
  textMuted: '#6EE7B7',
  accent: '#10B981',
  accentSoft: '#059669',
  success: '#34D399',
  danger: '#FB7185',
  warning: '#FCD34D',
  switchTrackOff: '#1E3A34',
  switchThumbOff: '#86C4AD',
  accentButtonText: '#022C22',
};

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'dark', label: 'Dark', icon: '🌑', colors: darkColors },
  { id: 'light', label: 'Light', icon: '☀️', colors: lightColors },
  { id: 'midnight', label: 'Midnight', icon: '🔮', colors: midnightColors },
  { id: 'emerald', label: 'Emerald', icon: '🌿', colors: emeraldColors },
];

/** Default export for backward compat — defaults to dark. */
export const colors: ThemeColors = darkColors;
