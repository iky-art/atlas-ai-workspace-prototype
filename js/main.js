import { initTheme, getTheme, setTheme, toggleTheme, onThemeChange } from './theme.js';
import { initSettings, getSettings, setSetting, ACCENT_PRESETS } from './settings.js';
import {
  initSessions,
  onSessionsChange,
  getState,
  getActiveSession,
  createSession,
  switchSession,
  renameSession,
  deleteSession,
  addMessage,
  updateMessage,
} from './sessions.js';
import { renderSessionList, initSidebar } from './sidebar.js';
import {
  getSimulatedResponse,
  createMessage,
  renderMessageElement,
  renderEmptyState,
  typeText,
} from './chat.js';
import { runSplash } from './splash.js';
import { initMobileViewport, scrollToBottom } from './mobile.js';
import { createCommandPalette } from './command-palette.js';
import { createGithubFlow } from './github-flow.js';
import { truncate, playTone, slugify, prefersReducedMotion } from './utils.js';
import { initAuth, isAuthenticated, getUser, login, loginAsGuest, register, logout } from './auth.js';

const el = {
  splash: document.getElementById('splash'),
  splashOutput: document.getElementById('splashOutput'),
  landingScreen: document.getElementById('landingScreen'),
  landingGetStartedBtn: document.getElementById('landingGetStartedBtn'),
  landingSignInBtn: document.getElementById('landingSignInBtn'),
  landingGuestLink: document.getElementById('landingGuestLink'),
  loginScreen: document.getElementById('loginScreen'),
  authTabs: document.getElementById('authTabs'),
  authTitle: document.getElementById('authTitle'),
  authBackBtn: document.getElementById('authBackBtn'),
  signinForm: document.getElementById('signinForm'),
  signupForm: document.getElementById('signupForm'),
  loginEmail: document.getElementById('loginEmail'),
  loginPassword: document.getElementById('loginPassword'),
  loginError: document.getElementById('loginError'),
  loginSubmitBtn: document.getElementById('loginSubmitBtn'),
  signupName: document.getElementById('signupName'),
  signupEmail: document.getElementById('signupEmail'),
  signupPassword: document.getElementById('signupPassword'),
  signupConfirmPassword: document.getElementById('signupConfirmPassword'),
  signupError: document.getElementById('signupError'),
  signupSubmitBtn: document.getElementById('signupSubmitBtn'),
  loginGuestBtn: document.getElementById('loginGuestBtn'),
  sidebarAccountBtn: document.getElementById('sidebarAccountBtn'),
  sidebarAccountAvatar: document.getElementById('sidebarAccountAvatar'),
  sidebarAccountName: document.getElementById('sidebarAccountName'),
  settingsAccountEmail: document.getElementById('settingsAccountEmail'),
  logoutBtn: document.getElementById('logoutBtn'),
  settingsTabs: document.getElementById('settingsTabs'),
  shortcutSendKeys: document.getElementById('shortcutSendKeys'),
  shortcutNewlineKeys: document.getElementById('shortcutNewlineKeys'),
  discordCardBtn: document.getElementById('discordCardBtn'),
  rulesOverlay: document.getElementById('rulesOverlay'),
  rulesAgreeCheckbox: document.getElementById('rulesAgreeCheckbox'),
  rulesContinueBtn: document.getElementById('rulesContinueBtn'),
  countdownOverlay: document.getElementById('countdownOverlay'),
  countdownNumber: document.getElementById('countdownNumber'),
  countdownStatus: document.getElementById('countdownStatus'),
  toastRegion: document.getElementById('toastRegion'),
  composerPhotoBtn: document.getElementById('composerPhotoBtn'),
  openGithubFlowBtn: document.getElementById('openGithubFlowBtn'),
  app: document.getElementById('app'),
  sidebar: document.getElementById('sidebar'),
  drawerOverlay: document.getElementById('drawerOverlay'),
  collapseBtn: document.getElementById('collapseBtn'),
  mobileMenuBtn: document.getElementById('mobileMenuBtn'),
  newSessionBtn: document.getElementById('newSessionBtn'),
  sessionList: document.getElementById('sessionList'),
  headerSessionTitle: document.getElementById('headerSessionTitle'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  commandTriggerBtn: document.getElementById('commandTriggerBtn'),
  chatScroll: document.getElementById('chatScroll'),
  messageList: document.getElementById('messageList'),
  composer: document.getElementById('composer'),
  composerInput: document.getElementById('composerInput'),
  composerSend: document.getElementById('composerSend'),
  composerHintText: document.getElementById('composerHintText'),
  openSettingsBtn: document.getElementById('openSettingsBtn'),
  openAboutBtn: document.getElementById('openAboutBtn'),
  openTeamBtn: document.getElementById('openTeamBtn'),
  aboutOverlay: document.getElementById('aboutOverlay'),
  teamOverlay: document.getElementById('teamOverlay'),
  settingsOverlay: document.getElementById('settingsOverlay'),
  themeSwitch: document.getElementById('themeSwitch'),
  accentSwatches: document.getElementById('accentSwatches'),
  fontSizeSwitch: document.getElementById('fontSizeSwitch'),
  compactToggle: document.getElementById('compactToggle'),
  animationsToggle: document.getElementById('animationsToggle'),
  soundToggle: document.getElementById('soundToggle'),
  ctrlEnterToggle: document.getElementById('ctrlEnterToggle'),
  sessionStatsValue: document.getElementById('sessionStatsValue'),
  exportSessionsBtn: document.getElementById('exportSessionsBtn'),
  clearDataBtn: document.getElementById('clearDataBtn'),
  confirmOverlay: document.getElementById('confirmOverlay'),
  confirmTitle: document.getElementById('confirmTitle'),
  confirmBody: document.getElementById('confirmBody'),
  confirmCancelBtn: document.getElementById('confirmCancelBtn'),
  confirmActionBtn: document.getElementById('confirmActionBtn'),
  cmdkOverlay: document.getElementById('cmdkOverlay'),
  cmdkPanel: document.getElementById('cmdkPanel'),
  cmdkInput: document.getElementById('cmdkInput'),
  cmdkList: document.getElementById('cmdkList'),
};

const THEME_ICONS = {
  dark: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3.5a6.5 6.5 0 1 0 6.5 6.5 5 5 0 0 1-6.5-6.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  light: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="3.5" stroke="currentColor" stroke-width="1.3"/><path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.1 4.9l-1.4 1.4M6.3 13.7l-1.4 1.4M15.1 15.1l-1.4-1.4M6.3 6.3 4.9 4.9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
};

/* ============================================
   MODAL HELPERS
   ============================================ */
function openModal(overlay) {
  overlay.classList.add('is-open');
}

function closeModal(overlay) {
  overlay.classList.remove('is-open');
}

document.querySelectorAll('[data-close-modal]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const overlay = document.getElementById(btn.dataset.closeModal);
    if (overlay) closeModal(overlay);
  });
});

