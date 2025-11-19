import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SelectorIp = ({ label, placeholder, data, selectedValue, onValueChange, isDarkMode }) => {
  const handlePress = (value) => {
    onValueChange(value);
  };

  const getIpStatus = (ip) => {
    // Lógica básica para determinar si la IP podría estar ocupada
    // Esto se puede expandir según la lógica de negocio
    return ip.estado || 'disponible';
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
    ipList: {
      backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      maxHeight: 400,
    },
    ipScrollView: {
      maxHeight: 400,
    },
    ipItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#4B5563' : '#E5E7EB',
    },
    ipItemContent: {
      flex: 1,
      marginLeft: 12,
    },
    ipItemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? '#F9FAFB' : '#111827',
      marginBottom: 2,
    },
    ipItemSubtitle: {
      fontSize: 12,
      color: isDarkMode ? '#9CA3AF' : '#6B7280',
    },
    selectedIp: {
      backgroundColor: isDarkMode ? '#4B5563' : '#EFF6FF',
    },
    selectedIpText: {
      color: isDarkMode ? '#60A5FA' : '#2563EB',
      fontWeight: '600',
    },
    availableIp: {
      backgroundColor: 'transparent',
    },
    occupiedIp: {
      backgroundColor: isDarkMode ? '#7F1D1D' : '#FEF2F2',
      opacity: 0.7,
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
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 4,
    },
    statusAvailable: {
      backgroundColor: '#10B981',
    },
    statusOccupied: {
      backgroundColor: '#EF4444',
    },
    scrollHint: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      gap: 6,
    },
    scrollHintText: {
      fontSize: 12,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.ipList}>
        {data.length > 0 ? (
          <>
            {data.length > 6 && (
              <View style={[styles.scrollHint, { 
                backgroundColor: isDarkMode ? '#4B5563' : '#F3F4F6',
                borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB'
              }]}>
                <Icon 
                  name="unfold-more" 
                  size={16} 
                  color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                />
                <Text style={[styles.scrollHintText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                  {data.length} IPs disponibles • Desliza para ver más
                </Text>
              </View>
            )}
            <ScrollView 
              style={styles.ipScrollView}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
            {data.map((item, index) => {
              const isSelected = selectedValue === item.direccion_ip;
              const isLastItem = index === data.length - 1;
              const ipStatus = getIpStatus(item);
              const isAvailable = ipStatus === 'disponible';
              
              return (
                <TouchableOpacity
                  key={`${item.direccion_ip}-${index}`}
                  style={[
                    styles.ipItem,
                    isSelected && styles.selectedIp,
                    !isAvailable && styles.occupiedIp,
                    isLastItem && { borderBottomWidth: 0 }
                  ]}
                  onPress={() => handlePress(item.direccion_ip)}
                  activeOpacity={0.7}
                  disabled={!isAvailable}
                >
                  <Icon 
                    name={isSelected ? "radio-button-checked" : "radio-button-unchecked"}
                    size={20} 
                    color={isSelected 
                      ? (isDarkMode ? '#60A5FA' : '#2563EB') 
                      : (isDarkMode ? '#6B7280' : '#9CA3AF')
                    }
                  />
                  
                  <View style={styles.ipItemContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={[
                        styles.statusIndicator,
                        isAvailable ? styles.statusAvailable : styles.statusOccupied
                      ]} />
                      <Text style={[
                        styles.ipItemTitle,
                        isSelected && styles.selectedIpText,
                        !isAvailable && { opacity: 0.6 }
                      ]}>
                        {item.direccion_ip}
                      </Text>
                    </View>
                    <Text style={styles.ipItemSubtitle}>
                      {isAvailable ? 'Dirección disponible' : 'IP ocupada o reservada'}
                    </Text>
                  </View>
                  
                  {isSelected && (
                    <Icon 
                      name="check" 
                      size={18} 
                      color={isDarkMode ? '#60A5FA' : '#2563EB'}
                    />
                  )}
                  
                  {!isAvailable && (
                    <Icon 
                      name="block" 
                      size={18} 
                      color={isDarkMode ? '#EF4444' : '#DC2626'}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
            </ScrollView>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon 
              name="my-location" 
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

export default SelectorIp;
