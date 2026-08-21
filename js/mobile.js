/**
 * Keeps the composer visible above the on-screen keyboard on mobile.
 *
 * Relies on the VisualViewport API rather than `position: fixed; bottom: 0`
 * alone, because Android's keyboard resizes the visual viewport without
 * resizing the layout viewport in many browsers \u2014 fixed-bottom elements
 * end up hidden behind the keyboard if you don't account for that gap.
 */
export function initMobileViewport() {
  const root = document.documentElement;

  function applyViewportUnit() {
    // 100dvh has patchy support on some Android WebViews; this keeps a
    // reliable fallback in sync with the actual visible height.
    root.style.setProperty('--app-vh', `${window.innerHeight * 0.01}px`);
  }

  function applyKeyboardInset() {
    const viewport = window.visualViewport;
    if (!viewport) {
      root.style.setProperty('--keyboard-inset', '0px');
      return;
    }

    const layoutHeight = window.innerHeight;
    const visibleHeight = viewport.height + viewport.offsetTop;
    const inset = Math.max(0, layoutHeight - visibleHeight);

    root.style.setProperty('--keyboard-inset', `${inset}px`);
  }

  applyViewportUnit();
  applyKeyboardInset();

  window.addEventListener('resize', applyViewportUnit);

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', applyKeyboardInset);
    window.visualViewport.addEventListener('scroll', applyKeyboardInset);
  } else {
    window.addEventListener('resize', applyKeyboardInset);
  }
}

/**
 * Scrolls the chat area to the bottom after layout settles \u2014 used after
 * the keyboard opens/closes or a new message is appended, so the latest
 * content stays above the composer instead of behind it.
 */
export function scrollToBottom(scrollContainer) {
  requestAnimationFrame(() => {
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  });
}