document.querySelectorAll('.modal-overlay').forEach((overlay) => {
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeModal(overlay);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll('.modal-overlay.is-open').forEach((overlay) => {
    if (overlay !== el.cmdkOverlay) closeModal(overlay);
  });
});

/* ============================================
   CONFIRM DIALOG (reused for delete / clear)
   ============================================ */
function confirmDialog({ title, body, actionLabel }) {
  return new Promise((resolve) => {
    el.confirmTitle.textContent = title;
    el.confirmBody.textContent = body;
    el.confirmActionBtn.textContent = actionLabel;
    openModal(el.confirmOverlay);

    function cleanup(result) {
      closeModal(el.confirmOverlay);
      el.confirmActionBtn.removeEventListener('click', onConfirm);
      el.confirmCancelBtn.removeEventListener('click', onCancel);
      resolve(result);
    }

    function onConfirm() {
      cleanup(true);
    }

    function onCancel() {
      cleanup(false);
    }

    el.confirmActionBtn.addEventListener('click', onConfirm);
    el.confirmCancelBtn.addEventListener('click', onCancel);
  });
}

/* ============================================
   THEME
   ============================================ */
function updateThemeUI(theme) {
  el.themeToggleBtn.innerHTML = THEME_ICONS[theme];
  el.themeSwitch.querySelectorAll('[data-theme-choice]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.themeChoice === theme);
  });
}

