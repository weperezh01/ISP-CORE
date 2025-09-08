import React from 'react';
import { View, Text, ActivityIndicator, Modal } from 'react-native';
import { useTheme } from '../../../../ThemeContext';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Cargando...',
}) => {
  const { isDarkMode } = useTheme();

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          borderRadius: 12,
          padding: 24,
          alignItems: 'center',
          minWidth: 120,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 8,
        }}>
          <ActivityIndicator 
            size="large" 
            color={isDarkMode ? '#3B82F6' : '#2563EB'} 
          />
          <Text style={{
            marginTop: 16,
            fontSize: 16,
            fontWeight: '500',
            color: isDarkMode ? '#F3F4F6' : '#1F2937',
            textAlign: 'center',
          }}>
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default LoadingOverlay;