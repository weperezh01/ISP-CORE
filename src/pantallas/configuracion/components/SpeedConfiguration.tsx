import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from '../../../estilos/styles';
import { SPEED_UNITS, VALIDATION_RULES, ERROR_MESSAGES } from '../constants/configurationConstants';

interface SpeedConfigurationProps {
  uploadSpeed: string;
  uploadUnit: string;
  downloadSpeed: string;
  downloadUnit: string;
  onUploadSpeedChange: (speed: string) => void;
  onUploadUnitChange: (unit: string) => void;
  onDownloadSpeedChange: (speed: string) => void;
  onDownloadUnitChange: (unit: string) => void;
  style?: any;
}

const SpeedConfiguration: React.FC<SpeedConfigurationProps> = ({
  uploadSpeed,
  uploadUnit,
  downloadSpeed,
  downloadUnit,
  onUploadSpeedChange,
  onUploadUnitChange,
  onDownloadSpeedChange,
  onDownloadUnitChange,
  style,
}) => {
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);
  const [errors, setErrors] = useState<{upload?: string; download?: string}>({});

  const validateSpeed = (speed: string, type: 'upload' | 'download') => {
    const numSpeed = parseFloat(speed);
    const newErrors = { ...errors };

    if (!speed || isNaN(numSpeed)) {
      newErrors[type] = 'Requerido';
    } else if (numSpeed < VALIDATION_RULES.MIN_SPEED) {
      newErrors[type] = `Mínimo ${VALIDATION_RULES.MIN_SPEED}`;
    } else if (numSpeed > VALIDATION_RULES.MAX_SPEED) {
      newErrors[type] = `Máximo ${VALIDATION_RULES.MAX_SPEED}`;
    } else {
      delete newErrors[type];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUploadSpeedChange = (speed: string) => {
    onUploadSpeedChange(speed);
    validateSpeed(speed, 'upload');
  };

  const handleDownloadSpeedChange = (speed: string) => {
    onDownloadSpeedChange(speed);
    validateSpeed(speed, 'download');
  };

  const getInputStyle = (hasError: boolean) => ({
    ...speedInputStyle,
    borderColor: hasError 
      ? '#EF4444' 
      : isDarkMode ? '#6B7280' : '#D1D5DB',
    backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
    color: isDarkMode ? '#F3F4F6' : '#1F2937',
  });

  const getPickerStyle = () => ({
    ...speedPickerStyle,
    backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
    borderColor: isDarkMode ? '#6B7280' : '#D1D5DB',
  });

  const speedInputStyle = {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    marginRight: 8,
  };

  const speedPickerStyle = {
    height: 48,
    width: 120,
    borderWidth: 1,
    borderRadius: 8,
  };

  return (
    <View style={[{ gap: 16 }, style]}>
      {/* Upload Speed */}
      <View>
        <Text style={[styles.text, { marginBottom: 8, fontWeight: '600' }]}>
          Velocidad de Subida
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={getInputStyle(!!errors.upload)}
            placeholder="Ej: 100"
            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
            keyboardType="numeric"
            value={uploadSpeed}
            onChangeText={handleUploadSpeedChange}
          />
          <Picker
            selectedValue={uploadUnit}
            style={getPickerStyle()}
            onValueChange={onUploadUnitChange}
          >
            {SPEED_UNITS.map((unit) => (
              <Picker.Item 
                key={unit.value} 
                label={unit.label} 
                value={unit.value}
                color={isDarkMode ? '#F3F4F6' : '#1F2937'}
              />
            ))}
          </Picker>
        </View>
        {errors.upload && (
          <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
            {errors.upload}
          </Text>
        )}
      </View>

      {/* Download Speed */}
      <View>
        <Text style={[styles.text, { marginBottom: 8, fontWeight: '600' }]}>
          Velocidad de Bajada
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={getInputStyle(!!errors.download)}
            placeholder="Ej: 100"
            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
            keyboardType="numeric"
            value={downloadSpeed}
            onChangeText={handleDownloadSpeedChange}
          />
          <Picker
            selectedValue={downloadUnit}
            style={getPickerStyle()}
            onValueChange={onDownloadUnitChange}
          >
            {SPEED_UNITS.map((unit) => (
              <Picker.Item 
                key={unit.value} 
                label={unit.label} 
                value={unit.value}
                color={isDarkMode ? '#F3F4F6' : '#1F2937'}
              />
            ))}
          </Picker>
        </View>
        {errors.download && (
          <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
            {errors.download}
          </Text>
        )}
      </View>

      {/* Speed Summary */}
      {uploadSpeed && downloadSpeed && !errors.upload && !errors.download && (
        <View style={{
          backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6',
          padding: 12,
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: '#10B981',
        }}>
          <Text style={[styles.text, { fontSize: 14, fontWeight: '500' }]}>
            Configuración: ⬆ {uploadSpeed} {uploadUnit} / ⬇ {downloadSpeed} {downloadUnit}
          </Text>
        </View>
      )}
    </View>
  );
};

export default SpeedConfiguration;