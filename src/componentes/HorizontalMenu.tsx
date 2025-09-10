import React from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import getStyles from './HorizontalMenu.styles';

const HorizontalMenu = ({ botones, navigation, isDarkMode }) => {
  const styles = getStyles(isDarkMode); // Obtén estilos basados en el modo

  const DEBUG = __DEV__;

  const normalizeIcon = (name) => {
    if (!name) return undefined;
    const map = {
      // comunes de otras librerías → MaterialIcons
      bars: 'menu',
      plus: 'add',
      user: 'person',
      users: 'people',
      'file-text': 'description',
      'bar-chart': 'insights',
      plug: 'power',
      search: 'search',
      download: 'download',
      // tema
      'sun-o': 'light-mode',
      'moon-o': 'dark-mode',
      // flechas
      'arrow-back': 'arrow-back',
    };
    return map[name] || name;
  };

  // Validación de datos
  if (!Array.isArray(botones) || botones.length === 0) {
    return <View style={styles.menuContainer} />;
  }

  try {
    return (
      <View style={styles.menuContainer}>
        <FlatList
          data={botones}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const handlePress = () => {
            try {
              if (item.action && typeof item.action === 'function') {
                item.action();
              } else if (item.screen && navigation) {
                navigation.navigate(item.screen, item.params || {});
              }
            } catch (error) {
              console.error('Error en acción del botón:', error);
            }
          };

          const normalizedIcon = normalizeIcon(item.icon);
          if (DEBUG && item.icon) {
            console.log('[HorizontalMenu] icon', item.icon, '→', normalizedIcon);
          }

          return (
            <TouchableOpacity
              style={styles.footerButtonHorizontal}
              onPress={handlePress}
            >
            {normalizedIcon ? (
              <Icon
                name={normalizedIcon}
                size={20}
                color="#fff"
                style={styles.iconLeft}
              />
            ) : (
              <View style={[styles.iconLeft, { width: 20, height: 20 }]} />
            )}
            {item.title && <Text style={styles.footerButtonText}>{item.title}</Text>}
            </TouchableOpacity>
          );
        }}
        />
      </View>
    );
  } catch (error) {
    console.error('Error en HorizontalMenu:', error);
    return <View style={styles.menuContainer} />;
  }
};

export default HorizontalMenu;
