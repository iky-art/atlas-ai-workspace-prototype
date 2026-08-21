import { truncate } from './utils.js';

const ICONS = {
  rename: '<svg viewBox="0 0 20 20" fill="none"><path d="M13.5 3.5 16.5 6.5 7 16 3.5 16.5 4 13 13.5 3.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  delete: '<svg viewBox="0 0 20 20" fill="none"><path d="M4.5 6h11M8 6V4.5A1 1 0 0 1 9 3.5h2a1 1 0 0 1 1 1V6M6 6l.6 9a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9L14 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

export function renderSessionList(container, { sessions, activeSessionId }, handlers) {
  container.innerHTML = '';

  if (sessions.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'session-empty';
    empty.textContent = 'No sessions yet.';
    container.appendChild(empty);
    return;
  }

  sessions.forEach((session) => {
    const item = document.createElement('li');
    item.className = `session-item${session.id === activeSessionId ? ' is-active' : ''}`;

    // A plain element rather than a <button>: native buttons treat Space
    // as an activation key (triggers click) instead of inserting a
    // character, which corrupts typing while the title is contentEditable.
    const titleBtn = document.createElement('span');
    titleBtn.setAttribute('role', 'button');
    titleBtn.tabIndex = 0;
    titleBtn.className = 'session-item-title';
    titleBtn.textContent = truncate(session.title, 26);
    titleBtn.title = session.title;
    titleBtn.addEventListener('click', () => {
      if (titleBtn.contentEditable !== 'true') handlers.onSwitch(session.id);
    });
    titleBtn.addEventListener('keydown', (event) => {
      if (titleBtn.contentEditable === 'true') return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handlers.onSwitch(session.id);
      }
    });

    const actions = document.createElement('div');
    actions.className = 'session-item-actions';

    const renameBtn = document.createElement('button');
    renameBtn.type = 'button';
    renameBtn.className = 'icon-btn';
    renameBtn.setAttribute('aria-label', `Rename ${session.title}`);
    renameBtn.innerHTML = ICONS.rename;
    renameBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      startRename(titleBtn, session, handlers);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'icon-btn';
    deleteBtn.setAttribute('aria-label', `Delete ${session.title}`);
    deleteBtn.innerHTML = ICONS.delete;
    deleteBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      handlers.onDelete(session);
    });

    actions.append(renameBtn, deleteBtn);
    item.append(titleBtn, actions);
    container.appendChild(item);
  });
}

function startRename(titleBtn, session, handlers) {
  titleBtn.contentEditable = 'true';
  titleBtn.textContent = session.title;
  titleBtn.focus();

  const range = document.createRange();
  range.selectNodeContents(titleBtn);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  function commit() {
    titleBtn.contentEditable = 'false';
    const newTitle = titleBtn.textContent.trim();
    if (newTitle && newTitle !== session.title) {
      handlers.onRename(session.id, newTitle);
    } else {
      titleBtn.textContent = truncate(session.title, 26);
    }
    titleBtn.removeEventListener('blur', commit);
    titleBtn.removeEventListener('keydown', onKeydown);
  }

  function onKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      titleBtn.blur();
    } else if (event.key === 'Escape') {
      titleBtn.textContent = truncate(session.title, 26);
      titleBtn.contentEditable = 'false';
      titleBtn.removeEventListener('blur', commit);
      titleBtn.removeEventListener('keydown', onKeydown);
    }
  }

  titleBtn.addEventListener('blur', commit);
  titleBtn.addEventListener('keydown', onKeydown);
}

export function initSidebar({ sidebar, overlay, collapseBtn, mobileMenuBtn }) {
  function openMobile() {
    sidebar.classList.add('is-open');
    overlay.classList.add('is-visible');
    mobileMenuBtn?.setAttribute('aria-expanded', 'true');
  }

  function closeMobile() {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    mobileMenuBtn?.setAttribute('aria-expanded', 'false');
  }

  function toggleMobile() {
    if (sidebar.classList.contains('is-open')) {
      closeMobile();
    } else {
      openMobile();
    }
  }

  mobileMenuBtn?.addEventListener('click', toggleMobile);
  overlay.addEventListener('click', closeMobile);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sidebar.classList.contains('is-open')) {
      closeMobile();
    }
  });

  collapseBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('is-collapsed');
  });

  return { openMobile, closeMobile, toggleMobile };
}
