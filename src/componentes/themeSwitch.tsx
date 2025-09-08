import React from 'react';
import { Switch, View, StyleSheet } from 'react-native';
import { useTheme } from '../../ThemeContext'; // Asegúrate de que la ruta del contexto es correcta

const ThemeSwitch = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const styles = StyleSheet.create({
    switchTrackColor: { false: "#767577", true: "#81b0ff" },
    switchThumbColor: { false: "#f4f3f4", true: "#f5dd4b" },
  });

  return (
    <Switch
      trackColor={styles.switchTrackColor}
      thumbColor={isDarkMode ? styles.switchThumbColor.true : styles.switchThumbColor.false}
      ios_backgroundColor="#3e3e3e"
      onValueChange={toggleTheme}
      value={isDarkMode}
    />
  );
};

export default ThemeSwitch;
