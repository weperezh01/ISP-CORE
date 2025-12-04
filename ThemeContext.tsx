// ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';  // Asegúrate de tener instalado este paquete

const defaultTheme = {
    isDarkMode: false,
    toggleTheme: () => {},
};

const ThemeContext = createContext(defaultTheme);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('@theme');
                if (savedTheme !== null) {
                    setIsDarkMode(savedTheme === 'dark');
                }
            } catch (e) {
                console.error('Failed to load theme', e);
            }
        };

        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newIsDarkMode = !isDarkMode;
        setIsDarkMode(newIsDarkMode);
        try {
            await AsyncStorage.setItem('@theme', newIsDarkMode ? 'dark' : 'light');
        } catch (e) {
            console.error('Error saving theme', e);
        }
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
