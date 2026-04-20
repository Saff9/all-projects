import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ChatSidebar from "../Chat/ChatSidebar";
import { ChatThread as ChatThreadType } from "../../types";

export default function Layout() {
  const location = useLocation();
  const isChatRoute = location.pathname === "/";
  
  const [activeThread, setActiveThread] = useState<ChatThreadType | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileChatSidebarOpen, setIsMobileChatSidebarOpen] = useState(false);

  const handleSelectThread = (thread: ChatThreadType) => {
    setActiveThread(thread);
    setIsMobileSidebarOpen(false);
    setIsMobileChatSidebarOpen(false); // auto close mobile chat drawer
  };

  const handleNewThread = () => {
    setActiveThread(null);
    setIsMobileSidebarOpen(false);
    setIsMobileChatSidebarOpen(false);
  };

  const handleThreadUpdated = (thread: ChatThreadType) => {
    setActiveThread(thread);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans overflow-hidden relative">
      <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      {isChatRoute && (
        <ChatSidebar
          activeThreadId={activeThread?.id || null}
          onSelectThread={handleSelectThread}
          onNewThread={handleNewThread}
          isOpen={isMobileChatSidebarOpen}
          onClose={() => setIsMobileChatSidebarOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onToggleMobileChatSidebar={() => setIsMobileChatSidebarOpen(!isMobileChatSidebarOpen)}
          isChatRoute={isChatRoute}
        />
        <main className={`flex-1 min-h-0 overflow-hidden ${isChatRoute ? "" : "overflow-y-auto p-3 sm:p-6"}`}>
          <Outlet context={{ activeThread, onThreadUpdated: handleThreadUpdated }} />
        </main>
      </div>
    </div>
  );
}
