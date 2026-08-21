import { STORAGE_KEYS, readJSON, writeJSON, readString, writeString } from './storage.js';
import { generateId, nowIso } from './utils.js';

let sessions = [];
let activeSessionId = null;
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener(getState()));
}

function persist() {
  writeJSON(STORAGE_KEYS.sessions, sessions);
  if (activeSessionId) {
    writeString(STORAGE_KEYS.activeSession, activeSessionId);
  }
}

function isValidSession(session) {
  return (
    session &&
    typeof session.id === 'string' &&
    typeof session.title === 'string' &&
    Array.isArray(session.messages)
  );
}

function createDefaultSession() {
  return {
    id: generateId('session'),
    title: 'Session 01',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    messages: [],
  };
}

export function onSessionsChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getState() {
  return {
    sessions: [...sessions],
    activeSessionId,
  };
}

export function getActiveSession() {
  return sessions.find((session) => session.id === activeSessionId) ?? null;
}

export function initSessions() {
  const stored = readJSON(STORAGE_KEYS.sessions, []);
  sessions = Array.isArray(stored) ? stored.filter(isValidSession) : [];

  const storedActive = readString(STORAGE_KEYS.activeSession);

  if (sessions.length === 0) {
    const first = createDefaultSession();
    sessions = [first];
    activeSessionId = first.id;
  } else {
    activeSessionId = sessions.some((s) => s.id === storedActive)
      ? storedActive
      : sessions[0].id;
  }

  persist();
  notify();
}

export function createSession() {
  const nextNumber = sessions.length + 1;
  const session = {
    id: generateId('session'),
    title: `Session ${String(nextNumber).padStart(2, '0')}`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    messages: [],
  };
  sessions = [session, ...sessions];
  activeSessionId = session.id;
  persist();
  notify();
  return session;
}

export function switchSession(sessionId) {
  if (!sessions.some((s) => s.id === sessionId)) return;
  activeSessionId = sessionId;
  persist();
  notify();
}

export function renameSession(sessionId, title) {
  const trimmed = title.trim();
  if (!trimmed) return;
  sessions = sessions.map((session) =>
    session.id === sessionId
      ? { ...session, title: trimmed.slice(0, 60), updatedAt: nowIso() }
      : session
  );
  persist();
  notify();
}

export function deleteSession(sessionId) {
  const remaining = sessions.filter((session) => session.id !== sessionId);

  if (remaining.length === 0) {
    const fresh = createDefaultSession();
    sessions = [fresh];
    activeSessionId = fresh.id;
  } else {
    sessions = remaining;
    if (activeSessionId === sessionId) {
      activeSessionId = remaining[0].id;
    }
  }

  persist();
  notify();
}

export function clearSessionMessages(sessionId) {
  sessions = sessions.map((session) =>
    session.id === sessionId
      ? { ...session, messages: [], updatedAt: nowIso() }
      : session
  );
  persist();
  notify();
}

export function addMessage(sessionId, message) {
  sessions = sessions.map((session) =>
    session.id === sessionId
      ? {
          ...session,
          messages: [...session.messages, message],
          updatedAt: nowIso(),
        }
      : session
  );
  persist();
  notify();
}

export function updateMessage(sessionId, messageId, patch) {
  sessions = sessions.map((session) =>
    session.id === sessionId
      ? {
          ...session,
          messages: session.messages.map((message) =>
            message.id === messageId ? { ...message, ...patch } : message
          ),
        }
      : session
  );
  persist();
  notify();
}
