'use client';

import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <svg
          className="w-5 h-5 text-gray-800"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
        </svg>
      ) : (
        <svg
          className="w-5 h-5 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm4.323 3.677a1 1 0 00-1.414-1.414L12.586 5a1 1 0 001.414 1.414l2.121-2.121zm2.646 2.646a1 1 0 001.414 0l1.414-1.414a1 1 0 00-1.414-1.414l-1.414 1.414zM13 10a3 3 0 11-6 0 3 3 0 016 0zm7-4.5a1 1 0 11-2 0 1 1 0 012 0zM2 13a1 1 0 011-1h2a1 1 0 110 2H3a1 1 0 01-1-1zm13.5-6.5a1 1 0 110-2 1 1 0 010 2zM2.458 18.971a1 1 0 001.414.014l1.414-1.414a1 1 0 00-1.414-1.414L2.458 18.971zM17 17a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          ></path>
        </svg>
      )}
    </button>
  );
}
