// src/components/RandomButton.js
'use client';
import { useRouter } from 'next/navigation';
import { FaDice } from 'react-icons/fa';

export default function RandomButton({ slugs }) {
  const router = useRouter();

  const goRandom = () => {
    if (slugs.length === 0) return;
    const random = slugs[Math.floor(Math.random() * slugs.length)];
    router.push(random);
  };

  return (
    <button
      onClick={goRandom}
      className="group relative inline-flex items-center gap-3 px-8 py-4 bg-craft-surface hover:bg-craft-border border border-craft-primary/50 text-craft-text font-bold text-base rounded-2xl shadow-[0_4px_20px_rgba(0,114,245,0.15)] hover:shadow-[0_4px_25px_rgba(0,114,245,0.3)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      <FaDice className="text-xl text-craft-primary group-hover:rotate-180 transition-transform duration-500" />
      <span>I’m Feeling Crafty</span>
    </button>
  );
}
