import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from './TR069StatsScreenStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import ThemeSwitch from '../../../componentes/themeSwitch';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    getOnuTr069Stats,
    configureWirelessLan,
    configureLanDhcp,
    rebootOnuTr069,
    resyncOnuConfig,
    factoryResetOnu,
    disableOnu,
    diagnosticPing,
    diagnosticTraceroute,
    diagnosticSpeedTest,
} from './services/api';

// Tipos para los datos de las secciones
interface GeneralData {
    manufacturer: string;
    modelName: string;
    softwareVersion: string;
    hardwareVersion: string;
    provisioningCode: string;
    serialNumber: string;
    cpuUsage: string;
    totalRam: string;
    freeRam: string;
    uptime: string;
    uptimeAgo: string;
    pendingProvisions?: string;
}

interface IPInterface {
    name: string;
    addressingType: string;
    connectionStatus: string;
    uptime: string;
    uptimeAgo: string;
    ipAddress: string;
    subnetMask: string;
    defaultGateway: string;
    dnsServers: string;
    ipv6Address?: string;
    ipv6Gateway?: string;
    ipv6DelegatedPrefix?: string;
    lastConnectionError: string;
    macAddress: string;
    maxMtuSize: string;
    natEnabled: boolean;
    vlanId: string;
}

interface LanDhcpServer {
    lanIpAddress: string;
    lanNetmask: string;
    dhcpServerEnabled: boolean;
    dhcpMinAddr: string;
    dhcpMaxAddr: string;
    dhcpSubnetMask: string;
    dhcpGateway: string;
    dhcpDnsServers: string;
    clientsDomainName: string;
    reservedIpAddress: string;
    leaseTimeSec: string;
}

interface LanPort {
    id: string;
    name: string;
    enable: string;
    status: string;
    speed: string;
    duplex: string;
    l3Enable: string;
    speedMode: string;
    duplexMode: string;
    flowControl: string;
}

interface LanCounter {
    id: string;
    bytesIn: string;
    bytesOut: string;
    pktsIn: string;
    pktsOut: string;
    uniIn: string;
    uniOut: string;
    multiIn: string;
    multiOut: string;
    broIn: string;
    broOut: string;
    errIn: string;
    errOut: string;
    discIn: string;
    discOut: string;
}

interface WirelessLan {
    ssid: string;
    password: string;
    authMode: string;
    status: string;
    enable: string;
    rfBand: string;
    standard: string;
    radioEnabled: string;
    totalAssociations: string;
    ssidAdvertisementEnabled: string;
    wpaEncryption: string;
    channelWidth: string;
    autoChannel: string;
    channel: string;
    countryDomain: string;
    txPower: string;
}

interface WlanCounter {
    bytesIn: string;
    bytesOut: string;
    pktsIn: string;
    pktsOut: string;
    discardsIn: string;
    discardsOut: string;
    errIn: string;
    errOut: string;
}

interface Host {
    id: string;
    macAddress: string;
    ipAddress: string;
    addressSource: string;
    hostname: string;
    port: string;
    active: string;
}

interface SecuritySettings {
    ftpWan: string;
    ftpLan: string;
    uiWan: string;
    uiLan: string;
    sshWan: string;
    sshLan: string;
    sambaWan: string;
    sambaLan: string;
    telnetWan: string;
    telnetLan: string;
    wanIcmpEcho: string;
    sshService: string;
    telnetService: string;
    cliUsername: string;
    cliPassword: string;
    webUserEnabled: string;
    webUsername: string;
    webPassword: string;
    webAdminEnabled: string;
    webAdminName: string;
    webAdminPassword: string;
}

interface VoiceLine {
    id: string;
    profile: string;
    number: string;
    enable: string;
    userName: string;
    status: string;
    port: string;
    callState: string;
    dtmfTm: string;
    faxT38: string;
    t38Bitrate: string;
    sipDscp: string;
    rtpDscp: string;
}

interface Miscellaneous {
    currentLocalTime: string;
    localTimeZone: string;
    localTimeZoneName: string;
    ntpEnabled: string;
    ntpStatus: string;
    ntpServer1: string;
    ntpServer2: string;
    syncInterval: string;
    huaweiCloudUrl: string;
    huaweiCloudPort: string;
    huaweiPhoneAppUrl: string;
    huaweiCloudWanInterface: string;
}

interface DeviceLogEntry {
    id: string;
    timestamp: string;
    severity: string;
    terminal: string;
    result: string;
    type: string;
    cmd?: string;
    username?: string;
    source?: string;
}

