import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const InstallationDetailsModern = ({ 
    connectionDetails, 
    styles, 
    isDarkMode, 
    navigation, 
    connectionId,
    expandedCards,
    toggleCardExpansion 
}) => {
    // Debug: Verificar estructura de connectionDetails
    console.log('🔍 InstallationDetailsModern - connectionDetails:', connectionDetails);
    console.log('🔍 InstallationDetailsModern - connectionDetails type:', typeof connectionDetails);
    console.log('🔍 InstallationDetailsModern - is array?', Array.isArray(connectionDetails));
    
    // Corregir acceso a instalaciones - connectionDetails es un objeto, no un array
    const installations = connectionDetails?.detallesInstalacion || [];
    
    console.log('🏗️ Instalaciones encontradas:', installations);
    console.log('🔍 Número de instalaciones:', installations.length);

    const handleViewMaterials = (installation) => {
        // Navegar a InstalacionForm en modo de vista para ver materiales
        const navParams = {
            id_conexion: connectionId,
            id_isp: connectionDetails?.id_isp,
            id_instalacion: installation.id_instalacion,
            isEditMode: false, // Cambiado: en modo vista no debe ser editable
            viewMode: 'materials' // Para mostrar solo la sección de materiales
        };
        
        console.log('🔗 Navegando a InstalacionForm con parámetros:', navParams);
        console.log('📋 Datos de instalación completos:', installation);
        console.log('🔍 ID de instalación específico:', installation.id_instalacion);
        
        navigation.navigate('InstalacionForm', navParams);
    };

    const handleNewInstallation = () => {
        navigation.navigate('InstalacionForm', {
            id_conexion: connectionId,
            id_isp: connectionDetails?.id_isp,
            id_instalacion: null,
            isEditMode: false
        });
    };

    const handleEditInstallation = (installation) => {
        const navParams = {
            id_conexion: connectionId,
            id_isp: connectionDetails?.id_isp,
            id_instalacion: installation.id_instalacion,
            isEditMode: true
        };
        
        console.log('✏️ Navegando a EDITAR instalación con parámetros:', navParams);
        console.log('📋 Datos de instalación completos:', installation);
        console.log('🔍 ID de instalación específico:', installation.id_instalacion);
        
        navigation.navigate('InstalacionForm', navParams);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true // Esto agrega AM/PM
        });
    };

    const getStatusColor = (installation) => {
        // Determinar color basado en el estado de la instalación
        if (installation.estado === 'completada') {
            return '#10B981'; // Verde
        } else if (installation.estado === 'en_progreso') {
            return '#F59E0B'; // Amarillo/Naranja
        } else {
            return '#6B7280'; // Gris
        }
    };

    const getStatusIcon = (installation) => {
        if (installation.estado === 'completada') {
            return 'check-circle';
        } else if (installation.estado === 'en_progreso') {
            return 'schedule';
        } else {
            return 'radio-button-unchecked';
        }
    };

    // Lógica para detectar instalaciones abiertas/sin finalizar
    const getInstallationStatus = () => {
        if (installations.length === 0) return { hasOpenInstallation: false };

        // Ordenar instalaciones por fecha (más reciente primero)
        const sortedInstallations = [...installations].sort((a, b) => 
            new Date(b.fecha_guardado) - new Date(a.fecha_guardado)
        );

        const mostRecent = sortedInstallations[0];
        
        // Verificar si la instalación más reciente está "abierta" (estado 2 = guardada para continuar)
        // La lógica es: si id_estado_conexion es 2, está abierta; si es 3, está finalizada
        const isOpenInstallation = mostRecent.id_estado_conexion === 2;

        return {
            hasOpenInstallation: isOpenInstallation,
            openInstallation: isOpenInstallation ? mostRecent : null,
            mostRecentInstallation: mostRecent,
            totalInstallations: installations.length
        };
    };

    const installationStatus = getInstallationStatus();

    // Debug: Ver el estado de las instalaciones
    console.log('🏗️ Estado de instalaciones:', installationStatus);
    console.log('📊 Instalaciones disponibles:', installations.map(inst => ({
        id: inst.id_instalacion,
        fecha: inst.fecha_guardado,
        estado: inst.estado,
        id_estado_conexion: inst.id_estado_conexion
    })));

    // Colors palette for expand buttons
    const colors = {
        primary: {
            500: '#3B82F6',
            600: '#2563EB',
        },
        gray: {
            300: '#CBD5E1',
            600: '#475569',
        }
    };

    return (
        <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <View style={styles.headerLeft}>
                    <Icon name="build" size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                    <Text style={styles.sectionTitle}>Labores</Text>
                </View>
                <View style={styles.headerBadge}>
                    <Text style={styles.badgeText}>{installations.length}</Text>
                </View>
                <TouchableOpacity 
                    style={[styles.expandButton, expandedCards?.has('labores') && styles.expandButtonActive]} 
                    onPress={() => toggleCardExpansion('labores')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                >
                    <Icon 
                        name={expandedCards?.has('labores') ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                        size={20} 
                        color={expandedCards?.has('labores') ? "#FFFFFF" : (isDarkMode ? colors.gray[300] : colors.gray[600])} 
                    />
                </TouchableOpacity>
            </View>

            {/* Compact info - Always visible */}
            <View style={styles.compactInfo}>
                <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                    <Icon name="assignment" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                    <View style={styles.connectionDetailContent}>
                        <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Total Labores</Text>
                        <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{installations.length}</Text>
                    </View>
                </View>
                {installationStatus.hasOpenInstallation && (
                    <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                        <Icon name="warning" size={20} color="#F59E0B" />
                        <View style={styles.connectionDetailContent}>
                            <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Estado</Text>
                            <Text style={[styles.connectionDetailValue, { color: '#F59E0B' }]}>Labor Pendiente</Text>
                        </View>
                    </View>
                )}
                {installationStatus.mostRecentInstallation && (
                    <View style={[styles.connectionDetailRow, { borderBottomColor: 'transparent' }]}>
                        <Icon name="schedule" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                        <View style={styles.connectionDetailContent}>
                            <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Última Labor</Text>
                            <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{
                                formatDate(installationStatus.mostRecentInstallation.fecha_guardado)
                            }</Text>
                        </View>
                    </View>
                )}
            </View>
            
            {/* Expanded details - Only visible when expanded */}
            {expandedCards?.has('labores') && (
                <>
                    {/* Indicador de Alerta para Instalaciones Abiertas */}
                    {installationStatus.hasOpenInstallation && (
                        <View style={styles.alertContainer}>
                            <Icon name="warning" size={20} color="#F59E0B" />
                            <View style={styles.alertTextContainer}>
                                <Text style={styles.alertTitle}>Labor Pendiente</Text>
                                <Text style={styles.alertMessage}>
                                    Hay una labor sin finalizar del {formatDate(installationStatus.openInstallation.fecha_guardado)}. 
                                    Para cerrar esta alerta, complete la labor usando "Finalizar Labor".
                                </Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.alertButton}
                                onPress={() => handleEditInstallation(installationStatus.openInstallation)}
                            >
                                <Text style={styles.alertButtonText}>Completar</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.sectionContent}>
                {installations.length > 0 ? (
                    installations.map((installation, index) => (
                        <View key={installation.id_instalacion} style={styles.installationCard}>
                            {/* Header de la instalación */}
                            <View style={styles.installationHeader}>
                                <View style={styles.installationInfo}>
                                    <View style={styles.installationIdContainer}>
                                        <Icon 
                                            name={getStatusIcon(installation)} 
                                            size={20} 
                                            color={getStatusColor(installation)} 
                                        />
                                        <Text style={styles.installationId}>
                                            Labor #{installation.id_instalacion}
                                        </Text>
                                    </View>
                                    <Text style={styles.installationDate}>
                                        {formatDate(installation.fecha_guardado)}
                                    </Text>
                                </View>
                            </View>

                            {/* Detalles de la instalación */}
                            <View style={styles.installationDetails}>
                                <View style={styles.detailRow}>
                                    <Icon name="settings-ethernet" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <Text style={styles.detailLabel}>Tipo:</Text>
                                    <Text style={styles.detailValue}>{installation.tipo_conexion || 'No especificado'}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Icon name="person" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <Text style={styles.detailLabel}>Técnico:</Text>
                                    <Text style={styles.detailValue}>
                                        {installation.detalleUsuario?.nombre || 'No asignado'}
                                    </Text>
                                </View>

                                {installation.notas_config && (
                                    <View style={styles.detailRow}>
                                        <Icon name="note" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                        <Text style={styles.detailLabel}>Notas:</Text>
                                        <Text style={styles.detailValue} numberOfLines={2}>
                                            {installation.notas_config}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Botones de acción */}
                            <View style={styles.installationActions}>
                                <TouchableOpacity 
                                    style={styles.actionButtonPrimary}
                                    onPress={() => handleViewMaterials(installation)}
                                >
                                    <Icon name="inventory" size={16} color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Ver Materiales</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.actionButtonSecondary}
                                    onPress={() => handleEditInstallation(installation)}
                                >
                                    <Icon name="edit" size={16} color={isDarkMode ? '#FFFFFF' : '#374151'} />
                                    <Text style={[styles.actionButtonText, { 
                                        color: isDarkMode ? '#FFFFFF' : '#374151' 
                                    }]}>Editar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Icon name="construction" size={48} color={isDarkMode ? '#6B7280' : '#9CA3AF'} />
                        <Text style={styles.emptyStateTitle}>Sin Labores</Text>
                        <Text style={styles.emptyStateSubtitle}>
                            No hay labores registradas para esta conexión
                        </Text>
                    </View>
                )}

                {/* Botón para nueva labor */}
                <TouchableOpacity 
                    style={styles.newInstallationButton}
                    onPress={handleNewInstallation}
                >
                    <Icon name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.newInstallationButtonText}>Nueva Labor</Text>
                </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
};

export default InstallationDetailsModern;