import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from '../../../estilos/styles';
import ThemeSwitch from '../../../componentes/themeSwitch';
import { useConfiguration } from '../context/ConfigurationContext';
import { SCREEN_TITLES } from '../constants/configurationConstants';

interface ConfigurationHeaderProps {
  userName: string;
  showProgress?: boolean;
  onUserPress?: () => void;
}

const ConfigurationHeader: React.FC<ConfigurationHeaderProps> = ({
  userName,
  showProgress = true,
  onUserPress = () => {},
}) => {
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);
  const { state, getProgressPercentage } = useConfiguration();

  const getStepTitle = () => {
    switch (state.currentStep) {
      case 'router':
        return SCREEN_TITLES.ROUTER_SELECTION;
      case 'network':
        return SCREEN_TITLES.NETWORK_SELECTION;
      case 'ip':
        return SCREEN_TITLES.IP_CONFIGURATION;
      case 'confirmation':
        return SCREEN_TITLES.CONFIRMATION;
      default:
        return SCREEN_TITLES.CONFIGURATION;
    }
  };

  return (
    <View style={styles.containerSuperior}>
      <TouchableOpacity onPress={onUserPress}>
        <Text style={styles.buttonText}>{userName || 'Usuario'}</Text>
      </TouchableOpacity>
      
      <View style={{ alignItems: 'center', flex: 1 }}>
        <Text style={styles.title}>{getStepTitle()}</Text>
        {showProgress && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 4,
          }}>
            <View style={{
              width: 100,
              height: 4,
              backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
              borderRadius: 2,
              overflow: 'hidden',
            }}>
              <View style={{
                width: `${getProgressPercentage()}%`,
                height: '100%',
                backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB',
                borderRadius: 2,
              }} />
            </View>
            <Text style={{
              fontSize: 12,
              color: isDarkMode ? '#9CA3AF' : '#6B7280',
              marginLeft: 8,
            }}>
              {getProgressPercentage()}%
            </Text>
          </View>
        )}
      </View>
      
      <ThemeSwitch />
    </View>
  );
};

export default ConfigurationHeader;