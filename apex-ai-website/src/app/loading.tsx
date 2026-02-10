import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[200]">
      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center animate-pulse">
        <div className="w-6 h-6 rounded-md bg-black" />
      </div>
      <div className="mt-8 flex gap-2">
        <div className="w-1 h-1 rounded-full bg-white/20 animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1 h-1 rounded-full bg-white/20 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1 h-1 rounded-full bg-white/20 animate-bounce" />
      </div>
    </div>
  );
}
