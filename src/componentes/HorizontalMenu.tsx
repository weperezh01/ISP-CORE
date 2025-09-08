import React from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import getStyles from './HorizontalMenu.styles';

const HorizontalMenu = ({ botones, navigation, isDarkMode }) => {
  const styles = getStyles(isDarkMode); // Obtén estilos basados en el modo

  return (
    <View style={styles.menuContainer}>
      <FlatList
        data={botones}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.footerButtonHorizontal}
            onPress={item.action || (() => navigation.navigate(item.screen, item.params || {}))}
          >
            <Icon
              name={item.icon}
              size={20}
              color="#fff"
              style={styles.iconLeft}
            />
            {item.title && <Text style={styles.footerButtonText}>{item.title}</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default HorizontalMenu;
