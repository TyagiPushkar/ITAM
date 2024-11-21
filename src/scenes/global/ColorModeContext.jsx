import React, { createContext, useState, useMemo } from 'react';

// Create a context for color mode
export const ColorModeContext = createContext({
  mode: 'light', // Default value
  toggleColorMode: () => {},
  setColorMode: (mode) => {},
});

// Provider component for the context
export const ColorModeProvider = ({ children }) => {
  const [mode, setMode] = useState(localStorage.getItem("themeMode") || 'light');

  // Memoize the context value to avoid unnecessary re-renders
  const value = useMemo(() => ({
    mode,
    toggleColorMode: () => {
      const newMode = mode === 'light' ? 'dark' : 'light';
      setMode(newMode);
      localStorage.setItem("themeMode", newMode); // Update localStorage
    },
    setColorMode: (newMode) => {
      setMode(newMode);
      localStorage.setItem("themeMode", newMode); // Update localStorage
    },
  }), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  );
};
