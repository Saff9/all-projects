// Minimal use-toast implementation to satisfy imports and show feedback to users.
// Prevents compile errors and provides standard client feedback.

export interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const toast = ({ title, description, variant }: ToastProps) => {
  console.log(`[Toast] ${title}: ${description || ""}`);
  if (typeof window !== "undefined") {
    // Show a clean native alert as a robust fallback
    alert(`${variant === "destructive" ? "❌ " : "🔥 "}${title}\n${description || ""}`);
  }
};

export const useToast = () => {
  return { toast };
};
