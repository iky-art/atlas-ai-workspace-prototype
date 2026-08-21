import { STORAGE_KEYS, readJSON, writeJSON, removeKey } from './storage.js';

let currentUser = null;
const listeners = new Set();

function isValidUser(user) {
  return user && typeof user.email === 'string' && typeof user.name === 'string';
}

export function getUser() {
  return currentUser;
}

export function isAuthenticated() {
  return currentUser !== null;
}

export function initAuth() {
  const stored = readJSON(STORAGE_KEYS.auth, null);
  currentUser = isValidUser(stored) ? stored : null;
}

/**
 * Simulated sign-in \u2014 there is no backend, so this does not verify a
 * password against anything. It only validates the shape of the input and
 * persists a local "session" so the gate stays closed on reload.
 */
export function login({ email, name }) {
  currentUser = {
    email,
    name: name && name.trim() ? name.trim() : email.split('@')[0],
    loggedInAt: new Date().toISOString(),
  };
  writeJSON(STORAGE_KEYS.auth, currentUser);
  listeners.forEach((listener) => listener(currentUser));
  return currentUser;
}

export function loginAsGuest() {
  return login({ email: 'guest@local.atlas', name: 'Guest' });
}

/**
 * Simulated sign-up. Same as login() under the hood \u2014 there's no
 * real account database to check against \u2014 kept as a separate export
 * for clarity at the call site (the Sign Up form vs. the Sign In form).
 */
export function register({ email, name }) {
  return login({ email, name });
}

export function logout() {
  currentUser = null;
  removeKey(STORAGE_KEYS.auth);
  listeners.forEach((listener) => listener(null));
}

export function onAuthChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
