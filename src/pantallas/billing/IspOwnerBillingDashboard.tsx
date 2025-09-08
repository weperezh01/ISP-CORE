import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    PermissionsAndroid,
    Platform,
    Share,
    Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTheme } from '../../../ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const IspOwnerBillingDashboard = ({ route, navigation }) => {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userToken, setUserToken] = useState('');
    const [userId, setUserId] = useState(null);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [billingStats, setBillingStats] = useState(null);
    const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1 });

    const API_BASE = 'https://wellnet-rd.com:444/api';
    
    // Debug: Verificar inicio del dashboard
    useEffect(() => {
        console.log('🛠️ [BILLING] Iniciando dashboard de facturación ISP');
        console.log('🛠️ [BILLING] Backend obtendrá automáticamente todos los ISPs del usuario');
    }, []);

    useEffect(() => {
        loadUserData();
    }, []);

    useEffect(() => {
        if (userToken && userId) {
            loadBillingData();
        }
    }, [userToken, userId]);
    
    // Función de test para verificar conectividad con el backend
    const testBackendConnection = async () => {
        try {
            console.log('🧪 [TEST] Probando conexión con backend...');
            console.log('🧪 [TEST] Usuario ID para test:', userId);
            console.log('🧪 [TEST] Token presente:', !!userToken);
            
            // Test simple del endpoint
            const testUrl = `${API_BASE}/isp-owner/invoices-by-user?user_id=${userId}&page=1&limit=10`;
            console.log('🧪 [TEST] URL de prueba:', testUrl);
            
            const response = await fetch(testUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                }
            });
            
            console.log('🧪 [TEST] Status:', response.status);
            console.log('🧪 [TEST] Status Text:', response.statusText);
            console.log('🧪 [TEST] Headers:', response.headers);
            
            const responseText = await response.text();
            console.log('🧪 [TEST] Response raw:', responseText);
            
            try {
                const data = JSON.parse(responseText);
                console.log('🧪 [TEST] Response JSON:', data);
                
                if (data.success && data.data && data.data.invoices) {
                    console.log('✅ [TEST] Backend funciona! Facturas encontradas:', data.data.invoices.length);
                    return data.data.invoices;
                } else {
                    console.log('⚠️ [TEST] Backend responde pero sin facturas:', data);
                    return [];
                }
            } catch (jsonError) {
                console.error('❌ [TEST] Response no es JSON válido:', jsonError);
                console.log('🔍 [TEST] Raw response:', responseText);
                return null;
            }
            
        } catch (error) {
            console.error('❌ [TEST] Error conectando con backend:', error);
            return null;
        }
    };

    const loadUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            const loginData = jsonValue != null ? JSON.parse(jsonValue) : null;
            
            if (loginData && loginData.token && loginData.id) {
                setUserToken(loginData.token);
                setUserId(loginData.id);
                console.log('✅ [BILLING] Usuario cargado - ID:', loginData.id);
            } else {
                Alert.alert('Error', 'No se encontraron datos de autenticación');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            Alert.alert('Error', 'Error al cargar datos del usuario');
        }
    };

    const loadBillingData = async () => {
        try {
            setLoading(true);
            
            if (!userId) {
                console.log('📋 [BILLING] Sin usuario ID, cargando datos demo...');
                loadDemoInvoices();
                loadDemoPlan();
                setIsDemoMode(true);
                return;
            }
            
            console.log('🚀 [BILLING] Intentando cargar datos reales para usuario:', userId);
            console.log('🚀 [BILLING] El backend obtendrá automáticamente todos los ISPs del usuario');
            
            // Cargar datos reales directamente
            await Promise.all([
                loadInvoices(),
                loadCurrentPlan()
            ]);
            
        } catch (error) {
            console.error('❌ [BILLING] Error general cargando datos:', error);
            console.log('📋 [BILLING] Fallback final a datos demo...');
            loadDemoInvoices();
            loadDemoPlan();
            setIsDemoMode(true);
        } finally {
            setLoading(false);
        }
    };

    const loadInvoices = async (page = 1) => {
        try {
            console.log('🔍 [BILLING] Intentando cargar facturas reales...');
            console.log('🔍 [BILLING] Usuario ID:', userId);
            console.log('🔍 [BILLING] Token presente:', !!userToken);
            
            const url = `${API_BASE}/isp-owner/invoices-by-user?user_id=${userId}&page=${page}&limit=10`;
            console.log('🔍 [BILLING] URL:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                }
            });

            console.log('🔍 [BILLING] Response status:', response.status);
            console.log('🔍 [BILLING] Response ok:', response.ok);
            
            const data = await response.json();
            console.log('🔍 [BILLING] Response data:', JSON.stringify(data, null, 2));
            
            if (response.ok && data.success) {
                console.log('✅ [BILLING] Facturas reales cargadas:', data.data.invoices?.length || 0);
                if (data.data.invoices && data.data.invoices.length > 0) {
                    setInvoices(data.data.invoices);
                    setPagination(data.data.pagination || { current_page: 1, total_pages: 1 });
                    setBillingStats(data.data.summary || null);
                    setIsDemoMode(false);
                    console.log('✅ [BILLING] Datos reales aplicados exitosamente');
                } else {
                    console.log('⚠️ [BILLING] Backend responde pero sin facturas, usando demo');
                    loadDemoInvoices();
                    setIsDemoMode(true);
                }
            } else {
                console.error('❌ [BILLING] Error del backend:', data.message);
                console.log('📋 [BILLING] Fallback a datos de demostración...');
                loadDemoInvoices();
                setIsDemoMode(true);
            }
        } catch (error) {
            console.error('❌ [BILLING] Error de conexión:', error);
            console.log('📋 [BILLING] Fallback a datos de demostración...');
            loadDemoInvoices();
            setIsDemoMode(true);
        }
    };

    const loadDemoInvoices = () => {
        // Datos de demostración mientras se implementa el backend
        const demoInvoices = [
            {
                id: 1,
                invoice_number: "WTL-2025-07-0012",
                billing_period_start: "2025-07-18",
                billing_period_end: "2025-08-17",
                base_amount: "1200.00",
                accounting_service_amount: "500.00",
                accounting_plan_name: "Contabilidad Profesional",
                has_accounting_service: true,
                overage_amount: "0.00",
                total_amount: "1700.00",
                transactions_included: 1129,
                transactions_used: 1129,
                status: "pending",
                created_at: "2025-07-15T18:00:00Z",
                pdf_available: true
            },
            {
                id: 2,
                invoice_number: "WTL-2025-06-0008",
                billing_period_start: "2025-06-18",
                billing_period_end: "2025-07-17",
                base_amount: "1200.00",
                accounting_service_amount: "500.00",
                accounting_plan_name: "Contabilidad Profesional",
                has_accounting_service: true,
                overage_amount: "0.00",
                total_amount: "1700.00",
                transactions_included: 1200,
                transactions_used: 1089,
                status: "paid",
                created_at: "2025-06-15T18:00:00Z",
                pdf_available: true
            },
            {
                id: 3,
                invoice_number: "WTL-2025-05-0005",
                billing_period_start: "2025-05-18",
                billing_period_end: "2025-06-17",
                base_amount: "1200.00",
                accounting_service_amount: null,
                accounting_plan_name: null,
                has_accounting_service: false,
                overage_amount: "0.00",
                total_amount: "1200.00",
                transactions_included: 1200,
                transactions_used: 956,
                status: "paid",
                created_at: "2025-05-15T18:00:00Z",
                pdf_available: true
            }
        ];

        setInvoices(demoInvoices);
        setPagination({ current_page: 1, total_pages: 1 });
        setBillingStats({
            total_amount_pending: "1200.00",
            total_amount_paid: "2400.00",
            next_billing_date: "2025-08-18"
        });
    };

    const loadCurrentPlan = async () => {
        try {
            console.log('🔍 [BILLING] Intentando cargar plan actual...');
            const url = `${API_BASE}/isp-owner/current-plan-by-user?user_id=${userId}`;
            console.log('🔍 [BILLING] Plan URL:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            console.log('🔍 [BILLING] Plan response:', JSON.stringify(data, null, 2));
            
            if (response.ok && data.success) {
                console.log('✅ [BILLING] Plan real cargado');
                setCurrentPlan(data.data);
            } else {
                console.error('❌ [BILLING] Error cargando plan:', data.message);
                console.log('📋 [BILLING] Fallback a plan de demostración...');
                loadDemoPlan();
                setIsDemoMode(true);
            }
        } catch (error) {
            console.error('❌ [BILLING] Error de conexión plan:', error);
            console.log('📋 [BILLING] Fallback a plan de demostración...');
            loadDemoPlan();
            setIsDemoMode(true);
        }
    };

    const loadDemoPlan = () => {
        // Datos de demostración del plan actual
        const demoPlan = {
            current_plan: {
                id: "enterprise",
                name: "Enterprise",
                price: "1200.00",
                connection_limit: 2000,
                price_per_connection: "0.60"
            },
            usage: {
                connections_used: 1129,
                connections_available: 871,
                usage_percentage: 56.45
            },
            billing_info: {
                next_billing_date: "2025-08-18",
                billing_day: 18,
                estimated_next_amount: "1200.00"
            }
        };

        setCurrentPlan(demoPlan);
    };

    // Función para formatear datos de factura como texto para compartir
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
Well Technologies

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

        invoiceText += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: ${formatMoney(invoice.total_amount)}

Estado: ${invoice.status === 'paid' ? '✅ PAGADA' : 
               invoice.status === 'pending' ? '⏳ PENDIENTE' : 
               '⚠️ VENCIDA'}

Transacciones Incluidas: ${invoice.transactions_included || 0}
Transacciones Utilizadas: ${invoice.transactions_used || 0}

Fecha de Creación: ${formatDate(invoice.created_at)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gracias por confiar en Well Technologies
${new Date().toLocaleString('es-ES')}`;

        return invoiceText;
    };

    // Función para compartir factura usando Share API nativo
    const shareInvoiceDetails = async (invoice) => {
        try {
            console.log('📤 [BILLING] Compartiendo detalles de factura...');
            
            const invoiceText = formatInvoiceForSharing(invoice);
            
            const result = await Share.share({
                message: invoiceText,
                title: `Factura #${invoice?.invoice_number || 'N/A'}`,
            });

            if (result.action === Share.sharedAction) {
                console.log('📤 [BILLING] Factura compartida exitosamente');
            }
        } catch (error) {
            console.error('Error al compartir factura:', error);
            Alert.alert('Error', 'No se pudo compartir la factura');
        }
    };

    // Función para compartir por WhatsApp
    const shareViaWhatsApp = async (invoice) => {
        try {
            console.log('📱 [BILLING] Compartiendo por WhatsApp...');
            
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
                        { text: 'Compartir', onPress: () => shareInvoiceDetails(invoice) }
                    ]
                );
            }
        } catch (error) {
            console.error('Error al compartir por WhatsApp:', error);
            Alert.alert('Error', 'No se pudo compartir por WhatsApp');
        }
    };

    // Función para enviar por Email
    const shareViaEmail = async (invoice) => {
        try {
            console.log('📧 [BILLING] Compartiendo por Email...');
            
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
    const openPDFInBrowser = async (invoice) => {
        try {
            console.log('📄 [BILLING] Abriendo PDF en navegador...');
            
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
                console.log('📄 [BILLING] URL recibida del backend, abriendo:', data.pdfUrl);
                
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

    // Función de opciones de compartir (mantener para otros usos)
    const showShareOptions = async (invoiceId, invoiceNumber) => {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (!invoice) {
            Alert.alert('Error', 'No se pudo encontrar la información de la factura');
            return;
        }
        
        Alert.alert(
            '📤 Compartir Factura',
            'Seleccione cómo desea compartir esta factura:',
            [
                {
                    text: '📱 WhatsApp',
                    onPress: () => shareViaWhatsApp(invoice),
                },
                {
                    text: '📧 Email',
                    onPress: () => shareViaEmail(invoice),
                },
                {
                    text: '📋 Compartir Texto',
                    onPress: () => shareInvoiceDetails(invoice),
                },
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBillingData();
        setRefreshing(false);
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

    // Función para formatear el rango de fechas
    const formatDateRange = (startDate, endDate) => {
        if (!startDate || !endDate) return 'Período no disponible';
        
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            const formatOptions = { 
                day: '2-digit', 
                month: 'short',
                year: start.getFullYear() === end.getFullYear() ? undefined : '2-digit'
            };
            
            const startFormatted = start.toLocaleDateString('es-ES', formatOptions);
            const endFormatted = end.toLocaleDateString('es-ES', formatOptions);
            
            return `${startFormatted} - ${endFormatted}`;
        } catch (error) {
            console.error('Error formatting date range:', error);
            return 'Período inválido';
        }
    };

    const BillingStatsCard = () => {
        if (!currentPlan || !billingStats) return null;

        return (
            <View style={[styles.statsCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
                <View style={styles.statsHeader}>
                    <Icon name="account-balance" size={24} color="#3B82F6" />
                    <Text style={[styles.statsTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                        Plan Actual
                    </Text>
                </View>

                <View style={styles.planInfo}>
                    <Text style={[styles.planName, { color: '#3B82F6' }]}>
                        {currentPlan.current_plan?.name}
                    </Text>
                    <Text style={[styles.planPrice, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                        US${currentPlan.current_plan?.price}/mes
                    </Text>
                </View>

                <View style={styles.usageContainer}>
                    <View style={styles.usageItem}>
                        <Text style={[styles.usageLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            Conexiones Utilizadas
                        </Text>
                        <Text style={[styles.usageValue, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                            {currentPlan.usage?.connections_used || 0} / {currentPlan.current_plan?.connection_limit || 0}
                        </Text>
                    </View>
                    
                    <View style={styles.progressBar}>
                        <View 
                            style={[
                                styles.progressFill, 
                                { 
                                    width: `${currentPlan.usage?.usage_percentage || 0}%`,
                                    backgroundColor: currentPlan.usage?.usage_percentage > 80 ? '#EF4444' : '#10B981'
                                }
                            ]} 
                        />
                    </View>
                </View>

                <View style={styles.nextBilling}>
                    <Icon name="schedule" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                    <Text style={[styles.nextBillingText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        Próxima facturación: {currentPlan.billing_info?.next_billing_date}
                    </Text>
                </View>
            </View>
        );
    };

    const InvoiceCard = ({ invoice }) => (
        <View style={[styles.invoiceCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            {/* Header compacto con información principal */}
            <View style={styles.compactHeader}>
                <View style={styles.leftHeaderInfo}>
                    <Text style={[styles.invoiceNumber, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                        {invoice.invoice_number}
                    </Text>
                    <Text style={[styles.totalAmount, { color: isDarkMode ? '#10B981' : '#059669' }]}>
                        US${parseFloat(invoice.total_amount).toFixed(2)}
                    </Text>
                </View>
                
                <View style={styles.rightHeaderInfo}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
                        <Text style={styles.statusText}>
                            {getStatusText(invoice.status)}
                        </Text>
                    </View>
                    <Text style={[styles.invoicePeriod, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        {formatDateRange(invoice.billing_period_start, invoice.billing_period_end)}
                    </Text>
                </View>
            </View>

            {/* Botones de acción compactos */}
            <View style={styles.compactActions}>
                {/* Botón Ver */}
                <TouchableOpacity
                    style={[styles.compactButton, { backgroundColor: '#3B82F6' }]}
                    onPress={() => navigation.navigate('InvoiceDetailsScreen', { invoiceId: invoice.id })}
                >
                    <Icon name="visibility" size={18} color="#FFFFFF" />
                    <Text style={styles.compactButtonText}>Ver</Text>
                </TouchableOpacity>

                {/* Botón PDF */}
                {invoice.pdf_available && (
                    <TouchableOpacity
                        style={[styles.compactButton, { backgroundColor: '#DC2626' }]}
                        onPress={() => openPDFInBrowser(invoice)}
                    >
                        <Icon name="description" size={18} color="#FFFFFF" />
                        <Text style={styles.compactButtonText}>PDF</Text>
                    </TouchableOpacity>
                )}

                {/* Botón Pagar */}
                {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                    <TouchableOpacity
                        style={[styles.compactButton, { backgroundColor: '#10B981' }]}
                        onPress={() => navigation.navigate('ProcesarPago', { 
                            invoiceId: invoice.id,
                            invoiceNumber: invoice.invoice_number,
                            totalAmount: invoice.total_amount,
                            dueDate: invoice.due_date,
                            ispName: invoice.isp_name
                        })}
                    >
                        <Icon name="payment" size={18} color="#FFFFFF" />
                        <Text style={styles.compactButtonText}>Pagar</Text>
                    </TouchableOpacity>
                )}

            </View>

            {/* Detalles expandibles (ocultos por defecto para ahorrar espacio) */}
            {false && ( // Se puede controlar con estado local
                <View style={styles.expandedDetails}>
                    <View style={styles.serviceBreakdown}>
                        <View style={styles.serviceItem}>
                            <Text style={[styles.serviceLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                ISP Base
                            </Text>
                            <Text style={[styles.serviceAmount, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                                US${parseFloat(invoice.base_amount).toFixed(2)}
                            </Text>
                        </View>
                        
                        {invoice.has_accounting_service && invoice.accounting_service_amount && (
                            <View style={styles.serviceItem}>
                                <Text style={[styles.serviceLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Contabilidad
                                </Text>
                                <Text style={[styles.serviceAmount, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                                    US${parseFloat(invoice.accounting_service_amount).toFixed(2)}
                                </Text>
                            </View>
                        )}
                        
                        {invoice.overage_amount && parseFloat(invoice.overage_amount) > 0 && (
                            <View style={styles.serviceItem}>
                                <Text style={[styles.serviceLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Excedentes
                                </Text>
                                <Text style={[styles.serviceAmount, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                                    US${parseFloat(invoice.overage_amount).toFixed(2)}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </View>
    );

    const DemoBanner = () => {
        // Solo mostrar si realmente estamos en modo demo
        if (!isDemoMode) return null;
        
        return (
            <View style={[styles.demoBanner, { backgroundColor: isDarkMode ? '#1F2937' : '#FEF3C7' }]}>
                <Icon name="info" size={20} color={isDarkMode ? '#F59E0B' : '#D97706'} />
                <Text style={[styles.demoText, { color: isDarkMode ? '#F59E0B' : '#D97706' }]}>
                    Modo Demo: Mostrando datos de ejemplo mientras se conecta con el servidor.
                </Text>
            </View>
        );
    };

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
            justifyContent: 'center',
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: isDarkMode ? '#F9FAFB' : '#1F2937',
            textAlign: 'center',
        },
        content: {
            flex: 1,
            padding: 16,
        },
        statsCard: {
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        statsHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        statsTitle: {
            fontSize: 18,
            fontWeight: '600',
            marginLeft: 8,
        },
        planInfo: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        planName: {
            fontSize: 24,
            fontWeight: '700',
        },
        planPrice: {
            fontSize: 20,
            fontWeight: '600',
        },
        usageContainer: {
            marginBottom: 16,
        },
        usageItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
        },
        usageLabel: {
            fontSize: 14,
        },
        usageValue: {
            fontSize: 14,
            fontWeight: '600',
        },
        progressBar: {
            height: 8,
            backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
            borderRadius: 4,
            overflow: 'hidden',
        },
        progressFill: {
            height: '100%',
            borderRadius: 4,
        },
        nextBilling: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        nextBillingText: {
            fontSize: 14,
            marginLeft: 4,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: isDarkMode ? '#F9FAFB' : '#1F2937',
            marginBottom: 16,
        },
        invoiceCard: {
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        invoiceHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
        },
        invoiceInfo: {
            flex: 1,
        },
        invoiceNumber: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 4,
        },
        invoicePeriod: {
            fontSize: 14,
        },
        statusBadge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
        },
        statusText: {
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '600',
        },
        invoiceDetails: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        amountContainer: {
            flex: 1,
        },
        amountLabel: {
            fontSize: 14,
            marginBottom: 2,
        },
        amountValue: {
            fontSize: 20,
            fontWeight: '700',
        },
        serviceBreakdown: {
            marginBottom: 12,
        },
        serviceItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8,
        },
        serviceLabel: {
            fontSize: 14,
            fontWeight: '500',
        },
        servicePlan: {
            fontSize: 12,
            fontWeight: '400',
            marginTop: 2,
        },
        serviceAmount: {
            fontSize: 16,
            fontWeight: '600',
        },
        totalContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 12,
            marginTop: 12,
            borderTopWidth: 1,
        },
        totalLabel: {
            fontSize: 16,
            fontWeight: '600',
        },
        totalAmount: {
            fontSize: 20,
            fontWeight: '700',
        },
        // Nuevos estilos compactos
        compactHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
        },
        leftHeaderInfo: {
            flex: 1,
        },
        rightHeaderInfo: {
            alignItems: 'flex-end',
        },
        compactActions: {
            flexDirection: 'row',
            gap: 6,
            flexWrap: 'wrap',
        },
        compactButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 8,
            paddingVertical: 6,
            borderRadius: 6,
            minWidth: 60,
            flex: 1,
        },
        compactButtonText: {
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: '600',
            marginLeft: 3,
        },
        expandedDetails: {
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? '#374151' : '#E5E7EB',
        },
        // Estilos heredados (mantener compatibilidad)
        invoiceActions: {
            flexDirection: 'column',
            gap: 8,
        },
        secondaryActionsRow: {
            flexDirection: 'row',
            gap: 8,
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 6,
            minHeight: 36,
        },
        actionButtonFull: {
            flex: 1,
        },
        actionButtonHalf: {
            flex: 1,
        },
        actionButtonText: {
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '600',
            marginLeft: 4,
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
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 100,
        },
        emptyText: {
            fontSize: 16,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            textAlign: 'center',
            marginTop: 16,
        },
        demoBanner: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDarkMode ? '#F59E0B' : '#D97706',
        },
        demoText: {
            fontSize: 14,
            marginLeft: 8,
            flex: 1,
            fontWeight: '500',
        },
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Facturación</Text>
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                    <Text style={styles.loadingText}>Cargando datos de facturación...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Facturación</Text>
                </View>
            </View>

            <ScrollView 
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Demo Banner */}
                <DemoBanner />
                
                {/* Billing Stats Card */}

                {/* Invoices Section */}
                <Text style={styles.sectionTitle}>Facturas</Text>
                
                {invoices.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="receipt_long" size={64} color={isDarkMode ? '#4B5563' : '#9CA3AF'} />
                        <Text style={styles.emptyText}>
                            No hay facturas disponibles.
                        </Text>
                    </View>
                ) : (
                    invoices.map((invoice) => (
                        <InvoiceCard key={invoice.id} invoice={invoice} />
                    ))
                )}
            </ScrollView>
        </View>
    );
};

export default IspOwnerBillingDashboard;