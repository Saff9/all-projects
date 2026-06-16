import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../common';
import { initializeTheme, initializeMobileDetection } from '../../store/useStore';

interface ChatLayoutProps {
  children: React.ReactNode;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  useEffect(() => {
    // Initialize theme
    initializeTheme();

    // Initialize mobile detection
    const cleanup = initializeMobileDetection();

    return cleanup;
  }, []);

  return (
    <div className="h-screen flex bg-[var(--bg-primary)] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ChatLayout;