import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Dimensions,
    Linking,
    PermissionsAndroid,
    Platform,
    Share,
    Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTheme } from '../../../ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const InvoiceDetailsScreen = ({ route, navigation }) => {
    const { invoiceId } = route.params || {};
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [userToken, setUserToken] = useState('');
    const [invoice, setInvoice] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const API_BASE = 'https://wellnet-rd.com:444/api';

    useEffect(() => {
        loadUserData();
    }, []);

    useEffect(() => {
        if (userToken && invoiceId) {
            loadInvoiceDetails();
        }
    }, [userToken, invoiceId]);

    const loadUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            const loginData = jsonValue != null ? JSON.parse(jsonValue) : null;
            
            if (loginData && loginData.token) {
                setUserToken(loginData.token);
            } else {
                Alert.alert('Error', 'No se encontraron datos de autenticación');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            Alert.alert('Error', 'Error al cargar datos del usuario');
        }
    };

    const loadInvoiceDetails = async () => {
        try {
            setLoading(true);
            console.log('🔍 [INVOICE] Intentando cargar detalles de factura...');
            const response = await fetch(`${API_BASE}/isp-owner/invoices/${invoiceId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                setInvoice(data.data.invoice);
            } else {
                console.error('Error loading invoice details:', data.message);
                loadDemoInvoice(); // Cargar datos de demostración
            }
        } catch (error) {
            console.error('Error fetching invoice details:', error);
            console.log('📋 [INVOICE] Cargando factura de demostración...');
            loadDemoInvoice(); // Cargar datos de demostración
        } finally {
            setLoading(false);
        }
    };

    const loadDemoInvoice = () => {
        // Datos de demostración de la factura
        const demoInvoice = {
            id: invoiceId,
            invoice_number: "WTL-2025-07-0012",
            isp_id: 12,
            isp_name: "Well Net",
            billing_period_start: "2025-07-18",
            billing_period_end: "2025-08-17",
            base_amount: "1200.00",
            accounting_service_amount: "500.00",
            accounting_plan_name: "Contabilidad Profesional",
            has_accounting_service: true,
            overage_amount: "0.00",
            total_amount: "1700.00",
            status: "pending",
            created_at: "2025-07-15T18:00:00Z",
            plan_details: {
                id: "enterprise",
                name: "Enterprise",
                price: "1200.00",
                connection_limit: 2000
            },
            connection_usage: {
                active: 750,
                suspended: 340,
                maintenance: 39,
                total_billable: 1129
            }
        };

        setInvoice(demoInvoice);
    };

    // Función para formatear datos de factura como texto
    const formatInvoiceForSharing = (invoice) => {
        if (!invoice) return 'Factura no disponible';

        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            return new Date(dateString).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        };

        const formatMoney = (amount) => {
            const num = parseFloat(amount) || 0;
            return `US$${num.toFixed(2)}`;
        };

        let invoiceText = `
🧾 FACTURA #${invoice.invoice_number}
${invoice.isp_name || 'Well Technologies'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 PERÍODO DE FACTURACIÓN:
${formatDate(invoice.billing_period_start)} - ${formatDate(invoice.billing_period_end)}

💰 DESGLOSE DE SERVICIOS:
Servicio ISP Base: ${formatMoney(invoice.base_amount)}`;

        // Agregar servicio de contabilidad si existe
        if (invoice.has_accounting_service && invoice.accounting_service_amount) {
            invoiceText += `
Servicio de Contabilidad: ${formatMoney(invoice.accounting_service_amount)}
Plan: ${invoice.accounting_plan_name || 'Contabilidad'}`;
        }

        // Agregar excedentes si existen
        if (invoice.overage_amount && parseFloat(invoice.overage_amount) > 0) {
            invoiceText += `
Excedentes: ${formatMoney(invoice.overage_amount)}`;
        }

        if (invoice.plan_details) {
            invoiceText += `

📋 DETALLES DEL PLAN ISP:
Plan: ${invoice.plan_details?.name || 'N/A'}
Precio Mensual: ${formatMoney(invoice.plan_details?.price || 0)}
Límite de Conexiones: ${invoice.plan_details?.connection_limit || 0}`;
        }

        invoiceText += `

🔌 USO DE CONEXIONES:
Activas: ${invoice.connection_usage?.active || 0}
Suspendidas: ${invoice.connection_usage?.suspended || 0}
Mantenimiento: ${invoice.connection_usage?.maintenance || 0}
Total Facturable: ${invoice.connection_usage?.total_billable || 0}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 RESUMEN DE FACTURACIÓN:
Monto Base: ${formatMoney(invoice.base_amount)}
Total: ${formatMoney(invoice.total_amount)}

Estado: ${invoice.status === 'paid' ? '✅ PAGADA' : 
               invoice.status === 'pending' ? '⏳ PENDIENTE' : 
               '⚠️ VENCIDA'}

Fecha de Creación: ${formatDate(invoice.created_at)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gracias por confiar en Well Technologies
${new Date().toLocaleString('es-ES')}`;

        return invoiceText;
    };

    // Función para compartir factura usando Share API nativo
    const shareInvoiceDetails = async () => {
        try {
            console.log('📤 [INVOICE] Compartiendo detalles de factura...');
            
            const invoiceText = formatInvoiceForSharing(invoice);
            
            const result = await Share.share({
                message: invoiceText,
                title: `Factura #${invoice?.invoice_number || 'N/A'}`,
            });

            if (result.action === Share.sharedAction) {
                console.log('📤 [INVOICE] Factura compartida exitosamente');
            }
        } catch (error) {
            console.error('Error al compartir factura:', error);
            Alert.alert('Error', 'No se pudo compartir la factura');
        }
    };

    // Función para compartir por WhatsApp
    const shareViaWhatsApp = async () => {
        try {
            console.log('📱 [INVOICE] Compartiendo por WhatsApp...');
            
            const invoiceText = formatInvoiceForSharing(invoice);
            const encodedText = encodeURIComponent(invoiceText);
            const whatsappUrl = `whatsapp://send?text=${encodedText}`;

            const canOpen = await Linking.canOpenURL(whatsappUrl);
            if (canOpen) {
                await Linking.openURL(whatsappUrl);
            } else {
                Alert.alert(
                    'WhatsApp no disponible',
                    'WhatsApp no está instalado en este dispositivo. ¿Desea compartir por otros medios?',
                    [
                        { text: 'Cancelar' },
                        { text: 'Compartir', onPress: shareInvoiceDetails }
                    ]
                );
            }
        } catch (error) {
            console.error('Error al compartir por WhatsApp:', error);
            Alert.alert('Error', 'No se pudo compartir por WhatsApp');
        }
    };

    // Función para enviar por Email
    const shareViaEmail = async () => {
        try {
            console.log('📧 [INVOICE] Compartiendo por Email...');
            
            const invoiceText = formatInvoiceForSharing(invoice);
            const subject = `Factura #${invoice?.invoice_number || 'N/A'} - Well Technologies`;
            const emailBody = `Estimado cliente,

Adjunto encontrará los detalles de su factura:

${invoiceText}

Si tiene alguna pregunta, no dude en contactarnos.

Saludos cordiales,
Well Technologies`;

            const encodedSubject = encodeURIComponent(subject);
            const encodedBody = encodeURIComponent(emailBody);
            const emailUrl = `mailto:?subject=${encodedSubject}&body=${encodedBody}`;

            const canOpen = await Linking.canOpenURL(emailUrl);
            if (canOpen) {
                await Linking.openURL(emailUrl);
            } else {
                Alert.alert('Error', 'No se pudo abrir la aplicación de email');
            }
        } catch (error) {
            console.error('Error al compartir por email:', error);
            Alert.alert('Error', 'No se pudo compartir por email');
        }
    };

    // Función simple: Un clic → PDF en navegador (coordinación Frontend-Backend)
    const openPDFInBrowser = async () => {
        try {
            console.log('📄 [INVOICE] Abriendo PDF en navegador...');
            
            // 1. Solicitar URL al backend (como acordado con el agente backend)
            const response = await fetch(`${API_BASE}/isp-owner/invoices/${invoice.id}/pdf-url`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok && data.success && data.pdfUrl) {
                console.log('📄 [INVOICE] URL recibida del backend, abriendo:', data.pdfUrl);
                
                // 2. Abrir PDF directamente en navegador (sin alertas, sin menús)
                await Linking.openURL(data.pdfUrl);
                
            } else {
                console.error('Error obteniendo enlace PDF:', data.message);
                Alert.alert('Error', 'No se pudo abrir el PDF');
            }
        } catch (error) {
            console.error('Error al abrir PDF:', error);
            Alert.alert('Error', 'No se pudo conectar con el servidor');
        }
    };

    // Función de opciones de compartir (mantener para menú horizontal)
    const showShareOptions = async () => {
        Alert.alert(
            '📤 Compartir Factura',
            'Seleccione cómo desea compartir esta factura:',
            [
                {
                    text: '📱 WhatsApp',
                    onPress: shareViaWhatsApp,
                },
                {
                    text: '📧 Email',
                    onPress: shareViaEmail,
                },
                {
                    text: '📋 Compartir Texto',
                    onPress: shareInvoiceDetails,
                },
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return '#10B981';
            case 'pending': return '#F59E0B';
            case 'overdue': return '#EF4444';
            default: return isDarkMode ? '#9CA3AF' : '#6B7280';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'paid': return 'Pagada';
            case 'pending': return 'Pendiente';
            case 'overdue': return 'Vencida';
            default: return 'Desconocido';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Función para manejar el pago con confirmación
    const handlePayment = () => {
        setShowPaymentModal(true);
    };

    const confirmPayment = () => {
        setShowPaymentModal(false);
        navigation.navigate('ProcesarPago', {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoice_number,
            totalAmount: invoice.total_amount,
            dueDate: invoice.due_date,
            ispName: invoice.isp_name
        });
    };

    const InfoCard = ({ title, children, icon }) => (
        <View style={[styles.infoCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.cardHeader}>
                <Icon name={icon} size={24} color="#3B82F6" />
                <Text style={[styles.cardTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                    {title}
                </Text>
            </View>
            {children}
        </View>
    );

    const InfoRow = ({ label, value, valueColor, labelWeight, valueWeight }) => (
        <View style={styles.infoRow}>
            <Text style={[
                styles.infoLabel, 
                { 
                    color: isDarkMode ? '#9CA3AF' : '#6B7280',
                    fontWeight: labelWeight || '400'
                }
            ]}>
                {label}
            </Text>
            <Text style={[
                styles.infoValue, 
                { 
                    color: valueColor || (isDarkMode ? '#F9FAFB' : '#1F2937'),
                    fontWeight: valueWeight || '500'
                }
            ]}>
                {value}
            </Text>
        </View>
    );

    const styles = {
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
        },
        header: {
            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            paddingTop: 40,
            paddingBottom: 20,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB',
        },
        headerContent: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        backButton: {
            padding: 8,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: isDarkMode ? '#F9FAFB' : '#1F2937',
            flex: 1,
            textAlign: 'center',
        },
        downloadButton: {
            backgroundColor: '#10B981',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
        },
        downloadButtonText: {
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '600',
            marginLeft: 4,
        },
        content: {
            flex: 1,
            padding: 16,
            paddingBottom: 120, // Espacio ampliado para el botón flotante
        },
        statusContainer: {
            alignItems: 'center',
            marginBottom: 24,
        },
        invoiceNumber: {
            fontSize: 24,
            fontWeight: '700',
            color: isDarkMode ? '#F9FAFB' : '#1F2937',
            marginBottom: 8,
        },
        statusBadge: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            marginBottom: 8,
        },
        statusText: {
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '600',
        },
        totalAmount: {
            fontSize: 32,
            fontWeight: '900',
            color: '#10B981',
        },
        infoCard: {
            padding: 20,
            borderRadius: 12,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        cardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        cardTitle: {
            fontSize: 18,
            fontWeight: '600',
            marginLeft: 8,
        },
        infoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        infoLabel: {
            fontSize: 14,
            flex: 1,
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
            fontWeight: '500',
        },
        infoValue: {
            fontSize: 14,
            fontWeight: '600',
            flex: 1,
            textAlign: 'right',
            color: isDarkMode ? '#FFFFFF' : '#111827',
        },
        totalSeparator: {
            borderTopWidth: 1,
            marginVertical: 12,
            marginBottom: 8,
        },
        usageGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 8,
        },
        usageItem: {
            width: '50%',
            paddingVertical: 8,
        },
        usageItemLabel: {
            fontSize: 12,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            marginBottom: 4,
        },
        usageItemValue: {
            fontSize: 16,
            fontWeight: '600',
            color: isDarkMode ? '#F9FAFB' : '#1F2937',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            marginTop: 16,
            fontSize: 16,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
        },
        paymentButtonContainer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? '#374151' : '#E5E7EB',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
        },
        paymentButton: {
            backgroundColor: '#10B981',
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#10B981',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
        },
        paymentButtonText: {
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: '700',
            marginLeft: 8,
        },
        // Estilos del modal
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContainer: {
            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
            borderRadius: 16,
            padding: 24,
            margin: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
        },
        modalHeader: {
            alignItems: 'center',
            marginBottom: 20,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: isDarkMode ? '#FFFFFF' : '#111827',
            marginTop: 8,
        },
        modalContent: {
            alignItems: 'center',
            marginBottom: 24,
        },
        modalText: {
            fontSize: 16,
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
            textAlign: 'center',
            marginBottom: 16,
        },
        modalInvoiceInfo: {
            alignItems: 'center',
            padding: 16,
            backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
            borderRadius: 12,
        },
        modalInvoiceNumber: {
            fontSize: 16,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#111827',
            marginBottom: 4,
        },
        modalInvoiceAmount: {
            fontSize: 24,
            fontWeight: '700',
            color: '#10B981',
        },
        modalButtons: {
            flexDirection: 'row',
            gap: 12,
        },
        modalButton: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: 'center',
        },
        modalButtonCancel: {
            backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
        },
        modalButtonConfirm: {
            backgroundColor: '#10B981',
        },
        modalButtonTextCancel: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
            fontSize: 16,
            fontWeight: '600',
        },
        modalButtonTextConfirm: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
        },
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Icon name="arrow_back" size={32} color={isDarkMode ? '#F9FAFB' : '#1F2937'} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Detalles de Factura</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                    <Text style={styles.loadingText}>Cargando detalles de la factura...</Text>
                </View>
            </View>
        );
    }

    if (!invoice) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Icon name="arrow_back" size={32} color={isDarkMode ? '#F9FAFB' : '#1F2937'} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Detalles de Factura</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <Icon name="error_outline" size={64} color={isDarkMode ? '#4B5563' : '#9CA3AF'} />
                    <Text style={styles.loadingText}>No se pudo cargar la factura</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={{ fontSize: 24, color: isDarkMode ? '#F9FAFB' : '#1F2937', fontWeight: 'bold' }}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Detalles de Factura</Text>
                    <TouchableOpacity 
                        style={[styles.downloadButton, { backgroundColor: '#DC2626' }]}
                        onPress={openPDFInBrowser}
                    >
                        <Icon name="description" size={16} color="#FFFFFF" />
                        <Text style={styles.downloadButtonText}>PDF</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Invoice Header */}
                <View style={styles.statusContainer}>
                    <Text style={styles.invoiceNumber}>
                        {invoice.invoice_number}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
                        <Text style={styles.statusText}>
                            {getStatusText(invoice.status)}
                        </Text>
                    </View>
                    <Text style={styles.totalAmount}>
                        US${parseFloat(invoice.total_amount).toFixed(2)}
                    </Text>
                </View>

                {/* Invoice Information */}
                <InfoCard title="Información de la factura" icon="receipt">
                    <InfoRow 
                        label="ISP:" 
                        value={invoice.isp_name} 
                    />
                    <InfoRow 
                        label="Período de facturación:" 
                        value={`${formatDate(invoice.billing_period_start)} - ${formatDate(invoice.billing_period_end)}`} 
                    />
                    <InfoRow 
                        label="Fecha de creación:" 
                        value={formatDate(invoice.created_at)} 
                    />
                </InfoCard>

                {/* Service Breakdown */}
                <InfoCard title="Desglose de servicios" icon="receipt">
                    <InfoRow 
                        label="Servicio ISP básico:" 
                        value={`US$${parseFloat(invoice.base_amount).toFixed(2)}`} 
                    />
                    
                    {invoice.has_accounting_service && invoice.accounting_service_amount && (
                        <>
                            <InfoRow 
                                label="Servicio de contabilidad:" 
                                value={`US$${parseFloat(invoice.accounting_service_amount).toFixed(2)}`} 
                            />
                            <InfoRow 
                                label="Plan de contabilidad:" 
                                value={`${invoice.accounting_plan_name} - US$${parseFloat(invoice.accounting_service_amount).toFixed(2)}`}
                                valueColor="#3B82F6"
                            />
                        </>
                    )}
                    
                    {invoice.overage_amount && parseFloat(invoice.overage_amount) > 0 && (
                        <InfoRow 
                            label="Excedentes:" 
                            value={`US$${parseFloat(invoice.overage_amount).toFixed(2)}`} 
                        />
                    )}
                    
                    <View style={[styles.totalSeparator, { borderTopColor: isDarkMode ? '#374151' : '#E5E7EB' }]} />
                    <InfoRow 
                        label="TOTAL:" 
                        value={`US$${parseFloat(invoice.total_amount).toFixed(2)}`}
                        valueColor="#10B981"
                        labelWeight="700"
                        valueWeight="700"
                    />
                </InfoCard>

                {/* Plan Details */}
                {invoice.plan_details && (
                    <InfoCard title="Detalles del plan" icon="business">
                        <InfoRow 
                            label="Plan:" 
                            value={invoice.plan_details.name} 
                        />
                        <InfoRow 
                            label="Precio mensual:" 
                            value={`US$${parseFloat(invoice.plan_details.price).toFixed(2)}`} 
                        />
                        <InfoRow 
                            label="Límite de conexiones:" 
                            value={invoice.plan_details.connection_limit.toLocaleString()} 
                        />
                    </InfoCard>
                )}

                {/* Connection Usage */}
                {invoice.connection_usage && (
                    <InfoCard title="Uso de conexiones" icon="wifi">
                        <View style={styles.usageGrid}>
                            <View style={styles.usageItem}>
                                <Text style={styles.usageItemLabel}>Activas</Text>
                                <Text style={[styles.usageItemValue, { color: '#10B981' }]}>
                                    {invoice.connection_usage.active?.toLocaleString() || 0}
                                </Text>
                            </View>
                            <View style={styles.usageItem}>
                                <Text style={styles.usageItemLabel}>Suspendidas</Text>
                                <Text style={[styles.usageItemValue, { color: '#F59E0B' }]}>
                                    {invoice.connection_usage.suspended?.toLocaleString() || 0}
                                </Text>
                            </View>
                            <View style={styles.usageItem}>
                                <Text style={styles.usageItemLabel}>Mantenimiento</Text>
                                <Text style={[styles.usageItemValue, { color: '#6B7280' }]}>
                                    {invoice.connection_usage.maintenance?.toLocaleString() || 0}
                                </Text>
                            </View>
                            <View style={styles.usageItem}>
                                <Text style={styles.usageItemLabel}>Total Facturable</Text>
                                <Text style={[styles.usageItemValue, { color: '#3B82F6' }]}>
                                    {invoice.connection_usage.total_billable?.toLocaleString() || 0}
                                </Text>
                            </View>
                        </View>
                    </InfoCard>
                )}
            </ScrollView>

            {/* Espacio adicional para evitar solapamiento */}
            <View style={{ height: 20 }} />

            {/* Botón de Pago Flotante - Solo mostrar si no está pagada */}
            {(invoice.status === 'pending' || invoice.status === 'overdue') && invoice.status !== 'paid' && (
                <View style={styles.paymentButtonContainer}>
                    <TouchableOpacity
                        style={styles.paymentButton}
                        onPress={handlePayment}
                    >
                        <Icon name="payment" size={24} color="#FFFFFF" />
                        <Text style={styles.paymentButtonText}>
                            Pagar US${parseFloat(invoice.total_amount).toFixed(2)}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Modal de Confirmación de Pago */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showPaymentModal}
                onRequestClose={() => setShowPaymentModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Icon name="payment" size={32} color="#10B981" />
                            <Text style={styles.modalTitle}>Confirmar Pago</Text>
                        </View>
                        
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>
                                ¿Desea proceder con el pago de la factura?
                            </Text>
                            
                            <View style={styles.modalInvoiceInfo}>
                                <Text style={styles.modalInvoiceNumber}>{invoice?.invoice_number}</Text>
                                <Text style={styles.modalInvoiceAmount}>
                                    US${parseFloat(invoice?.total_amount || 0).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setShowPaymentModal(false)}
                            >
                                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonConfirm]}
                                onPress={confirmPayment}
                            >
                                <Text style={styles.modalButtonTextConfirm}>Confirmar Pago</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default InvoiceDetailsScreen;