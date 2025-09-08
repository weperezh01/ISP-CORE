import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from './AssignConnectionScreenStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../../componentes/themeSwitch';
import { format } from 'date-fns';

const AssignConnectionScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { ipDetails, id_usuario } = route.params; // Asegúrate de recibir id_usuario por parámetro
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [connectionId, setConnectionId] = useState('');
    const [ipInfo, setIpInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInputFocused, setIsInputFocused] = useState(false);

    useEffect(() => {
        const fetchIpDetails = async () => {
            try {
                const response = await fetch('https://wellnet-rd.com:444/api/routers/detalles-ip', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ direccion_ip: ipDetails.direccion_ip })
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch IP details');
                }
                const data = await response.json();
                setIpInfo(data);
            } catch (error) {
                Alert.alert('Error', error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchIpDetails();
        registrarNavegacion(); // Registrar la navegación cuando se cargue la pantalla
    }, [ipDetails.direccion_ip]);

    const registrarNavegacion = async () => {
        if (!id_usuario) return;

        const fechaActual = new Date();
        const fecha = format(fechaActual, 'yyyy-MM-dd');
        const hora = format(fechaActual, 'HH:mm:ss');
        const pantalla = 'AssignConnectionScreen';

        const datos = JSON.stringify({
            ipDetails,
            ipInfo,
        });

        const navigationLogData = {
            id_usuario,
            fecha,
            hora,
            pantalla,
            datos
        };

        try {
            const response = await fetch('https://wellnet-rd.com:444/api/log-navegacion-registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(navigationLogData),
            });

            if (!response.ok) {
                throw new Error('Error al registrar la navegación.');
            }

            console.log('Navegación registrada exitosamente');
        } catch (error) {
            console.error('Error al registrar la navegación:', error);
        }
    };

    const handleAssign = async () => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/routers/asignar-conexion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    direccion_ip: ipDetails.direccion_ip,
                    id_conexion: connectionId
                })
            });
            if (!response.ok) {
                throw new Error('Failed to assign connection');
            }
            Alert.alert('Success', 'Connection assigned successfully');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleRemoveAssign = async () => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/routers/quitar-conexion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ direccion_ip: ipDetails.direccion_ip })
            });
            if (!response.ok) {
                throw new Error('Failed to remove connection assignment');
            }
            Alert.alert('Success', 'Connection assignment removed successfully');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const confirmAssign = () => {
        Alert.alert(
            'Confirmación',
            '¿Estás seguro que quieres asignar esta conexión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Confirmar', onPress: handleAssign }
            ]
        );
    };

    const confirmRemoveAssign = () => {
        Alert.alert(
            'Confirmación',
            '¿Estás seguro que quieres quitar la asignación de esta conexión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Confirmar', onPress: handleRemoveAssign }
            ]
        );
    };

    const renderLoadingState = () => {
        if (!isLoading) return null;
        
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingContent}>
                    <ActivityIndicator size="large" color="#F59E0B" />
                    <Text style={styles.loadingText}>Cargando información de IP...</Text>
                    <Text style={styles.loadingSubtext}>Verificando asignaciones actuales</Text>
                </View>
            </View>
        );
    };

    if (isLoading) {
        return renderLoadingState();
    }

    const getAssignmentStatus = () => {
        if (ipInfo?.id_conexion) {
            return {
                badge: styles.statusAssigned,
                text: styles.statusTextAssigned,
                label: '🔗 Asignada'
            };
        } else {
            return {
                badge: styles.statusUnassigned,
                text: styles.statusTextUnassigned,
                label: '✅ Disponible'
            };
        }
    };

    const renderIpInfoCard = () => {
        if (!ipInfo) return null;
        
        const statusInfo = getAssignmentStatus();
        
        return (
            <View style={styles.ipInfoCard}>
                <View style={styles.ipInfoHeader}>
                    <Text style={styles.ipIcon}>🌐</Text>
                    <View style={styles.ipMainInfo}>
                        <Text style={styles.ipAddress}>
                            {ipInfo.direccion_ip || 'Dirección no disponible'}
                        </Text>
                        <Text style={styles.ipType}>Dirección IP de Red</Text>
                    </View>
                    <View style={[styles.statusIndicator, statusInfo.badge]}>
                        <Text style={statusInfo.text}>{statusInfo.label}</Text>
                    </View>
                </View>
                
                <View style={styles.detailsGrid}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>ID Conexión Actual</Text>
                        <Text style={[
                            styles.detailValue, 
                            ipInfo.id_conexion ? styles.detailValueHighlight : null
                        ]}>
                            {ipInfo.id_conexion || 'No Asignado'}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Red</Text>
                        <Text style={styles.detailValue}>
                            {ipInfo.network || 'No especificada'}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>ID Router</Text>
                        <Text style={styles.detailValue}>
                            {ipInfo.id_router || 'No asignado'}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderConnectionCard = () => {
        if (!ipInfo?.conexion && !ipInfo?.cliente) return null;
        
        return (
            <View style={styles.connectionCard}>
                <View style={styles.connectionHeader}>
                    <Text style={styles.connectionIcon}>🔗</Text>
                    <View style={styles.connectionInfo}>
                        <Text style={styles.connectionTitle}>
                            Conexión Asignada
                        </Text>
                        <Text style={styles.connectionSubtitle}>
                            ID: {ipInfo.id_conexion}
                        </Text>
                    </View>
                </View>
                
                {ipInfo.conexion && (
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Dirección</Text>
                            <Text style={styles.detailValue}>
                                {ipInfo.conexion.direccion || 'No especificada'}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>ID Cliente</Text>
                            <Text style={styles.detailValue}>
                                {ipInfo.conexion.id_cliente || 'No asignado'}
                            </Text>
                        </View>
                    </View>
                )}
                
                {ipInfo.cliente && (
                    <View style={styles.clientInfoCard}>
                        <Text style={styles.clientName}>
                            👤 {ipInfo.cliente.nombres} {ipInfo.cliente.apellidos}
                        </Text>
                        {ipInfo.conexion?.direccion && (
                            <Text style={styles.clientAddress}>
                                📍 {ipInfo.conexion.direccion}
                            </Text>
                        )}
                    </View>
                )}
            </View>
        );
    };

    const renderInputSection = () => {
        return (
            <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>ID de Conexión</Text>
                <TextInput
                    style={[
                        styles.textInput,
                        isInputFocused && styles.textInputFocused
                    ]}
                    placeholder="Ingresa el ID de la conexión..."
                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                    value={connectionId}
                    onChangeText={setConnectionId}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    keyboardType="numeric"
                    autoCapitalize="none"
                />
                <Text style={styles.inputHint}>
                    Ingresa el ID de la conexión que deseas asignar a esta IP
                </Text>
            </View>
        );
    };

    const renderWarningCard = () => {
        if (!ipInfo?.id_conexion) return null;
        
        return (
            <View style={styles.warningCard}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningText}>
                    Esta IP ya tiene una conexión asignada. Al quitar la asignación actual, 
                    la conexión quedará sin dirección IP.
                </Text>
            </View>
        );
    };

    const renderActionButtons = () => {
        const hasAssignment = ipInfo?.id_conexion;
        const canAssign = connectionId.trim().length > 0;
        
        return (
            <View style={styles.actionsContainer}>
                {/* Assign Button - Show only if no current assignment */}
                {!hasAssignment && (
                    <TouchableOpacity 
                        style={[
                            styles.actionButton, 
                            canAssign ? styles.assignButton : styles.assignButtonDisabled
                        ]}
                        onPress={confirmAssign}
                        disabled={!canAssign}
                    >
                        <Text style={styles.actionButtonIcon}>🔗</Text>
                        <Text style={styles.actionButtonText}>Asignar Conexión</Text>
                    </TouchableOpacity>
                )}
                
                {/* Remove Assignment Button - Show only if there's an assignment */}
                {hasAssignment && (
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.removeButton]}
                        onPress={confirmRemoveAssign}
                    >
                        <Text style={styles.actionButtonIcon}>🗑️</Text>
                        <Text style={styles.actionButtonText}>Quitar Asignación</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.backButtonText}>← Volver</Text>
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>Gestión de Asignación</Text>
                            <Text style={styles.headerSubtitle}>
                                {ipInfo?.direccion_ip || 'Dirección IP'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <ThemeSwitch />
                    </View>
                </View>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                <ScrollView 
                    style={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* IP Information Card */}
                    {renderIpInfoCard()}
                    
                    {/* Warning Card (if IP is assigned) */}
                    {renderWarningCard()}
                    
                    {/* Connection Information Card (if assigned) */}
                    {renderConnectionCard()}
                    
                    {/* Input Section (if not assigned) */}
                    {!ipInfo?.id_conexion && (
                        <>
                            <Text style={styles.sectionHeader}>Nueva Asignación</Text>
                            {renderInputSection()}
                        </>
                    )}
                    
                    <View style={styles.spacer} />
                </ScrollView>

                {/* Action Buttons */}
                {renderActionButtons()}
            </View>
        </View>
    );
};

export default AssignConnectionScreen;
