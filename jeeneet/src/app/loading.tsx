// src/app/loading.tsx
// Shown by Next.js while server components are loading

export default function Loading() {
  return (
    <div className="min-h-screen bg-nta-bg animate-pulse">
      {/* Header skeleton */}
      <div className="h-14 bg-[#003580]" />
      <div className="h-8 bg-[#f7941d]" />

      {/* Stats bar */}
      <div className="bg-white h-16 border-b border-gray-200" />

      {/* Search card skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="h-16 bg-[#003580] opacity-80" />
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded-lg" />
              <div className="h-10 bg-gray-200 rounded-lg" />
            </div>
            <div className="h-12 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* News grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-32" />
        ))}
      </div>
    </div>
  );
}
