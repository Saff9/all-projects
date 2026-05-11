// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-nta-bg flex flex-col items-center justify-center px-4 text-center">
      <div className="text-7xl font-heading font-extrabold text-[#003580] mb-2">404</div>
      <h1 className="font-heading font-bold text-2xl text-gray-800 mb-2">Page Not Found</h1>
      <p className="text-gray-500 font-sans mb-6 max-w-md">
        The page you are looking for does not exist. Please go back to the home page to find your JEE 2026 exam hall.
      </p>
      <Link
        href="/"
        className="nta-btn px-6 py-3 rounded-lg font-heading font-bold text-base"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
