import { generateId, nowIso, formatTime, prefersReducedMotion, randomBetween } from './utils.js';

const SIMULATED_RESPONSES = [
  {
    match: (text) => /^\s*(hi|hello|hey)\b/i.test(text),
    response:
      'Hello. I\u2019m Atlas, an experimental interface prototype by Orbit Studio. Ask me something \u2014 try "help" to see what I can simulate.',
  },
  {
    match: (text) => /^\s*help\b/i.test(text),
    response:
      'This is a prototype workspace with a small set of simulated responses. Try: "what is an api", "explain python", or "build a website". Everything here runs locally \u2014 no external AI service is connected.',
  },
  {
    match: (text) => /what is an api|how (does|an) api works?/i.test(text),
    response:
      'An API provides a defined interface for software systems to communicate. It exposes a set of endpoints or functions so one program can request data or trigger behavior in another, without needing to know its internal implementation.',
  },
  {
    match: (text) => /explain python/i.test(text),
    response:
      'Python is a high-level, dynamically typed programming language known for readable syntax. It is widely used for scripting, data analysis, automation, and backend services, backed by a large standard library and ecosystem.',
  },
  {
    match: (text) => /build a website/i.test(text),
    response:
      'A basic website starts with three layers: HTML for structure, CSS for presentation, and JavaScript for behavior. From there, most teams add tooling \u2014 a bundler, a framework, and a deployment pipeline \u2014 as complexity grows.',
  },
];

const FALLBACK_RESPONSES = [
  'This is a simulated response \u2014 Atlas is running as a local prototype with no external AI connected. Try "help" for a list of supported prompts.',
  'I don\u2019t have a scripted answer for that in this prototype. Try one of the example prompts from "help".',
];

