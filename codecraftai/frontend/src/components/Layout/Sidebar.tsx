import { NavLink } from "react-router-dom";
import { MessageSquare, LayoutDashboard, Settings, Terminal, X } from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navItems = [
    { name: "AI Chat", path: "/", icon: MessageSquare },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const sidebarContent = (
    <aside className="w-20 sm:w-20 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col items-center py-6 gap-6 shadow-2xl sm:shadow-sm h-full shrink-0 z-50 transition duration-200">
      <div className="flex items-center justify-between w-full px-4 sm:justify-center">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-lg shadow-blue-500/30">
          <Terminal size={20} />
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 sm:hidden text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 cursor-pointer">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-3 w-full px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.name}
              onClick={onClose}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-3 rounded-2xl transition duration-200 group relative ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold shadow-xs border border-blue-100 dark:border-blue-900/50"
                    : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`
              }
            >
              <Icon size={20} className="transition duration-200 group-hover:scale-110" />
              <span className="text-[10px] mt-1 tracking-tight font-sans">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-2 px-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-xs shadow-green-500" title="System Online & Healthy" />
        <span className="text-[9px] text-gray-400 font-mono tracking-wider">v1.0.2</span>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden sm:flex h-full">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 sm:hidden animate-fade-in flex">
          <div className="h-full animate-slide-right">
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={onClose} />
        </div>
      )}
    </>
  );
}
