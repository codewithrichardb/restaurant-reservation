'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we can show the toggle
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until after mounting to prevent hydration mismatch
  if (!mounted) {
    return <div className="btn btn-link nav-link px-2 py-1" style={{ visibility: 'hidden' }}></div>;
  }

  return (
    <button
      className="btn btn-link nav-link px-2 py-1"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <i className="bi bi-moon"></i>
      ) : (
        <i className="bi bi-sun"></i>
      )}
    </button>
  );
}
