import { prefersReducedMotion, randomBetween } from './utils.js';

const BOOT_LINES = [
  { text: '$ atlas --initialize', className: 'prompt' },
  { text: '> Loading Atlas Core...       ', suffix: 'OK' },
  { text: '> Initializing Interface...   ', suffix: 'OK' },
  { text: '> Loading Context System...   ', suffix: 'OK' },
  { text: '> Checking Workspace...       ', suffix: 'OK' },
  { text: '> System Check...             ', suffix: 'OK' },
];

function typeLine(lineEl, text) {
  return new Promise((resolve) => {
    let index = 0;
    const textNode = document.createTextNode('');
    lineEl.appendChild(textNode);
    lineEl.classList.add('is-visible');

    function step() {
      index += 1;
      textNode.textContent = text.slice(0, index);
      if (index < text.length) {
        window.setTimeout(step, randomBetween(10, 28));
      } else {
        resolve();
      }
    }

    step();
  });
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function runAnimated(outputEl, onReady) {
  for (const line of BOOT_LINES) {
    const lineEl = document.createElement('div');
    lineEl.className = `splash-line${line.className ? ` ${line.className}` : ''}`;
    outputEl.appendChild(lineEl);

    await typeLine(lineEl, line.text);

    if (line.suffix) {
      const okSpan = document.createElement('span');
      okSpan.className = 'ok';
      okSpan.textContent = line.suffix;
      lineEl.appendChild(okSpan);
    }

    await wait(randomBetween(120, 260));
  }

  await wait(220);

  const readyEl = document.createElement('div');
  readyEl.className = 'splash-line is-ready is-visible';
  readyEl.textContent = 'ATLAS READY';
  outputEl.appendChild(readyEl);

  await wait(320);

  const promptEl = document.createElement('div');
  promptEl.className = 'splash-line is-visible';
  promptEl.innerHTML = '<span class="prompt">$</span> <span class="splash-cursor" aria-hidden="true"></span>';
  outputEl.appendChild(promptEl);

  await wait(650);
  onReady();
}

function runReducedMotion(outputEl, onReady) {
  BOOT_LINES.forEach((line) => {
    const lineEl = document.createElement('div');
    lineEl.className = `splash-line is-visible${line.className ? ` ${line.className}` : ''}`;
    lineEl.textContent = line.text;
    if (line.suffix) {
      const okSpan = document.createElement('span');
      okSpan.className = 'ok';
      okSpan.textContent = line.suffix;
      lineEl.appendChild(okSpan);
    }
    outputEl.appendChild(lineEl);
  });

  const readyEl = document.createElement('div');
  readyEl.className = 'splash-line is-ready is-visible';
  readyEl.textContent = 'ATLAS READY';
  outputEl.appendChild(readyEl);

  window.setTimeout(onReady, 400);
}

/**
 * Runs the terminal boot sequence inside `splashEl`, then calls `onDone`
 * once the fade-out transition finishes.
 */
export function runSplash(splashEl, outputEl, onDone) {
  const finish = () => {
    splashEl.classList.add('is-hidden');
    window.setTimeout(onDone, 440);
  };

  if (prefersReducedMotion()) {
    runReducedMotion(outputEl, finish);
  } else {
    runAnimated(outputEl, finish);
  }
}
