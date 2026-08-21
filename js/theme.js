import { STORAGE_KEYS, readString, writeString } from './storage.js';

const VALID_THEMES = ['dark', 'light'];

function systemPrefersLight() {
  return window.matchMedia('(prefers-color-scheme: light)').matches;
}

function resolveInitialTheme() {
  const stored = readString(STORAGE_KEYS.theme);
  if (stored && VALID_THEMES.includes(stored)) return stored;
  return systemPrefersLight() ? 'light' : 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

let currentTheme = 'dark';
const listeners = new Set();

export function getTheme() {
  return currentTheme;
}

export function setTheme(theme) {
  if (!VALID_THEMES.includes(theme)) return;
  currentTheme = theme;
  applyTheme(theme);
  writeString(STORAGE_KEYS.theme, theme);
  listeners.forEach((listener) => listener(theme));
}

export function toggleTheme() {
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

export function onThemeChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initTheme() {
  currentTheme = resolveInitialTheme();
  applyTheme(currentTheme);
}
