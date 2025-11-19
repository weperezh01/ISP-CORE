import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Switch } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from './AutorizarONUScreenStyles';

const ponTypes = ['GPON', 'EPON', 'XG-PON', 'XGS-PON'];
const modes = ['Routing', 'Bridging'];

const AutorizarONUScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { oltId } = route.params || {};
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    const [form, setForm] = useState({
        ponType: 'GPON',
        board: '',
        port: '',
        sn: '',
        onuType: '',
        customProfile: false,
        mode: 'Bridging',
        userVlan: '100',
        zone: '',
        odb: '',
        odbPort: '',
        download: '100M',
        upload: '100M',
        name: '',
        address: '',
        externalId: '',
        useGps: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = (key: string, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const validate = () => {
        if (!oltId) return 'Falta el ID de la OLT';
        if (!form.board) return 'Selecciona la board';
        if (!form.port) return 'Selecciona el puerto';
        if (!form.sn || form.sn.length < 8) return 'Ingresa el SN completo';
        if (!form.userVlan) return 'Ingresa la VLAN de usuario';
        return null;
    };

    const handleSubmit = async () => {
        const error = validate();
        if (error) {
            Alert.alert('Validación', error);
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                oltId,
                pon_type: form.ponType,
                board: form.board,
                port: form.port,
                sn: form.sn.trim(),
                onu_type: form.onuType,
                custom_profile: form.customProfile,
                mode: form.mode,
                user_vlan: form.userVlan,
                zone: form.zone,
                odb: form.odb,
                odb_port: form.odbPort,
                download_speed: form.download,
                upload_speed: form.upload,
                name: form.name,
                address: form.address,
                external_id: form.externalId || form.sn.trim(),
                use_gps: form.useGps,
            };

            // TODO: reemplazar por endpoint real de autorización
            console.log('➡️ Payload autorización ONU', payload);
            Alert.alert('Autorizar ONU', 'Petición enviada (simulada). Integra el endpoint real.');
        } catch (err) {
            console.error('Error al autorizar ONU', err);
            Alert.alert('Error', 'No se pudo enviar la autorización');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSelect = (label: string, value: string, options: string[], onChange: (v: string) => void) => (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.chipsContainer}>
                {options.map((opt) => (
                    <TouchableOpacity
                        key={opt}
                        style={[styles.chip, value === opt && styles.chipActive]}
                        onPress={() => onChange(opt)}
                        disabled={isSubmitting}
                    >
                        <Text style={[styles.chipText, value === opt && styles.chipTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderInput = (label: string, keyName: string, placeholder = '', keyboardType: any = 'default') => (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={String((form as any)[keyName] || '')}
                onChangeText={(text) => updateField(keyName, text)}
                placeholder={placeholder}
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                keyboardType={keyboardType}
                editable={!isSubmitting}
                autoCapitalize="characters"
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Autorizar ONU</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {renderSelect('PON Type', form.ponType, ponTypes, (v) => updateField('ponType', v))}

                <View style={styles.row}>
                    {renderInput('Board', 'board', 'Ej: 1', 'numeric')}
                    {renderInput('Puerto', 'port', 'Ej: 0', 'numeric')}
                </View>

                {renderInput('Serial (SN)', 'sn', 'HWTC439B989D')}
                {renderInput('ONU Type / Perfil', 'onuType', 'COMCAST1 / GENÉRICA')}

                <View style={styles.switchRow}>
                    <Text style={styles.label}>Usar perfil genérico</Text>
                    <Switch
                        value={form.customProfile}
                        onValueChange={(v) => updateField('customProfile', v)}
                        disabled={isSubmitting}
                    />
                </View>

                {renderSelect('Modo', form.mode, modes, (v) => updateField('mode', v))}
                {renderInput('VLAN de usuario', 'userVlan', '100', 'numeric')}

                <View style={styles.row}>
                    {renderInput('Zona', 'zone', '30 de Mayo')}
                    {renderInput('ODB / Splitter', 'odb', 'ODB-01')}
                </View>
                <View style={styles.row}>
                    {renderInput('Puerto ODB', 'odbPort', '1')}
                    {renderInput('Vel. Bajada', 'download', '1G')}
                </View>
                <View style={styles.row}>
                    {renderInput('Vel. Subida', 'upload', '1G')}
                    {renderInput('External ID', 'externalId', form.sn || 'ID externo')}
                </View>

                {renderInput('Nombre', 'name', 'Cliente / Referencia')}
                {renderInput('Dirección / Comentario', 'address', 'Dirección, notas...')}

                <View style={styles.switchRow}>
                    <Text style={styles.label}>Guardar GPS</Text>
                    <Switch
                        value={form.useGps}
                        onValueChange={(v) => updateField('useGps', v)}
                        disabled={isSubmitting}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    <Text style={styles.submitButtonText}>{isSubmitting ? 'Procesando…' : 'Autorizar ONU'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default AutorizarONUScreen;
