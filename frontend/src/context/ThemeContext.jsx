import React, { createContext, useContext, useEffect, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(
        // Default to light, but check localStorage first
        localStorage.getItem('theme') || 'light'
    );

    useEffect(() => {
        // Find the root HTML element
        const root = window.document.documentElement;
        
        // Remove the old theme class and add the new one
        root.classList.remove('light', 'dark');
        root.classList.add(theme);

        // Persist to local storage
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook for easier consumption
export const useTheme = () => useContext(ThemeContext);
