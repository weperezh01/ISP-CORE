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

const CompanySettingsScreen = ({ navigation }) => {
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
            const response = await fetch(`${API_BASE}/admin/company-settings`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                const company = data.data.company;
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
                console.error('Error loading company settings:', data.message);
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
            Alert.alert('Error', 'Error al cargar configuración de la empresa');
        } finally {
            setLoading(false);
        }
    };

    const saveCompanySettings = async () => {
        try {
            setSaving(true);
            const response = await fetch(`${API_BASE}/admin/company-settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: settings.company_name,
                    address: settings.company_address,
                    city: settings.company_city,
                    state: settings.company_state,
                    zip_code: settings.company_zip,
                    phone: settings.company_phone,
                    email: settings.company_email,
                    federal_ein: settings.federal_ein,
                    nj_tax_id: settings.nj_tax_id,
                    bank_name: settings.bank_name,
                    routing_number: settings.routing_number,
                    account_number: settings.account_number,
                    swift_code: settings.swift_code
                })
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                Alert.alert('Éxito', 'Configuración de la empresa actualizada exitosamente');
            } else {
                Alert.alert('Error', data.message || 'Error al guardar la configuración');
            }
        } catch (error) {
            console.error('Error saving company settings:', error);
            Alert.alert('Error', 'Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadCompanySettings();
        setRefreshing(false);
    };

    // Funciones de handler para evitar re-renders
    const handleCompanyNameChange = useCallback((text) => {
        setSettings(prev => ({ ...prev, company_name: text }));
    }, []);

    const handleCompanyAddressChange = useCallback((text) => {
        setSettings(prev => ({ ...prev, company_address: text }));
    }, []);

    const handleCompanyCityChange = useCallback((text) => {
        setSettings(prev => ({ ...prev, company_city: text }));
    }, []);

    const handleCompanyStateChange = useCallback((text) => {
        setSettings(prev => ({ ...prev, company_state: text }));
    }, []);

    const handleCompanyZipChange = useCallback((text) => {
        setSettings(prev => ({ ...prev, company_zip: text }));
    }, []);

    const handleCompanyPhoneChange = useCallback((text) => {
        setSettings(prev => ({ ...prev, company_phone: text }));
    }, []);

    const handleCompanyEmailChange = useCallback((text) => {
        setSettings(prev => ({ ...prev, company_email: text }));
    }, []);

    const handleFederalEinChange = useCallback((text) => {
        setSettings(prev => ({ ...prev, federal_ein: text }));
    }, []);

    const handleNjTaxIdChange = useCallback((text) => {
        setSettings(prev => ({ ...prev, nj_tax_id: text }));
    }, []);

    const handleBankNameChange = useCallback((text) => {
        setSettings(prev => ({ ...prev, bank_name: text }));
    }, []);

    const handleRoutingNumberChange = useCallback((text) => {
        setSettings(prev => ({ ...prev, routing_number: text }));
    }, []);

    const handleAccountNumberChange = useCallback((text) => {
        setSettings(prev => ({ ...prev, account_number: text }));
    }, []);

    const handleSwiftCodeChange = useCallback((text) => {
        setSettings(prev => ({ ...prev, swift_code: text }));
    }, []);

    const InputField = React.memo(({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }) => (
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

    const SectionCard = React.memo(({ title, icon, children }) => (
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

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
        },
        header: {
            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            paddingTop: 60,
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
            marginLeft: 8,
        },
        inputContainer: {
            marginBottom: 16,
        },
        inputLabel: {
            fontSize: 14,
            fontWeight: '500',
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
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
        },
    });

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Icon name="arrow_back" size={24} color={isDarkMode ? '#F9FAFB' : '#1F2937'} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Configuración de Empresa</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                    <Text style={styles.loadingText}>Cargando configuración...</Text>
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
                        <Icon name="arrow_back" size={24} color={isDarkMode ? '#F9FAFB' : '#1F2937'} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Configuración de Empresa</Text>
                    <TouchableOpacity 
                        style={styles.saveButton}
                        onPress={saveCompanySettings}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Icon name="save" size={16} color="#FFFFFF" />
                                <Text style={styles.saveButtonText}>Guardar</Text>
                            </>
                        )}
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
                {/* Company Information */}
                <SectionCard title="Información de la Empresa" icon="business">
                    <InputField
                        label="Nombre de la Empresa"
                        value={settings.company_name}
                        onChangeText={handleCompanyNameChange}
                        placeholder="Well Technologies LLC"
                    />
                    <InputField
                        label="Dirección"
                        value={settings.company_address}
                        onChangeText={handleCompanyAddressChange}
                        placeholder="123 Business Park Drive, Suite 200"
                        multiline
                    />
                    <InputField
                        label="Ciudad"
                        value={settings.company_city}
                        onChangeText={handleCompanyCityChange}
                        placeholder="Newark"
                    />
                    <InputField
                        label="Estado"
                        value={settings.company_state}
                        onChangeText={handleCompanyStateChange}
                        placeholder="New Jersey"
                    />
                    <InputField
                        label="Código Postal"
                        value={settings.company_zip}
                        onChangeText={handleCompanyZipChange}
                        placeholder="07102"
                        keyboardType="numeric"
                    />
                </SectionCard>

                {/* Contact Information */}
                <SectionCard title="Información de Contacto" icon="contact_phone">
                    <InputField
                        label="Teléfono"
                        value={settings.company_phone}
                        onChangeText={handleCompanyPhoneChange}
                        placeholder="+1 (973) 555-1200"
                        keyboardType="phone-pad"
                    />
                    <InputField
                        label="Email"
                        value={settings.company_email}
                        onChangeText={handleCompanyEmailChange}
                        placeholder="billing@welltechnologies.com"
                        keyboardType="email-address"
                    />
                </SectionCard>

                {/* Tax Information */}
                <SectionCard title="Información Fiscal" icon="account_balance">
                    <InputField
                        label="EIN Federal"
                        value={settings.federal_ein}
                        onChangeText={handleFederalEinChange}
                        placeholder="88-1234567"
                    />
                    <InputField
                        label="NJ Tax ID"
                        value={settings.nj_tax_id}
                        onChangeText={handleNjTaxIdChange}
                        placeholder="NJ123456789"
                    />
                </SectionCard>

                {/* Banking Information */}
                <SectionCard title="Información Bancaria" icon="account_balance_wallet">
                    <InputField
                        label="Nombre del Banco"
                        value={settings.bank_name}
                        onChangeText={handleBankNameChange}
                        placeholder="Chase Bank USA"
                    />
                    <InputField
                        label="Routing Number"
                        value={settings.routing_number}
                        onChangeText={handleRoutingNumberChange}
                        placeholder="021000021"
                        keyboardType="numeric"
                    />
                    <InputField
                        label="Account Number"
                        value={settings.account_number}
                        onChangeText={handleAccountNumberChange}
                        placeholder="1234567890"
                        keyboardType="numeric"
                    />
                    <InputField
                        label="SWIFT Code"
                        value={settings.swift_code}
                        onChangeText={handleSwiftCodeChange}
                        placeholder="CHASUS33"
                    />
                </SectionCard>
            </ScrollView>
        </View>
    );
};

export default CompanySettingsScreen;