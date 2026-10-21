// Security Guard: Anti-Inspect, Anti-F12, Anti-Tamper, Privacy Shield

export interface SecurityViolationCallback {
  (type: 'right_click' | 'devtools_key' | 'devtools_detected' | 'save_attempt' | 'print_attempt'): void;
}

export function initSecurityGuard(onViolation: SecurityViolationCallback) {
  // 1. Disable Right Click (Context Menu)
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onViolation('right_click');
    return false;
  };

  // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S, Ctrl+P)
  const handleKeyDown = (e: KeyboardEvent) => {
    // Check for F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      onViolation('devtools_key');
      return false;
    }

    const isCtrlOrMeta = e.ctrlKey || e.metaKey;

    // Check for Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (isCtrlOrMeta && e.shiftKey) {
      const k = e.key.toLowerCase();
      if (k === 'i' || k === 'j' || k === 'c') {
        e.preventDefault();
        e.stopPropagation();
        onViolation('devtools_key');
        return false;
      }
    }

    // Check for Ctrl+U (View Source)
    if (isCtrlOrMeta && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      e.stopPropagation();
      onViolation('devtools_key');
      return false;
    }

    // Check for Ctrl+S (Save Page)
    if (isCtrlOrMeta && e.key.toLowerCase() === 's') {
      e.preventDefault();
      e.stopPropagation();
      onViolation('save_attempt');
      return false;
    }

    // Check for Ctrl+P (Print Page)
    if (isCtrlOrMeta && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      e.stopPropagation();
      onViolation('print_attempt');
      return false;
    }
  };

  // 3. DevTools Detection via outer/inner threshold & debugger timing
  let devtoolsOpen = false;
  const threshold = 160;

  const checkDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        onViolation('devtools_detected');
      }
    } else {
      devtoolsOpen = false;
    }
  };

  const devToolsInterval = setInterval(checkDevTools, 1000);

  // 4. Attach event listeners
  window.addEventListener('contextmenu', handleContextMenu, { capture: true });
  window.addEventListener('keydown', handleKeyDown, { capture: true });

  // Cleanup handler
  return () => {
    window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    window.removeEventListener('keydown', handleKeyDown, { capture: true });
    clearInterval(devToolsInterval);
  };
}
