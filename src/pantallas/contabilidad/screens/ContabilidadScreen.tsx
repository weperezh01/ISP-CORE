import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { useAccountingSubscription } from '../hooks/useAccountingSubscription';

const ContabilidadScreen = ({ route }) => {
    const { ispId } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const navigation = useNavigation();
    const [reportes, setReportes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Subscription management
    const { subscriptionStatus, loading, checkAccess, getUsageWarning } = useAccountingSubscription(ispId);

    useEffect(() => {
        // Datos dinámicos o ejemplo
        const fetchReportes = async () => {
            try {
                const response = await axios.get(`https://your-api.com/api/reportes/${ispId}`);
                setReportes(response.data);
            } catch (error) {
                console.error('Error al cargar reportes:', error);
                // Ejemplo de fallback si falla la API
                setReportes([
                    {
                        id: 1,
                        titulo: 'Balance General Q1 2024',
                        fecha: '31/03/2024',
                        descripcion: 'Resumen del balance general para el primer trimestre de 2024, conforme a las normativas contables de República Dominicana.',
                    },
                    {
                        id: 2,
                        titulo: 'Estado de Resultados Q1 2024',
                        fecha: '31/03/2024',
                        descripcion: 'Resumen del estado de resultados para el primer trimestre de 2024, conforme a las normativas contables de República Dominicana.',
                    },
                    {
                        id: 3,
                        titulo: 'Flujo de Efectivo Q1 2024',
                        fecha: '31/03/2024',
                        descripcion: 'Resumen del flujo de efectivo para el primer trimestre de 2024, conforme a las normativas contables de República Dominicana.',
                    },
                    {
                        id: 4,
                        titulo: 'Informe de Gastos Q1 2024',
                        fecha: '31/03/2024',
                        descripcion: 'Detalles de los gastos incurridos en el primer trimestre de 2024, conforme a las normativas contables de República Dominicana.',
                    },
                ]);
            }
        };

        fetchReportes();
    }, [ispId]);

    const filteredReportes = reportes.filter((reporte) =>
        reporte.titulo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderReporte = (reporte) => (
        <TouchableOpacity
            key={reporte.id}
            style={styles.reporteCard}
            onPress={() => navigation.navigate('ReporteDetailScreen', { reporte })}
        >
            <Text style={styles.reporteTitle}>{reporte.titulo}</Text>
            <Text style={styles.reporteFecha}>{reporte.fecha}</Text>
            <Text style={styles.reporteDescripcion}>{reporte.descripcion}</Text>
        </TouchableOpacity>
    );

    // Check access and show appropriate UI
    const handleFeatureAccess = (feature, callback) => {
        if (!checkAccess(feature)) {
            Alert.alert(
                'Suscripción Requerida',
                'Esta funcionalidad requiere una suscripción activa de contabilidad.',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                        text: 'Ver Planes', 
                        onPress: () => navigation.navigate('ContabilidadSuscripcionScreen', { ispId })
                    }
                ]
            );
            return;
        }
        callback();
    };

    // Usage warning component
    const UsageWarning = () => {
        const warning = getUsageWarning();
        if (!warning) return null;

        return (
            <View style={[styles.warningCard, { 
                backgroundColor: warning.type === 'error' ? '#FEF2F2' : '#FFFBEB',
                borderColor: warning.type === 'error' ? '#FCA5A5' : '#FCD34D'
            }]}>
                <MaterialIcon 
                    name={warning.type === 'error' ? 'error' : 'warning'} 
                    size={20} 
                    color={warning.type === 'error' ? '#EF4444' : '#F59E0B'} 
                />
                <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.warningText, { 
                        color: warning.type === 'error' ? '#EF4444' : '#F59E0B'
                    }]}>
                        {warning.message}
                    </Text>
                    <Text style={[styles.warningAction, {
                        color: warning.type === 'error' ? '#B91C1C' : '#D97706'
                    }]}>
                        {warning.action}
                    </Text>
                </View>
            </View>
        );
    };

    // Subscription banner
    const SubscriptionBanner = () => {
        if (subscriptionStatus?.isActive) return null;

        return (
            <TouchableOpacity 
                style={styles.subscriptionBanner}
                onPress={() => navigation.navigate('ContabilidadSuscripcionScreen', { ispId })}
            >
                <MaterialIcon name="business_center" size={24} color="#FFFFFF" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.bannerTitle}>Activa tu Suscripción de Contabilidad</Text>
                    <Text style={styles.bannerSubtitle}>Accede a todas las funciones contables</Text>
                </View>
                <MaterialIcon name="arrow_forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
            <View style={styles.headerContainer}>
                <Text style={styles.cardTitle}>Contabilidad</Text>
                {subscriptionStatus?.isActive && (
                    <TouchableOpacity
                        style={styles.dashboardButton}
                        onPress={() => navigation.navigate('ContabilidadDashboardSuscripcion', { ispId })}
                    >
                        <MaterialIcon name="dashboard" size={16} color="#FFFFFF" />
                        <Text style={styles.dashboardButtonText}>Dashboard</Text>
                    </TouchableOpacity>
                )}
            </View>
            
            <SubscriptionBanner />
            <UsageWarning />
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar reportes..."
                placeholderTextColor={isDarkMode ? '#ccc' : '#888'}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <View style={styles.flexContainer}>
                {filteredReportes.length > 0 ? (
                    filteredReportes.map((reporte) => renderReporte(reporte))
                ) : (
                    <Text style={styles.noReportesText}>No hay reportes disponibles.</Text>
                )}
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, !checkAccess('basic_accounting') && styles.disabledButton]}
                    onPress={() => handleFeatureAccess('basic_accounting', () => navigation.navigate('PlanDeCuentasScreen'))}
                >
                    <Icon name="book" size={20} color="#fff" />
                    <Text style={styles.buttonText}> Plan de Cuentas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, !checkAccess('basic_accounting') && styles.disabledButton]}
                    onPress={() => handleFeatureAccess('basic_accounting', () => navigation.navigate('InsertarTransaccionScreen'))}
                >
                    <Icon name="plus" size={20} color="#fff" />
                    <Text style={styles.buttonText}> Insertar Transacción</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, !checkAccess('basic_accounting') && styles.disabledButton]}
                    onPress={() => handleFeatureAccess('basic_accounting', () => navigation.navigate('TransaccionesScreen'))}
                >
                    <Icon name="list" size={20} color="#fff" />
                    <Text style={styles.buttonText}> Transacciones</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, !checkAccess('basic_accounting') && styles.disabledButton]}
                    onPress={() => handleFeatureAccess('basic_accounting', () => navigation.navigate('BalanceGeneralScreen'))}
                >
                    <Icon name="balance-scale" size={20} color="#fff" />
                    <Text style={styles.buttonText}> Balance General</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('EstadoResultadosScreen')}
                >
                    <Icon name="bar-chart" size={20} color="#fff" />
                    <Text style={styles.buttonText}> Estado de Resultados</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const getStyles = (isDarkMode) => StyleSheet.create({
    flexContainer: {
        flex: 1,
        backgroundColor: isDarkMode ? '#121212' : '#FFF',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    scrollViewContentContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: isDarkMode ? '#121212' : '#FFF',
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: isDarkMode ? '#fff' : '#000',
        marginBottom: 20,
        textAlign: 'center',
    },
    reporteCard: {
        backgroundColor: isDarkMode ? '#1c1c1e' : '#fff',
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    reporteTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: isDarkMode ? 'white' : 'black',
    },
    reporteFecha: {
        fontSize: 16,
        color: isDarkMode ? '#e5e5e5' : '#333',
        marginVertical: 5,
    },
    reporteDescripcion: {
        fontSize: 16,
        color: isDarkMode ? '#e5e5e5' : '#333',
    },
    noReportesText: {
        fontSize: 18,
        color: isDarkMode ? '#e5e5e5' : '#333',
        textAlign: 'center',
        marginTop: 20,
    },
    searchInput: {
        backgroundColor: isDarkMode ? '#333' : '#f4f4f4',
        color: isDarkMode ? '#fff' : '#000',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
    },
    buttonContainer: {
        marginTop: 20,
        paddingHorizontal: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDarkMode ? '#444' : '#007bff',
        padding: 15,
        borderRadius: 8,
        justifyContent: 'center',
        marginVertical: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginLeft: 10,
    },
    // New subscription styles
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    dashboardButton: {
        backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dashboardButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    subscriptionBanner: {
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    bannerTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    bannerSubtitle: {
        color: '#DBEAFE',
        fontSize: 14,
        marginTop: 2,
    },
    warningCard: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    warningText: {
        fontSize: 14,
        fontWeight: '500',
    },
    warningAction: {
        fontSize: 12,
        marginTop: 2,
    },
    disabledButton: {
        opacity: 0.5,
        backgroundColor: isDarkMode ? '#6B7280' : '#9CA3AF',
    },
});

export default ContabilidadScreen;
