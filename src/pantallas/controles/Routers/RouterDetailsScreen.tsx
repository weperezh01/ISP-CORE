import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from './RouterDetailsScreenStyles';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../../componentes/themeSwitch';
import { format } from 'date-fns';
import SystemResources from './components/SystemResources';
import RouterInfoCard from './components/RouterInfoCard';
import InterfaceItem from './components/InterfaceItem';
import VlanItem from './components/VlanItem';

const RouterDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { routerId } = route.params || {};
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    // State variables
    const [router, setRouter] = useState(null);
    const [systemResources, setSystemResources] = useState(null);
    const [interfaces, setInterfaces] = useState([]);
    const [vlans, setVlans] = useState([]);
    const [ipAddresses, setIpAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastResourcesUpdate, setLastResourcesUpdate] = useState(null);
    const [resourcesError, setResourcesError] = useState(null);
    const [isUpdatingResources, setIsUpdatingResources] = useState(false);
    const [showMockData, setShowMockData] = useState(false);
    const [id_usuario, setIdUsuario] = useState(null);
    const [interfaceTraffic, setInterfaceTraffic] = useState([]);

    // Helper function to process API responses
    const processResponse = useCallback(async (response, context) => {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            
            if (response.ok) {
                return data;
            } else {
                throw new Error(data.message || `Failed to fetch ${context}`);
            }
        } else {
            const text = await response.text();
            throw new Error(`Unexpected content-type for ${context}: ${contentType}`);
        }
    }, []);

    // Navigation logging function
    const registrarNavegacion = useCallback(async (routerData, interfacesData, vlansData, ipAddressesData) => {
        if (!id_usuario) return;

        const fechaActual = new Date();
        const fecha = format(fechaActual, 'yyyy-MM-dd');
        const hora = format(fechaActual, 'HH:mm:ss');
        const pantalla = 'RouterDetailsScreen';

        const datos = JSON.stringify({
            router: routerData,
            interfaces: interfacesData,
            vlans: vlansData,
            ipAddresses: ipAddressesData
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
        } catch (error) {
            // Silent error logging for navigation tracking
            if (__DEV__) {
                console.error('Error al registrar la navegación:', error);
            }
        }
    }, [id_usuario]);

    // Utility functions
    const calculatePercentage = useCallback((used, total) => {
        if (!total || total === 0) return 0;
        return Math.round((used / total) * 100);
    }, []);

    const getResourceStatus = useCallback((percentage) => {
        if (percentage >= 90) return { color: '#EF4444', level: 'Crítico' };
        if (percentage >= 70) return { color: '#F59E0B', level: 'Alto' };
        if (percentage >= 50) return { color: '#10B981', level: 'Normal' };
        return { color: '#6B7280', level: 'Bajo' };
    }, []);

    const formatUptime = useCallback((uptime) => {
        if (!uptime) return 'N/A';
        
        // Si ya viene formateado como string (ej: "28w4d20h46m32s"), devolverlo tal como está
        if (typeof uptime === 'string' && uptime.includes('w')) {
            return uptime;
        }
        
        // Si viene como número de segundos, convertir
        if (typeof uptime === 'number') {
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            return `${days}d ${hours}h ${minutes}m`;
        }
        
        return uptime.toString();
    }, []);

    const formatBytes = useCallback((bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    const formatNumber = useCallback((num) => {
        if (!num || num === 0) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }, []);

    const formatBps = useCallback((bps) => {
        if (bps === undefined || bps === null || bps < 0) return 'N/A';
        if (bps === 0) return '0 bps';
    
        const k = 1000;
        const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'];
        const i = Math.floor(Math.log(bps) / Math.log(k));
        
        // Debug logging solo para valores >= 1 Gbps para monitoreo
        if (bps >= 1000000000) {
            console.log(`🔍 formatBps: ${bps} bps → ${parseFloat((bps / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`);
        }
    
        return parseFloat((bps / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    const getTemperatureStatus = useCallback((temp) => {
        if (temp > 70) return { color: '#EF4444', icon: '🚨' };
        if (temp > 65) return { color: '#F59E0B', icon: '🔥' };
        if (temp > 50) return { color: '#10B981', icon: '🌡️' };
        return { color: '#6B7280', icon: '✅' };
    }, []);

    const getPowerStatus = useCallback((status) => {
        if (status === 'ok') return { color: '#10B981', icon: '✅', level: 'Operativa' };
        if (status === 'warning') return { color: '#F59E0B', icon: '⚠️', level: 'Advertencia' };
        return { color: '#EF4444', icon: '🔴', level: 'Falla' };
    }, []);

    const getFanStatus = useCallback((speed) => {
        if (speed === 0) return { color: '#EF4444', icon: '🔴' };
        if (speed < 1000) return { color: '#F59E0B', icon: '⚠️' };
        return { color: '#10B981', icon: '💨' };
    }, []);


    // Data fetching functions
    const fetchRouterData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Fetch router details
            const response = await fetch(`https://wellnet-rd.com:444/api/routers/${routerId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setRouter(data);
            
            // Fetch additional data
            await Promise.allSettled([
                fetchSystemResources(),
                fetchInterfacesData()
            ]);
            
            // Log navigation after successful data fetch
            setTimeout(() => {
                registrarNavegacion(data, interfaces, vlans, ipAddresses);
            }, 1000);
            
        } catch (err) {
            setError(err.message || 'Error al cargar los datos del router');
            console.error('Error fetching router data:', err);
        } finally {
            setIsLoading(false);
        }
    }, [routerId]);

    const fetchSystemResources = useCallback(async () => {
        try {
            setIsUpdatingResources(true);
            setResourcesError(null);
            
            const response = await fetch('https://wellnet-rd.com:444/api/routers/system-resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_router: routerId })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const backendData = await response.json();
            
            // DEBUG: Verificar respuesta completa del backend
            console.log('🔍 BACKEND RESPONSE COMPLETA:', JSON.stringify(backendData, null, 2));
            
            // Verificar específicamente los sensores
            if (backendData.data?.sensors) {
                console.log('✅ SENSORES ENCONTRADOS:', JSON.stringify(backendData.data.sensors, null, 2));
                
                // Verificar cada tipo de sensor
                const temps = backendData.data.sensors.temperatures;
                const psus = backendData.data.sensors.power_supplies;
                const fans = backendData.data.sensors.fans;
                const voltages = backendData.data.sensors.voltages;
                
                console.log('🌡️ TEMPERATURAS:', temps ? Object.keys(temps).length : 0, 'sensores');
                console.log('🔋 PSUs:', psus ? Object.keys(psus).length : 0, 'sensores');
                console.log('💨 VENTILADORES:', fans ? Object.keys(fans).length : 0, 'sensores');
                console.log('⚡ VOLTAJES:', voltages ? Object.keys(voltages).length : 0, 'sensores');
            } else {
                console.log('❌ NO HAY CAMPO SENSORS EN LA RESPUESTA');
            }
            
            // Mapear respuesta del backend al formato esperado por el frontend
            const systemData = backendData.data;
            const mappedData = {
                // CPU
                cpu_load: systemData.cpuLoad || 0,
                architecture: systemData.architectureName || 'N/A',
                
                // Memory (convertir MB a bytes para compatibilidad)
                used_memory: ((systemData.totalMemory - systemData.freeMemory) * 1024 * 1024) || 0,
                total_memory: (systemData.totalMemory * 1024 * 1024) || 0,
                free_memory: (systemData.freeMemory * 1024 * 1024) || 0,
                
                // System Info
                uptime: systemData.uptime || 'N/A',
                version: systemData.version || 'N/A',
                board_name: systemData.boardName || 'N/A',
                platform: systemData.platform || 'N/A',
                
                // Storage (convertir MB a bytes)
                total_hdd_space: (systemData.totalHddSpace * 1024 * 1024) || 0,
                used_hdd_space: ((systemData.totalHddSpace - systemData.freeHddSpace) * 1024 * 1024) || 0,
                free_hdd_space: (systemData.freeHddSpace * 1024 * 1024) || 0,
                
                // Additional fields from backend
                memory_usage_percent: systemData.memoryUsagePercent || 0,
                hdd_usage_percent: systemData.hddUsagePercent || 0,
                
                // Sensors - mapear desde la respuesta del backend
                sensors: systemData.sensors ? {
                    temperatures: systemData.sensors.temperatures || {},
                    power_supplies: systemData.sensors.power_supplies || {},
                    fans: systemData.sensors.fans || {},
                    voltages: systemData.sensors.voltages || {}
                } : {
                    temperatures: {},
                    power_supplies: {},
                    fans: {},
                    voltages: {}
                }
            };
            
            // DEBUG: Verificar datos después del mapeo
            console.log('🔍 DATOS MAPEADOS - Sensores:', JSON.stringify(mappedData.sensors, null, 2));
            
            // Verificar si hay datos reales después del mapeo
            const hasRealSensors = (
                Object.keys(mappedData.sensors.temperatures).length > 0 ||
                Object.keys(mappedData.sensors.power_supplies).length > 0 ||
                Object.keys(mappedData.sensors.fans).length > 0 ||
                Object.keys(mappedData.sensors.voltages || {}).length > 0
            );
            
            console.log('🔍 SENSORES REALES DESPUÉS DEL MAPEO:', hasRealSensors);
            
            if (hasRealSensors) {
                console.log('🎉 ¡SENSORES DETECTADOS! Se mostrarán en la UI');
            } else {
                console.log('⚠️ NO HAY SENSORES REALES - Se mostrará mensaje de backend');
            }
            
            setSystemResources(mappedData);
            setLastResourcesUpdate(new Date());
            
        } catch (err) {
            setResourcesError(err.message || 'Error al cargar recursos del sistema');
            console.error('Error fetching system resources:', err);
        } finally {
            setIsUpdatingResources(false);
        }
    }, [routerId]);

    const fetchInterfacesData = useCallback(async () => {
        try {
            // Fetch interfaces, VLANs, and IP addresses in single call
            // REQUERIMIENTO BACKEND: Ver REQUERIMIENTO_BACKEND_INTERFACES_COMPLETO.md
            // Campos requeridos para interfaces:
            // - name, running, mtu, mac-address, arp, comment (opcional)
            // - switch-info (opcional): { port, switch-host }
            // - NUEVO: tx_rate, rx_rate, tx_packets_per_sec, rx_packets_per_sec (para tráfico en tiempo real)
            //
            // Campos requeridos para VLANs:
            // - name, vlan_id, running, mtu, interface, arp, comment (opcional)
            //
            // Campos requeridos para IP addresses:
            // - address, interface, network, gateway (opcional), dns (opcional)
            
            const response = await fetch('https://wellnet-rd.com:444/api/routers/interfaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_router: routerId })
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn('Interfaces endpoint not found, using empty data');
                    setInterfaces([]);
                    setVlans([]);
                    setIpAddresses([]);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Set the data from the combined response
            setInterfaces(data?.interfaces || []);
            setVlans(data?.vlans || []);
            setIpAddresses(data?.ipAddresses || []);
            
        } catch (err) {
            console.error('Error fetching interfaces data:', err);
            setInterfaces([]);
            setVlans([]);
            setIpAddresses([]);
        }
    }, [routerId]);

    const fetchInterfaceTraffic = useCallback(async () => {
        if (!routerId) return;
        console.log(`🔄 RouterDetailsScreen: Fetching interface traffic for router ${routerId}`);
        try {
            const response = await fetch(`https://wellnet-rd.com:444/api/router/${routerId}/interfaces/traffic`);
            if (!response.ok) {
                // Don't throw an error, just log it, so we don't show a scary error message for a background refresh
                console.error(`HTTP error! status: ${response.status}`);
                return;
            }
            const data = await response.json();
            
            // Los valores de tráfico llegan normalizados del backend en bps
            
            // DEBUG: Solo mostrar interfaces con tráfico significativo
            const activeInterfaces = data.filter(item => item.upload_bps > 10000 || item.download_bps > 10000);
            if (activeInterfaces.length > 0) {
                console.log(`🔍 ACTIVE INTERFACES:`, activeInterfaces.map(i => `${i.name}: ↑${i.upload_bps} ↓${i.download_bps}`));
            }
            
            setInterfaceTraffic(data);
            console.log(`✅ RouterDetailsScreen: Interface traffic updated successfully`);
        } catch (err) {
            console.error('Error fetching interface traffic:', err);
        }
    }, [routerId]);

    // Mock data generators
    const generateMockData = useCallback(() => {
        setShowMockData(true);
        
        // Mock router data to show in RouterInfoCard
        const mockRouterData = {
            ...router,
            router_username: 'admin',
            ip_publica: '190.165.123.45',
            ip_wan: '192.168.100.1',
            ip_router: '192.168.1.1',
            descripcion: 'Router principal de la sucursal'
        };
        setRouter(mockRouterData);
        
        const mockSystemResources = {
            cpu_load: 11,
            used_memory: 0,
            total_memory: 15728640, // 15 MB en bytes
            free_memory: 15728640,
            uptime: '28w4d20h46m32s',
            version: '7.11.3 (stable)',
            architecture: 'arm64',
            board_name: 'CCR2116-12G-4S+',
            platform: 'MikroTik',
            total_hdd_space: 135266304, // 129 MB en bytes
            used_hdd_space: 27262976,   // 26 MB en bytes (129-103)
            free_hdd_space: 108003328,  // 103 MB en bytes
            memory_usage_percent: 0,
            hdd_usage_percent: 20,
            sensors: {
                temperatures: {
                    cpu_temp: 45,
                    board_temp: 42,
                    switch_temp: 38,
                    sfp_temp: 35
                },
                power_supplies: {
                    psu1_status: 'ok',
                    psu2_status: 'ok'
                },
                fans: {
                    fan1_speed: 1200,
                    fan2_speed: 1150,
                    fan3_speed: 1300,
                    fan4_speed: 1250
                }
            }
        };
        
        setSystemResources(mockSystemResources);
        setLastResourcesUpdate(new Date());
        
        // Mock interfaces with traffic data
        const mockInterfaces = [
            {
                name: 'ether1',
                running: true,
                mtu: 1500,
                'mac-address': '48:A9:8A:12:34:56',
                arp: 'enabled',
                'switch-info': {
                    port: 1,
                    'switch-host': 'switch1'
                },
                comment: 'Conexión principal WAN',
                tx_rate: 182100000, // 182.1 Mbps
                rx_rate: 12800000,  // 12.8 Mbps
                tx_packets_per_sec: 18618,
                rx_packets_per_sec: 7809
            },
            {
                name: 'ether2',
                running: false,
                mtu: 1500,
                'mac-address': '48:A9:8A:12:34:57',
                arp: 'enabled',
                comment: 'Puerto backup',
                tx_rate: 0,
                rx_rate: 0,
                tx_packets_per_sec: 0,
                rx_packets_per_sec: 0
            },
            {
                name: 'ether3',
                running: true,
                mtu: 1500,
                'mac-address': '48:A9:8A:12:34:58',
                arp: 'enabled',
                'switch-info': {
                    port: 3,
                    'switch-host': 'switch1'
                },
                comment: 'Puerto de alta velocidad',
                tx_rate: 32500000,  // 32.5 Mbps
                rx_rate: 1960000,   // 1.96 Mbps
                tx_packets_per_sec: 3212,
                rx_packets_per_sec: 1654
            },
            {
                name: 'sfp-sfpplus1',
                running: true,
                mtu: 1500,
                'mac-address': '48:A9:8A:12:34:59',
                arp: 'enabled',
                comment: 'Enlace 10 Gb entrada',
                tx_rate: 108000000,   // 108 Mbps
                rx_rate: 1030000000, // 1.03 Gbps
                tx_packets_per_sec: 50329,
                rx_packets_per_sec: 104575
            },
            {
                name: 'sfp-sfpplus3',
                running: true,
                mtu: 1500,
                'mac-address': '48:A9:8A:12:34:60',
                arp: 'enabled',
                comment: 'Enlace 10 Gb salida',
                tx_rate: 840800000,  // 840.8 Mbps
                rx_rate: 94600000,   // 94.6 Mbps
                tx_packets_per_sec: 85005,
                rx_packets_per_sec: 42557
            }
        ];
        
        setInterfaces(mockInterfaces);
        
        // Mock VLANs
        const mockVlans = [
            {
                name: 'vlan100',
                vlan_id: 100,
                running: true,
                mtu: 1500,
                interface: 'ether1',
                arp: 'enabled',
                comment: 'VLAN de administración'
            },
            {
                name: 'vlan200',
                vlan_id: 200,
                running: true,
                mtu: 1500,
                interface: 'ether2',
                arp: 'enabled',
                comment: 'VLAN de usuarios'
            },
            {
                name: 'vlan300',
                vlan_id: 300,
                running: false,
                mtu: 1500,
                interface: 'ether3',
                arp: 'disabled'
            }
        ];
        
        setVlans(mockVlans);
        
        // Mock IP addresses
        const mockIpAddresses = [
            {
                address: '192.168.1.1/24',
                interface: 'ether1',
                network: '192.168.1.0',
                gateway: '192.168.1.254',
                dns: '8.8.8.8'
            },
            {
                address: '10.0.0.1/24',
                interface: 'ether2',
                network: '10.0.0.0',
                gateway: '10.0.0.254'
            },
            {
                address: '172.16.1.1/24',
                interface: 'ether3',
                network: '172.16.1.0'
            },
            {
                address: '201.123.45.67/30',
                interface: 'ether1',
                network: '201.123.45.64',
                gateway: '201.123.45.65'
            }
        ];
        
        setIpAddresses(mockIpAddresses);
    }, []);

    const clearMockData = useCallback(() => {
        setShowMockData(false);
        setSystemResources(null);
        setInterfaces([]);
        setVlans([]);
        setIpAddresses([]);
        // Reload router data to clear mock data
        fetchRouterData();
    }, [fetchRouterData]);

    // Render functions for list items
    const renderInterfaceItem = useCallback(({ item }) => {
        const traffic = interfaceTraffic.find(t => t.name === item.name);
        // DEBUG: Solo mostrar interfaces SFP+ con tráfico >= 1 Gbps
        if (traffic && item.name.toLowerCase().includes('sfp') && (traffic.upload_bps >= 1000000000 || traffic.download_bps >= 1000000000)) {
            console.log(`🔎 ${item.name}: ↑${traffic.upload_bps} ↓${traffic.download_bps}`);
        }
        
        const handleInterfacePress = () => {
            // Mapear los datos de tráfico al formato esperado por InterfaceDetailsScreen
            // El backend ya envía los valores correctos como upload_bps y download_bps
            const mappedTrafficData = traffic ? {
                upload_bps: traffic.upload_bps || 0,    // Usar directamente del backend
                download_bps: traffic.download_bps || 0  // Usar directamente del backend
            } : { upload_bps: 0, download_bps: 0 };
            
            navigation.navigate('InterfaceDetailsScreen', {
                interfaceDetails: item,
                trafficData: mappedTrafficData,
                routerId: routerId,
                id_usuario: id_usuario
            });
        };
        
        // Usar los datos de tráfico directamente del backend
        // El backend ya envía los valores correctos como upload_bps y download_bps
        const correctedTraffic = traffic ? {
            ...traffic,
            upload_bps: traffic.upload_bps || 0,    // Usar directamente del backend
            download_bps: traffic.download_bps || 0  // Usar directamente del backend
        } : undefined;
        
        return (
            <InterfaceItem 
                item={item} 
                traffic={correctedTraffic} 
                styles={styles} 
                isDarkMode={isDarkMode} 
                formatBps={formatBps}
                onPress={handleInterfacePress}
            />
        );
    }, [styles, isDarkMode, interfaceTraffic, formatBps, navigation, routerId, id_usuario]);

    const renderVlanItem = useCallback(({ item }) => {
        if (item.isAddButton) {
            return (
                <TouchableOpacity style={[styles.addButton, {
                    marginHorizontal: 8,
                    marginVertical: 4,
                    borderRadius: 12,
                    backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                    borderWidth: 2,
                    borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
                    borderStyle: 'dashed',
                    minHeight: 120,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 20
                }]}>
                    <Text style={[styles.addButtonText, {
                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                        fontSize: 14,
                        fontWeight: '500'
                    }]}>+ Agregar VLAN</Text>
                </TouchableOpacity>
            );
        }
        return <VlanItem item={item} styles={styles} isDarkMode={isDarkMode} />;
    }, [styles, isDarkMode]);

    const renderIpAddressItem = useCallback(({ item }) => {
        if (item.isAddButton) {
            return (
                <TouchableOpacity style={[styles.addButton, {
                    marginHorizontal: 8,
                    marginVertical: 4,
                    borderRadius: 12,
                    backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                    borderWidth: 2,
                    borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
                    borderStyle: 'dashed',
                    minHeight: 120,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 20
                }]}>
                    <Text style={[styles.addButtonText, {
                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                        fontSize: 14,
                        fontWeight: '500'
                    }]}>+ Agregar IP</Text>
                </TouchableOpacity>
            );
        }

        const getIpType = (address: string) => {
            if (address.startsWith('192.168.')) return { type: 'LAN', color: '#10B981' };
            if (address.startsWith('10.')) return { type: 'VPN', color: '#3B82F6' };
            if (address.startsWith('172.')) return { type: 'DMZ', color: '#F59E0B' };
            return { type: 'WAN', color: '#8B5CF6' };
        };

        const ipInfo = getIpType(item.address);
        
        return (
            <TouchableOpacity 
                style={[styles.cardContainer, {
                    marginHorizontal: 8,
                    marginVertical: 4,
                    borderRadius: 12,
                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                    shadowColor: isDarkMode ? '#000' : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: isDarkMode ? '#374151' : '#E5E7EB'
                }]}
                onPress={() => {
                    navigation.navigate('IpAddressDetailsScreen', {
                        ipDetails: {
                            address: item.address,
                            network: item.network,
                            interface: item.interface,
                            comment: `${ipInfo.type} - Gateway: ${item.gateway || 'N/A'}${item.dns ? ` - DNS: ${item.dns}` : ''}`
                        },
                        id_usuario: id_usuario,
                        routerId: routerId
                    });
                }}
                activeOpacity={0.7}
            >
                <View style={[styles.cardHeader, { 
                    paddingHorizontal: 16, 
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: isDarkMode ? '#374151' : '#F3F4F6'
                }]}>
                    <Text style={[styles.cardIcon, { fontSize: 20, marginRight: 12 }]}>🌐</Text>
                    <View style={[styles.cardInfo, { flex: 1 }]}>
                        <View style={[styles.titleRow, { 
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 4
                        }]}>
                            <Text style={[styles.cardTitle, { 
                                fontSize: 16, 
                                fontWeight: '600',
                                color: isDarkMode ? '#F9FAFB' : '#1F2937',
                                marginRight: 8
                            }]}>{item.address}</Text>
                            <View style={[styles.ipTypeBadge, { 
                                backgroundColor: ipInfo.color,
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 8
                            }]}>
                                <Text style={[styles.ipTypeText, { 
                                    color: '#FFFFFF',
                                    fontSize: 10,
                                    fontWeight: '600'
                                }]}>{ipInfo.type}</Text>
                            </View>
                        </View>
                        <Text style={[styles.cardSubtitle, { 
                            fontSize: 14,
                            color: isDarkMode ? '#9CA3AF' : '#6B7280'
                        }]}>Interface: {item.interface}</Text>
                    </View>
                </View>
                <View style={[styles.cardBody, { padding: 16 }]}>
                    <View style={[styles.cardDetailRow, { 
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 8,
                        borderBottomWidth: item.gateway || item.dns ? 1 : 0,
                        borderBottomColor: isDarkMode ? '#374151' : '#F9FAFB'
                    }]}>
                        <Text style={[styles.cardDetailLabel, { 
                            fontSize: 14,
                            color: isDarkMode ? '#9CA3AF' : '#6B7280',
                            fontWeight: '500'
                        }]}>Red</Text>
                        <Text style={[styles.cardDetailValue, { 
                            fontSize: 14,
                            color: isDarkMode ? '#F3F4F6' : '#1F2937',
                            fontWeight: '600'
                        }]}>{item.network || 'N/A'}</Text>
                    </View>
                    
                    {item.gateway && (
                        <View style={[styles.cardDetailRow, { 
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingVertical: 8,
                            borderBottomWidth: item.dns ? 1 : 0,
                            borderBottomColor: isDarkMode ? '#374151' : '#F9FAFB'
                        }]}>
                            <Text style={[styles.cardDetailLabel, { 
                                fontSize: 14,
                                color: isDarkMode ? '#9CA3AF' : '#6B7280',
                                fontWeight: '500'
                            }]}>Gateway</Text>
                            <Text style={[styles.cardDetailValue, { 
                                fontSize: 14,
                                color: isDarkMode ? '#F3F4F6' : '#1F2937',
                                fontWeight: '600'
                            }]}>{item.gateway}</Text>
                        </View>
                    )}
                    
                    {item.dns && (
                        <View style={[styles.cardDetailRow, { 
                            paddingVertical: 8
                        }]}>
                            <Text style={[styles.cardDetailLabel, { 
                                fontSize: 14,
                                color: isDarkMode ? '#9CA3AF' : '#6B7280',
                                fontWeight: '500'
                            }]}>DNS</Text>
                            <Text style={[styles.cardDetailValue, { 
                                fontSize: 14,
                                color: isDarkMode ? '#F3F4F6' : '#1F2937',
                                fontWeight: '600'
                            }]}>{item.dns}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    }, [styles]);

    const renderSectionHeader = useCallback((title, count) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionCount}>{count}</Text>
        </View>
    ), [styles]);

    // Loading and empty states
    const renderLoadingState = useMemo(() => {
        if (!isLoading) return null;
        
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                <Text style={styles.loadingText}>Cargando detalles del router...</Text>
            </View>
        );
    }, [isLoading, styles, isDarkMode]);

    const renderEmptyState = useMemo(() => {
        if (isLoading || router) return null;
        
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔌</Text>
                <Text style={styles.emptyTitle}>Router no encontrado</Text>
                <Text style={styles.emptyMessage}>
                    {error || 'No se pudo cargar la información del router'}
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchRouterData}>
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }, [router, isLoading, error, styles, fetchRouterData]);

    // Effects
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem('userData');
                if (userData) {
                    const parsedData = JSON.parse(userData);
                    setIdUsuario(parsedData.id_usuario);
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };
        
        loadUserData();
    }, []);

    useEffect(() => {
        if (routerId) {
            fetchRouterData();
        }
    }, [routerId, fetchRouterData]);

    // Auto-refresh system resources - only when screen is focused
    useFocusEffect(
        useCallback(() => {
            if (!router) return;
            
            console.log('🎯 RouterDetailsScreen: Screen focused - Starting system resources polling');
            
            // Initial fetch when screen comes into focus
            fetchSystemResources();
            
            const interval = setInterval(() => {
                fetchSystemResources();
            }, 30000); // 30 seconds
            
            // Cleanup when screen loses focus or component unmounts
            return () => {
                console.log('🛑 RouterDetailsScreen: Screen unfocused - Stopping system resources polling');
                clearInterval(interval);
            };
        }, [router, fetchSystemResources])
    );

    // Auto-refresh interface traffic - only when screen is focused
    useFocusEffect(
        useCallback(() => {
            if (!router) return;

            console.log('🎯 RouterDetailsScreen: Screen focused - Starting interface traffic polling');

            // Initial fetch when screen comes into focus
            fetchInterfaceTraffic();

            const trafficInterval = setInterval(() => {
                fetchInterfaceTraffic();
            }, 3000); // 3 seconds

            // Cleanup when screen loses focus or component unmounts
            return () => {
                console.log('🛑 RouterDetailsScreen: Screen unfocused - Stopping interface traffic polling');
                clearInterval(trafficInterval);
            };
        }, [router, fetchInterfaceTraffic])
    );

    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>Detalles del Router</Text>
                            <Text style={styles.headerSubtitle}>
                                {router?.nombre_router || 'Cargando...'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        {__DEV__ && (
                            <>
                                {!showMockData ? (
                                    <TouchableOpacity 
                                        style={[styles.statusBadge, { backgroundColor: '#3B82F6' }]}
                                        onPress={generateMockData}
                                    >
                                        <Text style={[styles.statusText, { fontSize: 10 }]}>DEMO</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity 
                                        style={[styles.statusBadge, { backgroundColor: '#EF4444' }]}
                                        onPress={clearMockData}
                                    >
                                        <Text style={[styles.statusText, { fontSize: 10 }]}>CLEAR</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                        <ThemeSwitch />
                    </View>
                </View>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                {renderLoadingState}
                {renderEmptyState}
                
                {!isLoading && router && (
                    <ScrollView 
                        style={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Router Info Card */}
                        <RouterInfoCard 
                            router={router} 
                            getRouterStatus={null} 
                            styles={styles} 
                        />

                        {/* System Resources Section - Only show if data exists or mock data is enabled */}
                        {(systemResources || showMockData) && (
                            <SystemResources
                                systemResources={systemResources}
                                isUpdatingResources={isUpdatingResources}
                                lastResourcesUpdate={lastResourcesUpdate}
                                resourcesError={resourcesError}
                                showMockData={showMockData}
                                isDarkMode={isDarkMode}
                                calculatePercentage={calculatePercentage}
                                getResourceStatus={getResourceStatus}
                                formatUptime={formatUptime}
                                formatBytes={formatBytes}
                                formatNumber={formatNumber}
                                getTemperatureStatus={getTemperatureStatus}
                                getPowerStatus={getPowerStatus}
                                getFanStatus={getFanStatus}
                                styles={styles}
                            />
                        )}

                        {/* Interfaces Section */}
                        {renderSectionHeader('Interfaces', interfaces.length)}
                        <FlatList
                            data={interfaces}
                            renderItem={renderInterfaceItem}
                            keyExtractor={(item, index) => item.name || `interface-${index}`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                            style={styles.cardContainer}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={3}
                            windowSize={5}
                        />

                        {/* VLANs Section */}
                        {renderSectionHeader('VLANs', vlans.length)}
                        <FlatList
                            data={[...vlans, { isAddButton: true }]}
                            renderItem={renderVlanItem}
                            keyExtractor={(item, index) => {
                                if (item.isAddButton) return 'add-vlan-button';
                                return `${item.name}-${item.vlan_id}-${index}`;
                            }}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                            style={styles.cardContainer}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={3}
                            windowSize={5}
                        />

                        {/* IP Addresses Section */}
                        {renderSectionHeader('Direcciones IP', ipAddresses.length)}
                        <FlatList
                            data={[...ipAddresses, { isAddButton: true }]}
                            renderItem={renderIpAddressItem}
                            keyExtractor={(item, index) => {
                                if (item.isAddButton) return 'add-button';
                                return `${item.address}-${item.interface}-${index}`;
                            }}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                            style={styles.cardContainer}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={3}
                            windowSize={5}
                        />

                        <View style={styles.spacer} />
                    </ScrollView>
                )}
            </View>
        </View>
    );
};

export default RouterDetailsScreen;