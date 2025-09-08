// src/componentes/DataTable.js
import React from 'react';
import { View, Text } from 'react-native';

const DataTable = ({ data, headers, isDarkMode, formatDate }) => {
  return (
    <View style={{ borderColor: isDarkMode ? '#333' : '#C1C0B9', borderWidth: 1 }}>
      <View style={{ flexDirection: 'row', backgroundColor: isDarkMode ? '#333' : '#f1f8ff' }}>
        {headers.map((header, index) => (
          <Text key={index} style={{ flex: 1, padding: 8, color: isDarkMode ? '#fff' : '#000', fontWeight: 'bold' }}>{header}</Text>
        ))}
      </View>
      {data.map((item, index) => (
        <View 
          key={index} 
          style={{
            flexDirection: 'row', 
            backgroundColor: isDarkMode ? '#1e1e1e' : '#fff', 
            borderBottomColor: isDarkMode ? '#444' : '#ddd', 
            borderBottomWidth: 1
          }}
        >
          <Text style={{ flex: 1, padding: 8, color: isDarkMode ? '#fff' : '#000' }}>{item.value}</Text>
          <Text style={{ flex: 1, padding: 8, color: isDarkMode ? '#fff' : '#000' }}>{formatDate(item.date)}</Text>
        </View>
      ))}
    </View>
  );
};

export default DataTable;