el.themeToggleBtn.addEventListener('click', toggleTheme);
el.themeSwitch.querySelectorAll('[data-theme-choice]').forEach((btn) => {
  btn.addEventListener('click', () => setTheme(btn.dataset.themeChoice));
});
onThemeChange(updateThemeUI);

/* ============================================
   SETTINGS
   ============================================ */
function buildAccentSwatches() {
  el.accentSwatches.innerHTML = '';
  Object.entries(ACCENT_PRESETS).forEach(([key, preset]) => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'accent-swatch';
    swatch.style.backgroundColor = preset.accent;
    swatch.dataset.accentChoice = key;
    swatch.setAttribute('aria-label', `${key} accent`);
    swatch.addEventListener('click', () => {
      setSetting('accentColor', key);
      updateSettingsUI(getSettings());
    });
    el.accentSwatches.appendChild(swatch);
  });
}

function updateSettingsUI(settings) {
  el.compactToggle.classList.toggle('is-on', settings.compactMode);
  el.compactToggle.setAttribute('aria-checked', String(settings.compactMode));
  el.animationsToggle.classList.toggle('is-on', settings.animations);
  el.animationsToggle.setAttribute('aria-checked', String(settings.animations));
  el.soundToggle.classList.toggle('is-on', settings.soundEffects);
  el.soundToggle.setAttribute('aria-checked', String(settings.soundEffects));
  el.ctrlEnterToggle.classList.toggle('is-on', settings.sendWithCtrlEnter);
  el.ctrlEnterToggle.setAttribute('aria-checked', String(settings.sendWithCtrlEnter));

  el.composerHintText.innerHTML = settings.sendWithCtrlEnter
    ? '<kbd>Ctrl</kbd>+<kbd>Enter</kbd> to send &middot; <kbd>Enter</kbd> for a new line'
    : '<kbd>Enter</kbd> to send &middot; <kbd>Shift</kbd>+<kbd>Enter</kbd> for a new line';

  el.shortcutSendKeys.innerHTML = settings.sendWithCtrlEnter
    ? '<kbd>Ctrl</kbd><kbd>Enter</kbd>'
    : '<kbd>Enter</kbd>';
  el.shortcutNewlineKeys.innerHTML = settings.sendWithCtrlEnter
    ? '<kbd>Enter</kbd>'
    : '<kbd>Shift</kbd><kbd>Enter</kbd>';

  el.accentSwatches.querySelectorAll('[data-accent-choice]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.accentChoice === settings.accentColor);
  });
  el.fontSizeSwitch.querySelectorAll('[data-font-choice]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.fontChoice === settings.fontSize);
  });
}

function updateSessionStats() {
  const { sessions } = getState();
  const messageCount = sessions.reduce((sum, s) => sum + s.messages.length, 0);
  el.sessionStatsValue.textContent = `${sessions.length} sessions \u00b7 ${messageCount} messages`;
}

buildAccentSwatches();

el.compactToggle.addEventListener('click', () => {
  setSetting('compactMode', !getSettings().compactMode);
  updateSettingsUI(getSettings());
});

el.animationsToggle.addEventListener('click', () => {
  setSetting('animations', !getSettings().animations);
  updateSettingsUI(getSettings());
});

el.soundToggle.addEventListener('click', () => {
  const next = !getSettings().soundEffects;
  setSetting('soundEffects', next);
  updateSettingsUI(getSettings());
  if (next) playTone();
});

