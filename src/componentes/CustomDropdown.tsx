// CustomDropdown.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';

const CustomDropdown = ({ data, onSelect, placeholder, isDarkMode, initialSelectedItem, onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(initialSelectedItem);

  useEffect(() => {
    setSelectedItem(initialSelectedItem);
  }, [initialSelectedItem]);

  const toggleDropdown = () => {
    if (!isOpen && onOpen) {
      onOpen();
    }
    setIsOpen(!isOpen);
  };

  // Aquí definimos los estilos directamente dentro del componente.
  // Esto nos permite cambiar los estilos en función del tema.
  const styles = {
    input: {
      borderWidth: 1,
      borderColor: isDarkMode ? 'white' : 'gray',
      padding: 10,
      borderRadius: 5,
      backgroundColor: isDarkMode ? '#333' : 'white',
      marginBottom: 10,
    },
    textStyle: {
      fontSize: 16,
      color: isDarkMode ? 'white' : 'black',
    },
    listContainer: {
      borderColor: isDarkMode ? 'white' : 'gray',
      borderWidth: 1,
      borderRadius: 5,
    },
    itemStyle: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? 'white' : 'gray',
      backgroundColor: isDarkMode ? '#333' : 'white',
    },
    textItemStyle: {
      fontSize: 16,
      color: isDarkMode ? 'white' : 'black',
    },
    expanded: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
  };

  const handleSelect = (item) => {
    onSelect(item);
    setSelectedItem(item);
    setIsOpen(false);
  };

  return (
    <View>
      <TouchableOpacity 
        onPress={() => setIsOpen(!isOpen)} 
        style={[styles.input, isOpen && styles.expanded]} // Estilo para el elemento seleccionado
      >
        <Text style={styles.textStyle}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.listContainer}>
          <FlatList
            data={data}
            keyExtractor={(item, index) => item.value ? item.value.toString() : `unique-${index}`}

            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelect(item)} style={styles.itemStyle}>
                <Text style={styles.textItemStyle}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default CustomDropdown;
