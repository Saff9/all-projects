// src/lib/BookmarksContext.js
'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const BookmarksContext = createContext();

export function BookmarksProvider({ children }) {
  const [bookmarks, setBookmarks] = useState([]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      setBookmarks(stored);
    } catch {}
  }, []);

  const toggleBookmark = (slug) => {
    setBookmarks(prev => {
      let updated;
      if (prev.includes(slug)) {
        updated = prev.filter(s => s !== slug);
      } else {
        updated = [...prev, slug];
      }
      localStorage.setItem('bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  const isBookmarked = (slug) => bookmarks.includes(slug);

  return (
    <BookmarksContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export const useBookmarks = () => useContext(BookmarksContext);
