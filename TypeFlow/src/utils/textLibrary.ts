import { Difficulty, TextEntry } from '../types';

/**
 * Collection of text entries organized by difficulty and category.
 * Each entry includes content, estimated typing time, and metadata.
 */
export const textLibrary: Record<Difficulty, Record<string, TextEntry[]>> = {
  easy: {
    quotes: [
      {
        id: 'easy-quote-1',
        content: 'The only way to do great work is to love what you do.',
        difficulty: 'easy',
        category: 'quotes',
        estimatedTime: 15,
        wordCount: 11,
        charCount: 52
      },
      {
        id: 'easy-quote-2',
        content: 'Life is what happens when you are busy making other plans.',
        difficulty: 'easy',
        category: 'quotes',
        estimatedTime: 18,
        wordCount: 12,
        charCount: 62
      }
    ],
    code: [
      {
        id: 'easy-code-1',
        content: 'console.log("Hello, World!");',
        difficulty: 'easy',
        category: 'code',
        estimatedTime: 8,
        wordCount: 4,
        charCount: 28
      },
      {
        id: 'easy-code-2',
        content: 'function add(a, b) { return a + b; }',
        difficulty: 'easy',
        category: 'code',
        estimatedTime: 12,
        wordCount: 11,
        charCount: 38
      }
    ],
    technical: [
      {
        id: 'easy-tech-1',
        content: 'The CPU processes data at high speeds.',
        difficulty: 'easy',
        category: 'technical',
        estimatedTime: 10,
        wordCount: 6,
        charCount: 36
      },
      {
        id: 'easy-tech-2',
        content: 'RAM provides temporary storage for active programs.',
        difficulty: 'easy',
        category: 'technical',
        estimatedTime: 14,
        wordCount: 8,
        charCount: 51
      }
    ],
    prose: [
      {
        id: 'easy-prose-1',
        content: 'The sun set slowly behind the mountains.',
        difficulty: 'easy',
        category: 'prose',
        estimatedTime: 10,
        wordCount: 7,
        charCount: 37
      },
      {
        id: 'easy-prose-2',
        content: 'A gentle breeze blew through the trees.',
        difficulty: 'easy',
        category: 'prose',
        estimatedTime: 9,
        wordCount: 7,
        charCount: 34
      }
    ]
  },
  medium: {
    quotes: [
      {
        id: 'medium-quote-1',
        content: 'In the middle of difficulty lies opportunity.',
        difficulty: 'medium',
        category: 'quotes',
        estimatedTime: 12,
        wordCount: 7,
        charCount: 46
      },
      {
        id: 'medium-quote-2',
        content: 'Future belongs to those who believe in beauty of their dreams.',
        difficulty: 'medium',
        category: 'quotes',
        estimatedTime: 18,
        wordCount: 12,
        charCount: 74
      }
    ],
    code: [
      {
        id: 'medium-code-1',
        content: 'const fibonacci = (n) => n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);',
        difficulty: 'medium',
        category: 'code',
        estimatedTime: 22,
        wordCount: 23,
        charCount: 80
      },
      {
        id: 'medium-code-2',
        content: 'const [state, setState] = useState(initialValue);',
        difficulty: 'medium',
        category: 'code',
        estimatedTime: 15,
        wordCount: 10,
        charCount: 47
      }
    ],
    technical: [
      {
        id: 'medium-tech-1',
        content: 'The operating system manages system resources and provides common services.',
        difficulty: 'medium',
        category: 'technical',
        estimatedTime: 20,
        wordCount: 12,
        charCount: 76
      },
      {
        id: 'medium-tech-2',
        content: 'Encryption transforms data into unreadable format to protect it.',
        difficulty: 'medium',
        category: 'technical',
        estimatedTime: 18,
        wordCount: 11,
        charCount: 68
      }
    ],
    prose: [
      {
        id: 'medium-prose-1',
        content: 'The old house stood at the end of the lane, its windows boarded and garden overgrown.',
        difficulty: 'medium',
        category: 'prose',
        estimatedTime: 24,
        wordCount: 16,
        charCount: 85
      },
      {
        id: 'medium-prose-2',
        content: 'She opened the letter with trembling hands, not knowing what news it would bring.',
        difficulty: 'medium',
        category: 'prose',
        estimatedTime: 22,
        wordCount: 15,
        charCount: 78
      }
    ]
  },
  hard: {
    quotes: [
      {
        id: 'hard-quote-1',
        content: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
        difficulty: 'hard',
        category: 'quotes',
        estimatedTime: 22,
        wordCount: 14,
        charCount: 80
      },
      {
        id: 'hard-quote-2',
        content: 'The unexamined life is not worth living. To find yourself, think for yourself.',
        difficulty: 'hard',
        category: 'quotes',
        estimatedTime: 25,
        wordCount: 16,
        charCount: 89
      }
    ],
    code: [
      {
        id: 'hard-code-1',
        content: 'const debounce = (func, wait) => { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func(...args), wait); }; };',
        difficulty: 'hard',
        category: 'code',
        estimatedTime: 40,
        wordCount: 44,
        charCount: 165
      },
      {
        id: 'hard-code-2',
        content: 'const memoize = (fn) => { const cache = {}; return (...args) => { const key = JSON.stringify(args); return cache[key] || (cache[key] = fn(...args)); }; };',
        difficulty: 'hard',
        category: 'code',
        estimatedTime: 45,
        wordCount: 52,
        charCount: 191
      }
    ],
    technical: [
      {
        id: 'hard-tech-1',
        content: 'A distributed system is a system whose components are located on different networked computers, which communicate and coordinate their actions by passing messages.',
        difficulty: 'hard',
        category: 'technical',
        estimatedTime: 45,
        wordCount: 32,
        charCount: 192
      },
      {
        id: 'hard-tech-2',
        content: 'Cryptographic hash functions are mathematical algorithms that transform data into a fixed-size string of characters, which appears random.',
        difficulty: 'hard',
        category: 'technical',
        estimatedTime: 38,
        wordCount: 26,
        charCount: 161
      }
    ],
    prose: [
      {
        id: 'hard-prose-1',
        content: 'It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly.',
        difficulty: 'hard',
        category: 'prose',
        estimatedTime: 40,
        wordCount: 40,
        charCount: 204
      },
      {
        id: 'hard-prose-2',
        content: 'The sky above the port was the color of television, tuned to a dead channel. It was a lightless day, the sun obscured by a blanket of clouds.',
        difficulty: 'hard',
        category: 'prose',
        estimatedTime: 35,
        wordCount: 34,
        charCount: 165
      }
    ]
  },
  expert: {
    quotes: [
      {
        id: 'expert-quote-1',
        content: 'That which does not kill us makes us stronger. I am not a man, but a method. The reasonable man adapts himself to the world; the unreasonable one persists in trying to adapt the world to himself.',
        difficulty: 'expert',
        category: 'quotes',
        estimatedTime: 35,
        wordCount: 42,
        charCount: 220
      },
      {
        id: 'expert-quote-2',
        content: 'In three words I can sum up everything I have learned about life: it goes on. Do not go where the path may lead, go instead where there is no path and leave a trail.',
        difficulty: 'expert',
        category: 'quotes',
        estimatedTime: 32,
        wordCount: 38,
        charCount: 203
      }
    ],
    code: [
      {
        id: 'expert-code-1',
        content: 'const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x); const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);',
        difficulty: 'expert',
        category: 'code',
        estimatedTime: 35,
        wordCount: 52,
        charCount: 182
      },
      {
        id: 'expert-code-2',
        content: 'const curry = (fn) => { return function curried(...args) { if (args.length >= fn.length) { return fn.apply(this, args); } else { return function(...args2) { return curried.apply(this, args.concat(args2)); }; }};};',
        difficulty: 'expert',
        category: 'code',
        estimatedTime: 50,
        wordCount: 82,
        charCount: 282
      }
    ],
    technical: [
      {
        id: 'expert-tech-1',
        content: 'The CAP theorem states that a distributed system can only simultaneously provide two out of the following three guarantees: consistency, availability, and partition tolerance. Understanding this trade-off is fundamental.',
        difficulty: 'expert',
        category: 'technical',
        estimatedTime: 45,
        wordCount: 45,
        charCount: 270
      },
      {
        id: 'expert-tech-2',
        content: 'Recursion in computer science is a method where the solution to a problem depends on solutions to smaller instances of the same problem. It requires a base case to prevent infinite loops.',
        difficulty: 'expert',
        category: 'technical',
        estimatedTime: 42,
        wordCount: 48,
        charCount: 258
      }
    ],
    prose: [
      {
        id: 'expert-prose-1',
        content: 'It was a pleasure to burn. It was a special pleasure to see things eaten, to see things burned, to see things turned to ashes. The fire was alive and it was beautiful.',
        difficulty: 'expert',
        category: 'prose',
        estimatedTime: 35,
        wordCount: 42,
        charCount: 217
      },
      {
        id: 'expert-prose-2',
        content: 'Lolita, light of my life, fire of my loins. My sin, my soul. Lo-lee-ta: the tip of the tongue taking a trip of three steps down the palate to tap.',
        difficulty: 'expert',
        category: 'prose',
        estimatedTime: 38,
        wordCount: 42,
        charCount: 208
      }
    ]
  }
};