el.ctrlEnterToggle.addEventListener('click', () => {
  setSetting('sendWithCtrlEnter', !getSettings().sendWithCtrlEnter);
  updateSettingsUI(getSettings());
});

el.fontSizeSwitch.querySelectorAll('[data-font-choice]').forEach((btn) => {
  btn.addEventListener('click', () => {
    setSetting('fontSize', btn.dataset.fontChoice);
    updateSettingsUI(getSettings());
  });
});

el.exportSessionsBtn.addEventListener('click', () => {
  const { sessions } = getState();
  const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `atlas-sessions-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

el.clearDataBtn.addEventListener('click', async () => {
  const confirmed = await confirmDialog({
    title: 'Clear local data?',
    body: 'This removes all sessions, messages, and preferences stored in this browser. This cannot be undone.',
    actionLabel: 'Clear data',
  });
  if (confirmed) {
    window.localStorage.clear();
    window.location.reload();
  }
});

/* ============================================
   SETTINGS CATEGORY TABS
   ============================================ */
el.settingsTabs.querySelectorAll('[data-settings-tab]').forEach((tabBtn) => {
  tabBtn.addEventListener('click', () => {
    const target = tabBtn.dataset.settingsTab;

    el.settingsTabs.querySelectorAll('[data-settings-tab]').forEach((btn) => {
      const isActive = btn === tabBtn;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    document.querySelectorAll('[data-settings-category]').forEach((panel) => {
      panel.hidden = panel.dataset.settingsCategory !== target;
    });
  });
});

/* ============================================
   TOAST
   ============================================ */
function showToast(message, duration = 2600) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.3"/><path d="M10 9v4.2M10 6.8v.1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
    <span>${message}</span>
  `;
  el.toastRegion.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('is-visible'));

  window.setTimeout(() => {
    toast.classList.remove('is-visible');
    window.setTimeout(() => toast.remove(), 250);
  }, duration);
}

/* ============================================
   AUTH (simulated — no backend, gates the app UI only)
   ============================================ */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function updateAccountUI(user) {
  const label = user ? user.name || user.email : '\u2014';
  const initial = user ? label.charAt(0).toUpperCase() : '?';

  el.sidebarAccountAvatar.textContent = initial;
  el.sidebarAccountName.textContent = label;
  el.settingsAccountEmail.textContent = user ? user.email : '\u2014';
}

function setButtonLoading(button, isLoading) {
  button.classList.toggle('is-loading', isLoading);
  button.disabled = isLoading;
}

function showLanding() {
  el.loginScreen.hidden = true;
  el.app.hidden = true;
  el.landingScreen.hidden = false;
}

function showAuthScreen(tab = 'signin') {
  el.landingScreen.hidden = true;
  el.loginScreen.hidden = false;
  setAuthTab(tab);
  window.setTimeout(() => {
    (tab === 'signup' ? el.signupName : el.loginEmail).focus();
  }, 50);
}

function setAuthTab(tab) {
  el.authTabs.querySelectorAll('[data-auth-tab]').forEach((btn) => {
    const isActive = btn.dataset.authTab === tab;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  });
  el.signinForm.hidden = tab !== 'signin';
  el.signupForm.hidden = tab !== 'signup';
  el.authTitle.textContent = tab === 'signup' ? 'Create your account' : 'Sign in to Atlas';
}

function enterApp() {
  el.landingScreen.hidden = true;
  el.loginScreen.hidden = true;
  el.app.hidden = false;
  el.signinForm.reset();
  el.signupForm.reset();
  el.loginError.textContent = '';
  el.signupError.textContent = '';
}

el.authTabs.querySelectorAll('[data-auth-tab]').forEach((btn) => {
  btn.addEventListener('click', () => setAuthTab(btn.dataset.authTab));
});

el.authBackBtn.addEventListener('click', showLanding);

el.landingGetStartedBtn.addEventListener('click', () => showAuthScreen('signup'));
el.landingSignInBtn.addEventListener('click', () => showAuthScreen('signin'));

