export function setupGlobalShortcuts(handlers: {
  generate?: () => void;
  newChat?: () => void;
  toggleSidebar?: () => void;
  openSettings?: () => void;
}) {
  const listener = (e: KeyboardEvent) => {
    // Ctrl + Enter to generate
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      handlers.generate?.();
    }
    // Alt + N for New Chat
    if (e.altKey && e.key.toLowerCase() === "n") {
      e.preventDefault();
      handlers.newChat?.();
    }
    // Alt + B for Toggle Sidebar
    if (e.altKey && e.key.toLowerCase() === "b") {
      e.preventDefault();
      handlers.toggleSidebar?.();
    }
    // Alt + S for Settings
    if (e.altKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      handlers.openSettings?.();
    }
  };

  window.addEventListener("keydown", listener);
  return () => window.removeEventListener("keydown", listener);
}
