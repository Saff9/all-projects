import { useSettingsStore } from "../../store/settingsStore";
import { useEncryption } from "../../hooks/useEncryption";
import { useAuthStore } from "../../store/authStore";
import { Moon, Sun, Lock, ShieldCheck, Sparkles, Terminal, Menu, LogOut, User, MessageSquare } from "lucide-react";

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
  onToggleMobileChatSidebar?: () => void;
  isChatRoute?: boolean;
}

export default function Header({ onToggleMobileSidebar, onToggleMobileChatSidebar, isChatRoute }: HeaderProps) {
  const { theme, setTheme } = useSettingsStore();
  const { isLocked } = useEncryption();
  const { userEmail, logout } = useAuthStore();

  return (
    <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-glass border-b border-gray-100 dark:border-gray-800 px-3 sm:px-6 flex items-center justify-between shadow-xs shrink-0 z-20 transition duration-200">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 sm:hidden rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition shadow-xs active:scale-95 cursor-pointer shrink-0"
          title="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        {/* Mobile Chats Drawer Button (visible only on chat route < md) */}
        {isChatRoute && (
          <button
            onClick={onToggleMobileChatSidebar}
            className="flex md:hidden items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-blue-600 dark:text-blue-400 font-bold text-xs shadow-xs active:scale-95 cursor-pointer shrink-0"
            title="Open Chats List"
          >
            <MessageSquare size={16} />
            <span>Chats</span>
          </button>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
            <Terminal size={16} />
          </div>
          <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-white font-mono hidden sm:inline truncate">Code Craft</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-950 border border-gray-200/60 dark:border-gray-800/60 rounded-xl text-[11px] font-semibold text-gray-600 dark:text-gray-400 shadow-inner flex-1 max-w-md truncate">
          <Sparkles size={13} className="text-blue-500 animate-pulse shrink-0" />
          <span className="truncate">Agent Skills Active: Web Scraper, Cost Analyst, Secure AES-GCM Memory</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Authenticated User Email Badge */}
        {userEmail && (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-blue-700 dark:text-blue-300 text-xs font-mono shadow-xs max-w-[120px] sm:max-w-none truncate">
            <User size={14} className="text-blue-500 shrink-0" />
            <span className="truncate hidden md:inline">{userEmail}</span>
            <button
              onClick={logout}
              className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800/60 rounded-lg text-blue-600 dark:text-blue-400 hover:text-red-500 transition cursor-pointer shrink-0 ml-auto sm:ml-0"
              title="Secure Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}

        {/* Encryption Status Badge */}
        <div className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold border shadow-xs transition duration-200 shrink-0 ${
          isLocked 
            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60 animate-pulse" 
            : "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/60"
        }`}>
          {isLocked ? <Lock size={14} /> : <ShieldCheck size={14} />}
          <span className="hidden sm:inline">{isLocked ? "Locked" : "AES-GCM"}</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Toggle Theme"
          className="p-2 sm:p-2.5 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition shadow-xs active:scale-95 cursor-pointer shrink-0"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
