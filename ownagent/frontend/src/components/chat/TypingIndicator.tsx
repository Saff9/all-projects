import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <span
        className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-bounce"
        style={{ animationDelay: '0ms' }}
      />
      <span
        className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-bounce"
        style={{ animationDelay: '150ms' }}
      />
      <span
        className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-bounce"
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );
};

export default TypingIndicator;