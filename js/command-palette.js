const ICONS = {
  session: '<svg viewBox="0 0 20 20" fill="none"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 14.5v-9Z" stroke="currentColor" stroke-width="1.3"/><path d="M7 8h6M7 11h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  search: '<svg viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="5" stroke="currentColor" stroke-width="1.3"/><path d="m16 16-3.5-3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  theme: '<svg viewBox="0 0 20 20" fill="none"><path d="M10 3.5a6.5 6.5 0 1 0 6.5 6.5 5 5 0 0 1-6.5-6.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  settings: '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2.6" stroke="currentColor" stroke-width="1.3"/><path d="M10 3.5v2M10 14.5v2M16.5 10h-2M5.5 10h-2M14.6 5.4l-1.4 1.4M6.8 13.2l-1.4 1.4M14.6 14.6l-1.4-1.4M6.8 6.8 5.4 5.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  about: '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="6.5" stroke="currentColor" stroke-width="1.3"/><path d="M10 9v4.5M10 6.8v.1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  github: '<svg viewBox="0 0 20 20" fill="none"><path d="M10 3.5c-3.6 0-6.5 2.9-6.5 6.5 0 2.9 1.9 5.3 4.5 6.2.3.1.5-.1.5-.4v-1.4c-1.8.4-2.2-.9-2.2-.9-.3-.8-.7-1-.7-1-.6-.4.1-.4.1-.4.6 0 1 .7 1 .7.6 1 1.6.7 2 .5.1-.4.2-.7.4-.9-1.4-.2-2.9-.7-2.9-3.2 0-.7.2-1.3.7-1.7-.1-.2-.3-.9.1-1.9 0 0 .6-.2 1.9.7.6-.1 1.1-.2 1.7-.2.6 0 1.1.1 1.7.2 1.3-.9 1.9-.7 1.9-.7.4 1 .1 1.7.1 1.9.4.5.7 1.1.7 1.7 0 2.5-1.5 3-2.9 3.2.2.2.4.6.4 1.2v1.8c0 .3.2.5.5.4 2.6-.9 4.5-3.3 4.5-6.2 0-3.6-2.9-6.5-6.5-6.5Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>',
};

export function createCommandPalette({ overlay, panel, input, list }, initialCommands) {
  let activeIndex = 0;
  let commands = initialCommands;
  let filtered = commands;

  function render() {
    list.innerHTML = '';

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'cmdk-empty';
      empty.textContent = 'No matching commands.';
      list.appendChild(empty);
      return;
    }

    filtered.forEach((command, index) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = `cmdk-item${index === activeIndex ? ' is-active' : ''}`;
      item.innerHTML = `${ICONS[command.icon] ?? ''}<span>${command.label}</span>`;
      item.addEventListener('mouseenter', () => {
        activeIndex = index;
        render();
      });
      item.addEventListener('click', () => runActive());
      list.appendChild(item);
    });
  }

  function filterCommands(query) {
    const normalized = query.trim().toLowerCase();
    filtered = normalized
      ? commands.filter((command) => command.label.toLowerCase().includes(normalized))
      : commands;
    activeIndex = 0;
    render();
  }

  function runActive() {
    const command = filtered[activeIndex];
    if (command) {
      close();
      command.action();
    }
  }

  function open() {
    overlay.classList.add('is-open');
    input.value = '';
    filterCommands('');
    window.setTimeout(() => input.focus(), 10);
    document.addEventListener('keydown', onKeydown);
  }

  function setCommands(nextCommands, placeholder) {
    commands = nextCommands;
    if (placeholder !== undefined) input.placeholder = placeholder;
  }

  function close() {
    overlay.classList.remove('is-open');
    document.removeEventListener('keydown', onKeydown);
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
      render();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      render();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      runActive();
    }
  }

  input.addEventListener('input', (event) => filterCommands(event.target.value));
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  panel.addEventListener('click', (event) => event.stopPropagation());

  return { open, close, setCommands };
}