export function getSimulatedResponse(input) {
  const trimmed = input.trim();
  const matched = SIMULATED_RESPONSES.find((entry) => entry.match(trimmed));
  if (matched) return matched.response;
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

export function createMessage(role, content) {
  return {
    id: generateId('msg'),
    role,
    content,
    createdAt: nowIso(),
  };
}

const ICONS = {
  copy: '<svg viewBox="0 0 20 20" fill="none"><rect x="7" y="7" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M4 13V5a1.5 1.5 0 0 1 1.5-1.5H13" stroke="currentColor" stroke-width="1.4"/></svg>',
  regenerate: '<svg viewBox="0 0 20 20" fill="none"><path d="M4 10a6 6 0 0 1 10.2-4.24M16 10a6 6 0 0 1-10.2 4.24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M14 3v3.5h-3.5M6 17v-3.5h3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  thumbsUp: '<svg viewBox="0 0 20 20" fill="none"><path d="M7 8.5V16h6.2c.7 0 1.3-.5 1.4-1.2l.9-4.3c.2-.9-.5-1.7-1.4-1.7H11l.4-3A1.4 1.4 0 0 0 10 4l-3 4.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M4.5 8.5H7V16H4.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  thumbsDown: '<svg viewBox="0 0 20 20" fill="none"><path d="M13 11.5V4h-6.2c-.7 0-1.3.5-1.4 1.2l-.9 4.3c-.2.9.5 1.7 1.4 1.7H9l-.4 3A1.4 1.4 0 0 0 10 16l3-4.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M15.5 11.5H13V4h2.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  speak: '<svg viewBox="0 0 20 20" fill="none"><path d="M7 6.5v7l-3-2.2H2.5v-2.6H4L7 6.5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M11.5 7.3a2.8 2.8 0 0 1 0 5.4M13.3 5.3a5.4 5.4 0 0 1 0 9.4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
};

export function renderMessageElement(message, handlers = {}) {
  const el = document.createElement('article');
  el.className = `message ${message.role === 'user' ? 'is-user' : 'is-atlas'}`;
  el.dataset.messageId = message.id;

  const header = document.createElement('div');
  header.className = 'message-header';

  const role = document.createElement('span');
  role.className = 'message-role';
  role.textContent = message.role === 'user' ? 'User' : 'Atlas';
  header.appendChild(role);

  const time = document.createElement('span');
  time.className = 'message-time';
  time.textContent = formatTime(message.createdAt);
  header.appendChild(time);

  const body = document.createElement('div');
  body.className = 'message-body';
  body.textContent = message.content;

  el.appendChild(header);
  el.appendChild(body);

  if (message.role === 'atlas') {
    const actions = document.createElement('div');
    actions.className = 'message-actions';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'icon-btn';
    copyBtn.type = 'button';
    copyBtn.setAttribute('aria-label', 'Copy response');
    copyBtn.innerHTML = ICONS.copy;
    copyBtn.addEventListener('click', () => handlers.onCopy?.(message, copyBtn));

    const regenBtn = document.createElement('button');
    regenBtn.className = 'icon-btn';
    regenBtn.type = 'button';
    regenBtn.setAttribute('aria-label', 'Regenerate response');
    regenBtn.innerHTML = ICONS.regenerate;
    regenBtn.addEventListener('click', () => handlers.onRegenerate?.(message));

    const speakBtn = document.createElement('button');
    speakBtn.className = 'icon-btn';
    speakBtn.type = 'button';
    speakBtn.setAttribute('aria-label', 'Read aloud');
    speakBtn.innerHTML = ICONS.speak;
    speakBtn.addEventListener('click', () => handlers.onSpeak?.(message, speakBtn));

    const upBtn = document.createElement('button');
    upBtn.className = 'icon-btn';
    upBtn.type = 'button';
    upBtn.setAttribute('aria-label', 'Good response');
    upBtn.innerHTML = ICONS.thumbsUp;
    upBtn.addEventListener('click', () => {
      upBtn.classList.add('is-active');
      downBtn.classList.remove('is-active');
      handlers.onFeedback?.(message, 'up');
    });

    const downBtn = document.createElement('button');
    downBtn.className = 'icon-btn';
    downBtn.type = 'button';
    downBtn.setAttribute('aria-label', 'Poor response');
    downBtn.innerHTML = ICONS.thumbsDown;
    downBtn.addEventListener('click', () => {
      downBtn.classList.add('is-active');
      upBtn.classList.remove('is-active');
      handlers.onFeedback?.(message, 'down');
    });

    actions.append(copyBtn, regenBtn, speakBtn, upBtn, downBtn);
    el.appendChild(actions);
  }

  return el;
}

export function renderEmptyState() {
  const wrap = document.createElement('div');
  wrap.className = 'chat-empty';
  wrap.innerHTML = `
    <svg class="chat-empty-mark" viewBox="0 0 64 64" fill="none">
      <path d="M13 55 L32 8 L51 55" stroke="currentColor" stroke-width="7" stroke-linecap="square" stroke-linejoin="miter"/>
      <path d="M19.5 36 L28 36 L28 43" stroke="currentColor" stroke-width="5" stroke-linecap="square" stroke-linejoin="miter"/>
    </svg>
    <div class="chat-empty-title">Start a conversation</div>
    <p class="chat-empty-hint">This workspace runs entirely on simulated, local responses. Try "help" to see what Atlas can do.</p>
  `;
  return wrap;
}

/**
 * Reveals `text` into `element` progressively. Falls back to an instant
 * render when reduced motion is preferred.
 */
export function typeText(element, text) {
  return new Promise((resolve) => {
    if (prefersReducedMotion()) {
      element.textContent = text;
      resolve();
      return;
    }

    let index = 0;
    element.textContent = '';

    function step() {
      const chunk = Math.random() > 0.7 ? 2 : 1;
      index += chunk;
      element.textContent = text.slice(0, index);

      if (index < text.length) {
        window.setTimeout(step, randomBetween(6, 18));
      } else {
        resolve();
      }
    }

    step();
  });
}
