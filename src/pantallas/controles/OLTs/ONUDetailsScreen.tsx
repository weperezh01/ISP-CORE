import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, RefreshControl, Modal, TextInput } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from './ONUDetailsScreenStyles';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../../componentes/themeSwitch';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AuthorizationFormTR069, { AuthorizationFormValues } from './components/AuthorizationFormTR069';
import {
    authorizeOnu,
    deauthorizeOnu,
    getVlansCatalog,
    getZonesCatalog,
    getOdbsCatalog,
    getOdbPortsCatalog,
    getSpeedProfilesCatalog,
    getOnuTypesCatalog,
    getOnuStatus,
    getOnuRunningConfig,
    getOnuSwInfo,
    getOnuTr069Status,
    getOnuLiveStream,
    rebootOnuTr069,
    resyncOnuConfig,
    factoryResetOnu,
    disableOnu,
} from './services/api';
import {
    VlanCatalog,
    ZoneCatalog,
    OdbCatalog,
    OdbPortCatalog,
    SpeedProfileCatalog,
    OnuTypeCatalog,
} from './services/types';

const ONUDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const routeParams = route.params || {};
    const { onuId, oltId, id_usuario } = routeParams;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    const previewData = routeParams.onuPreview || null;
    const autoOpenAuthModalRequested = routeParams.autoOpenAuthModal === true;
    const [portHint] = useState(routeParams.puerto || previewData?.puerto || null);
    const [ontIdHint] = useState(
        routeParams.ont_id ??
        routeParams.ontId ??
        previewData?.ont_id ??
        previewData?.ontId ??
        null
    );

    // State variables
    const [onu, setOnu] = useState(previewData || null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(
        previewData?.timestamp ? new Date(previewData.timestamp) : null
    );
    const [usuarioId, setUsuarioId] = useState(id_usuario || null);
    const [authToken, setAuthToken] = useState(null);
    const [isCached, setIsCached] = useState(false);
    const [dataSource, setDataSource] = useState('');
    const [consistencyCheck, setConsistencyCheck] = useState('');
    const hasLoadedOnce = useRef(false);
    const autoOpenAuthModalTriggered = useRef(false);

    // Authorization modal states
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isAuthorizing, setIsAuthorizing] = useState(false);
    const [isDeauthorizing, setIsDeauthorizing] = useState(false);
    const [authFormValues, setAuthFormValues] = useState<Partial<AuthorizationFormValues>>({});
    const [availableOntIds, setAvailableOntIds] = useState<number[]>([]);
    const [isLoadingIds, setIsLoadingIds] = useState(false);
    const [nextSuggestedId, setNextSuggestedId] = useState<number | null>(null);

    // Catalog states
    const [vlans, setVlans] = useState<VlanCatalog[]>([]);
    const [zones, setZones] = useState<ZoneCatalog[]>([]);
    const [odbs, setOdbs] = useState<OdbCatalog[]>([]);
    const [speedProfiles, setSpeedProfiles] = useState<SpeedProfileCatalog[]>([]);
    const [onuTypes, setOnuTypes] = useState<OnuTypeCatalog[]>([]);
    const [odbPorts, setOdbPorts] = useState<OdbPortCatalog[]>([]);
    const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false);

    // Fallback data when backend is not available
    const fallbackVlans: VlanCatalog[] = [
        { vlan_id: 100, name: 'vlan-clientes', comment: 'Clientes residenciales', display: 'VLAN 100 (vlan-clientes)' },
        { vlan_id: 200, name: 'vlan-empresas', comment: 'Clientes empresariales', display: 'VLAN 200 (vlan-empresas)' },
    ];

    const fallbackZones: ZoneCatalog[] = [
        { id: 281, nombre: '30 de Mayo' },
        { id: 211, nombre: 'Agua Fría' },
        { id: 635, nombre: 'Villa Mella' },
        { id: 150, nombre: 'Los Alcarrizos' },
        { id: 420, nombre: 'Santo Domingo Este' },
    ];

    const fallbackSpeedProfiles: SpeedProfileCatalog[] = [
        { id: 1, name: '10M', download_mbps: 10, upload_mbps: 10, download_speed: '10M', upload_speed: '10M' },
        { id: 2, name: '20M', download_mbps: 20, upload_mbps: 20, download_speed: '20M', upload_speed: '20M' },
        { id: 3, name: '50M', download_mbps: 50, upload_mbps: 50, download_speed: '50M', upload_speed: '50M' },
        { id: 4, name: '100M', download_mbps: 100, upload_mbps: 100, download_speed: '100M', upload_speed: '100M' },
        { id: 5, name: '200M', download_mbps: 200, upload_mbps: 200, download_speed: '200M', upload_speed: '200M' },
        { id: 6, name: '500M', download_mbps: 500, upload_mbps: 500, download_speed: '500M', upload_speed: '500M' },
        { id: 7, name: '1G', download_mbps: 1000, upload_mbps: 1000, download_speed: '1G', upload_speed: '1G' },
    ];

    const fallbackOnuTypes: OnuTypeCatalog[] = [
        { value: 'HG8546M', label: 'Huawei HG8546M', vendor: 'HUAWEI', compatible_with: ['HUAWEI', 'ZTE'] },
        { value: 'HG8310M', label: 'Huawei HG8310M', vendor: 'HUAWEI', compatible_with: ['HUAWEI'] },
        { value: 'HG8245H', label: 'Huawei HG8245H', vendor: 'HUAWEI', compatible_with: ['HUAWEI'] },
        { value: 'F660', label: 'ZTE F660', vendor: 'ZTE', compatible_with: ['ZTE'] },
        { value: 'F601', label: 'ZTE F601', vendor: 'ZTE', compatible_with: ['ZTE'] },
        { value: 'COMCAST1', label: 'COMCAST1', vendor: 'OTHER', compatible_with: ['HUAWEI', 'ZTE'] },
    ];

    // Get user data from storage
    const obtenerDatosUsuario = useCallback(async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            if (jsonValue != null) {
                const userData = JSON.parse(jsonValue);
                setUsuarioId(userData.id);
                setAuthToken(userData.token);
            }
        } catch (e) {
            console.error('Error al leer el token del usuario', e);
        }
    }, []);

    // Fetch ONU details
    const fetchOnuDetails = useCallback(async (forceRefresh = false) => {
        console.log('🔍 [ONU Details] Fetching ONU details for ID:', onuId);

        if (!onuId) {
            setError('ID de ONU no proporcionado');
            setIsLoading(false);
            return;
        }

        if (!oltId) {
            setError('ID de OLT no proporcionado');
            setIsLoading(false);
            return;
        }

        if (!authToken) {
            console.log('⚠️ [ONU Details] No auth token available yet');
            return;
        }

        try {
            if (forceRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            const queryParams = [];
            if (portHint) {
                queryParams.push(`puerto=${encodeURIComponent(portHint)}`);
            }
            if (ontIdHint !== null && ontIdHint !== undefined && ontIdHint !== '') {
                queryParams.push(`ont_id=${encodeURIComponent(ontIdHint)}`);
            }

            const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
            const endpoint = `https://wellnet-rd.com:444/api/olts/realtime/${oltId}/onus/${onuId}${queryString}`;

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ [ONU Details] Data received:', data);

            // Handle response structure
            let onuData = null;
            if (data && data.success && data.data && data.data.onu) {
                onuData = data.data.onu;
                setIsCached(data.cached || false);
                setDataSource(data.source || data.data.source || '');
                setConsistencyCheck(data.consistency_check || data.data.consistency_check || '');
            } else if (data && data.data && data.data.onu) {
                onuData = data.data.onu;
            } else if (data && data.onu) {
                onuData = data.onu;
            } else if (data) {
                onuData = data;
            }

            setOnu(onuData);
            const apiTimestamp = data?.timestamp || onuData?.timestamp;
            setLastUpdate(apiTimestamp ? new Date(apiTimestamp) : new Date());
            hasLoadedOnce.current = true;

        } catch (error) {
            console.error('❌ [ONU Details] Error:', error);
            setError(error.message || 'Error desconocido al consultar la ONU');
            Alert.alert('Error', 'No se pudieron cargar los detalles de la ONU');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [onuId, oltId, authToken, portHint, ontIdHint]);

    // Initial load
    useEffect(() => {
        obtenerDatosUsuario();
    }, [obtenerDatosUsuario]);

    useEffect(() => {
        if (authToken) {
            fetchOnuDetails();
        }
    }, [authToken, fetchOnuDetails]);

    useEffect(() => {
        if (autoOpenAuthModalRequested && onu && !autoOpenAuthModalTriggered.current) {
            autoOpenAuthModalTriggered.current = true;
            const timeoutId = setTimeout(() => setShowAuthModal(true), 150);
            return () => clearTimeout(timeoutId);
        }
        return undefined;
    }, [autoOpenAuthModalRequested, onu]);

    // Refresh on focus
    useFocusEffect(
        useCallback(() => {
            if (authToken && hasLoadedOnce.current) {
                // Soft refresh when coming back to screen
                fetchOnuDetails(true);
            }
            return () => {};
        }, [authToken, fetchOnuDetails])
    );

    // Handle manual refresh
    const handleRefresh = useCallback(() => {
        fetchOnuDetails(true);
    }, [fetchOnuDetails]);

    // Load all catalogs for authorization form
    const loadCatalogs = useCallback(async () => {
        if (!authToken || !oltId) {
            console.log('⚠️ [Catalogs] Missing auth token or oltId');
            return;
        }

        console.log('📋 [Catalogs] Loading authorization catalogs...');
        setIsLoadingCatalogs(true);

        try {
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 10000)
            );

            const results = await Promise.race([
                Promise.all([
                    getVlansCatalog(authToken).catch(err => ({ success: false, error: err.message })),
                    getZonesCatalog(authToken).catch(err => ({ success: false, error: err.message })),
                    getOdbsCatalog(authToken).catch(err => ({ success: false, error: err.message })),
                    getSpeedProfilesCatalog(authToken).catch(err => ({ success: false, error: err.message })),
                    getOnuTypesCatalog(oltId, authToken).catch(err => ({ success: false, error: err.message })),
                ]),
                timeout
            ]);

            const [vlansRes, zonesRes, odbsRes, speedsRes, typesRes] = results as any[];

            if (vlansRes.success && vlansRes.data) {
                setVlans(vlansRes.data);
            } else {
                setVlans(fallbackVlans);
            }

            if (zonesRes.success && zonesRes.data) {
                setZones(zonesRes.data);
            } else {
                setZones(fallbackZones);
            }

            if (odbsRes.success && odbsRes.data) {
                setOdbs(odbsRes.data);
            } else {
                setOdbs([]);
            }

            if (speedsRes.success && speedsRes.data) {
                setSpeedProfiles(speedsRes.data);
            } else {
                setSpeedProfiles(fallbackSpeedProfiles);
            }

            if (typesRes.success && typesRes.data) {
                setOnuTypes(typesRes.data);
            } else {
                setOnuTypes(fallbackOnuTypes);
            }

        } catch (error: any) {
            console.error('❌ [Catalogs] Error loading catalogs:', error);
            setVlans(fallbackVlans);
            setZones(fallbackZones);
            setSpeedProfiles(fallbackSpeedProfiles);
            setOnuTypes(fallbackOnuTypes);
            setOdbs([]);
        } finally {
            setIsLoadingCatalogs(false);
        }
    }, [authToken, oltId]);

    // Load ODB ports when splitter changes
    const handleLoadOdbPorts = useCallback(async (odbId: string) => {
        if (!authToken || !odbId) return;

        try {
            const result = await getOdbPortsCatalog(authToken, odbId, 16);
            if (result.success && result.data) {
                setOdbPorts(result.data);
            } else {
                setOdbPorts([]);
            }
        } catch (error) {
            setOdbPorts([]);
        }
    }, [authToken]);

    // Memoizar initialValues para evitar loops infinitos
    const authFormInitialValues = useMemo(() => {
        let boardValue = '';
        let portValue = '';

        if (onu?.puerto) {
            const parts = String(onu.puerto).split('/');
            if (parts.length === 3) {
                boardValue = parts[1];
                portValue = parts[2];
            }
        }

        return {
            board: String(previewData?.board || boardValue || onu?.board || ''),
            port: String(previewData?.port || portValue || onu?.port || ''),
        };
    }, [previewData?.board, previewData?.port, onu?.board, onu?.port, onu?.puerto]);

    // Memoizar onChange callback para evitar loops infinitos
    const handleAuthFormChange = useCallback((values: AuthorizationFormValues) => {
        setAuthFormValues(values);
    }, []);

    // Load catalogs when modal opens
    useEffect(() => {
        if (showAuthModal && authToken && oltId) {
            loadCatalogs();
        }
    }, [showAuthModal, authToken, oltId, loadCatalogs]);

    // Handle ONU authorization
    const handleAuthorizeOnu = useCallback(async () => {
        if (!authToken || !onu || !authFormValues) return;

        if (!authFormValues.onu_type || !authFormValues.user_vlan_id || !authFormValues.zona ||
            !authFormValues.download_speed || !authFormValues.upload_speed || !authFormValues.name ||
            !authFormValues.board || !authFormValues.port) {
            Alert.alert('Error', 'Por favor complete todos los campos requeridos (*)');
            return;
        }

        const puerto = `0/${authFormValues.board}/${authFormValues.port}`;
        const zonaNombre = authFormValues.zona_nombre || authFormValues.zona;

        Alert.alert(
            'Confirmar Autorización',
            `¿Está seguro que desea autorizar esta ONU?\n\n` +
            `Serial: ${onu.serial || onuId}\n` +
            `Puerto PON: ${puerto}\n` +
            `Tipo: ${authFormValues.onu_type}\n` +
            `VLAN: ${authFormValues.user_vlan_id}\n` +
            `Zona: ${zonaNombre}\n` +
            `Velocidad: ${authFormValues.download_speed}/${authFormValues.upload_speed}\n` +
            `Nombre: ${authFormValues.name}`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Autorizar',
                    onPress: async () => {
                        setIsAuthorizing(true);
                        try {
                            const serial = onu.serial || onu.index || onuId;

                            const speedToMbps = (speed: string): number => {
                                const match = speed.match(/^(\d+(?:\.\d+)?)(M|G)$/i);
                                if (!match) return 0;
                                const value = parseFloat(match[1]);
                                const unit = match[2].toUpperCase();
                                return unit === 'G' ? value * 1000 : value;
                            };

                            const downloadMbps = speedToMbps(authFormValues.download_speed!);
                            const uploadMbps = speedToMbps(authFormValues.upload_speed!);
                            const zonaId = authFormValues.zona!.replace(/^[A-Z]+/i, '');

                            const payloadRaw = {
                                // Identificación
                                sn: serial,
                                onu_external_id: serial,

                                // Puerto PON
                                puerto: puerto,
                                board: parseInt(authFormValues.board!),
                                port: parseInt(authFormValues.port!),
                                ont_id: 0,

                                // Tipo y Modo
                                onu_type: authFormValues.onu_type!,
                                onu_mode: 'Routing',
                                pon_type: 'GPON',
                                gpon_channel: 'GPON',

                                // VLAN
                                user_vlan_id: parseInt(authFormValues.user_vlan_id!),

                                // Velocidades
                                download_speed: authFormValues.download_speed!,
                                upload_speed: authFormValues.upload_speed!,
                                download_mbps: downloadMbps,
                                upload_mbps: uploadMbps,

                                // Ubicación
                                zona: zonaId,
                                zona_nombre: zonaNombre,
                                name: authFormValues.name!,
                                address_comment: authFormValues.address_comment || undefined,

                                // ODB (Splitter)
                                odb_splitter: authFormValues.odb_splitter || undefined,
                                odb_port: authFormValues.odb_port || undefined,

                                // GPS (opcional)
                                use_gps: authFormValues.use_gps || false,
                                gps_latitude: authFormValues.gps_latitude || undefined,
                                gps_longitude: authFormValues.gps_longitude || undefined,
                            };

                            const payload = Object.fromEntries(
                                Object.entries(payloadRaw).filter(([_, value]) => value !== undefined)
                            );

                            console.log('📤 [Authorization] Sending payload:', payload);
                            const response = await authorizeOnu(oltId, serial, payload, authToken);

                            if (response.success) {
                                Alert.alert(
                                    'Éxito',
                                    'ONU autorizada correctamente',
                                    [{
                                        text: 'OK',
                                        onPress: () => {
                                            setShowAuthModal(false);
                                            setTimeout(() => fetchOnuDetails(true), 3000);
                                        }
                                    }]
                                );
                            } else {
                                throw new Error(response.error || 'Error desconocido');
                            }
                        } catch (error: any) {
                            console.error('❌ [Authorization] Exception:', error);
                            Alert.alert('Error', `No se pudo autorizar la ONU: ${error.message}`);
                        } finally {
                            setIsAuthorizing(false);
                        }
                    }
                }
            ]
        );
    }, [authToken, onu, authFormValues, oltId, onuId, fetchOnuDetails]);

    // Action handlers for ONU operations
    const handleReboot = useCallback(() => {
        if (!authToken || !oltId || !onu?.serial) {
            Alert.alert('Error', 'Faltan datos necesarios para esta operación');
            return;
        }

        Alert.alert(
            'Reiniciar ONU',
            `¿Está seguro que desea reiniciar esta ONU?\n\nSerial: ${onu?.serial || onuId}\n\nLa ONU estará fuera de servicio por aproximadamente 60 segundos.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Reiniciar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('🔄 [Reboot] Reiniciando ONU:', onu.serial);
                            const response = await rebootOnuTr069(
                                oltId,
                                onu.serial,
                                authToken
                            );

                            if (response.success) {
                                Alert.alert(
                                    'Éxito',
                                    'Comando de reinicio enviado a la ONU.\n\nLa ONU se reiniciará en unos momentos.',
                                    [{
                                        text: 'OK',
                                        onPress: () => {
                                            // Refrescar después de 5 segundos
                                            setTimeout(() => fetchOnuDetails(true), 5000);
                                        }
                                    }]
                                );
                            } else {
                                throw new Error(response.error || 'Error desconocido');
                            }
                        } catch (error: any) {
                            console.error('❌ [Reboot] Error:', error);
                            Alert.alert('Error', `No se pudo reiniciar la ONU: ${error.message}`);
                        }
                    }
                }
            ]
        );
    }, [authToken, onu, onuId, oltId, fetchOnuDetails]);

    const handleResyncConfig = useCallback(() => {
        if (!authToken || !oltId || !onu?.serial) {
            Alert.alert('Error', 'Faltan datos necesarios para esta operación');
            return;
        }

        Alert.alert(
            'Resincronizar Configuración',
            `¿Desea resincronizar la configuración de esta ONU?\n\nSerial: ${onu?.serial || onuId}\n\nEsto forzará una actualización de la configuración desde la OLT.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Resincronizar',
                    onPress: async () => {
                        try {
                            console.log('🔄 [Resync] Resincronizando configuración:', onu.serial);
                            const response = await resyncOnuConfig(
                                oltId,
                                onu.serial,
                                authToken
                            );

                            if (response.success) {
                                Alert.alert(
                                    'Éxito',
                                    'Configuración resincronizada correctamente',
                                    [{
                                        text: 'OK',
                                        onPress: () => fetchOnuDetails(true)
                                    }]
                                );
                            } else {
                                throw new Error(response.error || 'Error desconocido');
                            }
                        } catch (error: any) {
                            console.error('❌ [Resync] Error:', error);
                            Alert.alert('Error', `No se pudo resincronizar: ${error.message}`);
                        }
                    }
                }
            ]
        );
    }, [authToken, onu, onuId, oltId, fetchOnuDetails]);

    const handleRestoreDefaults = useCallback(() => {
        if (!authToken || !oltId || !onu?.serial) {
            Alert.alert('Error', 'Faltan datos necesarios para esta operación');
            return;
        }

        Alert.alert(
            'Restaurar Valores Predeterminados',
            `⚠️ ADVERTENCIA: Esta acción restaurará la ONU a su configuración de fábrica.\n\nSerial: ${onu?.serial || onuId}\n\n• Se perderán TODAS las configuraciones personalizadas\n• WiFi, DHCP, y otras configuraciones se resetearán\n• La ONU estará fuera de servicio por aproximadamente 120 segundos\n\n¿Está COMPLETAMENTE seguro que desea continuar?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Restaurar',
                    style: 'destructive',
                    onPress: async () => {
                        // Segunda confirmación
                        Alert.alert(
                            'Confirmación Final',
                            '⚠️ Última advertencia: Esta acción NO se puede deshacer.\n\n¿Proceder con el factory reset?',
                            [
                                { text: 'No, Cancelar', style: 'cancel' },
                                {
                                    text: 'Sí, Restaurar',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            console.log('⚠️ [Factory Reset] Restaurando ONU:', onu.serial);
                                            const response = await factoryResetOnu(
                                                oltId,
                                                onu.serial,
                                                authToken,
                                                true // confirm
                                            );

                                            if (response.success) {
                                                Alert.alert(
                                                    'Éxito',
                                                    'Valores predeterminados restaurados.\n\nLa ONU se reiniciará con configuración de fábrica.',
                                                    [{
                                                        text: 'OK',
                                                        onPress: () => {
                                                            // Refrescar después de 10 segundos
                                                            setTimeout(() => fetchOnuDetails(true), 10000);
                                                        }
                                                    }]
                                                );
                                            } else {
                                                throw new Error(response.error || 'Error desconocido');
                                            }
                                        } catch (error: any) {
                                            console.error('❌ [Factory Reset] Error:', error);
                                            Alert.alert('Error', `No se pudo restaurar: ${error.message}`);
                                        }
                                    }
                                }
                            ]
                        );
                    }
                }
            ]
        );
    }, [authToken, onu, onuId, oltId, fetchOnuDetails]);

    const handleDisableOnu = useCallback(() => {
        if (!authToken || !oltId || !onu?.serial) {
            Alert.alert('Error', 'Faltan datos necesarios para esta operación');
            return;
        }

        Alert.alert(
            'Deshabilitar ONU',
            `⚠️ Esta acción deshabilitará la ONU temporalmente.\n\nSerial: ${onu?.serial || onuId}\n\n• El cliente perderá servicio de internet\n• La ONU permanecerá autorizada pero inactiva\n• Puedes volver a habilitarla cuando lo necesites\n\n¿Está seguro que desea continuar?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Deshabilitar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('⚠️ [Disable] Deshabilitando ONU:', onu.serial);
                            const response = await disableOnu(
                                oltId,
                                onu.serial,
                                authToken
                            );

                            if (response.success) {
                                Alert.alert(
                                    'Éxito',
                                    `ONU deshabilitada correctamente.\n\nEstado anterior: ${response.data?.previous_state || 'N/A'}\nNuevo estado: ${response.data?.new_state || 'disabled'}`,
                                    [{
                                        text: 'OK',
                                        onPress: () => fetchOnuDetails(true)
                                    }]
                                );
                            } else {
                                throw new Error(response.error || 'Error desconocido');
                            }
                        } catch (error: any) {
                            console.error('❌ [Disable] Error:', error);
                            Alert.alert('Error', `No se pudo deshabilitar: ${error.message}`);
                        }
                    }
                }
            ]
        );
    }, [authToken, onu, onuId, oltId, fetchOnuDetails]);

    const handleDeleteOnu = useCallback(() => {
        const puerto = onu?.puerto || portHint;
        const ontId = onu?.ont_id ?? ontIdHint ?? 0;

        Alert.alert(
            'Desautorizar ONU',
            `⚠️ Esta acción desautorizará la ONU de la OLT.\n\nSerial: ${onu?.serial || onuId}\nPuerto: ${puerto || 'N/A'}\nONT ID: ${ontId}\n\nNota: Si la ONU permanece conectada físicamente, volverá a aparecer como "Pendiente de Autorización".\n\n¿Desea continuar?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Desautorizar',
                    style: 'destructive',
                    onPress: async () => {
                        // Validaciones antes de mostrar el modal
                        if (!authToken || !oltId) {
                            Alert.alert('Error', 'Faltan datos de autenticación u OLT ID');
                            return;
                        }

                        if (!puerto) {
                            Alert.alert('Error', 'No se encontró el puerto de la ONU');
                            return;
                        }

                        console.log('🔄 [Deauthorize] Mostrando modal de progreso...');
                        setIsDeauthorizing(true);
                        try {
                            const serial = onu?.serial || onuId;

                            console.log('🗑️ [Deauthorize] Desautorizando ONU:', {
                                oltId,
                                serial,
                                puerto,
                                ontId: Number(ontId)
                            });

                            const response = await deauthorizeOnu(
                                oltId,
                                serial,
                                puerto,
                                Number(ontId),
                                authToken
                            );

                            if (response.success) {
                                Alert.alert(
                                    'Éxito',
                                    'ONU desautorizada correctamente.\n\nSi la ONU sigue conectada físicamente, aparecerá nuevamente en la lista de ONUs pendientes.',
                                    [{
                                        text: 'OK',
                                        onPress: () => navigation.goBack()
                                    }]
                                );
                            } else {
                                throw new Error(response.error || 'Error desconocido al desautorizar');
                            }
                        } catch (error: any) {
                            console.error('❌ [Deauthorize] Error:', error);
                            Alert.alert('Error', `No se pudo desautorizar la ONU: ${error.message}`);
                        } finally {
                            console.log('🔄 [Deauthorize] Ocultando modal de progreso...');
                            setIsDeauthorizing(false);
                        }
                    }
                }
            ]
        );
    }, [authToken, onu, onuId, oltId, navigation, portHint, ontIdHint]);

    // Technical/Diagnostic action handlers
    const handleGetStatus = useCallback(async () => {
        if (!authToken) return;

        Alert.alert('Obteniendo estado', 'Por favor espere...');
        try {
            const response = await getOnuStatus(onuId, authToken);
            if (response.success) {
                Alert.alert('Estado de ONU', JSON.stringify(response.data, null, 2));
            } else {
                Alert.alert('Error', response.error || 'No se pudo obtener el estado');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    }, [authToken, onuId]);

    const handleShowRunningConfig = useCallback(async () => {
        if (!authToken) return;

        Alert.alert('Obteniendo configuración', 'Por favor espere...');
        try {
            const response = await getOnuRunningConfig(onuId, authToken);
            if (response.success) {
                Alert.alert('Running Config', response.data?.config || 'No disponible');
            } else {
                Alert.alert('Error', response.error || 'No se pudo obtener la configuración');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    }, [authToken, onuId]);

    const handleGetSwInfo = useCallback(async () => {
        if (!authToken) return;

        Alert.alert('Obteniendo información de software', 'Por favor espere...');
        try {
            const response = await getOnuSwInfo(onuId, authToken);
            if (response.success) {
                Alert.alert('SW Info', JSON.stringify(response.data, null, 2));
            } else {
                Alert.alert('Error', response.error || 'No se pudo obtener la información');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    }, [authToken, onuId]);

    const handleGetTr069Stats = useCallback(() => {
        navigation.navigate('TR069StatsScreen', {
            onuId: onuId,
            onuSerial: onu?.serial || onuId,
            oltId: oltId,
            // Datos adicionales para contexto TR-069
            macAddress: onu?.mac_address,
            puerto: onu?.puerto || portHint,
            ontId: onu?.ont_id ?? ontIdHint,
            vlan: onu?.vlan,
            modelo: onu?.modelo,
            clienteNombre: onu?.cliente_nombre,
            clienteDireccion: onu?.cliente_direccion,
            planServicio: onu?.plan_servicio,
            velocidadBajada: onu?.velocidad_bajada,
            velocidadSubida: onu?.velocidad_subida,
        });
    }, [navigation, onuId, onu, oltId, portHint, ontIdHint]);

    const handleLiveStream = useCallback(async () => {
        if (!authToken) return;

        Alert.alert('Iniciando LIVE', 'Conectando al stream en tiempo real...');
        try {
            const response = await getOnuLiveStream(onuId, authToken);
            if (response.success) {
                Alert.alert('LIVE Stream', 'Stream iniciado correctamente');
            } else {
                Alert.alert('Error', response.error || 'No se pudo iniciar el stream');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    }, [authToken, onuId]);

    // Get status info for display
    const getStatusInfo = (status) => {
        const statusStr = String(status || '').toLowerCase();
        switch (statusStr) {
            case 'online':
            case 'active':
            case 'authorized':
            case 'autorizada':
                return {
                    badge: styles.statusOnline,
                    icon: 'check-circle',
                    iconColor: '#10B981',
                    label: 'En Línea'
                };
            case 'offline':
            case 'inactive':
            case 'desconectada':
                return {
                    badge: styles.statusOffline,
                    icon: 'close-circle',
                    iconColor: '#EF4444',
                    label: 'Desconectada'
                };
            case 'pending':
            case 'discovered':
            case 'pendiente':
                return {
                    badge: styles.statusPending,
                    icon: 'clock-outline',
                    iconColor: '#F59E0B',
                    label: 'Pendiente'
                };
            default:
                return {
                    badge: styles.statusUnknown,
                    icon: 'help-circle',
                    iconColor: '#9CA3AF',
                    label: 'Desconocido'
                };
        }
    };

    // Get signal strength indicator
    const getSignalStrength = (rxPower) => {
        const power = parseFloat(rxPower || 0);
        if (!Number.isFinite(power)) {
            return { color: '#6B7280', label: 'Sin datos', icon: 'signal-cellular-outline' };
        }
        if (power >= -15) {
            return { color: '#10B981', label: 'Excelente', icon: 'signal-cellular-3' };
        } else if (power >= -20) {
            return { color: '#3B82F6', label: 'Buena', icon: 'signal-cellular-2' };
        } else if (power >= -25) {
            return { color: '#F59E0B', label: 'Regular', icon: 'signal-cellular-1' };
        }
        return { color: '#EF4444', label: 'Débil', icon: 'signal-cellular-outline' };
    };

    const getPaymentStatusInfo = (status) => {
        if (!status) return null;
        const normalized = String(status).trim().toLowerCase();

        if (['al dia', 'al día', 'aldia', 'pagado', 'al corriente'].includes(normalized)) {
            return { label: 'Al día', badgeStyle: styles.paymentStatusBadgePaid };
        }

        if (['moroso', 'atrasado', 'late'].includes(normalized)) {
            return { label: 'Moroso', badgeStyle: styles.paymentStatusBadgeLate };
        }

        if (['suspendido', 'suspendida', 'suspendido por pago'].includes(normalized)) {
            return { label: 'Suspendido', badgeStyle: styles.paymentStatusBadgeSuspended };
        }

        return { label: String(status), badgeStyle: styles.paymentStatusBadgeUnknown };
    };

    const formatCurrency = (value) => {
        if (value === null || value === undefined || value === '') return 'N/A';
        const numeric = Number(value);
        if (!Number.isNaN(numeric)) {
            const formatted = numeric
                .toFixed(2)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return `RD$ ${formatted}`;
        }
        return String(value);
    };

    const formatPercentage = (value) => {
        if (value === null || value === undefined || value === '') return 'N/A';
        if (typeof value === 'string' && value.includes('%')) {
            return value;
        }
        const numeric = Number(value);
        if (Number.isNaN(numeric)) {
            return String(value);
        }
        if (Number.isInteger(numeric)) {
            return `${numeric}%`;
        }
        return `${numeric.toFixed(2)}%`;
    };

    const formatSnrValue = (value) => {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        const normalized = String(value);
        return normalized.toLowerCase().includes('db') ? normalized : `${normalized} dB`;
    };

    const parseDateTimeValue = (value) => {
        if (!value && value !== 0) return null;
        const trimmed = String(value).trim();
        if (!trimmed) return null;

        let normalized = trimmed;
        if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/.test(trimmed)) {
            normalized = trimmed.replace(' ', 'T');
        }

        let parsed = new Date(normalized);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            parsed = new Date(`${trimmed}T00:00:00`);
            if (!Number.isNaN(parsed.getTime())) {
                return parsed;
            }
        }

        return null;
    };

    const formatDateTimeValue = (value) => {
        const parsed = parseDateTimeValue(value);
        if (parsed) {
            return format(parsed, 'dd/MM/yyyy HH:mm:ss');
        }
        return value ? String(value) : 'N/A';
    };

    // Render loading state
    if (isLoading && !onu) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={styles.loadingText}>Cargando detalles de ONU...</Text>
                </View>
            </View>
        );
    }

    // Render error state
    if (error && !onu) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={64} color="#EF4444" />
                    <Text style={styles.errorTitle}>Error al cargar ONU</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (!onu) return null;

    // Para ZTE: usar estado_resumido, para Huawei: usar estado
    const estadoParaMostrar = onu.estado_resumido || onu.estado;
    const statusInfo = getStatusInfo(estadoParaMostrar);
    const signalStrength = getSignalStrength(onu.potencia_rx);
    const paymentStatusInfo = getPaymentStatusInfo(onu.estado_pago);
    const snrValue = onu.snr ?? onu.snr_db ?? onu.snr_value ?? null;
    const signalQualityLabel = onu.calidad_senal || signalStrength.label;
    const formattedSnr = formatSnrValue(snrValue);
    const portUtilization = onu.utilizacion_puerto ?? onu.utilizacion_bw ?? onu.utilizacion;
    const hasAdvancedStats = Boolean(
        formattedSnr ||
        portUtilization ||
        onu.calidad_senal ||
        onu.errores_fec != null ||
        onu.paquetes_descartados != null
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Icon name="arrow-left" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>Detalles de ONU</Text>
                            <Text style={styles.headerSubtitle}>
                                {String(onu.serial || `ONU ${onuId}`)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.refreshButton}
                            onPress={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <Icon
                                name={isRefreshing ? 'loading' : 'refresh'}
                                size={24}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>
                        <ThemeSwitch />
                    </View>
                </View>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.contentContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor="#10B981"
                    />
                }
            >
                {/* Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <Icon name={statusInfo.icon} size={48} color={statusInfo.iconColor} />
                        <View style={styles.statusInfo}>
                            <Text style={styles.statusLabel}>Estado de Conexión</Text>
                            <Text style={[styles.statusValue, { color: statusInfo.iconColor }]}>
                                {statusInfo.label}
                            </Text>
                        </View>
                    </View>

                    {/* Botón de Autorizar - Solo para ONUs pendientes */}
                    {(String(onu.estado || '').toLowerCase() === 'pending' ||
                      String(onu.estado || '').toLowerCase() === 'pendiente' ||
                      String(onu.estado || '').toLowerCase() === 'discovered' ||
                      onu.es_pendiente === true) && (
                        <TouchableOpacity
                            style={styles.authorizeButton}
                            onPress={() => setShowAuthModal(true)}
                            activeOpacity={0.8}
                        >
                            <Icon name="check-circle" size={24} color="#FFFFFF" />
                            <Text style={styles.authorizeButtonText}>Autorizar ONU</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* General Info Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="information" size={24} color="#3B82F6" />
                        <Text style={styles.cardTitle}>Información General</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Serial Number</Text>
                            <Text style={styles.infoValue}>{String(onu.serial || 'N/A')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Descripción</Text>
                            <Text style={styles.infoValue}>{String(onu.descripcion || 'Sin descripción')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>MAC Address</Text>
                            <Text style={styles.infoValue}>{String(onu.mac_address || 'N/A')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Modelo</Text>
                            <Text style={styles.infoValue}>{String(onu.modelo || 'N/A')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Versión Firmware</Text>
                            <Text style={styles.infoValue}>{String(onu.version_firmware || 'N/A')}</Text>
                        </View>
                    </View>
                </View>

                {/* Technical/Diagnostic Buttons - Solo mostrar si NO está pendiente */}
                {!(String(onu.estado || '').toLowerCase() === 'pending' ||
                   String(onu.estado || '').toLowerCase() === 'pendiente' ||
                   String(onu.estado || '').toLowerCase() === 'discovered' ||
                   onu.es_pendiente === true) && (
                    <View style={styles.diagnosticSection}>
                        <Text style={styles.diagnosticTitle}>🔧 Diagnóstico Técnico</Text>
                        <View style={styles.diagnosticButtonsContainer}>
                            <TouchableOpacity
                                style={styles.diagnosticButton}
                                onPress={handleGetStatus}
                                activeOpacity={0.8}
                            >
                                <Icon name="information-outline" size={18} color="#3B82F6" />
                                <Text style={styles.diagnosticButtonText}>Obtener estado</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.diagnosticButton}
                                onPress={handleShowRunningConfig}
                                activeOpacity={0.8}
                            >
                                <Icon name="file-document-outline" size={18} color="#3B82F6" />
                                <Text style={styles.diagnosticButtonText}>Running config</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.diagnosticButton}
                                onPress={handleGetSwInfo}
                                activeOpacity={0.8}
                            >
                                <Icon name="chip" size={18} color="#3B82F6" />
                                <Text style={styles.diagnosticButtonText}>SW info</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.diagnosticButton}
                                onPress={handleGetTr069Stats}
                                activeOpacity={0.8}
                            >
                                <Icon name="chart-line" size={18} color="#3B82F6" />
                                <Text style={styles.diagnosticButtonText}>TR-069 Stats</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.diagnosticButtonLive}
                                onPress={handleLiveStream}
                                activeOpacity={0.8}
                            >
                                <ActivityIndicator size="small" color="#FFFFFF" />
                                <Text style={styles.diagnosticButtonLiveText}>LIVE!</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Optical Signal Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="waves" size={24} color="#10B981" />
                        <Text style={styles.cardTitle}>Señal Óptica</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <View style={styles.signalGrid}>
                            <View style={styles.signalBox}>
                                <Icon name="download" size={32} color="#3B82F6" />
                                <Text style={styles.signalLabel}>RX (Recibida)</Text>
                                <Text style={styles.signalValue}>
                                    {onu.potencia_rx ? `${onu.potencia_rx} dBm` : 'N/A'}
                                </Text>
                                {onu.potencia_rx && (
                                    <View style={[styles.signalIndicator, { backgroundColor: signalStrength.color }]}>
                                        <Text style={styles.signalIndicatorText}>{signalStrength.label}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.signalBox}>
                                <Icon name="upload" size={32} color="#8B5CF6" />
                                <Text style={styles.signalLabel}>TX (Transmitida)</Text>
                                <Text style={styles.signalValue}>
                                    {onu.potencia_tx ? `${onu.potencia_tx} dBm` : 'N/A'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Temperatura</Text>
                            <Text style={styles.infoValue}>
                                {onu.temperatura ? `${onu.temperatura}°C` : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Voltaje</Text>
                            <Text style={styles.infoValue}>
                                {onu.voltaje ? `${onu.voltaje} V` : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Corriente</Text>
                            <Text style={styles.infoValue}>
                                {onu.corriente ? `${onu.corriente} mA` : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>SNR</Text>
                            <Text style={styles.infoValue}>
                                {formattedSnr || 'N/A'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Connection Info Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="connection" size={24} color="#F59E0B" />
                        <Text style={styles.cardTitle}>Información de Conexión</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Puerto PON</Text>
                            <Text style={styles.infoValue}>
                                {onu.puerto ? `${onu.puerto}${onu.slot ? `/${onu.slot}` : ''}` : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Distancia</Text>
                            <Text style={styles.infoValue}>
                                {onu.distancia ? `${onu.distancia} m` : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Última Conexión</Text>
                            <Text style={styles.infoValue}>
                                {formatDateTimeValue(onu.ultima_conexion)}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Uptime</Text>
                            <Text style={styles.infoValue}>{String(onu.uptime || 'N/A')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Última Desconexión</Text>
                            <Text style={styles.infoValue}>
                                {formatDateTimeValue(onu.ultima_desconexion)}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Razón Desconexión</Text>
                            <Text style={styles.infoValue}>{String(onu.razon_desconexion || 'N/A')}</Text>
                        </View>
                    </View>
                </View>

                {/* Configuration Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="cog" size={24} color="#8B5CF6" />
                        <Text style={styles.cardTitle}>Configuración</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>VLAN</Text>
                            <Text style={styles.infoValue}>{String(onu.vlan || 'N/A')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Perfil de Servicio</Text>
                            <Text style={styles.infoValue}>{String(onu.perfil_servicio || 'N/A')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Velocidad Bajada</Text>
                            <Text style={styles.infoValue}>
                                {onu.velocidad_bajada ? `${onu.velocidad_bajada} Mbps` : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Velocidad Subida</Text>
                            <Text style={styles.infoValue}>
                                {onu.velocidad_subida ? `${onu.velocidad_subida} Mbps` : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Modo Autorización</Text>
                            <Text style={styles.infoValue}>{String(onu.modo_autorizacion || 'N/A')}</Text>
                        </View>
                    </View>
                </View>

                {/* Traffic Stats Card */}
                {(onu.trafico_rx || onu.trafico_tx) && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Icon name="chart-line" size={24} color="#EF4444" />
                            <Text style={styles.cardTitle}>Estadísticas de Tráfico</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <View style={styles.trafficGrid}>
                                <View style={styles.trafficBox}>
                                    <Icon name="arrow-down-bold" size={24} color="#3B82F6" />
                                    <Text style={styles.trafficLabel}>Descarga (RX)</Text>
                                    <Text style={styles.trafficValue}>
                                        {onu.trafico_rx ? `${onu.trafico_rx}` : '0 B'}
                                    </Text>
                                </View>
                                <View style={styles.trafficBox}>
                                    <Icon name="arrow-up-bold" size={24} color="#8B5CF6" />
                                    <Text style={styles.trafficLabel}>Subida (TX)</Text>
                                    <Text style={styles.trafficValue}>
                                        {onu.trafico_tx ? `${onu.trafico_tx}` : '0 B'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Advanced Stats */}
                {hasAdvancedStats && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Icon name="chart-areaspline" size={24} color="#10B981" />
                            <Text style={styles.cardTitle}>Estadísticas Avanzadas</Text>
                        </View>
                        <View style={styles.cardContent}>
                            {(formattedSnr || portUtilization) && (
                                <View style={styles.metricsGrid}>
                                    {formattedSnr && (
                                        <View style={styles.metricBox}>
                                            <Icon name="signal" size={28} color="#14B8A6" />
                                            <Text style={styles.metricLabel}>SNR</Text>
                                            <Text style={styles.metricValue}>{formattedSnr}</Text>
                                        </View>
                                    )}
                                    {portUtilization !== null && portUtilization !== undefined && portUtilization !== '' && (
                                        <View style={styles.metricBox}>
                                            <Icon name="swap-vertical" size={28} color="#F59E0B" />
                                            <Text style={styles.metricLabel}>Utilización</Text>
                                            <Text style={styles.metricValue}>{formatPercentage(portUtilization)}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Calidad de Señal</Text>
                                <Text style={styles.infoValue}>{String(signalQualityLabel || 'N/A')}</Text>
                            </View>
                            {onu.errores_fec != null && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Errores FEC</Text>
                                    <Text style={styles.infoValue}>{String(onu.errores_fec)}</Text>
                                </View>
                            )}
                            {onu.paquetes_descartados != null && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Paquetes Descartados</Text>
                                    <Text style={styles.infoValue}>{String(onu.paquetes_descartados)}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Client Info Card (if available) */}
                {(onu.cliente_nombre || onu.cliente_direccion || onu.cliente_telefono || onu.plan_servicio || onu.estado_pago || onu.precio_servicio) && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Icon name="account" size={24} color="#10B981" />
                            <Text style={styles.cardTitle}>Información del Cliente</Text>
                        </View>
                        <View style={styles.cardContent}>
                            {onu.cliente_nombre && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Nombre</Text>
                                    <Text style={styles.infoValue}>{String(onu.cliente_nombre)}</Text>
                                </View>
                            )}
                            {onu.cliente_direccion && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Dirección</Text>
                                    <Text style={styles.infoValue}>{String(onu.cliente_direccion)}</Text>
                                </View>
                            )}
                            {onu.cliente_telefono && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Teléfono</Text>
                                    <Text style={styles.infoValue}>{String(onu.cliente_telefono)}</Text>
                                </View>
                            )}
                            {onu.plan_servicio && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Plan de Servicio</Text>
                                    <Text style={styles.infoValue}>{String(onu.plan_servicio)}</Text>
                                </View>
                            )}
                            {onu.precio_servicio && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Precio</Text>
                                    <Text style={styles.infoValue}>{formatCurrency(onu.precio_servicio)}</Text>
                                </View>
                            )}
                            {paymentStatusInfo && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Estado de Pago</Text>
                                    <View style={[styles.paymentStatusBadge, paymentStatusInfo.badgeStyle]}>
                                        <Text style={styles.paymentStatusText}>{paymentStatusInfo.label}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Last Update Info */}
                {lastUpdate && (
                    <View style={styles.lastUpdateContainer}>
                        <Text style={styles.lastUpdateText}>
                            Última actualización: {format(lastUpdate, 'dd/MM/yyyy HH:mm:ss')}
                        </Text>
                        {isCached && (
                            <Text style={styles.cacheIndicator}>
                                📦 Datos en caché
                            </Text>
                        )}
                        {!isCached && (
                            <Text style={styles.realtimeIndicator}>
                                ⚡ Datos en tiempo real
                            </Text>
                        )}
                        {(dataSource || consistencyCheck) && (
                            <Text style={styles.footerMeta}>
                                {dataSource ? `Fuente: ${dataSource}` : ''}
                                {dataSource && consistencyCheck ? ' · ' : ''}
                                {consistencyCheck ? `Consistencia: ${consistencyCheck}` : ''}
                            </Text>
                        )}
                    </View>
                )}

                {/* Action Buttons - Solo mostrar si NO está pendiente */}
                {!(String(onu.estado || '').toLowerCase() === 'pending' ||
                   String(onu.estado || '').toLowerCase() === 'pendiente' ||
                   String(onu.estado || '').toLowerCase() === 'discovered' ||
                   onu.es_pendiente === true) && (
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleReboot}
                            activeOpacity={0.8}
                        >
                            <Icon name="refresh" size={18} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Reiniciar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButtonDisabled}
                            onPress={handleResyncConfig}
                            activeOpacity={1}
                            disabled={true}
                        >
                            <Icon name="refresh" size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <Text style={styles.actionButtonTextDisabled}>Resincronizar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButtonDisabled}
                            onPress={handleRestoreDefaults}
                            activeOpacity={1}
                            disabled={true}
                        >
                            <Icon name="refresh" size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <Text style={styles.actionButtonTextDisabled}>Restaurar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButtonDisabled}
                            onPress={handleDisableOnu}
                            activeOpacity={1}
                            disabled={true}
                        >
                            <Icon name="refresh" size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <Text style={styles.actionButtonTextDisabled}>Deshabilitar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButtonDelete}
                            onPress={handleDeleteOnu}
                            activeOpacity={0.8}
                        >
                            <Icon name="delete" size={18} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Authorization Modal - TR-069 */}
            <Modal
                visible={showAuthModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAuthModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* Header - Fixed at top */}
                        <View style={styles.modalHeader}>
                            <Icon name="check-decagram" size={32} color="#10B981" />
                            <Text style={styles.modalTitle}>Autorizar ONU - TR-069</Text>
                            <TouchableOpacity
                                onPress={() => setShowAuthModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Icon name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Scrollable Content */}
                        <ScrollView
                            style={styles.modalScrollView}
                            contentContainerStyle={styles.modalScrollContent}
                            showsVerticalScrollIndicator={true}
                            keyboardShouldPersistTaps="handled"
                            bounces={true}
                        >
                            {/* ONU Info */}
                            <View style={styles.modalInfoBox}>
                                <Text style={styles.modalInfoLabel}>Serial Number</Text>
                                <Text style={styles.modalInfoValue}>
                                    {String(onu?.serial || onu?.index || onuId || 'N/A')}
                                </Text>
                            </View>

                            {/* TR-069 Authorization Form */}
                            <AuthorizationFormTR069
                                vlans={vlans}
                                zones={zones}
                                odbs={odbs}
                                speedProfiles={speedProfiles}
                                onuTypes={onuTypes}
                                isLoadingCatalogs={isLoadingCatalogs}
                                odbPorts={odbPorts}
                                onLoadOdbPorts={handleLoadOdbPorts}
                                initialValues={authFormInitialValues}
                                styles={styles}
                                isDarkMode={isDarkMode}
                                onChange={handleAuthFormChange}
                            />

                            {/* Warning */}
                            <View style={styles.modalWarning}>
                                <Icon name="alert-circle" size={20} color="#F59E0B" />
                                <Text style={styles.modalWarningText}>
                                    La autorización es permanente. Verifique que los datos sean correctos antes de continuar.
                                </Text>
                            </View>
                        </ScrollView>

                        {/* Footer Actions - Fixed at bottom */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalButtonSecondary}
                                onPress={() => setShowAuthModal(false)}
                                disabled={isAuthorizing}
                            >
                                <Text style={styles.modalButtonSecondaryText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalButtonPrimary,
                                    isAuthorizing && styles.modalButtonDisabled
                                ]}
                                onPress={handleAuthorizeOnu}
                                disabled={isAuthorizing}
                            >
                                {isAuthorizing ? (
                                    <>
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                        <Text style={styles.modalButtonPrimaryText}>
                                            Autorizando...
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Icon name="check-circle" size={20} color="#FFFFFF" />
                                        <Text style={styles.modalButtonPrimaryText}>
                                            Autorizar
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Deauthorizing Progress Modal */}
            {isDeauthorizing && console.log('🎨 [Render] Modal de desautorización visible')}
            <Modal
                visible={isDeauthorizing}
                animationType="fade"
                transparent={true}
                onRequestClose={() => {}}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.deauthorizingContainer}>
                        <ActivityIndicator size="large" color="#F59E0B" />
                        <Text style={styles.deauthorizingTitle}>Desautorizando ONU</Text>
                        <Text style={styles.deauthorizingMessage}>
                            Por favor espere mientras se procesa la desautorización...
                        </Text>
                        <Text style={styles.deauthorizingSubtext}>
                            Este proceso puede tomar varios segundos
                        </Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ONUDetailsScreen;
