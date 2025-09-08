import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SelectorRedes = ({ label, placeholder, data, selectedValue, onValueChange, isDarkMode }) => {
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
    networkList: {
      backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    networkItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#4B5563' : '#E5E7EB',
    },
    networkItemContent: {
      flex: 1,
      marginLeft: 12,
    },
    networkItemTitle: {
      fontSize: 15,
      fontWeight: '500',
      color: isDarkMode ? '#F9FAFB' : '#111827',
      marginBottom: 2,
    },
    networkItemSubtitle: {
      fontSize: 12,
      color: isDarkMode ? '#9CA3AF' : '#6B7280',
    },
    selectedNetwork: {
      backgroundColor: isDarkMode ? '#4B5563' : '#EFF6FF',
    },
    selectedNetworkText: {
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
      
      <View style={styles.networkList}>
        {data.length > 0 ? (
          data.map((item, index) => {
            const isSelected = selectedValue === item.value;
            const isLastItem = index === data.length - 1;
            
            return (
              <TouchableOpacity
                key={item.value.toString()}
                style={[
                  styles.networkItem,
                  isSelected && styles.selectedNetwork,
                  isLastItem && { borderBottomWidth: 0 }
                ]}
                onPress={() => handlePress(item.value)}
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
                
                <View style={styles.networkItemContent}>
                  <Text style={[
                    styles.networkItemTitle,
                    isSelected && styles.selectedNetworkText
                  ]}>
                    {item.label || item.value}
                  </Text>
                  <Text style={styles.networkItemSubtitle}>
                    Red LAN • {item.value}
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
              name="lan" 
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

export default SelectorRedes;
