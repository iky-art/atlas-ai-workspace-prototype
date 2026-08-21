import { STORAGE_KEYS, readJSON, writeJSON } from './storage.js';

export const ACCENT_PRESETS = {
  indigo: { accent: '#6366f1', accent2: '#8b5cf6', rgb: '99, 102, 241', hover: '#4f46e5' },
  blue: { accent: '#3b82f6', accent2: '#38bdf8', rgb: '59, 130, 246', hover: '#2563eb' },
  green: { accent: '#10b981', accent2: '#34d399', rgb: '16, 185, 129', hover: '#059669' },
  rose: { accent: '#f43f5e', accent2: '#fb7185', rgb: '244, 63, 94', hover: '#e11d48' },
  amber: { accent: '#f59e0b', accent2: '#fbbf24', rgb: '245, 158, 11', hover: '#d97706' },
};

export const FONT_SCALES = {
  small: '14px',
  default: '16px',
  large: '18px',
};

const DEFAULT_SETTINGS = {
  compactMode: false,
  animations: true,
  accentColor: 'indigo',
  fontSize: 'default',
  soundEffects: false,
  sendWithCtrlEnter: false,
};

let settings = { ...DEFAULT_SETTINGS };
const listeners = new Set();

function applyAccentColor(key) {
  const preset = ACCENT_PRESETS[key] ?? ACCENT_PRESETS.indigo;
  const root = document.documentElement.style;
  root.setProperty('--atlas-accent', preset.accent);
  root.setProperty('--atlas-accent-2', preset.accent2);
  root.setProperty('--atlas-accent-rgb', preset.rgb);
  root.setProperty('--atlas-accent-hover', preset.hover);
}

function applyFontSize(key) {
  document.documentElement.style.fontSize = FONT_SCALES[key] ?? FONT_SCALES.default;
}

function applySettings() {
  document.documentElement.classList.toggle('is-compact', settings.compactMode);
  document.documentElement.classList.toggle('is-no-animations', !settings.animations);
  applyAccentColor(settings.accentColor);
  applyFontSize(settings.fontSize);
}

export function getSettings() {
  return { ...settings };
}

export function initSettings() {
  const stored = readJSON(STORAGE_KEYS.settings, {});
  settings = { ...DEFAULT_SETTINGS, ...stored };
  applySettings();
}

export function setSetting(key, value) {
  if (!(key in DEFAULT_SETTINGS)) return;
  settings = { ...settings, [key]: value };
  writeJSON(STORAGE_KEYS.settings, settings);
  applySettings();
  listeners.forEach((listener) => listener(getSettings()));
}

export function onSettingsChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
