import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, PermissionsAndroid, Platform, Clipboard } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import GetLocation from 'react-native-get-location';

const CoordinatesFormModern = ({ form, handleChange, styles, isDarkMode, isViewOnly = false }) => {
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Permiso de Ubicación',
                        message: 'Esta aplicación necesita acceso a tu ubicación para obtener las coordenadas de instalación.',
                        buttonNeutral: 'Preguntar después',
                        buttonNegative: 'Cancelar',
                        buttonPositive: 'Permitir',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true; // iOS maneja los permisos automáticamente
    };

    const tryGetLocationWithFallback = async () => {
        console.log('🔄 Intentando obtener ubicación con GetLocation...');
        
        try {
            const location = await GetLocation.getCurrentPosition({
                enableHighAccuracy: false,
                timeout: 60000, // 1 minuto
                maximumAge: 300000, // 5 minutos
            });
            
            console.log('📍 Ubicación obtenida con GetLocation:', location);
            
            const lat = location.latitude.toFixed(6);
            const lng = location.longitude.toFixed(6);
            
            handleChange('latitud', lat);
            handleChange('longitud', lng);
            
            Alert.alert(
                'Ubicación Obtenida',
                `Coordenadas actualizadas:\nLatitud: ${lat}\nLongitud: ${lng}`,
                [{ text: 'OK' }]
            );
            
            setIsLoadingLocation(false);
            return true;
        } catch (error) {
            console.error('❌ Error con GetLocation:', error);
            return false;
        }
    };

    const getCurrentLocation = async () => {
        setIsLoadingLocation(true);
        
        try {
            const hasPermission = await requestLocationPermission();
            
            if (!hasPermission) {
                Alert.alert(
                    'Permiso Denegado',
                    'No se puede obtener la ubicación sin permisos de ubicación.',
                    [{ text: 'OK' }]
                );
                setIsLoadingLocation(false);
                return;
            }

            // Primero intentar con el método alternativo que suele ser más confiable
            const success = await tryGetLocationWithFallback();
            if (success) return;

            // Si falla, intentar con Geolocation como backup
            console.log('🔄 Intentando con Geolocation como backup...');
            
            Geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log('📍 Ubicación obtenida con Geolocation:', { latitude, longitude });
                    
                    const lat = latitude.toFixed(6);
                    const lng = longitude.toFixed(6);
                    
                    handleChange('latitud', lat);
                    handleChange('longitud', lng);
                    
                    Alert.alert(
                        'Ubicación Obtenida',
                        `Coordenadas actualizadas:\nLatitud: ${lat}\nLongitud: ${lng}`,
                        [{ text: 'OK' }]
                    );
                    
                    setIsLoadingLocation(false);
                },
                (error) => {
                    console.error('❌ Error con Geolocation:', error);
                    setIsLoadingLocation(false);
                    
                    // Mostrar opciones al usuario
                    Alert.alert(
                        'GPS No Disponible',
                        'No se pudo obtener la ubicación automáticamente. Esto puede deberse a:\n\n• GPS desactivado\n• Ubicación en interior\n• Interferencia de señal\n\n¿Qué deseas hacer?',
                        [
                            { 
                                text: 'Reintentar', 
                                onPress: () => getCurrentLocation() 
                            },
                            { 
                                text: 'Ingresar Manualmente', 
                                onPress: () => showManualInputHelper() 
                            },
                            { text: 'Cancelar' }
                        ]
                    );
                },
                {
                    enableHighAccuracy: false,
                    timeout: 45000, // 45 segundos
                    maximumAge: 300000, // 5 minutos
                }
            );
        } catch (error) {
            console.error('❌ Error general:', error);
            setIsLoadingLocation(false);
            Alert.alert(
                'Error',
                'Ocurrió un error inesperado al obtener la ubicación.',
                [{ text: 'OK' }]
            );
        }
    };

    const tryParseClipboard = async () => {
        try {
            const clipboardContent = await Clipboard.getString();
            console.log('📋 Contenido del portapapeles:', clipboardContent);
            
            // Buscar patrones de coordenadas comunes
            const patterns = [
                /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/, // "18.4861, -69.9312"
                /(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/, // "18.4861 -69.9312"
                /lat:\s*(-?\d+\.?\d*),?\s*lng?:\s*(-?\d+\.?\d*)/, // "lat: 18.4861, lng: -69.9312"
            ];
            
            for (const pattern of patterns) {
                const match = clipboardContent.match(pattern);
                if (match) {
                    const lat = parseFloat(match[1]);
                    const lng = parseFloat(match[2]);
                    
                    if (validateCoordinate(lat.toString(), 'latitud') && validateCoordinate(lng.toString(), 'longitud')) {
                        handleChange('latitud', lat.toFixed(6));
                        handleChange('longitud', lng.toFixed(6));
                        
                        Alert.alert(
                            'Coordenadas Detectadas',
                            `Se encontraron coordenadas en el portapapeles:\nLatitud: ${lat.toFixed(6)}\nLongitud: ${lng.toFixed(6)}`,
                            [{ text: 'OK' }]
                        );
                        return true;
                    }
                }
            }
            
            Alert.alert(
                'No se encontraron coordenadas',
                'No se detectaron coordenadas válidas en el portapapeles.',
                [{ text: 'OK' }]
            );
            return false;
        } catch (error) {
            console.error('Error al leer portapapeles:', error);
            return false;
        }
    };

    const showManualInputHelper = () => {
        Alert.alert(
            'Opciones para Coordenadas',
            'Elige cómo obtener las coordenadas:',
            [
                {
                    text: 'Pegar del Portapapeles',
                    onPress: () => tryParseClipboard()
                },
                {
                    text: 'Ver Instrucciones',
                    onPress: () => Alert.alert(
                        'Cómo Obtener Coordenadas',
                        '📱 Google Maps:\n1. Abre Google Maps\n2. Mantén presionado el lugar\n3. Copia las coordenadas\n4. Regresa aquí y pega\n\n🗺️ Formato esperado:\n18.486058, -69.931212\n\n💡 También funciona con formatos como:\n• lat: 18.486, lng: -69.931\n• 18.486 -69.931',
                        [{ text: 'Entendido' }]
                    )
                },
                { text: 'Cancelar' }
            ]
        );
    };

    const validateCoordinate = (value, type) => {
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        
        if (type === 'latitud') {
            return num >= -90 && num <= 90;
        } else if (type === 'longitud') {
            return num >= -180 && num <= 180;
        }
        return false;
    };

    const getCoordinateStatus = (value, type) => {
        if (!value) return null;
        
        const isValid = validateCoordinate(value, type);
        return {
            isValid,
            message: isValid ? '✅ Válida' : '❌ Inválida'
        };
    };

    const latStatus = getCoordinateStatus(form.latitud, 'latitud');
    const lngStatus = getCoordinateStatus(form.longitud, 'longitud');

    return (
        <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📍 Coordenadas GPS</Text>
                <Text style={styles.sectionIcon}>🌍</Text>
            </View>
            
            <View style={styles.sectionContent}>
                {/* GPS Buttons - Solo mostrar si no estamos en modo vista */}
                {!isViewOnly && (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity 
                            style={[styles.gpsButton, { flex: 1 }]} 
                            onPress={getCurrentLocation}
                            disabled={isLoadingLocation}
                        >
                            {isLoadingLocation ? (
                                <>
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                    <Text style={styles.gpsButtonText}>Obteniendo...</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.sectionIcon}>📡</Text>
                                    <Text style={styles.gpsButtonText}>GPS Automático</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.gpsButton, { backgroundColor: '#6B7280', flex: 0.6 }]} 
                            onPress={showManualInputHelper}
                        >
                            <Text style={styles.sectionIcon}>❓</Text>
                            <Text style={styles.gpsButtonText}>Ayuda</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Coordinates Input */}
                <View style={styles.coordinatesContainer}>
                    <View style={styles.coordinateGroup}>
                        <Text style={styles.label}>Latitud</Text>
                        <TextInput
                            style={[
                                styles.input,
                                isViewOnly && styles.inputDisabled,
                                latStatus && !latStatus.isValid && { borderColor: '#EF4444' }
                            ]}
                            value={form.latitud}
                            onChangeText={isViewOnly ? undefined : (value) => handleChange('latitud', value)}
                            placeholder="18.4861"
                            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            keyboardType="decimal-pad"
                            editable={!isViewOnly}
                        />
                        {latStatus && (
                            <Text style={[
                                styles.coordinateValue,
                                { color: latStatus.isValid ? '#10B981' : '#EF4444' }
                            ]}>
                                {latStatus.message}
                            </Text>
                        )}
                    </View>

                    <View style={styles.coordinateGroup}>
                        <Text style={styles.label}>Longitud</Text>
                        <TextInput
                            style={[
                                styles.input,
                                isViewOnly && styles.inputDisabled,
                                lngStatus && !lngStatus.isValid && { borderColor: '#EF4444' }
                            ]}
                            value={form.longitud}
                            onChangeText={isViewOnly ? undefined : (value) => handleChange('longitud', value)}
                            placeholder="-69.9312"
                            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            keyboardType="decimal-pad"
                            editable={!isViewOnly}
                        />
                        {lngStatus && (
                            <Text style={[
                                styles.coordinateValue,
                                { color: lngStatus.isValid ? '#10B981' : '#EF4444' }
                            ]}>
                                {lngStatus.message}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Location Info */}
                {(form.latitud && form.longitud && latStatus?.isValid && lngStatus?.isValid) && (
                    <View style={styles.infoBadge}>
                        <Text style={styles.infoBadgeText}>
                            📍 Ubicación registrada: {form.latitud}, {form.longitud}
                        </Text>
                        <Text style={styles.infoBadgeText}>
                            🗺️ Ver en Google Maps: https://maps.google.com/?q={form.latitud},{form.longitud}
                        </Text>
                    </View>
                )}

                {/* Instructions */}
                <View style={styles.infoBadge}>
                    <Text style={styles.infoBadgeText}>
                        💡 Presiona "Obtener Coordenadas GPS" para usar tu ubicación actual, o ingresa las coordenadas manualmente.
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default CoordinatesFormModern;