el.landingGuestLink.addEventListener('click', () => {
  loginAsGuest();
  updateAccountUI(getUser());
  enterApp();
});

el.signinForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = el.loginEmail.value.trim();
  const password = el.loginPassword.value;

  if (!EMAIL_PATTERN.test(email)) {
    el.loginError.textContent = 'Enter a valid email address.';
    return;
  }
  if (password.length < 4) {
    el.loginError.textContent = 'Password must be at least 4 characters.';
    return;
  }

  el.loginError.textContent = '';
  setButtonLoading(el.loginSubmitBtn, true);

  // Simulated auth delay — there is no server round-trip to wait on,
  // this only exists so the transition doesn't feel instantaneous/fake.
  window.setTimeout(() => {
    login({ email });
    updateAccountUI(getUser());
    setButtonLoading(el.loginSubmitBtn, false);
    enterApp();
  }, 550 + Math.random() * 300);
});

el.signupForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = el.signupName.value.trim();
  const email = el.signupEmail.value.trim();
  const password = el.signupPassword.value;
  const confirmPassword = el.signupConfirmPassword.value;

  if (!name) {
    el.signupError.textContent = 'Enter your name.';
    return;
  }
  if (!EMAIL_PATTERN.test(email)) {
    el.signupError.textContent = 'Enter a valid email address.';
    return;
  }
  if (password.length < 4) {
    el.signupError.textContent = 'Password must be at least 4 characters.';
    return;
  }
  if (password !== confirmPassword) {
    el.signupError.textContent = 'Passwords do not match.';
    return;
  }

  el.signupError.textContent = '';
  setButtonLoading(el.signupSubmitBtn, true);

  window.setTimeout(() => {
    register({ email, name });
    updateAccountUI(getUser());
    setButtonLoading(el.signupSubmitBtn, false);
    enterApp();
  }, 550 + Math.random() * 300);
});

el.loginGuestBtn.addEventListener('click', () => {
  setButtonLoading(el.loginGuestBtn, true);
  window.setTimeout(() => {
    loginAsGuest();
    updateAccountUI(getUser());
    setButtonLoading(el.loginGuestBtn, false);
    enterApp();
  }, 300);
});

el.sidebarAccountBtn.addEventListener('click', () => {
  openGithubFlow();
});

el.logoutBtn.addEventListener('click', async () => {
  const confirmed = await confirmDialog({
    title: 'Log out?',
    body: 'You will need to sign in again to access this workspace. Your sessions stay saved on this device.',
    actionLabel: 'Log out',
  });
  if (!confirmed) return;

  logout();
  updateAccountUI(null);
  closeModal(el.settingsOverlay);
  showLanding();
});

/* ============================================
   PROTOTYPE-ONLY FEATURES (Photo, Text-to-Speech)
   Both are visible, wired-up UI affordances that make it clear what's
   planned \u2014 neither actually attaches a file or plays audio yet.
   ============================================ */
el.composerPhotoBtn.addEventListener('click', () => {
  showToast('Photo attachments \u2014 still a prototype, not the real thing yet.');
});

/* ============================================
   PUSH TO GITHUB (polished demo flow \u2014 presentational only,
   no network request is made and no repository is created)
   ============================================ */
