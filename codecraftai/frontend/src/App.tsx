import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout/Layout";
import ChatThread from "./components/Chat/ChatThread";
import Dashboard from "./components/Dashboard/Dashboard";
import Settings from "./components/Settings/Settings";
import ErrorBoundary from "./components/Common/ErrorBoundary";
import AuthGuard from "./components/Auth/AuthGuard";
import { useSettingsStore } from "./store/settingsStore";
import { useEffect } from "react";

export default function App() {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster 
          position="top-right" 
          toastOptions={{
            className: 'text-xs font-sans dark:bg-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 shadow-lg rounded-xl',
            duration: 3000,
          }} 
        />
        <AuthGuard>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<ChatThread />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </AuthGuard>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
