import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput,
    RefreshControl,
    StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Componentes memoizados para evitar re-renders
const MemoizedTextInput = React.memo(({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    keyboardType = 'default', 
    multiline = false,
    isDarkMode
}) => (
    <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
            {label}
        </Text>
        <TextInput
            style={[
                styles.textInput,
                {
                    backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                    borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
                    color: isDarkMode ? '#F9FAFB' : '#1F2937',
                    height: multiline ? 80 : 50
                }
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
            keyboardType={keyboardType}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
            autoCorrect={false}
            autoCapitalize="none"
            spellCheck={false}
        />
    </View>
));

const MemoizedSectionCard = React.memo(({ title, icon, children, isDarkMode }) => (
    <View style={[styles.sectionCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.sectionHeader}>
            <Icon name={icon} size={24} color="#3B82F6" />
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                {title}
            </Text>
        </View>
        {children}
    </View>
));

const CompanySettingsScreenFixed = ({ navigation }) => {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [userToken, setUserToken] = useState('');
    const [userRole, setUserRole] = useState('');
    const [settings, setSettings] = useState({
        company_name: '',
        company_address: '',
        company_city: '',
        company_state: '',
        company_zip: '',
        company_phone: '',
        company_email: '',
        federal_ein: '',
        nj_tax_id: '',
        bank_name: '',
        routing_number: '',
        account_number: '',
        swift_code: ''
    });

    const API_BASE = 'https://wellnet-rd.com:444/api';

    useEffect(() => {
        loadUserData();
    }, []);

    useEffect(() => {
        if (userToken) {
            loadCompanySettings();
        }
    }, [userToken]);

    const loadUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            const loginData = jsonValue != null ? JSON.parse(jsonValue) : null;
            
            if (loginData && loginData.token) {
                setUserToken(loginData.token);
                setUserRole(loginData.nivel_usuario);
                
                // Check if user is super admin
                if (loginData.nivel_usuario !== 'SUPER ADMINISTRADOR' && loginData.nivel_usuario !== 'MEGA ADMINISTRADOR') {
                    Alert.alert('Error', 'No tienes permisos para acceder a esta sección');
                    navigation.goBack();
                }
            } else {
                Alert.alert('Error', 'No se encontraron datos de autenticación');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            Alert.alert('Error', 'Error al cargar datos del usuario');
        }
    };

    const loadCompanySettings = async () => {
        try {
            setLoading(true);
            console.log('📥 [SETTINGS] Cargando configuración de empresa...');
            
            const response = await fetch(`${API_BASE}/admin/company-settings`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('📥 [SETTINGS] Response status:', response.status);
            const data = await response.json();
            console.log('📥 [SETTINGS] Response data:', data);
            
            if (response.ok && data.success) {
                const company = data.data.company;
                console.log('✅ [SETTINGS] Datos cargados desde servidor:', company);
                setSettings({
                    company_name: company.name || '',
                    company_address: company.address || '',
                    company_city: company.city || '',
                    company_state: company.state || '',
                    company_zip: company.zip_code || '',
                    company_phone: company.phone || '',
                    company_email: company.email || '',
                    federal_ein: company.federal_ein || '',
                    nj_tax_id: company.nj_tax_id || '',
                    bank_name: company.banking_info?.bank_name || '',
                    routing_number: company.banking_info?.routing_number || '',
                    account_number: company.banking_info?.account_number || '',
                    swift_code: company.banking_info?.swift_code || ''
                });
            } else {
                console.error('❌ [SETTINGS] Error del servidor GET:', data.message);
                console.log('📋 [SETTINGS] Usando valores por defecto');
                // Set default values if API fails
                setSettings({
                    company_name: 'Well Technologies LLC',
                    company_address: '123 Business Park Drive, Suite 200',
                    company_city: 'Newark',
                    company_state: 'New Jersey',
                    company_zip: '07102',
                    company_phone: '+1 (973) 555-1200',
                    company_email: 'billing@welltechnologies.com',
                    federal_ein: '88-1234567',
                    nj_tax_id: 'NJ123456789',
                    bank_name: 'Chase Bank USA',
                    routing_number: '021000021',
                    account_number: '1234567890',
                    swift_code: 'CHASUS33'
                });
            }
        } catch (error) {
            console.error('Error fetching company settings:', error);
            console.log('📋 [SETTINGS] Error de conexión, usando valores por defecto');
            // Set default values if API fails
            setSettings({
                company_name: 'Well Technologies LLC',
                company_address: '123 Business Park Drive, Suite 200',
                company_city: 'Newark',
                company_state: 'New Jersey',
                company_zip: '07102',
                company_phone: '+1 (973) 555-1200',
                company_email: 'billing@welltechnologies.com',
                federal_ein: '88-1234567',
                nj_tax_id: 'NJ123456789',
                bank_name: 'Chase Bank USA',
                routing_number: '021000021',
                account_number: '1234567890',
                swift_code: 'CHASUS33'
            });
        } finally {
            setLoading(false);
        }
    };

    const saveCompanySettings = async () => {
        try {
            setSaving(true);
            console.log('💾 [SETTINGS] Guardando configuración de empresa...');
            
            const url = `${API_BASE}/admin/company-settings`;
            const payload = {
                // Campos con nombres que el backend espera
                name: settings.company_name,
                address: settings.company_address,
                city: settings.company_city,
                state: settings.company_state,
                zip_code: settings.company_zip,
                phone: settings.company_phone,
                email: settings.company_email,
                federal_ein: settings.federal_ein,
                nj_tax_id: settings.nj_tax_id,
                
                // Información bancaria
                banking_info: {
                    bank_name: settings.bank_name,
                    routing_number: settings.routing_number,
                    account_number: settings.account_number,
                    swift_code: settings.swift_code
                }
            };
            
            console.log('💾 [SETTINGS] URL:', url);
            console.log('💾 [SETTINGS] Método: PUT');
            console.log('💾 [SETTINGS] Headers: Content-Type: application/json');
            console.log('💾 [SETTINGS] Payload:', JSON.stringify(payload, null, 2));
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            console.log('💾 [SETTINGS] Response status:', response.status);
            console.log('💾 [SETTINGS] Response headers:', response.headers);
            
            const responseText = await response.text();
            console.log('💾 [SETTINGS] Response raw:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('💾 [SETTINGS] Response JSON:', data);
            } catch (jsonError) {
                console.error('❌ [SETTINGS] Response no es JSON válido:', jsonError);
                console.log('💾 [SETTINGS] Response text:', responseText);
                Alert.alert('Error', 'Respuesta del servidor no válida');
                return;
            }
            
            if (response.ok && data.success) {
                console.log('✅ [SETTINGS] Configuración guardada exitosamente');
                Alert.alert('Éxito', 'Configuración de la empresa actualizada exitosamente');
            } else {
                console.error('❌ [SETTINGS] Error del servidor:', data.message);
                Alert.alert('Error', data.message || 'Error al guardar la configuración');
            }
        } catch (error) {
            console.error('❌ [SETTINGS] Error de conexión:', error);
            Alert.alert('Error', 'Error al conectar con el servidor: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadCompanySettings();
        setRefreshing(false);
    };

    // Handlers optimizados con useCallback
    const updateField = useCallback((field, value) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            [field]: value
        }));
    }, []);

    // Crear handlers específicos para cada campo
    const handleCompanyNameChange = useCallback((text) => updateField('company_name', text), [updateField]);
    const handleCompanyAddressChange = useCallback((text) => updateField('company_address', text), [updateField]);
    const handleCompanyCityChange = useCallback((text) => updateField('company_city', text), [updateField]);
    const handleCompanyStateChange = useCallback((text) => updateField('company_state', text), [updateField]);
    const handleCompanyZipChange = useCallback((text) => updateField('company_zip', text), [updateField]);
    const handleCompanyPhoneChange = useCallback((text) => updateField('company_phone', text), [updateField]);
    const handleCompanyEmailChange = useCallback((text) => updateField('company_email', text), [updateField]);
    const handleFederalEinChange = useCallback((text) => updateField('federal_ein', text), [updateField]);
    const handleNjTaxIdChange = useCallback((text) => updateField('nj_tax_id', text), [updateField]);
    const handleBankNameChange = useCallback((text) => updateField('bank_name', text), [updateField]);
    const handleRoutingNumberChange = useCallback((text) => updateField('routing_number', text), [updateField]);
    const handleAccountNumberChange = useCallback((text) => updateField('account_number', text), [updateField]);
    const handleSwiftCodeChange = useCallback((text) => updateField('swift_code', text), [updateField]);


    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }]}>
                <View style={[styles.header, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Icon name="arrow_back" size={24} color={isDarkMode ? '#F9FAFB' : '#1F2937'} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                            Configuración de Empresa
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[styles.loadingText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        Cargando configuración...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow_back" size={24} color={isDarkMode ? '#F9FAFB' : '#1F2937'} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                        Configuración de Empresa
                    </Text>
                    <TouchableOpacity 
                        style={styles.saveButton}
                        onPress={saveCompanySettings}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Icon name="save" size={16} color="#FFFFFF" />
                        )}
                        <Text style={styles.saveButtonText}>
                            {saving ? 'Guardando...' : 'Guardar'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView 
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Company Information Section */}
                <MemoizedSectionCard title="Información de la Empresa" icon="business" isDarkMode={isDarkMode}>
                    <MemoizedTextInput
                        label="Nombre de la Empresa"
                        value={settings.company_name}
                        onChangeText={handleCompanyNameChange}
                        placeholder="Well Technologies LLC"
                        isDarkMode={isDarkMode}
                    />
                    <MemoizedTextInput
                        label="Dirección"
                        value={settings.company_address}
                        onChangeText={handleCompanyAddressChange}
                        placeholder="123 Business Park Drive, Suite 200"
                        multiline
                        isDarkMode={isDarkMode}
                    />
                    <MemoizedTextInput
                        label="Ciudad"
                        value={settings.company_city}
                        onChangeText={handleCompanyCityChange}
                        placeholder="Newark"
                        isDarkMode={isDarkMode}
                    />
                    <MemoizedTextInput
                        label="Estado"
                        value={settings.company_state}
                        onChangeText={handleCompanyStateChange}
                        placeholder="New Jersey"
                        isDarkMode={isDarkMode}
                    />
                    <MemoizedTextInput
                        label="Código Postal"
                        value={settings.company_zip}
                        onChangeText={handleCompanyZipChange}
                        placeholder="07102"
                        keyboardType="numeric"
                        isDarkMode={isDarkMode}
                    />
                </MemoizedSectionCard>

                {/* Contact Information Section */}
                <MemoizedSectionCard title="Información de Contacto" icon="contact_mail" isDarkMode={isDarkMode}>
                    <MemoizedTextInput
                        label="Teléfono"
                        value={settings.company_phone}
                        onChangeText={handleCompanyPhoneChange}
                        placeholder="+1 (973) 555-1200"
                        keyboardType="phone-pad"
                        isDarkMode={isDarkMode}
                    />
                    <MemoizedTextInput
                        label="Email"
                        value={settings.company_email}
                        onChangeText={handleCompanyEmailChange}
                        placeholder="billing@welltechnologies.com"
                        keyboardType="email-address"
                        isDarkMode={isDarkMode}
                    />
                </MemoizedSectionCard>

                {/* Tax Information Section */}
                <MemoizedSectionCard title="Información Fiscal" icon="account_balance" isDarkMode={isDarkMode}>
                    <MemoizedTextInput
                        label="EIN Federal"
                        value={settings.federal_ein}
                        onChangeText={handleFederalEinChange}
                        placeholder="88-1234567"
                        isDarkMode={isDarkMode}
                    />
                    <MemoizedTextInput
                        label="NJ Tax ID"
                        value={settings.nj_tax_id}
                        onChangeText={handleNjTaxIdChange}
                        placeholder="NJ123456789"
                        isDarkMode={isDarkMode}
                    />
                </MemoizedSectionCard>

                {/* Banking Information Section */}
                <MemoizedSectionCard title="Información Bancaria" icon="credit_card" isDarkMode={isDarkMode}>
                    <MemoizedTextInput
                        label="Nombre del Banco"
                        value={settings.bank_name}
                        onChangeText={handleBankNameChange}
                        placeholder="Chase Bank USA"
                        isDarkMode={isDarkMode}
                    />
                    <MemoizedTextInput
                        label="Routing Number"
                        value={settings.routing_number}
                        onChangeText={handleRoutingNumberChange}
                        placeholder="021000021"
                        keyboardType="numeric"
                        isDarkMode={isDarkMode}
                    />
                    <MemoizedTextInput
                        label="Account Number"
                        value={settings.account_number}
                        onChangeText={handleAccountNumberChange}
                        placeholder="1234567890"
                        keyboardType="numeric"
                        isDarkMode={isDarkMode}
                    />
                    <MemoizedTextInput
                        label="SWIFT Code"
                        value={settings.swift_code}
                        onChangeText={handleSwiftCodeChange}
                        placeholder="CHASUS33"
                        isDarkMode={isDarkMode}
                    />
                </MemoizedSectionCard>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
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
        flex: 1,
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#10B981',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionCard: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 12,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
});

export default CompanySettingsScreenFixed;