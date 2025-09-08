import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from './ProcesarPagoStyles';

const ProcesarPagoScreen = ({ navigation, route }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    
    // Datos de la factura/monto a pagar con valores por defecto
    const { 
        invoiceId = null,
        invoiceNumber = null,
        totalAmount = "1500", 
        dueDate = null,
        ispName = null,
        facturaId = null, 
        monto = "1500", 
        descripcion = "Pago de servicio ISP de demostración" 
    } = route.params || {};
    
    // Usar datos de factura si están disponibles
    const paymentAmount = totalAmount || monto;
    const paymentDescription = invoiceNumber ? 
        `Pago de factura #${invoiceNumber}${ispName ? ` - ${ispName}` : ''}` : 
        descripcion;
    
    // Estados principales
    const [userId, setUserId] = useState(null);
    const [userIsp, setUserIsp] = useState(null);
    const [userToken, setUserToken] = useState('');
    const [metodospago, setMetodosPago] = useState([]);
    const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMetodos, setIsLoadingMetodos] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);

    // Estados de transacción
    const [transactionResult, setTransactionResult] = useState(null);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        initializeScreen();
    }, []);

    const initializeScreen = async () => {
        try {
            console.log('🔄 [INIT] Inicializando pantalla de procesar pagos...');
            
            // Log de parámetros de factura si están disponibles
            if (invoiceId) {
                console.log('📋 [INIT] Procesando pago para factura:', {
                    invoiceId,
                    invoiceNumber,
                    totalAmount,
                    dueDate,
                    ispName
                });
            }
            
            // Intentar obtener datos del usuario desde AsyncStorage
            const loginData = await AsyncStorage.getItem('@loginData');
            
            if (loginData) {
                const user = JSON.parse(loginData);
                console.log('✅ [INIT] Usuario encontrado:', user.nombre || 'Sin nombre');
                
                setUserId(user.id);
                setUserIsp(user.id_isp);
                setUserToken(user.token);
                
                // Cargar métodos de pago con el ID del usuario
                await loadMetodosPago(user.id, user.token);
            } else {
                console.warn('⚠️ [INIT] No se encontraron datos de login');
                Alert.alert(
                    'Sesión no válida',
                    'Por favor inicia sesión nuevamente',
                    [
                        { text: 'OK', onPress: () => navigation.navigate('LoginScreen') }
                    ]
                );
            }
        } catch (error) {
            console.error('❌ [INIT] Error inicializando pantalla:', error);
            Alert.alert('Error', 'No se pudo cargar la información del usuario');
        }
    };

    const loadMetodosPago = async (id_usuario, token) => {
        try {
            setIsLoadingMetodos(true);
            console.log('📥 [PAYMENT-METHODS] Cargando métodos de pago para usuario:', id_usuario);
            
            // Crear timeout para la petición
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout')), 10000); // 10 segundos
            });
            
            const fetchPromise = fetch('https://wellnet-rd.com:444/api/usuarios/metodos-pago', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id_usuario }),
            });
            
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            const data = await response.json();
            
            if (response.ok && Array.isArray(data)) {
                // Filtrar solo métodos activos
                const metodosActivos = data.filter(metodo => metodo.activo);
                setMetodosPago(metodosActivos);
                console.log('✅ [PAYMENT-METHODS] Métodos cargados:', metodosActivos.length);
            } else {
                console.warn('⚠️ [PAYMENT-METHODS] Error en respuesta:', data);
                loadDemoPaymentMethods();
            }
        } catch (error) {
            console.error('❌ [PAYMENT-METHODS] Error:', error);
            console.log('🔄 [PAYMENT-METHODS] Cargando métodos de demostración...');
            loadDemoPaymentMethods();
        } finally {
            setIsLoadingMetodos(false);
        }
    };
    
    const loadDemoPaymentMethods = () => {
        const metodosDemo = [
            {
                id: 'demo_1',
                nombre: 'Tarjeta Visa Demo',
                tipo: 'tarjeta',
                numero: '4242424242424242',
                activo: true,
                es_demo: true
            },
            {
                id: 'demo_2',
                nombre: 'PayPal Demo',
                tipo: 'paypal',
                email_paypal: 'demo@paypal.com',
                activo: true,
                es_demo: true
            },
            {
                id: 'demo_3',
                nombre: 'Tarjeta Mastercard Demo',
                tipo: 'tarjeta',
                numero: '5555555555554444',
                activo: true,
                es_demo: true
            }
        ];
        setMetodosPago(metodosDemo);
        console.log('✅ [PAYMENT-METHODS] Métodos de demostración cargados');
    };

    const onRefresh = async () => {
        setRefreshing(true);
        if (userId && userToken) {
            await loadMetodosPago(userId, userToken);
        }
        setRefreshing(false);
    };

    const handleMetodoPagoSelection = (metodo) => {
        setMetodoPagoSeleccionado(metodo);
        console.log('💳 [SELECTION] Método seleccionado:', metodo.nombre, metodo.tipo);
    };

    const procesarPago = async () => {
        if (!metodoPagoSeleccionado) {
            Alert.alert('Error', 'Selecciona un método de pago');
            return;
        }

        if (!userToken) {
            Alert.alert('Error', 'Sesión no válida. Por favor inicia sesión nuevamente.');
            return;
        }

        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            Alert.alert('Error', 'Monto de pago inválido');
            return;
        }

        setIsLoading(true);
        setConfirmModalVisible(false);

        // Validar conexión con backend antes de procesar
        const isBackendAvailable = await validateBackendConnection();
        if (!isBackendAvailable) {
            setIsLoading(false);
            Alert.alert(
                'Error de Conectividad',
                'No se puede conectar con el servidor de pagos. Verifica tu conexión a internet e intenta nuevamente.'
            );
            return;
        }

        try {
            console.log('💳 [PROCESS-PAYMENT] Iniciando procesamiento...');
            console.log('💳 [PROCESS-PAYMENT] Método:', metodoPagoSeleccionado.tipo);
            console.log('💳 [PROCESS-PAYMENT] Monto:', paymentAmount);
            console.log('💳 [PROCESS-PAYMENT] Usuario:', userId);
            console.log('💳 [PROCESS-PAYMENT] ISP:', userIsp);
            console.log('💳 [PROCESS-PAYMENT] Factura ID:', invoiceId);

            // Si es método de demostración, usar procesamiento simulado
            if (metodoPagoSeleccionado.es_demo) {
                console.log('🎭 [PROCESS-PAYMENT] Procesando pago de demostración...');
                const result = await procesarPagoDemo();
                setTransactionResult(result);
                setShowResult(true);
                return;
            }

            // Seleccionar endpoint basado en el tipo de método de pago
            let endpoint = '';
            if (metodoPagoSeleccionado.tipo === 'paypal') {
                endpoint = 'https://wellnet-rd.com:444/api/pagos/procesar-pago-paypal';
            } else {
                endpoint = 'https://wellnet-rd.com:444/api/pagos/procesar-pago-tarjeta';
            }

            const payload = {
                id_usuario: userId,
                id_metodo_pago: metodoPagoSeleccionado.id,
                monto: parseFloat(paymentAmount),
                descripcion: paymentDescription || 'Pago de servicio ISP',
                id_factura: invoiceId || facturaId || null,
                invoice_number: invoiceNumber || null,
                id_isp: userIsp,
                currency: 'USD', // Especificar moneda
                payment_type: 'invoice_payment', // Tipo de pago
                metadata: {
                    due_date: dueDate,
                    isp_name: ispName,
                    processed_from: 'mobile_app'
                }
            };

            console.log('📤 [PROCESS-PAYMENT] Payload:', JSON.stringify(payload, null, 2));

            // Timeout para la petición
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout')), 30000); // 30 segundos
            });

            const fetchPromise = fetch(endpoint, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(payload),
            });

            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            console.log('📥 [PROCESS-PAYMENT] Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [PROCESS-PAYMENT] HTTP Error:', response.status, errorText);
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('📥 [PROCESS-PAYMENT] Result:', JSON.stringify(result, null, 2));

            setTransactionResult(result);
            setShowResult(true);

            if (result.success) {
                console.log('✅ [PROCESS-PAYMENT] Pago exitoso!');
                
                // Si el pago fue exitoso y tenemos invoiceId, actualizar el estado de la factura
                if (invoiceId && result.success) {
                    await updateInvoiceStatus(invoiceId, 'paid');
                }
            } else {
                console.error('❌ [PROCESS-PAYMENT] Pago fallido:', result.message);
            }

        } catch (error) {
            console.error('❌ [PROCESS-PAYMENT] Error:', error);
            setTransactionResult({
                success: false,
                message: 'Error de conexión. Intenta nuevamente.'
            });
            setShowResult(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para validar conectividad con el backend
    const validateBackendConnection = async () => {
        try {
            console.log('🔍 [VALIDATE] Verificando conexión con backend...');
            const response = await fetch('https://wellnet-rd.com:444/api/health', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });
            
            if (response.ok) {
                console.log('✅ [VALIDATE] Backend disponible');
                return true;
            } else {
                console.warn('⚠️ [VALIDATE] Backend no responde correctamente');
                return false;
            }
        } catch (error) {
            console.error('❌ [VALIDATE] Error conectando con backend:', error);
            return false;
        }
    };

    // Función para actualizar el estado de una factura después del pago
    const updateInvoiceStatus = async (invoiceId, newStatus) => {
        try {
            console.log('🔄 [UPDATE-INVOICE] Actualizando estado de factura:', invoiceId, 'a', newStatus);
            
            const response = await fetch('https://wellnet-rd.com:444/api/isp-owner/invoices/update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    invoice_id: invoiceId,
                    status: newStatus,
                    updated_by: userId
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ [UPDATE-INVOICE] Estado actualizado exitosamente:', result);
            } else {
                const errorText = await response.text();
                console.error('❌ [UPDATE-INVOICE] Error actualizando estado:', errorText);
            }
        } catch (error) {
            console.error('❌ [UPDATE-INVOICE] Error:', error);
        }
    };

    const procesarPagoDemo = async () => {
        // Simular delay del procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simular 90% de éxito
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
            return {
                success: true,
                message: 'Pago procesado exitosamente (Demo)',
                data: {
                    transaccion_id: `demo_${Date.now()}`,
                    monto: parseFloat(monto),
                    moneda: 'RD$',
                    estado: 'completed',
                    fecha_procesamiento: new Date().toISOString()
                }
            };
        } else {
            return {
                success: false,
                message: 'Pago rechazado por el procesador (Demo)',
                error: 'insufficient_funds'
            };
        }
    };

    const formatCardNumber = (numero) => {
        if (!numero) return '';
        return `**** **** **** ${numero.slice(-4)}`;
    };

    const getMetodoIcon = (tipo) => {
        switch (tipo) {
            case 'tarjeta':
                return 'credit-card';
            case 'cuenta':
                return 'bank';
            case 'paypal':
                return 'paypal';
            default:
                return 'credit-card';
        }
    };

    const getMetodoColor = (tipo) => {
        switch (tipo) {
            case 'tarjeta':
                return '#007AFF';
            case 'cuenta':
                return '#34C759';
            case 'paypal':
                return '#FF9500';
            default:
                return '#007AFF';
        }
    };

    const renderMetodoPago = (metodo) => {
        const isSelected = metodoPagoSeleccionado?.id === metodo.id;
        const iconColor = getMetodoColor(metodo.tipo);

        return (
            <TouchableOpacity
                key={metodo.id}
                style={[
                    styles.metodoCard,
                    isSelected && styles.metodoCardSelected
                ]}
                onPress={() => handleMetodoPagoSelection(metodo)}
            >
                <View style={styles.metodoHeader}>
                    <View style={styles.metodoIconContainer}>
                        <Icon 
                            name={getMetodoIcon(metodo.tipo)} 
                            size={24} 
                            color={iconColor} 
                        />
                    </View>
                    <View style={styles.metodoInfo}>
                        <Text style={styles.metodoNombre}>{metodo.nombre}</Text>
                        <Text style={styles.metodoTipo}>
                            {metodo.tipo === 'tarjeta' ? 'Tarjeta' : 
                             metodo.tipo === 'cuenta' ? 'Cuenta Bancaria' : 'PayPal'}
                        </Text>
                        <Text style={styles.metodoNumero}>
                            {metodo.tipo === 'paypal' 
                                ? metodo.email_paypal 
                                : formatCardNumber(metodo.numero)
                            }
                        </Text>
                        {metodo.es_demo && (
                            <Text style={styles.demoIndicator}>
                                Demo
                            </Text>
                        )}
                    </View>
                    <View style={styles.metodoSelector}>
                        <View style={[
                            styles.radioButton,
                            isSelected && styles.radioButtonSelected
                        ]}>
                            {isSelected && <View style={styles.radioButtonInner} />}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <Text style={styles.title}>Procesar Pago</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView 
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Información del pago */}
                <View style={styles.paymentInfoCard}>
                    <Text style={styles.cardTitle}>Detalles del Pago</Text>
                    <View style={styles.paymentDetail}>
                        <Text style={styles.paymentLabel}>Monto a pagar:</Text>
                        <Text style={styles.paymentAmount}>RD$ {paymentAmount ? parseFloat(paymentAmount).toLocaleString() : '0.00'}</Text>
                    </View>
                    <View style={styles.paymentDetail}>
                        <Text style={styles.paymentLabel}>Descripción:</Text>
                        <Text style={styles.paymentDescription}>{paymentDescription || 'Pago de servicio ISP'}</Text>
                    </View>
                    {(invoiceId || facturaId) && (
                        <View style={styles.paymentDetail}>
                            <Text style={styles.paymentLabel}>Factura #:</Text>
                            <Text style={styles.paymentDescription}>{invoiceNumber || facturaId}</Text>
                        </View>
                    )}
                    {dueDate && (
                        <View style={styles.paymentDetail}>
                            <Text style={styles.paymentLabel}>Fecha de vencimiento:</Text>
                            <Text style={styles.paymentDescription}>{dueDate}</Text>
                        </View>
                    )}
                </View>

                {/* Métodos de pago */}
                <View style={styles.metodosCard}>
                    <Text style={styles.cardTitle}>Seleccionar Método de Pago</Text>
                    
                    {isLoadingMetodos ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={styles.loadingText}>Cargando métodos de pago...</Text>
                        </View>
                    ) : metodospago.length === 0 ? (
                        <View style={styles.noMetodosContainer}>
                            <Icon name="credit-card" size={48} color="#8E8E93" />
                            <Text style={styles.noMetodosText}>No hay métodos de pago configurados</Text>
                            <TouchableOpacity 
                                style={styles.addMetodoButton}
                                onPress={() => navigation.navigate('UsuarioDetalle', { userId })}
                            >
                                <Icon name="plus" size={16} color="#FFF" />
                                <Text style={styles.addMetodoButtonText}>Agregar Método</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <View style={styles.metodosContainer}>
                                {metodospago.map(renderMetodoPago)}
                            </View>
                            
                            {/* Mensaje informativo para métodos de demostración */}
                            {metodospago.length > 0 && metodospago.some(metodo => metodo.es_demo) && (
                                <View style={styles.demoMessage}>
                                    <Icon name="info-circle" size={16} color="#007AFF" />
                                    <Text style={styles.demoMessageText}>
                                        Métodos de demostración disponibles. Los pagos se simularán sin cargos reales.
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Botón de procesar pago */}
                {metodospago.length > 0 && (
                    <TouchableOpacity
                        style={[
                            styles.processButton,
                            (!metodoPagoSeleccionado || isLoading) && styles.processButtonDisabled
                        ]}
                        onPress={() => setConfirmModalVisible(true)}
                        disabled={!metodoPagoSeleccionado || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Icon name="credit-card" size={20} color="#FFF" />
                        )}
                        <Text style={styles.processButtonText}>
                            {isLoading ? 'Procesando...' : 'Procesar Pago'}
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Modal de confirmación */}
            <Modal
                visible={confirmModalVisible}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirmar Pago</Text>
                        
                        <View style={styles.confirmDetails}>
                            <Text style={styles.confirmLabel}>Monto:</Text>
                            <Text style={styles.confirmValue}>RD$ {paymentAmount ? parseFloat(paymentAmount).toLocaleString() : '0.00'}</Text>
                        </View>
                        
                        <View style={styles.confirmDetails}>
                            <Text style={styles.confirmLabel}>Método:</Text>
                            <Text style={styles.confirmValue}>
                                {metodoPagoSeleccionado?.nombre} 
                                ({metodoPagoSeleccionado?.tipo === 'paypal' 
                                    ? metodoPagoSeleccionado?.email_paypal 
                                    : formatCardNumber(metodoPagoSeleccionado?.numero)
                                })
                            </Text>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setConfirmModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={procesarPago}
                            >
                                <Text style={styles.confirmButtonText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de resultado */}
            <Modal
                visible={showResult}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.resultHeader}>
                            <Icon 
                                name={transactionResult?.success ? "check-circle" : "times-circle"} 
                                size={64} 
                                color={transactionResult?.success ? "#34C759" : "#FF3B30"} 
                            />
                            <Text style={styles.resultTitle}>
                                {transactionResult?.success ? "¡Pago Exitoso!" : "Pago Fallido"}
                            </Text>
                        </View>
                        
                        <Text style={styles.resultMessage}>
                            {transactionResult?.message || 'Operación completada'}
                        </Text>

                        {transactionResult?.success && transactionResult?.data && (
                            <View style={styles.successDetails}>
                                <Text style={styles.successLabel}>ID Transacción:</Text>
                                <Text style={styles.successValue}>{transactionResult.data.transaccion_id}</Text>
                                
                                <Text style={styles.successLabel}>Monto Procesado:</Text>
                                <Text style={styles.successValue}>
                                    {transactionResult.data.moneda} ${transactionResult.data.monto?.toLocaleString()}
                                </Text>
                                
                                <Text style={styles.successLabel}>Estado:</Text>
                                <Text style={styles.successValue}>{transactionResult.data.estado}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.modalButton, styles.resultButton]}
                            onPress={() => {
                                setShowResult(false);
                                if (transactionResult?.success) {
                                    // Si el pago fue exitoso, regresar y mostrar mensaje de éxito
                                    Alert.alert(
                                        'Pago Procesado',
                                        'El pago se ha procesado exitosamente. La factura será actualizada.',
                                        [
                                            {
                                                text: 'OK',
                                                onPress: () => {
                                                    navigation.goBack();
                                                }
                                            }
                                        ]
                                    );
                                } else {
                                    // Si falló, permitir reintentar
                                    setTransactionResult(null);
                                }
                            }}
                        >
                            <Text style={styles.resultButtonText}>
                                {transactionResult?.success ? 'Finalizar' : 'Intentar de Nuevo'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ProcesarPagoScreen;