const TR069StatsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const {
        onuId,
        onuSerial,
        oltId,
        macAddress,
        puerto,
        ontId,
        vlan,
        modelo,
        clienteNombre,
        clienteDireccion,
        planServicio,
        velocidadBajada,
        velocidadSubida,
    } = route.params || {};
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    // Estados de carga y error
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState<string[]>(['general']); // General expandido por defecto

    // Datos crudos del backend
    const [rawData, setRawData] = useState<any>(null);
    const [requiresACS, setRequiresACS] = useState<any>({});

    // Mock data - TODO: Replace with actual API data
    const [generalData] = useState<GeneralData>({
        manufacturer: 'ETCH Technologies Co., Ltd (OUI: 00259E)',
        modelName: 'HS8545M5',
        softwareVersion: 'V5R019C20S100',
        hardwareVersion: '147C.A',
        provisioningCode: 'sOLT.rDHC',
        serialNumber: '4857544325F08D9D',
        cpuUsage: '2%',
        totalRam: '256 MB',
        freeRam: '131 MB',
        uptime: '2025-11-17 21:24:50',
        uptimeAgo: '3 hours, 26 minutes, 38 seconds ago',
        pendingProvisions: '',
    });

    const [ipInterface11] = useState<IPInterface>({
        name: 'OLT_C_TR069_Static_WAN',
        addressingType: 'Static',
        connectionStatus: 'Connected',
        uptime: '2025-11-17 21:25:41',
        uptimeAgo: '3 hours, 28 minutes, 13 seconds ago',
        ipAddress: '10.254.12.207',
        subnetMask: '255.255.224.0',
        defaultGateway: '10.254.0.1',
        dnsServers: '8.8.8.8, 1.1.1.1',
        lastConnectionError: 'unknown',
        macAddress: '34:0A:98:97:A8:A0',
        maxMtuSize: '1500',
        natEnabled: false,
        vlanId: '69',
    });

    const [ipInterface21] = useState<IPInterface>({
        name: 'Internet_DHCP',
        addressingType: 'DHCP',
        connectionStatus: 'Connected',
        uptime: '2025-11-17 21:25:48',
        uptimeAgo: '3 hours, 29 minutes, 26 seconds ago',
        ipAddress: '10.108.0.210',
        subnetMask: '255.255.255.0',
        defaultGateway: '10.108.0.1',
        dnsServers: '8.8.8.8, 1.1.1.1',
        ipv6Address: 'fc00:8::360a:98ff:fe97:a8a1',
        ipv6Gateway: 'fe80::6f4:1cff:fe00:9c01',
        ipv6DelegatedPrefix: '2803:1510:720:2900::/56',
        lastConnectionError: 'no error',
        macAddress: '34:0A:98:97:A8:A1',
        maxMtuSize: '1500',
        natEnabled: true,
        vlanId: '108',
    });

    // Estados editables para General
    const [pendingProvisions, setPendingProvisions] = useState('');

    // Estados editables para IP Interface 1.1
    const [addressingType11, setAddressingType11] = useState(ipInterface11.addressingType);
    const [name11, setName11] = useState(ipInterface11.name);
    const [ipAddress11, setIpAddress11] = useState(ipInterface11.ipAddress);
    const [subnetMask11, setSubnetMask11] = useState(ipInterface11.subnetMask);
    const [gateway11, setGateway11] = useState(ipInterface11.defaultGateway);
    const [dns11, setDns11] = useState(ipInterface11.dnsServers);
    const [mtu11, setMtu11] = useState(ipInterface11.maxMtuSize);
    const [vlan11, setVlan11] = useState(ipInterface11.vlanId);
    const [natEnabled11, setNatEnabled11] = useState(ipInterface11.natEnabled);

    // Estados editables para IP Interface 2.1
    const [addressingType21, setAddressingType21] = useState(ipInterface21.addressingType);
    const [name21, setName21] = useState(ipInterface21.name);
    const [ipAddress21, setIpAddress21] = useState(ipInterface21.ipAddress);
    const [subnetMask21, setSubnetMask21] = useState(ipInterface21.subnetMask);
    const [gateway21, setGateway21] = useState(ipInterface21.defaultGateway);
    const [dns21, setDns21] = useState(ipInterface21.dnsServers);
    const [ipv6Address21, setIpv6Address21] = useState(ipInterface21.ipv6Address || '');
    const [ipv6Gateway21, setIpv6Gateway21] = useState(ipInterface21.ipv6Gateway || '');
    const [ipv6Prefix21, setIpv6Prefix21] = useState(ipInterface21.ipv6DelegatedPrefix || '');
    const [mtu21, setMtu21] = useState(ipInterface21.maxMtuSize);
    const [vlan21, setVlan21] = useState(ipInterface21.vlanId);
    const [natEnabled21, setNatEnabled21] = useState(ipInterface21.natEnabled);

    // Estados editables para LAN DHCP Server
    const [lanIpAddress, setLanIpAddress] = useState('192.168.100.1');
    const [lanNetmask, setLanNetmask] = useState('255.255.255.0');
    const [dhcpEnabled, setDhcpEnabled] = useState(true);
    const [dhcpMinAddr, setDhcpMinAddr] = useState('192.168.100.2');
    const [dhcpMaxAddr, setDhcpMaxAddr] = useState('192.168.100.254');
    const [dhcpSubnetMask, setDhcpSubnetMask] = useState('255.255.255.0');
    const [dhcpGateway, setDhcpGateway] = useState('192.168.100.1');
    const [dhcpDnsServers, setDhcpDnsServers] = useState('192.168.100.1');
    const [clientsDomainName, setClientsDomainName] = useState('');
    const [reservedIpAddress, setReservedIpAddress] = useState('');
    const [leaseTimeSec, setLeaseTimeSec] = useState('86400');

    // Estados editables para Wireless LAN
    const [wifiSsid, setWifiSsid] = useState('');
    const [wifiPassword, setWifiPassword] = useState('');
    const [wifiAuthMode, setWifiAuthMode] = useState('wpa2-psk');
    const [wifiChannel, setWifiChannel] = useState('6');
    const [wifiTxPower, setWifiTxPower] = useState('100');
    const [wifiCountryDomain, setWifiCountryDomain] = useState('DO');

    // Estados de guardado
    const [isSavingWifi, setIsSavingWifi] = useState(false);
    const [isSavingDhcp, setIsSavingDhcp] = useState(false);

    const [lanPorts] = useState<LanPort[]>([
        {
            id: '1',
            name: 'eth0:1',
            enable: 'Yes',
            status: 'NoLink',
            speed: '10',
            duplex: 'Half',
            l3Enable: 'yes',
            speedMode: 'Auto',
            duplexMode: 'Auto',
            flowControl: 'Disable',
        },
        {
            id: '2',
            name: 'eth0:2',
            enable: 'Yes',
            status: 'NoLink',
            speed: '10',
            duplex: 'Half',
            l3Enable: 'yes',
            speedMode: 'Auto',
            duplexMode: 'Auto',
            flowControl: 'Disable',
        },
        {
            id: '3',
            name: 'eth0:3',
            enable: 'Yes',
            status: 'NoLink',
            speed: '10',
            duplex: 'Half',
            l3Enable: 'yes',
            speedMode: 'Auto',
            duplexMode: 'Auto',
            flowControl: 'Disable',
        },
        {
            id: '4',
            name: 'eth0:4',
            enable: 'Yes',
            status: 'NoLink',
            speed: '10',
            duplex: 'Half',
            l3Enable: 'yes',
            speedMode: 'Auto',
            duplexMode: 'Auto',
            flowControl: 'Disable',
        },
    ]);

    const [lanCounters] = useState<LanCounter[]>([
        {
            id: '1',
            bytesIn: '0',
            bytesOut: '0',
            pktsIn: '0',
            pktsOut: '0',
            uniIn: '0',
            uniOut: '0',
            multiIn: '0',
            multiOut: '0',
            broIn: '0',
            broOut: '0',
            errIn: '0',
            errOut: '0',
            discIn: '0',
            discOut: '0',
        },
        {
            id: '2',
            bytesIn: '0',
            bytesOut: '0',
            pktsIn: '0',
            pktsOut: '0',
            uniIn: '0',
            uniOut: '0',
            multiIn: '0',
            multiOut: '0',
            broIn: '0',
            broOut: '0',
            errIn: '0',
            errOut: '0',
            discIn: '0',
            discOut: '0',
        },
        {
            id: '3',
            bytesIn: '0',
            bytesOut: '0',
            pktsIn: '0',
            pktsOut: '0',
            uniIn: '0',
            uniOut: '0',
            multiIn: '0',
            multiOut: '0',
            broIn: '0',
            broOut: '0',
            errIn: '0',
            errOut: '0',
            discIn: '0',
            discOut: '0',
        },
        {
            id: '4',
            bytesIn: '0',
            bytesOut: '0',
            pktsIn: '0',
            pktsOut: '0',
            uniIn: '0',
            uniOut: '0',
            multiIn: '0',
            multiOut: '0',
            broIn: '0',
            broOut: '0',
            errIn: '0',
            errOut: '0',
            discIn: '0',
            discOut: '0',
        },
    ]);

    const [wirelessLan] = useState<WirelessLan>({
        ssid: 'Marleny',
        password: '',
        authMode: 'WPA/WPA2 PreSharedKey',
        status: 'Up',
        enable: 'Yes',
        rfBand: '2.4GHz',
        standard: '802.11 b/g/n',
        radioEnabled: 'Yes',
        totalAssociations: '2',
        ssidAdvertisementEnabled: 'Yes',
        wpaEncryption: 'TKIP + AES',
        channelWidth: 'Auto 20/40 MHZ',
        autoChannel: 'on',
        channel: '11',
        countryDomain: 'CN - China',
        txPower: '100',
    });

    const [wlanCounter] = useState<WlanCounter>({
        bytesIn: '120598519',
        bytesOut: '2103392800',
        pktsIn: '817778',
        pktsOut: '1665163',
        discardsIn: '65794',
        discardsOut: '196',
        errIn: '0',
        errOut: '0',
    });

    const [hosts] = useState<Host[]>([
        {
            id: '1',
            macAddress: '88:36:5f:d7:41:81',
            ipAddress: '192.168.100.17',
            addressSource: 'DHCP',
            hostname: 'android-86731e37a7edcef9',
            port: 'SSID1',
            active: 'Yes',
        },
        {
            id: '2',
            macAddress: '48:8f:4c:96:1a:6f',
            ipAddress: '192.168.100.7',
            addressSource: 'DHCP',
            hostname: 'GWIPC-7089591706',
            port: 'SSID1',
            active: 'Yes',
        },
        {
            id: '3',
            macAddress: '78:22:88:49:5f:14',
            ipAddress: '192.168.100.8',
            addressSource: 'DHCP',
            hostname: 'GWIPC-6860625164',
            port: 'SSID1',
            active: 'No',
        },
        {
            id: '4',
            macAddress: '22:61:e0:c0:1e:30',
            ipAddress: '192.168.100.13',
            addressSource: 'DHCP',
            hostname: '',
            port: 'SSID1',
            active: 'No',
        },
        {
            id: '5',
            macAddress: '98:a8:29:76:d4:c7',
            ipAddress: '192.168.100.14',
            addressSource: 'DHCP',
            hostname: '',
            port: 'SSID1',
            active: 'No',
        },
    ]);

    const [securitySettings] = useState<SecuritySettings>({
        ftpWan: 'Disabled',
        ftpLan: 'Disabled',
        uiWan: 'Disabled',
        uiLan: 'Enabled',
        sshWan: 'Disabled',
        sshLan: 'Disabled',
        sambaWan: 'Disabled',
        sambaLan: 'Disabled',
        telnetWan: 'Enabled',
        telnetLan: 'Enabled',
        wanIcmpEcho: 'Permit',
        sshService: 'Enabled',
        telnetService: 'Enabled',
        cliUsername: 'root',
        cliPassword: '',
        webUserEnabled: 'Enabled',
        webUsername: 'root',
        webPassword: '',
        webAdminEnabled: 'Enabled',
        webAdminName: 'telecomadmin',
        webAdminPassword: '',
    });

    const [voiceLines] = useState<VoiceLine[]>([
        {
            id: '1',
            profile: 'Nc',
            number: '',
            enable: '',
            userName: '',
            status: 'Disabled',
            port: '1',
            callState: 'Idle',
            dtmfTm: 'Transparent transn',
            faxT38: 'Disab',
            t38Bitrate: 'none',
            sipDscp: '26',
            rtpDscp: '46',
        },
    ]);

    const [miscellaneous] = useState<Miscellaneous>({
        currentLocalTime: '2025-11-18 00:46:01',
        localTimeZone: '+00:00 - UTC - Universal Coordinated Time',
        localTimeZoneName: 'Greenwich Mean Time: Dublin, Edinburgh, Lisbon, London',
        ntpEnabled: 'No',
        ntpStatus: 'Disabled',
        ntpServer1: 'clock.fmt.he.net',
        ntpServer2: 'clock.nyc.he.net',
        syncInterval: '86400',
        huaweiCloudUrl: '',
        huaweiCloudPort: '0',
        huaweiPhoneAppUrl: '',
        huaweiCloudWanInterface: 'Auto',
    });

    const [deviceLogs] = useState<DeviceLogEntry[]>([
        {
            id: '1',
            timestamp: '2025-11-18 00:47:16',
            severity: 'Critical',
            terminal: 'ACS(10.69.69.1)',
            result: 'Success',
            type: 'Authorization',
            source: 'smartolt',
        },
        {
            id: '2',
            timestamp: '2025-11-18 00:46:22',
            severity: 'Critical',
            terminal: 'ACS(10.69.69.1)',
            result: 'Success',
            type: 'Authorization',
            source: 'smartolt',
        },
        {
            id: '3',
            timestamp: '2025-11-17 21:23:00',
            severity: 'Critical',
            terminal: 'CLI(127.0.0.1)',
            result: 'Success',
            type: 'Logout',
            username: 'root',
        },
        {
            id: '4',
            timestamp: '2025-11-17 21:23:00',
            severity: 'Critical',
            terminal: 'CLI(127.0.0.1)',
            result: 'Success',
            cmd: 'quit',
        },
        {
            id: '5',
            timestamp: '2025-11-17 21:22:57',
            severity: 'Critical',
            terminal: 'CLI(127.0.0.1)',
            result: 'Success',
            type: 'Login',
            username: 'root',
        },
        {
            id: '6',
            timestamp: '2025-11-17 21:22:12',
            severity: 'Critical',
            terminal: 'CLI(127.0.0.1)',
            result: 'Success',
            type: 'Logout',
            username: 'root',
        },
        {
            id: '7',
            timestamp: '2025-11-17 21:22:12',
            severity: 'Critical',
            terminal: 'CLI(127.0.0.1)',
            result: 'Success',
            cmd: 'quit',
        },
    ]);

    const [selectedFileDownload, setSelectedFileDownload] = useState('-- none --');

    // Función helper para obtener token de autenticación
    const getAuthToken = async (): Promise<string> => {
        // Intentar obtener token desde @loginData (consistente con ONUDetailsScreen)
        const jsonValue = await AsyncStorage.getItem('@loginData');
        let token = null;

        if (jsonValue != null) {
            const userData = JSON.parse(jsonValue);
            token = userData.token;
        }

        // Fallback a 'userToken' si no está en @loginData
        if (!token) {
            token = await AsyncStorage.getItem('userToken');
        }

        if (!token) {
            throw new Error('No authentication token found');
        }

        return token;
    };

    // Función helper para calcular "tiempo atrás" desde un timestamp
    const getTimeAgo = (timestamp: string): string => {
        if (!timestamp) return '';

        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();

            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

            return `${hours} hours, ${minutes} minutes, ${seconds} seconds ago`;
        } catch {
            return '';
        }
    };

    // Función para cargar datos del backend
    const loadTr069Stats = async (showLoading: boolean = false) => {
        if (showLoading) {
            setIsLoading(true);
        }

        try {
            const token = await getAuthToken();

            if (!oltId || !onuSerial) {
                throw new Error('Missing OLT ID or ONU Serial');
            }

            console.log('🔄 [TR069Stats] Fetching stats for ONU:', onuSerial, 'on OLT:', oltId);

            const response = await getOnuTr069Stats(oltId, onuSerial, token);

            if (response.success && response.data) {
                console.log('✅ [TR069Stats] Data loaded successfully');
                console.log('📊 [TR069Stats] Raw data:', JSON.stringify(response.data, null, 2));
                setRawData(response.data);

                // Extraer información sobre qué requiere ACS
                const acsRequirements: any = {};

                if (response.data.wireless_lan_2_4ghz) {
                    acsRequirements.wirelessLan = response.data.wireless_lan_2_4ghz.available_via_cli === false;
                }

                if (response.data.ip_interface_1_1) {
                    acsRequirements.ipInterface11 = response.data.ip_interface_1_1.data_completeness === 'limited';
                }

                if (response.data.ip_interface_2_1) {
                    acsRequirements.ipInterface21 = response.data.ip_interface_2_1.data_completeness === 'limited';
                }

                if (response.data.wifi_site_survey) {
                    acsRequirements.wifiSurvey = response.data.wifi_site_survey.available_via_cli === false;
                }

                setRequiresACS(acsRequirements);

                // Cargar datos en estados editables para WiFi
                if (response.data.wireless_lan_2_4ghz) {
                    const wlan = response.data.wireless_lan_2_4ghz;
                    if (wlan.ssid) setWifiSsid(wlan.ssid);
                    if (wlan.password !== undefined) setWifiPassword(wlan.password || '');
                    if (wlan.auth_mode) setWifiAuthMode(wlan.auth_mode);
                    if (wlan.channel !== undefined) setWifiChannel(String(wlan.channel));
                    if (wlan.tx_power !== undefined) setWifiTxPower(String(wlan.tx_power));
                    if (wlan.country_domain) setWifiCountryDomain(wlan.country_domain);
                }

                setError(null);
            } else {
                throw new Error(response.error || 'Failed to load TR-069 statistics');
            }
        } catch (err: any) {
            console.error('❌ [TR069Stats] Error loading data:', err);
            setError(err.message || 'Error loading TR-069 statistics');
            Alert.alert(
                'Error',
                `No se pudieron cargar las estadísticas TR-069: ${err.message}`,
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        loadTr069Stats(true);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadTr069Stats(false);
    };

    // Función para guardar configuración de Wireless LAN
    const saveWirelessLanConfig = async () => {
        try {
            setIsSavingWifi(true);

            const token = await getAuthToken();

            if (!oltId || !onuSerial) {
                throw new Error('Missing OLT ID or ONU Serial');
            }

            console.log('💾 [TR069Stats] Saving WiFi config...');

            const config = {
                ssid: wifiSsid,
                password: wifiPassword,
                auth_mode: wifiAuthMode,
                channel: parseInt(wifiChannel),
                tx_power: parseInt(wifiTxPower),
                country_domain: wifiCountryDomain,
            };

            const response = await configureWirelessLan(oltId, onuSerial, config, token);

            if (response.success) {
                Alert.alert(
                    'Éxito',
                    'Configuración WiFi actualizada exitosamente',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Recargar datos
                                loadTr069Stats(true);
                            },
                        },
                    ]
                );
            } else {
                throw new Error(response.error || 'Failed to save WiFi configuration');
            }
        } catch (err: any) {
            console.error('❌ [TR069Stats] Error saving WiFi config:', err);
            Alert.alert(
                'Error',
                `No se pudo guardar la configuración WiFi: ${err.message}`,
                [{ text: 'OK' }]
            );
        } finally {
            setIsSavingWifi(false);
        }
    };

    // Función para guardar configuración de LAN DHCP
    const saveLanDhcpConfig = async () => {
        try {
            setIsSavingDhcp(true);

            const token = await getAuthToken();

            if (!oltId || !onuSerial) {
                throw new Error('Missing OLT ID or ONU Serial');
            }

            console.log('💾 [TR069Stats] Saving DHCP config...');

            const config: any = {
                dhcp_server_enable: dhcpEnabled,
            };

            // Solo incluir parámetros si DHCP está habilitado
            if (dhcpEnabled) {
                config.start_address = dhcpMinAddr;
                config.end_address = dhcpMaxAddr;
                config.subnet_mask = dhcpSubnetMask;
                config.dns_servers = dhcpDnsServers;
                config.lease_time = parseInt(leaseTimeSec);
            }

            const response = await configureLanDhcp(oltId, onuSerial, config, token);

            if (response.success) {
                Alert.alert(
                    'Éxito',
                    dhcpEnabled
                        ? 'Servidor DHCP habilitado y configurado exitosamente'
                        : 'Servidor DHCP deshabilitado exitosamente',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Recargar datos
                                loadTr069Stats(true);
                            },
                        },
                    ]
                );
            } else {
                throw new Error(response.error || 'Failed to save DHCP configuration');
            }
        } catch (err: any) {
            console.error('❌ [TR069Stats] Error saving DHCP config:', err);
            Alert.alert(
                'Error',
                `No se pudo guardar la configuración DHCP: ${err.message}`,
                [{ text: 'OK' }]
            );
        } finally {
            setIsSavingDhcp(false);
        }
    };

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    // Helper para renderizar filas de datos (solo lectura)
    const renderDataRow = (label: string, value: string | undefined, isLast: boolean = false) => {
        if (value === undefined && value !== '') return null;

        return (
            <View style={[styles.dataRow, isLast && styles.dataRowLast]}>
                <Text style={styles.dataLabel}>{label}</Text>
                <Text style={styles.dataValue}>{value || '-'}</Text>
            </View>
        );
    };

    // Helper para renderizar campo editable
    const renderEditableField = (
        label: string,
        value: string,
        onChangeText: (text: string) => void,
        isLast: boolean = false,
        placeholder: string = ''
    ) => {
        return (
            <View style={[styles.dataRow, isLast && styles.dataRowLast]}>
                <Text style={styles.dataLabel}>{label}</Text>
                <TextInput
                    style={styles.editableInput}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                />
            </View>
        );
    };

    // Helper para renderizar radio buttons
    const renderRadioButtons = (
        label: string,
        value: boolean,
        onValueChange: (val: boolean) => void,
        isLast: boolean = false
    ) => {
        return (
            <View style={[styles.dataRow, isLast && styles.dataRowLast]}>
                <Text style={styles.dataLabel}>{label}</Text>
                <View style={styles.radioContainer}>
                    <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => onValueChange(false)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.radioCircle}>
                            {!value && <View style={styles.radioCircleSelected} />}
                        </View>
                        <Text style={styles.radioLabel}>No</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => onValueChange(true)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.radioCircle}>
                            {value && <View style={styles.radioCircleSelected} />}
                        </View>
                        <Text style={styles.radioLabel}>Yes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Helper para renderizar dropdown
    const renderDropdown = (
        label: string,
        value: string,
        options: string[],
        onValueChange: (val: string) => void,
        isLast: boolean = false
    ) => {
        return (
            <View style={[styles.dataRow, isLast && styles.dataRowLast]}>
                <Text style={styles.dataLabel}>{label}</Text>
                <View style={styles.dropdownSmall}>
                    <Text style={styles.dropdownSmallText}>{value}</Text>
                    <Icon name="chevron-down" size={16} color="#6B7280" />
                </View>
            </View>
        );
    };

    // Helper para renderizar mensaje de ACS requerido
    const renderACSWarning = (sectionName: string, recommendation?: string) => {
        return (
            <View style={styles.acsWarningContainer}>
                <Icon name="alert-circle-outline" size={48} color="#F59E0B" />
                <Text style={styles.acsWarningTitle}>Requiere Servidor ACS</Text>
                <Text style={styles.acsWarningText}>
                    {recommendation ||
                    `Los datos de ${sectionName} solo están disponibles a través de un servidor TR-069 ACS (como GenieACS). Actualmente, el sistema usa CLI directo de la OLT.`}
                </Text>
                <Text style={styles.acsWarningSubtext}>
                    Consulta la documentación para instalar GenieACS.
                </Text>
            </View>
        );
    };

    // Handler para agregar pending provisions
    const handleAddPendingProvision = () => {
        if (pendingProvisions.trim() === '') {
            console.log('Pending provision vacío');
            return;
        }
        // TODO: Implementar agregar pending provision
        console.log('Add pending provision:', pendingProvisions);
        setPendingProvisions('');
    };

    // Handler para agregar port forwarding
    const handleAddPortForward = () => {
        // TODO: Implementar agregar port forward
        console.log('Add port forward');
    };

    // Handler para eliminar IP WAN
    const handleRemoveIpWan = (interfaceName: string) => {
        // TODO: Implementar eliminar IP WAN
        console.log('Remove IP WAN:', interfaceName);
    };

    // Handlers para troubleshooting
    const handleIpPing = async () => {
        if (!oltId || !onuSerial) {
            Alert.alert('Error', 'Faltan datos de OLT u ONU');
            return;
        }

        Alert.prompt(
            'IP Ping',
            'Ingrese la dirección IP o dominio a hacer ping:',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Ejecutar',
                    onPress: async (host) => {
                        if (!host || host.trim() === '') {
                            Alert.alert('Error', 'Debe ingresar una dirección válida');
                            return;
                        }

                        try {
                            Alert.alert('Ejecutando', 'Por favor espere...');
                            const token = await getAuthToken();

                            const response = await diagnosticPing(
                                oltId,
                                onuSerial,
                                {
                                    host: host.trim(),
                                    number_of_repetitions: 4,
                                    timeout: 1000
                                },
                                token
                            );

                            if (response.success && response.data) {
                                const data = response.data;
                                Alert.alert(
                                    'Resultado de Ping',
                                    `Host: ${host}\n\n` +
                                    `Paquetes exitosos: ${data.success_count}\n` +
                                    `Paquetes fallidos: ${data.failure_count}\n` +
                                    `Tiempo promedio: ${data.average_response_time} ms\n` +
                                    `Tiempo mínimo: ${data.min_response_time} ms\n` +
                                    `Tiempo máximo: ${data.max_response_time} ms`
                                );
                            } else {
                                throw new Error(response.error || 'No se pudo ejecutar ping');
                            }
                        } catch (err: any) {
                            Alert.alert('Error', `No se pudo ejecutar ping: ${err.message}`);
                        }
                    }
                }
            ],
            'plain-text',
            '8.8.8.8'
        );
    };

    const handleDownloadTest = async () => {
        if (!oltId || !onuSerial) {
            Alert.alert('Error', 'Faltan datos de OLT u ONU');
            return;
        }

        Alert.alert(
            'Test de Descarga',
            '¿Desea ejecutar un test de velocidad de descarga?\n\nEsto puede tardar 15-30 segundos.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Ejecutar',
                    onPress: async () => {
                        try {
                            Alert.alert('Ejecutando', 'Midiendo velocidad de descarga...');
                            const token = await getAuthToken();

                            const response = await diagnosticSpeedTest(
                                oltId,
                                onuSerial,
                                { direction: 'download' },
                                token
                            );

                            if (response.success && response.data) {
                                const data = response.data;
                                Alert.alert(
                                    'Resultado - Test de Descarga',
                                    `Velocidad de descarga: ${data.download_mbps.toFixed(2)} Mbps\n` +
                                    `Latencia: ${data.latency_ms} ms\n` +
                                    `Jitter: ${data.jitter_ms} ms\n` +
                                    `Duración: ${data.test_duration_seconds} segundos`
                                );
                            } else {
                                throw new Error(response.error || 'No se pudo ejecutar test');
                            }
                        } catch (err: any) {
                            Alert.alert('Error', `No se pudo ejecutar test: ${err.message}`);
                        }
                    }
                }
            ]
        );
    };

    const handleUploadTest = async () => {
        if (!oltId || !onuSerial) {
            Alert.alert('Error', 'Faltan datos de OLT u ONU');
            return;
        }

        Alert.alert(
            'Test de Subida',
            '¿Desea ejecutar un test de velocidad de subida?\n\nEsto puede tardar 15-30 segundos.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Ejecutar',
                    onPress: async () => {
                        try {
                            Alert.alert('Ejecutando', 'Midiendo velocidad de subida...');
                            const token = await getAuthToken();

                            const response = await diagnosticSpeedTest(
                                oltId,
                                onuSerial,
                                { direction: 'upload' },
                                token
                            );

                            if (response.success && response.data) {
                                const data = response.data;
                                Alert.alert(
                                    'Resultado - Test de Subida',
                                    `Velocidad de subida: ${data.upload_mbps.toFixed(2)} Mbps\n` +
                                    `Latencia: ${data.latency_ms} ms\n` +
                                    `Jitter: ${data.jitter_ms} ms\n` +
                                    `Duración: ${data.test_duration_seconds} segundos`
                                );
                            } else {
                                throw new Error(response.error || 'No se pudo ejecutar test');
                            }
                        } catch (err: any) {
                            Alert.alert('Error', `No se pudo ejecutar test: ${err.message}`);
                        }
                    }
                }
            ]
        );
    };

    const handleTraceRoute = async () => {
        if (!oltId || !onuSerial) {
            Alert.alert('Error', 'Faltan datos de OLT u ONU');
            return;
        }

        Alert.prompt(
            'Trace Route',
            'Ingrese la dirección IP o dominio para rastrear:',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Ejecutar',
                    onPress: async (host) => {
                        if (!host || host.trim() === '') {
                            Alert.alert('Error', 'Debe ingresar una dirección válida');
                            return;
                        }

                        try {
                            Alert.alert('Ejecutando', 'Rastreando ruta, por favor espere...');
                            const token = await getAuthToken();

                            const response = await diagnosticTraceroute(
                                oltId,
                                onuSerial,
                                {
                                    host: host.trim(),
                                    max_hop_count: 30,
                                    timeout: 5000
                                },
                                token
                            );

                            if (response.success && response.data && response.data.hops) {
                                const hops = response.data.hops;
                                let message = `Ruta hacia ${host}:\n\n`;
                                hops.forEach(hop => {
                                    message += `${hop.hop_number}. ${hop.host} - ${hop.response_time} ms\n`;
                                });
                                Alert.alert('Resultado de Traceroute', message);
                            } else {
                                throw new Error(response.error || 'No se pudo ejecutar traceroute');
                            }
                        } catch (err: any) {
                            Alert.alert('Error', `No se pudo ejecutar traceroute: ${err.message}`);
                        }
                    }
                }
            ],
            'plain-text',
            '8.8.8.8'
        );
    };

    // Handler para iniciar descarga de archivo
    const handleStartFileDownload = () => {
        if (selectedFileDownload === '-- none --') {
            // TODO: Mostrar mensaje de error
            console.log('Seleccione un archivo para descargar');
            return;
        }
        // TODO: Implementar descarga de archivo
        console.log('Start download:', selectedFileDownload);
    };

    // Helper para renderizar entrada de log
    const renderLogEntry = (log: DeviceLogEntry) => {
        let logText = `${log.timestamp} [${log.severity}] Terminal:${log.terminal},Result:${log.result}`;

        if (log.type) {
            logText += `,Type:${log.type}`;
        }
        if (log.cmd) {
            logText += `,Cmd:${log.cmd}`;
        }
        if (log.username) {
            logText += `,Username:${log.username}`;
        }
        if (log.source) {
            logText += `,${log.source}:`;
        }

        return logText;
    };

    const sections = [
        { id: 'general', title: 'General', icon: 'information' },
        { id: 'portForward', title: 'Port Forward', icon: 'swap-horizontal' },
        { id: 'ipInterface11', title: 'IP Interface 1.1', icon: 'ip-network' },
        { id: 'ipInterface21', title: 'IP Interface 2.1', icon: 'ip-network' },
        { id: 'lanDhcp', title: 'LAN DHCP Server', icon: 'server-network' },
        { id: 'lanPorts', title: 'LAN Ports', icon: 'ethernet' },
        { id: 'lanCounters', title: 'LAN Counters', icon: 'counter' },
        { id: 'wirelessLan', title: 'Wireless LAN 1', icon: 'wifi' },
        { id: 'wlanCounters', title: 'WLAN Counters', icon: 'chart-bar' },
        { id: 'wifiSurvey', title: 'Wifi 2.4GHz Site Survey', icon: 'wifi-settings' },
        { id: 'hosts', title: 'Hosts', icon: 'devices' },
        { id: 'security', title: 'Security', icon: 'shield-lock' },
        { id: 'voiceLines', title: 'Voice lines', icon: 'phone' },
        { id: 'miscellaneous', title: 'Miscellaneous', icon: 'cog' },
        { id: 'troubleshooting', title: 'Troubleshooting', icon: 'tools' },
        { id: 'deviceLogs', title: 'Device Logs', icon: 'text-box' },
        { id: 'fileFirmware', title: 'File & Firmware management', icon: 'file-download' },
    ];

    const renderSectionContent = (sectionId: string) => {
        switch (sectionId) {
            case 'general':
                if (!rawData || !rawData.general) {
                    return (
                        <View style={styles.sectionContent}>
                            <Text style={styles.noRecordsText}>No hay datos disponibles</Text>
                        </View>
                    );
                }

                const general = rawData.general;
                return (
                    <View style={styles.sectionContent}>
                        {renderDataRow('Model name', general.model_name)}
                        {renderDataRow('Software version', general.software_version)}
                        {renderDataRow('Hardware version', general.hardware_version)}
                        {renderDataRow('Serial number', general.serial_number || onuSerial)}
                        {renderDataRow('Optical Power RX', general.optical_power_rx)}
                        {renderDataRow('Optical Power TX', general.optical_power_tx)}
                        {renderDataRow('Distance', general.distance)}
                        {renderDataRow('Temperature', general.temperature)}
                        {renderDataRow('Voltage', general.voltage)}
                        {renderDataRow('Uptime', general.uptime)}
                        {general.uptime && renderDataRow('', getTimeAgo(general.uptime))}
                        {renderDataRow('Last seen', general.last_seen)}
                        {general.last_seen && renderDataRow('', getTimeAgo(general.last_seen))}

                        {/* Pending provisions con input y botón */}
                        <View style={styles.dataRow}>
                            <Text style={styles.dataLabel}>Pending provisions</Text>
                            <View style={styles.pendingProvisionsContainer}>
                                <TextInput
                                    style={styles.pendingProvisionsInput}
                                    value={pendingProvisions}
                                    onChangeText={setPendingProvisions}
                                    placeholder="Enter provision"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                />
                                <TouchableOpacity
                                    style={styles.addProvisionButton}
                                    onPress={handleAddPendingProvision}
                                    activeOpacity={0.7}
                                >
                                    <Icon name="plus" size={18} color="#FFFFFF" />
                                    <Text style={styles.addProvisionButtonText}>Add</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                );

            case 'portForward':
                return (
                    <View style={styles.sectionContent}>
                        <Text style={styles.noRecordsText}>No records found</Text>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleAddPortForward}
                            activeOpacity={0.7}
                        >
                            <Icon name="plus-circle" size={20} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Agregar redireccionamiento de puerto</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'ipInterface11':
                if (!rawData || !rawData.ip_interface_1_1) {
                    return (
                        <View style={styles.sectionContent}>
                            <Text style={styles.noRecordsText}>No hay datos disponibles</Text>
                        </View>
                    );
                }

                const ip11 = rawData.ip_interface_1_1;

                // Si requiere ACS y no hay datos completos, mostrar advertencia
                if (requiresACS.ipInterface11 && ip11.data_completeness === 'limited') {
                    return (
                        <View style={styles.sectionContent}>
                            {renderDataRow('Status', 'Datos limitados (requiere ACS)')}
                            {ip11.limitation && renderDataRow('Limitación', ip11.limitation)}

                            {renderACSWarning('IP Interface 1.1', ip11.recommendation)}
                        </View>
                    );
                }

                return (
                    <View style={styles.sectionContent}>
                        {ip11.available_via_cli === false && (
                            <Text style={styles.limitedDataBanner}>⚠️ Datos limitados - Se recomienda servidor ACS para información completa</Text>
                        )}
                        {renderDataRow('Name', ip11.name || 'N/A')}
                        {renderDataRow('Status', ip11.status || 'Unknown')}
                        {renderDataRow('IP Address', ip11.ip_address || 'N/A')}
                        {renderDataRow('Subnet Mask', ip11.subnet_mask || 'N/A')}
                        {renderDataRow('Gateway', ip11.gateway || 'N/A')}
                        {renderDataRow('DNS Servers', ip11.dns_servers || 'N/A')}
                        {renderDataRow('MAC Address', ip11.mac_address || 'N/A')}
                        {renderDataRow('VLAN ID', ip11.vlan_id || 'N/A', true)}
                    </View>
                );

            case 'ipInterface21':
                if (!rawData || !rawData.ip_interface_2_1) {
                    return (
                        <View style={styles.sectionContent}>
                            <Text style={styles.noRecordsText}>No hay datos disponibles</Text>
                        </View>
                    );
                }

                const ip21 = rawData.ip_interface_2_1;

                // Si requiere ACS y no hay datos completos, mostrar advertencia
                if (requiresACS.ipInterface21 && ip21.data_completeness === 'limited') {
                    return (
                        <View style={styles.sectionContent}>
                            {renderDataRow('Status', 'Datos limitados (requiere ACS)')}
                            {ip21.limitation && renderDataRow('Limitación', ip21.limitation)}

                            {renderACSWarning('IP Interface 2.1', ip21.recommendation)}
                        </View>
                    );
                }

                return (
                    <View style={styles.sectionContent}>
                        {ip21.available_via_cli === false && (
                            <Text style={styles.limitedDataBanner}>⚠️ Datos limitados - Se recomienda servidor ACS para información completa</Text>
                        )}
                        {renderDataRow('Name', ip21.name || 'N/A')}
                        {renderDataRow('Status', ip21.status || 'Unknown')}
                        {renderDataRow('IP Address', ip21.ip_address || 'N/A')}
                        {renderDataRow('Subnet Mask', ip21.subnet_mask || 'N/A')}
                        {renderDataRow('Gateway', ip21.gateway || 'N/A')}
                        {renderDataRow('DNS Servers', ip21.dns_servers || 'N/A')}
                        {renderDataRow('MAC Address', ip21.mac_address || 'N/A')}
                        {renderDataRow('VLAN ID', ip21.vlan_id || 'N/A', true)}
                    </View>
                );

            case 'lanDhcp':
                return (
                    <View style={styles.sectionContent}>
                        {renderEditableField('LAN IP interface address', lanIpAddress, setLanIpAddress)}
                        {renderEditableField('LAN IP interface netmask', lanNetmask, setLanNetmask)}
                        {renderRadioButtons('DHCP Server Enable', dhcpEnabled, setDhcpEnabled)}
                        {renderEditableField('DHCP IP Pool Min addr', dhcpMinAddr, setDhcpMinAddr)}
                        {renderEditableField('DHCP IP Pool Max addr', dhcpMaxAddr, setDhcpMaxAddr)}
                        {renderEditableField('DHCP Subnet Mask', dhcpSubnetMask, setDhcpSubnetMask)}
                        {renderEditableField('DHCP Default Gateway', dhcpGateway, setDhcpGateway)}
                        {renderEditableField('DHCP DNS Servers', dhcpDnsServers, setDhcpDnsServers)}
                        {renderEditableField('Clients domain name', clientsDomainName, setClientsDomainName, false, 'Optional')}
                        {renderEditableField('Reserved IP address', reservedIpAddress, setReservedIpAddress, false, 'Optional')}
                        {renderEditableField('Lease time in sec', leaseTimeSec, setLeaseTimeSec)}

                        {/* Botón Save */}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={saveLanDhcpConfig}
                            disabled={isSavingDhcp}
                            activeOpacity={0.7}
                        >
                            {isSavingDhcp ? (
                                <>
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Guardando...</Text>
                                </>
                            ) : (
                                <>
                                    <Icon name="content-save" size={20} color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Guardar Configuración DHCP</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                );

            case 'lanPorts':
                return (
                    <View style={styles.sectionContent}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                            <View>
                                {/* Table Header */}
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.tableHeaderCell, { width: 40 }]}>#</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 80 }]}>Name</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 70 }]}>Enable</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 70 }]}>Status</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 60 }]}>Speed</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 60 }]}>Duplex</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 80 }]}>L3 Enable</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 90 }]}>Speed mode</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 100 }]}>Duplex mode</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 100 }]}>Flow control</Text>
                                </View>

                                {/* Table Rows */}
                                {lanPorts.map((port, index) => (
                                    <View key={port.id} style={styles.tableRow}>
                                        <Text style={[styles.tableCell, { width: 40 }]}>{port.id}</Text>
                                        <Text style={[styles.tableCell, { width: 80 }]}>{port.name}</Text>
                                        <Text style={[styles.tableCell, { width: 70 }]}>{port.enable}</Text>
                                        <Text style={[styles.tableCell, { width: 70 }]}>{port.status}</Text>
                                        <Text style={[styles.tableCell, { width: 60 }]}>{port.speed}</Text>
                                        <Text style={[styles.tableCell, { width: 60 }]}>{port.duplex}</Text>
                                        <Text style={[styles.tableCell, { width: 80 }]}>{port.l3Enable}</Text>
                                        <Text style={[styles.tableCell, { width: 90 }]}>{port.speedMode}</Text>
                                        <Text style={[styles.tableCell, { width: 100 }]}>{port.duplexMode}</Text>
                                        <Text style={[styles.tableCell, { width: 100 }]}>{port.flowControl}</Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                );

            case 'lanCounters':
                return (
                    <View style={styles.sectionContent}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                            <View>
                                {/* Table Header */}
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.tableHeaderCell, { width: 40 }]}>#</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 80 }]}>Bytes In</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 80 }]}>Bytes Out</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 70 }]}>Pkts I</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 70 }]}>Pkts O</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 60 }]}>Uni I</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 60 }]}>Uni O</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 70 }]}>Multi I</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 70 }]}>Multi O</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 60 }]}>Bro I</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 60 }]}>Bro O</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 60 }]}>Err I</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 60 }]}>Err O</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 60 }]}>Disc I</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 60 }]}>Disc O</Text>
                                </View>

                                {/* Table Rows */}
                                {lanCounters.map((counter) => (
                                    <View key={counter.id} style={styles.tableRow}>
                                        <Text style={[styles.tableCell, { width: 40 }]}>{counter.id}</Text>
                                        <Text style={[styles.tableCell, { width: 80 }]}>{counter.bytesIn}</Text>
                                        <Text style={[styles.tableCell, { width: 80 }]}>{counter.bytesOut}</Text>
                                        <Text style={[styles.tableCell, { width: 70 }]}>{counter.pktsIn}</Text>
                                        <Text style={[styles.tableCell, { width: 70 }]}>{counter.pktsOut}</Text>
                                        <Text style={[styles.tableCell, { width: 60 }]}>{counter.uniIn}</Text>
                                        <Text style={[styles.tableCell, { width: 60 }]}>{counter.uniOut}</Text>
                                        <Text style={[styles.tableCell, { width: 70 }]}>{counter.multiIn}</Text>
                                        <Text style={[styles.tableCell, { width: 70 }]}>{counter.multiOut}</Text>
                                        <Text style={[styles.tableCell, { width: 60 }]}>{counter.broIn}</Text>
                                        <Text style={[styles.tableCell, { width: 60 }]}>{counter.broOut}</Text>
                                        <Text style={[styles.tableCell, { width: 60 }]}>{counter.errIn}</Text>
                                        <Text style={[styles.tableCell, { width: 60 }]}>{counter.errOut}</Text>
                                        <Text style={[styles.tableCell, { width: 60 }]}>{counter.discIn}</Text>
                                        <Text style={[styles.tableCell, { width: 60 }]}>{counter.discOut}</Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                );

            case 'wirelessLan':
                if (!rawData || !rawData.wireless_lan_2_4ghz) {
                    return (
                        <View style={styles.sectionContent}>
                            <Text style={styles.noRecordsText}>No hay datos disponibles</Text>
                        </View>
                    );
                }

                const wlan = rawData.wireless_lan_2_4ghz;

                // Si requiere ACS y no está disponible vía CLI
                if (requiresACS.wirelessLan && wlan.available_via_cli === false) {
                    return (
                        <View style={styles.sectionContent}>
                            {renderACSWarning('Wireless LAN 2.4GHz', wlan.recommendation)}
                        </View>
                    );
                }

                // Mostrar datos disponibles (aunque sea limitado)
                return (
                    <View style={styles.sectionContent}>
                        {wlan.available_via_cli === false && (
                            <View style={{ backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                                <Text style={{ color: '#92400E', fontSize: 13, fontWeight: '600' }}>
                                    ⚠️ Datos limitados - Se recomienda servidor ACS para información completa
                                </Text>
                            </View>
                        )}

                        {/* Campos editables para WiFi */}
                        {renderEditableField('SSID', wifiSsid, setWifiSsid)}
                        {renderEditableField('Password', wifiPassword, setWifiPassword)}

                        {/* Auth Mode Dropdown */}
                        <View style={[styles.dataRow]}>
                            <Text style={styles.dataLabel}>Authentication mode</Text>
                            <View style={styles.dropdownSmall}>
                                <Text style={styles.dropdownSmallText}>{wifiAuthMode}</Text>
                                <Icon name="chevron-down" size={16} color={isDarkMode ? '#FFFFFF' : '#000000'} />
                            </View>
                        </View>

                        {/* Campos de solo lectura */}
                        {wlan.status && renderDataRow('Status', wlan.status)}
                        {wlan.enable !== undefined && renderDataRow('Enable', wlan.enable)}
                        {wlan.rf_band && renderDataRow('RF Band', wlan.rf_band)}
                        {wlan.standard && renderDataRow('Standard', wlan.standard)}
                        {wlan.radio_enabled !== undefined && renderDataRow('Radio enabled', wlan.radio_enabled)}
                        {wlan.total_associations !== undefined && renderDataRow('Total associations', String(wlan.total_associations))}
                        {wlan.ssid_advertisement_enabled !== undefined && renderDataRow('SSID Advertisement Enabled', wlan.ssid_advertisement_enabled)}
                        {wlan.wpa_encryption && renderDataRow('WPA Encryption', wlan.wpa_encryption)}
                        {wlan.channel_width && renderDataRow('Channel width', wlan.channel_width)}
                        {wlan.auto_channel !== undefined && renderDataRow('Auto channel', wlan.auto_channel)}

                        {/* Campos editables */}
                        {renderEditableField('Channel', wifiChannel, setWifiChannel)}
                        {renderDataRow('Country Regulatory Domain', wlan.country_domain || wifiCountryDomain)}
                        {renderEditableField('Tx Power', wifiTxPower, setWifiTxPower, true)}

                        {/* Botón Save */}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={saveWirelessLanConfig}
                            disabled={isSavingWifi}
                            activeOpacity={0.7}
                        >
                            {isSavingWifi ? (
                                <>
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Guardando...</Text>
                                </>
                            ) : (
                                <>
                                    <Icon name="content-save" size={20} color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Guardar Configuración WiFi</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Si no hay datos disponibles, mostrar mensaje */}
                        {!wlan.ssid && !wlan.status && (
                            <Text style={styles.noRecordsText}>
                                No se pudieron obtener datos de Wireless LAN. {wlan.limitation || ''}
                            </Text>
                        )}
                    </View>
                );

            case 'wlanCounters':
                return (
                    <View style={styles.sectionContent}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                            <View>
                                {/* Table Header */}
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.tableHeaderCell, { width: 40 }]}>#</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 100 }]}>Bytes in</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 100 }]}>Bytes out</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 80 }]}>Pkts in</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 80 }]}>Pkts out</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 100 }]}>Discards in</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 100 }]}>Discards out</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 70 }]}>Err in</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 70 }]}>Err out</Text>
                                </View>

                                {/* Table Row */}
                                <View style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { width: 40 }]}>1</Text>
                                    <Text style={[styles.tableCell, { width: 100 }]}>{wlanCounter.bytesIn}</Text>
                                    <Text style={[styles.tableCell, { width: 100 }]}>{wlanCounter.bytesOut}</Text>
                                    <Text style={[styles.tableCell, { width: 80 }]}>{wlanCounter.pktsIn}</Text>
                                    <Text style={[styles.tableCell, { width: 80 }]}>{wlanCounter.pktsOut}</Text>
                                    <Text style={[styles.tableCell, { width: 100 }]}>{wlanCounter.discardsIn}</Text>
                                    <Text style={[styles.tableCell, { width: 100 }]}>{wlanCounter.discardsOut}</Text>
                                    <Text style={[styles.tableCell, { width: 70 }]}>{wlanCounter.errIn}</Text>
                                    <Text style={[styles.tableCell, { width: 70 }]}>{wlanCounter.errOut}</Text>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                );

            case 'wifiSurvey':
                if (!rawData || !rawData.wifi_site_survey) {
                    return (
                        <View style={styles.sectionContent}>
                            <Text style={styles.noRecordsText}>No hay datos disponibles</Text>
                        </View>
                    );
                }

                const wifiSurvey = rawData.wifi_site_survey;

                // Si requiere ACS y no está disponible vía CLI
                if (requiresACS.wifiSurvey && wifiSurvey.available_via_cli === false) {
                    return (
                        <View style={styles.sectionContent}>
                            {renderACSWarning('WiFi Site Survey 2.4GHz', wifiSurvey.recommendation)}
                        </View>
                    );
                }

                // Mostrar datos de survey disponibles
                const hasNetworks = wifiSurvey.networks && wifiSurvey.networks.length > 0;

                return (
                    <View style={styles.sectionContent}>
                        {wifiSurvey.available_via_cli === false && (
                            <View style={{ backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                                <Text style={{ color: '#92400E', fontSize: 13, fontWeight: '600' }}>
                                    ⚠️ WiFi Site Survey requiere servidor ACS
                                </Text>
                            </View>
                        )}

                        {!hasNetworks ? (
                            <>
                                <Text style={styles.noRecordsText}>No records found</Text>
                                <View style={styles.graphPlaceholder}>
                                    <Text style={styles.graphTitle}>Site survey 2.4 GHz</Text>
                                    <Text style={styles.graphSubtext}>2401–2483 MHz</Text>
                                    <Text style={styles.graphSubtext}>No detected networks (-99 dBm)</Text>
                                </View>
                            </>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                                <View>
                                    {/* Table Header */}
                                    <View style={styles.tableHeader}>
                                        <Text style={[styles.tableHeaderCell, { width: 40 }]}>#</Text>
                                        <Text style={[styles.tableHeaderCell, { width: 150 }]}>SSID</Text>
                                        <Text style={[styles.tableHeaderCell, { width: 80 }]}>Channel</Text>
                                        <Text style={[styles.tableHeaderCell, { width: 120 }]}>Signal Strength</Text>
                                        <Text style={[styles.tableHeaderCell, { width: 100 }]}>Security</Text>
                                    </View>

                                    {/* Table Rows */}
                                    {wifiSurvey.networks.map((network: any, index: number) => (
                                        <View key={index} style={styles.tableRow}>
                                            <Text style={[styles.tableCell, { width: 40 }]}>{index + 1}</Text>
                                            <Text style={[styles.tableCell, { width: 150 }]}>{network.ssid || 'Unknown'}</Text>
                                            <Text style={[styles.tableCell, { width: 80 }]}>{network.channel || '-'}</Text>
                                            <Text style={[styles.tableCell, { width: 120 }]}>{network.signal_strength || '-'}</Text>
                                            <Text style={[styles.tableCell, { width: 100 }]}>{network.security || '-'}</Text>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        )}
                    </View>
                );

            case 'hosts':
                return (
                    <View style={styles.sectionContent}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                            <View>
                                {/* Table Header */}
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.tableHeaderCell, { width: 40 }]}>#</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 140 }]}>MAC Address</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 110 }]}>IP Address</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 110 }]}>Address source</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 180 }]}>Hostname</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 70 }]}>Port</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 70 }]}>Active</Text>
                                </View>

                                {/* Table Rows */}
                                {hosts.map((host) => (
                                    <View key={host.id} style={styles.tableRow}>
                                        <Text style={[styles.tableCell, { width: 40 }]}>{host.id}</Text>
                                        <Text style={[styles.tableCell, { width: 140 }]}>{host.macAddress}</Text>
                                        <Text style={[styles.tableCell, { width: 110 }]}>{host.ipAddress}</Text>
                                        <Text style={[styles.tableCell, { width: 110 }]}>{host.addressSource}</Text>
                                        <Text style={[styles.tableCell, { width: 180 }]}>{host.hostname || '-'}</Text>
                                        <Text style={[styles.tableCell, { width: 70 }]}>{host.port}</Text>
                                        <Text style={[styles.tableCell, { width: 70 }]}>{host.active}</Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                );

            case 'security':
                return (
                    <View style={styles.sectionContent}>
                        {renderDataRow('FTP access from WAN', securitySettings.ftpWan)}
                        {renderDataRow('FTP access from LAN', securitySettings.ftpLan)}
                        {renderDataRow('User interface access from WAN', securitySettings.uiWan)}
                        {renderDataRow('User interface access from LAN', securitySettings.uiLan)}
                        {renderDataRow('SSH access from WAN', securitySettings.sshWan)}
                        {renderDataRow('SSH access from LAN', securitySettings.sshLan)}
                        {renderDataRow('Samba access from WAN', securitySettings.sambaWan)}
                        {renderDataRow('Samba access from LAN', securitySettings.sambaLan)}
                        {renderDataRow('Telnet access from WAN', securitySettings.telnetWan)}
                        {renderDataRow('Telnet access from LAN', securitySettings.telnetLan)}
                        {renderDataRow('WAN ICMP Echo reply', securitySettings.wanIcmpEcho)}
                        {renderDataRow('SSH Service', securitySettings.sshService)}
                        {renderDataRow('Telnet Service', securitySettings.telnetService)}
                        {renderDataRow('CLI Username', securitySettings.cliUsername)}
                        {renderDataRow('CLI Password', securitySettings.cliPassword || '(empty)')}
                        {renderDataRow('Web user account', securitySettings.webUserEnabled)}
                        {renderDataRow('Web username', securitySettings.webUsername)}
                        {renderDataRow('Web password', securitySettings.webPassword || '(empty)')}
                        {renderDataRow('Web admin account', securitySettings.webAdminEnabled)}
                        {renderDataRow('Web admin name', securitySettings.webAdminName)}
                        {renderDataRow('Web admin password', securitySettings.webAdminPassword || '(empty)', true)}
                    </View>
                );

            case 'voiceLines':
                return (
                    <View style={styles.sectionContent}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                            <View>
                                {/* Table Header */}
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.tableHeaderCell, { width: 40 }]}>#</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 70 }]}>Profile</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 80 }]}>Number</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 70 }]}>Enable</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 100 }]}>User name</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 90 }]}>Status</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 60 }]}>Port</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 90 }]}>Call state</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 140 }]}>DTMF TM</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 70 }]}>Fax T38</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 90 }]}>T38 Bitrate</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 80 }]}>SIP DSCP</Text>
                                    <Text style={[styles.tableHeaderCell, { width: 80 }]}>RTP DSCP</Text>
                                </View>

                                {/* Table Rows */}
                                {voiceLines.map((line) => (
                                    <View key={line.id} style={styles.tableRow}>
                                        <Text style={[styles.tableCell, { width: 40 }]}>{line.id}</Text>
                                        <Text style={[styles.tableCell, { width: 70 }]}>{line.profile}</Text>
                                        <Text style={[styles.tableCell, { width: 80 }]}>{line.number || '-'}</Text>
                                        <Text style={[styles.tableCell, { width: 70 }]}>{line.enable || '-'}</Text>
                                        <Text style={[styles.tableCell, { width: 100 }]}>{line.userName || '-'}</Text>
                                        <Text style={[styles.tableCell, { width: 90 }]}>{line.status}</Text>
                                        <Text style={[styles.tableCell, { width: 60 }]}>{line.port}</Text>
                                        <Text style={[styles.tableCell, { width: 90 }]}>{line.callState}</Text>
                                        <Text style={[styles.tableCell, { width: 140 }]}>{line.dtmfTm}</Text>
                                        <Text style={[styles.tableCell, { width: 70 }]}>{line.faxT38}</Text>
                                        <Text style={[styles.tableCell, { width: 90 }]}>{line.t38Bitrate}</Text>
                                        <Text style={[styles.tableCell, { width: 80 }]}>{line.sipDscp}</Text>
                                        <Text style={[styles.tableCell, { width: 80 }]}>{line.rtpDscp}</Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                );

            case 'miscellaneous':
                return (
                    <View style={styles.sectionContent}>
                        {renderDataRow('Current local time', miscellaneous.currentLocalTime)}
                        {renderDataRow('Local time zone', miscellaneous.localTimeZone)}
                        {renderDataRow('Local Time Zone Name', miscellaneous.localTimeZoneName)}
                        {renderDataRow('NTP Enabled', miscellaneous.ntpEnabled)}
                        {renderDataRow('NTP Status', miscellaneous.ntpStatus)}
                        {renderDataRow('NTP Server 1', miscellaneous.ntpServer1)}
                        {renderDataRow('NTP Server 2', miscellaneous.ntpServer2)}
                        {renderDataRow('Sync interval', miscellaneous.syncInterval)}
                        {renderDataRow('Huawei Cloud URL', miscellaneous.huaweiCloudUrl || '(empty)')}
                        {renderDataRow('Huawei Cloud Port', miscellaneous.huaweiCloudPort)}
                        {renderDataRow('Huawei Phone App URL', miscellaneous.huaweiPhoneAppUrl || '(empty)')}
                        {renderDataRow('Huawei Cloud WAN Interface', miscellaneous.huaweiCloudWanInterface, true)}
                    </View>
                );

            case 'troubleshooting':
                return (
                    <View style={styles.sectionContent}>
                        <Text style={styles.sectionSubtitle}>Available diagnostic tools:</Text>
                        <View style={styles.troubleshootingButtons}>
                            <TouchableOpacity
                                style={styles.troubleshootingButton}
                                onPress={handleIpPing}
                                activeOpacity={0.7}
                            >
                                <Icon name="network-outline" size={20} color="#3B82F6" />
                                <Text style={styles.troubleshootingButtonText}>IP Ping</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.troubleshootingButton}
                                onPress={handleDownloadTest}
                                activeOpacity={0.7}
                            >
                                <Icon name="download" size={20} color="#3B82F6" />
                                <Text style={styles.troubleshootingButtonText}>Download test</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.troubleshootingButton}
                                onPress={handleUploadTest}
                                activeOpacity={0.7}
                            >
                                <Icon name="upload" size={20} color="#3B82F6" />
                                <Text style={styles.troubleshootingButtonText}>Upload test</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.troubleshootingButton}
                                onPress={handleTraceRoute}
                                activeOpacity={0.7}
                            >
                                <Icon name="map-marker-path" size={20} color="#3B82F6" />
                                <Text style={styles.troubleshootingButtonText}>Trace Route</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            case 'deviceLogs':
                return (
                    <View style={styles.sectionContent}>
                        <Text style={styles.sectionSubtitle}>Logs</Text>
                        <View style={styles.logsContainer}>
                            {deviceLogs.map((log) => (
                                <View key={log.id} style={styles.logEntry}>
                                    <Text style={styles.logText}>{renderLogEntry(log)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                );

            case 'fileFirmware':
                return (
                    <View style={styles.sectionContent}>
                        <Text style={styles.sectionSubtitle}>File Download (ACS → ONU)</Text>

                        <View style={styles.dropdownContainer}>
                            <Text style={styles.dropdownLabel}>Seleccionar archivo:</Text>
                            <View style={styles.dropdown}>
                                <Text style={styles.dropdownText}>{selectedFileDownload}</Text>
                                <Icon name="chevron-down" size={20} color="#6B7280" />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.downloadButton}
                            onPress={handleStartFileDownload}
                            activeOpacity={0.7}
                        >
                            <Icon name="download" size={20} color="#FFFFFF" />
                            <Text style={styles.downloadButtonText}>Start download</Text>
                        </TouchableOpacity>
                    </View>
                );

            default:
                // Fallback para cualquier sección no implementada
                return (
                    <View style={styles.sectionContent}>
                        <Text style={styles.placeholderText}>
                            Contenido de {sections.find(s => s.id === sectionId)?.title}
                        </Text>
                        <Text style={styles.placeholderSubtext}>
                            Los datos se agregarán próximamente
                        </Text>
                    </View>
                );
        }
    };

    // Mostrar indicador de carga inicial
    if (isLoading) {
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
                                <Text style={styles.headerTitle}>TR-069 Statistics</Text>
                                <Text style={styles.headerSubtitle}>
                                    {onuSerial || `ONU ${onuId}`}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.headerActions}>
                            <ThemeSwitch />
                        </View>
                    </View>
                </View>

                {/* Loading indicator */}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Cargando estadísticas TR-069...</Text>
                    <Text style={styles.loadingSubtext}>Esto puede tomar hasta 30 segundos</Text>
                </View>
            </View>
        );
    }

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
                            <Text style={styles.headerTitle}>TR-069 Statistics</Text>
                            <Text style={styles.headerSubtitle}>
                                {onuSerial || `ONU ${onuId}`}
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
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor="#3B82F6"
                    />
                }
            >
                {/* Context Info Card */}
                {(clienteNombre || macAddress || modelo || planServicio) && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardHeaderLeft}>
                                <Icon name="account-network" size={24} color="#10B981" />
                                <Text style={styles.cardTitle}>Información del Cliente</Text>
                            </View>
                        </View>
                        <View style={styles.sectionContent}>
                            {clienteNombre && renderDataRow('Cliente', clienteNombre)}
                            {clienteDireccion && renderDataRow('Dirección', clienteDireccion)}
                            {modelo && renderDataRow('Modelo ONU', modelo)}
                            {macAddress && renderDataRow('MAC Address', macAddress)}
                            {puerto && renderDataRow('Puerto PON', puerto)}
                            {ontId !== undefined && ontId !== null && renderDataRow('ONT ID', String(ontId))}
                            {vlan && renderDataRow('VLAN', String(vlan))}
                            {planServicio && renderDataRow('Plan Contratado', planServicio)}
                            {velocidadBajada && renderDataRow('Velocidad Bajada', `${velocidadBajada} Mbps`)}
                            {velocidadSubida && renderDataRow('Velocidad Subida', `${velocidadSubida} Mbps`, true)}
                        </View>
                    </View>
                )}

                {sections.map((section) => {
                    const isExpanded = expandedSections.includes(section.id);

                    return (
                        <View key={section.id} style={styles.card}>
                            <TouchableOpacity
                                style={styles.cardHeader}
                                onPress={() => toggleSection(section.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.cardHeaderLeft}>
                                    <Icon name={section.icon} size={24} color="#3B82F6" />
                                    <Text style={styles.cardTitle}>{section.title}</Text>
                                </View>
                                <Icon
                                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                    size={24}
                                    color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                />
                            </TouchableOpacity>

                            {isExpanded && renderSectionContent(section.id)}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default TR069StatsScreen;