const githubFlow = createGithubFlow({
  overlay: document.getElementById('githubFlowOverlay'),
  stepDots: {
    generate: document.getElementById('flowStepGenerate'),
    visibility: document.getElementById('flowStepVisibility'),
    push: document.getElementById('flowStepPush'),
  },
  stepLineGenerate: document.getElementById('flowLineGenerate'),
  stepLineVisibility: document.getElementById('flowLineVisibility'),
  panels: {
    generate: document.getElementById('flowPanelGenerate'),
    visibility: document.getElementById('flowPanelVisibility'),
    push: document.getElementById('flowPanelPush'),
    pushing: document.getElementById('flowPanelPushing'),
    complete: document.getElementById('flowPanelComplete'),
  },
  repoNameLabel: document.getElementById('flowRepoNameLabel'),
  checklistItems: Array.from(document.querySelectorAll('#flowChecklist li')),
  generateStatus: document.getElementById('flowGenerateStatus'),
  visibilityInputs: Array.from(document.querySelectorAll('input[name="repoVisibility"]')),
  visibilityContinueBtn: document.getElementById('flowVisibilityContinueBtn'),
  summaryRepo: document.getElementById('flowSummaryRepo'),
  summaryVisibility: document.getElementById('flowSummaryVisibility'),
  pushBtn: document.getElementById('flowPushBtn'),
  progressFill: document.getElementById('flowProgressFill'),
  pushStatusItems: Array.from(document.querySelectorAll('#flowStatusList li')),
  completeRepoName: document.getElementById('flowCompleteRepoName'),
  completeOwner: document.getElementById('flowCompleteOwner'),
});

function openGithubFlow() {
  const user = getUser();
  const repoOwner = slugify(user?.name || user?.email || 'orbit-studio');
  const activeSession = getActiveSession();
  const repoName = activeSession ? slugify(activeSession.title) : 'atlas-demo';

  sidebarControls.closeMobile();
  closeModal(el.settingsOverlay);
  githubFlow.open({ repoOwner, repoName });
}

el.openGithubFlowBtn.addEventListener('click', openGithubFlow);

document.getElementById('flowOpenGithubBtn').addEventListener('click', () => {
  showToast('This is a demo flow \u2014 no real repository was created.');
});

/* ============================================
   DISCORD COMMUNITY FLOW (polished demo \u2014 does not open a
   real Discord invite; ends with an honest disclosure toast)
   ============================================ */
function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

el.discordCardBtn.addEventListener('click', () => {
  el.rulesAgreeCheckbox.checked = false;
  el.rulesContinueBtn.disabled = true;
  openModal(el.rulesOverlay);
});

el.rulesAgreeCheckbox.addEventListener('change', () => {
  el.rulesContinueBtn.disabled = !el.rulesAgreeCheckbox.checked;
});

el.rulesContinueBtn.addEventListener('click', async () => {
  closeModal(el.rulesOverlay);
  closeModal(el.settingsOverlay);
  await runCommunityCountdown();
});

async function runCommunityCountdown() {
  const reduced = prefersReducedMotion();

  el.countdownNumber.textContent = '5';
  el.countdownNumber.className = 'countdown-number';
  el.countdownStatus.textContent = 'Preparing Discord...';
  openModal(el.countdownOverlay);

  for (let count = 5; count >= 1; count -= 1) {
    el.countdownNumber.textContent = String(count);
    if (!reduced) {
      el.countdownNumber.classList.remove('is-tick');
      void el.countdownNumber.offsetWidth;
      el.countdownNumber.classList.add('is-tick');
    }
    await wait(reduced ? 120 : 850);
  }

  el.countdownNumber.textContent = '\u2726 BOOM! \u2726';
  el.countdownNumber.className = 'countdown-number is-boom';
  el.countdownStatus.textContent = 'Community unlocked!';
  await wait(reduced ? 150 : 700);

  el.countdownStatus.textContent = 'Opening Discord...';
  await wait(reduced ? 150 : 900);

  closeModal(el.countdownOverlay);
  showToast('This is a demo flow \u2014 no real Discord invite was opened.');
}

/* ============================================
   CHAT RENDERING
   ============================================ */
function renderChat() {
  const session = getActiveSession();
  el.messageList.innerHTML = '';

  if (!session || session.messages.length === 0) {
    el.messageList.appendChild(renderEmptyState());
    return;
  }

  session.messages.forEach((message) => {
    el.messageList.appendChild(renderMessageElement(message, messageHandlers));
  });

  scrollToBottom(el.chatScroll);
}

