'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import type { TypingState } from '@/lib/types';

interface TypingAreaProps {
  state: TypingState;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
  focused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  state,
  onKeyPress,
  onBackspace,
  disabled = false,
  focused = false,
  onFocus,
  onBlur,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus the input
  useEffect(() => {
    if (focused && inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [focused, disabled]);

  // Handle keyboard input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled || state.status === 'completed') return;

      // Prevent default for special keys
      if (e.key === 'Tab') {
        e.preventDefault();
        return;
      }

      // Handle backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        onBackspace();
        return;
      }

      // Handle regular character input
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        onKeyPress(e.key);
      }
    },
    [disabled, state.status, onKeyPress, onBackspace]
  );

  // Render the text with character-by-character styling
  const renderText = useCallback(() => {
    const { targetText, typedText, currentIndex, characterResults, status } = state;
    
    // Safe string handling
    if (typeof targetText !== 'string' || targetText.length === 0) {
      return <span className="text-tertiary text-lg">Loading text...</span>;
    }

    return targetText.split('').map((char: string, index: number) => {
      let className = 'character ';

      if (index < currentIndex) {
        // Already typed character
        const result = characterResults[index];
        if (result) {
          className += result.isCorrect ? 'correct' : 'incorrect';
        } else {
          className += 'correct';
        }
      } else if (index === currentIndex) {
        // Current character
        className += 'current';
        if (status === 'idle') {
          className += ' animate-pulse-slow';
        }
      } else {
        // Pending character
        className += 'pending';
      }

      // Handle space characters visually
      if (char === ' ') {
        return (
          <span key={index} className={className}>
            &nbsp;
          </span>
        );
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  }, [state.targetText, state.typedText, state.currentIndex, state.characterResults, state.status]);

  return (
    <div
      ref={containerRef}
      className={`
        relative w-full rounded-xl p-6 md:p-8
        transition-all duration-200
        ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-text'
        }
        ${focused ? 'ring-2 ring-accent ring-offset-2' : ''}
        bg-surface/50 backdrop-blur-sm
        border border-border
      `}
      onClick={() => inputRef.current?.focus()}
      role="textbox"
      aria-label="Typing area"
      aria-readonly={disabled}
      tabIndex={disabled ? -1 : 0}
    >
      {/* Hidden input for capturing keyboard events */}
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none"
        value={state.typedText}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-hidden="true"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
      />

      {/* Text display */}
      <div
        className="typing-text text-primary select-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {renderText()}
      </div>

      {/* Status indicator */}
      {state.status === 'idle' && (
        <div className="mt-4 text-center text-sm text-tertiary animate-pulse-slow">
          Start typing to begin...
        </div>
      )}

      {state.status === 'completed' && (
        <div className="mt-4 text-center text-sm text-success">
          Test completed!
        </div>
      )}
    </div>
  );
};

TypingArea.displayName = 'TypingArea';