/**
 * Get all text entries for a specific difficulty.
 * @param difficulty - The difficulty level to filter by
 * @returns Array of TextEntry objects
 */
export function getTextsByDifficulty(difficulty: Difficulty): TextEntry[] {
  const textsByCategory = textLibrary[difficulty];
  return Object.values(textsByCategory).flat();
}

/**
 * Get all text entries for a specific category across all difficulties.
 * @param category - The category to filter by
 * @returns Array of TextEntry objects
 */
export function getTextsByCategory(category: string): TextEntry[] {
  const allTexts: TextEntry[] = [];
  Object.values(textLibrary).forEach(difficultyTexts => {
    if (difficultyTexts[category]) {
      allTexts.push(...difficultyTexts[category]);
    }
  });
  return allTexts;
}

import { fetchLiveQuote } from './liveQuotes';

/**
 * Get random text, supports live quotes
 * @param difficulty - The difficulty level
 * @param useLive - Fetch from internet API (default false)
 * @returns Promise<TextEntry | string>
 */
/**
 * Get content string, supports live quotes
 * @param difficulty - The difficulty level
 * @param useLive - Fetch from internet API (default false)
 * @returns Promise<string>
 */
export async function getRandomTextContent(difficulty: Difficulty, useLive: boolean = false): Promise<string> {
  if (useLive && Math.random() < 0.7) { // 70% chance for live
    try {
      const liveQuote = await fetchLiveQuote(difficulty);
      return liveQuote;
    } catch {
      // Fallback to static
    }
  }
  
  const entry = getRandomStaticEntry(difficulty);
  return entry.content;
}

/**
 * Get full TextEntry (static only)
 */
export function getRandomStaticEntry(difficulty: Difficulty): TextEntry {
  const allTexts = getTextsByDifficulty(difficulty);
  const randomIndex = Math.floor(Math.random() * allTexts.length);
  return allTexts[randomIndex];
}

/**
 * Get a random text entry from all available texts.
 * @returns A random TextEntry
 */
export function getAnyRandomText(): TextEntry {
  const allDifficulties = Object.keys(textLibrary) as Difficulty[];
  const randomDifficulty = allDifficulties[Math.floor(Math.random() * allDifficulties.length)];
  return getRandomText(randomDifficulty);
}