const messageHandlers = {
  onCopy: async (message, btn) => {
    try {
      await navigator.clipboard.writeText(message.content);
      btn.setAttribute('aria-label', 'Copied');
      window.setTimeout(() => btn.setAttribute('aria-label', 'Copy response'), 1200);
    } catch (error) {
      console.warn('[atlas] Clipboard copy failed.', error);
    }
  },
  onRegenerate: (message) => {
    const session = getActiveSession();
    if (!session) return;

    const index = session.messages.findIndex((m) => m.id === message.id);
    const priorUserMessage = [...session.messages.slice(0, index)]
      .reverse()
      .find((m) => m.role === 'user');

    const promptText = priorUserMessage ? priorUserMessage.content : 'help';
    const newContent = getSimulatedResponse(promptText);
    updateMessage(session.id, message.id, { content: newContent });
  },
  onFeedback: () => {
    /* Prototype only \u2014 no backend to persist feedback to. */
  },
  onSpeak: () => {
    showToast('Text-to-speech \u2014 still a prototype, not the real thing yet.');
  },
};

/* ============================================
   COMPOSER
   ============================================ */
function autoResizeTextarea() {
  el.composerInput.style.height = 'auto';
  const nextHeight = Math.min(el.composerInput.scrollHeight, 200);
  el.composerInput.style.height = `${nextHeight}px`;
  el.composerInput.style.overflowY = el.composerInput.scrollHeight > 200 ? 'auto' : 'hidden';
}

function updateSendState() {
  el.composerSend.disabled = el.composerInput.value.trim().length === 0;
}

el.composerInput.addEventListener('input', () => {
  autoResizeTextarea();
  updateSendState();
});

el.composerInput.addEventListener('focus', () => el.composer.classList.add('is-focused'));
el.composerInput.addEventListener('blur', () => el.composer.classList.remove('is-focused'));

el.composerInput.addEventListener('keydown', (event) => {
  const wantsCtrlEnter = getSettings().sendWithCtrlEnter;

  if (wantsCtrlEnter) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      sendMessage();
    }
    // Plain Enter falls through to the browser default (newline) when
    // Ctrl+Enter-to-send is enabled.
    return;
  }

  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

el.composerSend.addEventListener('click', sendMessage);

async function sendMessage() {
  const text = el.composerInput.value.trim();
  if (!text) return;

  const session = getActiveSession();
  if (!session) return;

  el.composerInput.value = '';
  autoResizeTextarea();
  updateSendState();

  addMessage(session.id, createMessage('user', text));
  renderChat();
  if (getSettings().soundEffects) playTone({ frequency: 620 });

  await simulateAtlasResponse(session.id, text);
}

async function simulateAtlasResponse(sessionId, userText) {
  const processingEl = document.createElement('div');
  processingEl.className = 'processing-line';
  processingEl.innerHTML = `
    <span>ATLAS CORE \u2014 PROCESSING</span>
    <span class="typing-dots"><span></span><span></span><span></span></span>
  `;
  el.messageList.appendChild(processingEl);
  scrollToBottom(el.chatScroll);

  const responseText = getSimulatedResponse(userText);
  await new Promise((resolve) => window.setTimeout(resolve, 500 + Math.random() * 400));

  processingEl.remove();

  const message = createMessage('atlas', '');
  addMessage(sessionId, message);
  renderChat();
  if (getSettings().soundEffects) playTone({ frequency: 480, duration: 0.08 });

  const bodyEl = el.messageList.querySelector(
    `[data-message-id="${message.id}"] .message-body`
  );
  if (bodyEl) {
    await typeText(bodyEl, responseText);
    scrollToBottom(el.chatScroll);
  }

  updateMessage(sessionId, message.id, { content: responseText });
}

/* ============================================
   SIDEBAR / SESSIONS
   ============================================ */
const sidebarControls = initSidebar({
  sidebar: el.sidebar,
  overlay: el.drawerOverlay,
  collapseBtn: el.collapseBtn,
  mobileMenuBtn: el.mobileMenuBtn,
});

