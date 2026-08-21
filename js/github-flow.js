import { prefersReducedMotion } from './utils.js';

const STEP_ORDER = ['generate', 'visibility', 'push'];

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/**
 * Push to GitHub \u2014 a polished, fully-animated demo of what pushing a
 * generated project to GitHub would look like. This is presentational
 * only: no network request is made and no repository is actually
 * created. Every step that could plausibly be automatic (file
 * generation, the progress animation) runs on its own; the two moments
 * that matter \u2014 confirming visibility and the final push \u2014 always
 * require an explicit click.
 */
export function createGithubFlow(el) {
  let visibility = 'public';

  function setStepStatus(stepKey, status) {
    const stepEl = el.stepDots[stepKey];
    stepEl.dataset.status = status;
  }

  function updateStepLines() {
    el.stepLineGenerate.classList.toggle(
      'is-filled',
      el.stepDots.generate.dataset.status === 'done'
    );
    el.stepLineVisibility.classList.toggle(
      'is-filled',
      el.stepDots.visibility.dataset.status === 'done'
    );
  }

  function resetSteps() {
    setStepStatus('generate', 'current');
    setStepStatus('visibility', 'pending');
    setStepStatus('push', 'pending');
    updateStepLines();
  }

  async function swapPanel(fromKey, toKey) {
    const fromEl = el.panels[fromKey];
    const toEl = el.panels[toKey];
    const reduced = prefersReducedMotion();

    if (!reduced) {
      fromEl.classList.add('flow-anim-out');
      await wait(200);
    }

    fromEl.hidden = true;
    fromEl.classList.remove('flow-anim-out');
    toEl.hidden = false;

    if (!reduced) {
      toEl.classList.add('flow-anim-in');
      await wait(280);
      toEl.classList.remove('flow-anim-in');
    }
  }

  function resetGenerateChecklist() {
    el.checklistItems.forEach((item) => item.classList.remove('is-checked'));
    el.generateStatus.textContent = 'Generating...';
    el.generateStatus.classList.remove('is-complete');
  }

  async function runGenerateStep() {
    resetGenerateChecklist();
    for (const item of el.checklistItems) {
      await wait(280 + Math.random() * 220);
      item.classList.add('is-checked');
    }
    await wait(200);
    el.generateStatus.textContent = 'Generation complete';
    el.generateStatus.classList.add('is-complete');
    await wait(500);

    setStepStatus('generate', 'done');
    setStepStatus('visibility', 'current');
    updateStepLines();
    await swapPanel('generate', 'visibility');
  }

  function getRepoLabel() {
    return `${el.repoOwner}/${el.repoName}`;
  }

  el.visibilityInputs.forEach((input) => {
    input.addEventListener('change', () => {
      if (input.checked) visibility = input.value;
    });
  });

  el.visibilityContinueBtn.addEventListener('click', async () => {
    setStepStatus('visibility', 'done');
    setStepStatus('push', 'current');
    updateStepLines();

    el.summaryRepo.textContent = getRepoLabel();
    el.summaryVisibility.textContent = visibility.toUpperCase();

    await swapPanel('visibility', 'push');
  });

  el.pushBtn.addEventListener('click', async () => {
    await swapPanel('push', 'pushing');
    await runPushAnimation();
  });

  async function runPushAnimation() {
    el.progressFill.style.width = '0%';
    el.pushStatusItems.forEach((item) => {
      item.classList.remove('is-active', 'is-done');
    });

    const stages = [
      { percent: 35, key: 'upload' },
      { percent: 70, key: 'commit' },
      { percent: 100, key: 'finalize' },
    ];

    for (const stage of stages) {
      const item = el.pushStatusItems.find((i) => i.dataset.status === stage.key);
      item?.classList.add('is-active');
      el.progressFill.style.width = `${stage.percent}%`;
      await wait(650 + Math.random() * 300);
      item?.classList.remove('is-active');
      item?.classList.add('is-done');
    }

    await wait(300);

    el.completeRepoName.textContent = el.repoName;
    el.completeOwner.textContent = getRepoLabel();

    await swapPanel('pushing', 'complete');
  }

  function open({ repoOwner, repoName }) {
    el.repoOwner = repoOwner;
    el.repoName = repoName;
    el.repoNameLabel.textContent = `${repoName}/`;
    visibility = 'public';
    el.visibilityInputs.forEach((input) => {
      input.checked = input.value === 'public';
    });

    resetSteps();
    STEP_ORDER.forEach((key) => {
      el.panels[key].hidden = key !== 'generate';
    });
    el.panels.pushing.hidden = true;
    el.panels.complete.hidden = true;

    el.overlay.classList.add('is-open');
    runGenerateStep();
  }

  function close() {
    el.overlay.classList.remove('is-open');
  }

  return { open, close };
}
