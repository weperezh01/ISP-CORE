import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Selector = ({ label, placeholder, data, selectedValue, onValueChange, isDarkMode }) => {
  const handlePress = (value) => {
    onValueChange(value);
  };


  const styles = StyleSheet.create({
    container: {
      marginBottom: 4,
    },
    label: {
      fontSize: 14,
      marginBottom: 8,
      color: isDarkMode ? '#9CA3AF' : '#6B7280',
      fontWeight: '500',
    },
    dropdown: {
      backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
      marginTop: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    item: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#4B5563' : '#E5E7EB',
    },
    itemContent: {
      flex: 1,
      marginLeft: 12,
    },
    itemTitle: {
      fontSize: 15,
      fontWeight: '500',
      color: isDarkMode ? '#F9FAFB' : '#111827',
      marginBottom: 2,
    },
    itemSubtitle: {
      fontSize: 12,
      color: isDarkMode ? '#9CA3AF' : '#6B7280',
    },
    selectedItem: {
      backgroundColor: isDarkMode ? '#4B5563' : '#EFF6FF',
    },
    selectedItemText: {
      color: isDarkMode ? '#60A5FA' : '#2563EB',
      fontWeight: '600',
    },
    placeholder: {
      fontSize: 15,
      color: isDarkMode ? '#6B7280' : '#9CA3AF',
      textAlign: 'center',
      padding: 20,
      fontStyle: 'italic',
    },
    emptyContainer: {
      alignItems: 'center',
      padding: 20,
    },
    emptyIcon: {
      marginBottom: 8,
    },
  });


  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      {/* Router Selection List - Always Expanded */}
      <View style={styles.dropdown}>
        {data.length > 0 ? (
          data.map((item, index) => {
            const isSelected = selectedValue === item.id_router;
            const isLastItem = index === data.length - 1;
            
            return (
              <TouchableOpacity
                key={item.id_router.toString()}
                style={[
                  styles.item,
                  isSelected && styles.selectedItem,
                  isLastItem && { borderBottomWidth: 0 }
                ]}
                onPress={() => handlePress(item.id_router)}
                activeOpacity={0.7}
              >
                <Icon 
                  name={isSelected ? "radio-button-checked" : "radio-button-unchecked"}
                  size={20} 
                  color={isSelected 
                    ? (isDarkMode ? '#60A5FA' : '#2563EB') 
                    : (isDarkMode ? '#6B7280' : '#9CA3AF')
                  }
                />
                
                <View style={styles.itemContent}>
                  <Text style={[
                    styles.itemTitle,
                    isSelected && styles.selectedItemText
                  ]}>
                    {item.nombre_router}
                  </Text>
                  <Text style={styles.itemSubtitle}>
                    ID: {item.id_router} • Router del Proveedor
                  </Text>
                </View>
                
                {isSelected && (
                  <Icon 
                    name="check" 
                    size={18} 
                    color={isDarkMode ? '#60A5FA' : '#2563EB'}
                  />
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Icon 
              name="router" 
              size={48} 
              color={isDarkMode ? '#4B5563' : '#D1D5DB'} 
              style={styles.emptyIcon}
            />
            <Text style={styles.placeholder}>{placeholder}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Selector;