function renderSidebar() {
  const state = getState();
  renderSessionList(el.sessionList, state, sessionHandlers);

  const activeSession = getActiveSession();
  el.headerSessionTitle.textContent = activeSession
    ? truncate(activeSession.title, 28)
    : '\u2014';
}

const sessionHandlers = {
  onSwitch: (sessionId) => {
    switchSession(sessionId);
    sidebarControls.closeMobile();
  },
  onRename: (sessionId, title) => renameSession(sessionId, title),
  onDelete: async (session) => {
    const confirmed = await confirmDialog({
      title: 'Delete session?',
      body: `"${session.title}" and its messages will be permanently removed.`,
      actionLabel: 'Delete',
    });
    if (confirmed) deleteSession(session.id);
  },
};

el.newSessionBtn.addEventListener('click', () => {
  createSession();
  sidebarControls.closeMobile();
});

onSessionsChange(() => {
  renderSidebar();
  renderChat();
  updateSessionStats();
});

/* ============================================
   MODAL TRIGGERS (Settings / About / Team)
   ============================================ */
el.openSettingsBtn.addEventListener('click', () => {
  openModal(el.settingsOverlay);
  sidebarControls.closeMobile();
});
el.openAboutBtn.addEventListener('click', () => {
  openModal(el.aboutOverlay);
  sidebarControls.closeMobile();
});
el.openTeamBtn.addEventListener('click', () => {
  openModal(el.teamOverlay);
  sidebarControls.closeMobile();
});

const contextLink = document.getElementById('contextLink');
const activityLink = document.getElementById('activityLink');
contextLink?.addEventListener('click', () => sidebarControls.closeMobile());
activityLink?.addEventListener('click', () => sidebarControls.closeMobile());

/* ============================================
   COMMAND PALETTE
   ============================================ */
const mainCommands = [
  {
    label: 'New Session',
    icon: 'session',
    action: () => createSession(),
  },
  {
    label: 'Search Sessions',
    icon: 'search',
    action: () => openSessionSearch(),
  },
  {
    label: 'Toggle Theme',
    icon: 'theme',
    action: () => toggleTheme(),
  },
  {
    label: 'Settings',
    icon: 'settings',
    action: () => openModal(el.settingsOverlay),
  },
  {
    label: 'About Atlas',
    icon: 'about',
    action: () => openModal(el.aboutOverlay),
  },
  {
    label: 'Push to GitHub',
    icon: 'github',
    action: () => openGithubFlow(),
  },
];

const palette = createCommandPalette(
  { overlay: el.cmdkOverlay, panel: el.cmdkPanel, input: el.cmdkInput, list: el.cmdkList },
  mainCommands
);

function openMainPalette() {
  palette.setCommands(mainCommands, 'Type a command...');
  palette.open();
}

function openSessionSearch() {
  const { sessions } = getState();
  const sessionCommands = sessions.map((session) => ({
    label: session.title,
    icon: 'session',
    action: () => switchSession(session.id),
  }));
  palette.setCommands(sessionCommands, 'Search sessions...');
  palette.open();
}

el.commandTriggerBtn.addEventListener('click', openMainPalette);

document.addEventListener('keydown', (event) => {
  const isK = event.key === 'k' || event.key === 'K';
  if ((event.ctrlKey || event.metaKey) && isK) {
    event.preventDefault();
    openMainPalette();
  }
});

/* ============================================
   BOOTSTRAP
   ============================================ */
function boot() {
  initTheme();
  initSettings();
  initAuth();
  initSessions();

  updateThemeUI(getTheme());
  updateSettingsUI(getSettings());
  updateAccountUI(getUser());
  renderSidebar();
  renderChat();
  updateSendState();
  initMobileViewport();

  runSplash(el.splash, el.splashOutput, () => {
    el.splash.remove();
    if (isAuthenticated()) {
      el.app.hidden = false;
    } else {
      el.landingScreen.hidden = false;
    }
  });
}

boot();
