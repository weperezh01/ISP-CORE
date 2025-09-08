import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Pressable,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../ThemeContext';
import MenuModal from '../componentes/MenuModal';
import getStyles from './FacturacionesScreenStyles';
import HorizontalMenu from '../componentes/HorizontalMenu';


// Modern progress bar component for time
const TimeProgressBar = ({ progress, isDarkMode, styles }) => (
    <View style={styles.timeProgressContainer}>
        <Text style={styles.progressLabel}>Progreso del Ciclo</Text>
        <View style={styles.timeProgressBar}>
            <View style={[styles.timeProgressFill, { width: `${progress}%` }]}>
                <View style={styles.timeProgressBall}></View>
            </View>
        </View>
        <Text style={[styles.statLabel, { textAlign: 'right' }]}>{Math.round(progress)}%</Text>
    </View>
);

// Modern progress bar component for money
const MoneyProgressBar = ({ amountProgress, isDarkMode, styles, collected, total }) => {
    const formatter = new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
    });

    return (
        <View style={styles.moneyProgressContainer}>
            <Text style={styles.progressLabel}>Ingresos Cobrados</Text>
            <View style={styles.moneyProgressBar}>
                <View style={[styles.moneyProgressFill, { width: `${amountProgress}%` }]}></View>
            </View>
            <View style={styles.moneyRow}>
                <Text style={styles.moneyLabel}>Cobrado:</Text>
                <Text style={styles.moneyValue}>{formatter.format(collected)}</Text>
            </View>
            <View style={styles.moneyRow}>
                <Text style={styles.moneyLabel}>Total:</Text>
                <Text style={styles.moneyTotal}>{formatter.format(total)}</Text>
            </View>
        </View>
    );
};

const FacturacionesScreen = () => {
    // Theme and styles
    const { isDarkMode, toggleTheme } = useTheme();
    const styles = getStyles(isDarkMode);

    // States
    const [ciclos, setCiclos] = useState([]);
    const [ispId, setIspId] = useState('');
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        const obtenerIspId = async () => {
            try {
                const id = await AsyncStorage.getItem('@selectedIspId');
                setIspId(id || '');
            } catch (error) {
                console.error('Error al recuperar el ID del ISP', error);
            }
        };
        obtenerIspId();
    }, []);


    useEffect(() => {
        const cargarCiclos = async () => {
            if (!ispId) return;
            setLoading(true);
            try {
                const response = await fetch(
                    'https://wellnet-rd.com:444/api/ciclos-incompleto',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id_isp: ispId }),
                    }
                );

                if (!response.ok) {
                    throw new Error('Error al cargar ciclos');
                }

                const data = await response.json();
                setCiclos(data.reverse());
            } catch (error) {
                console.error('Error al cargar ciclos:', error);
            } finally {
                setLoading(false);
            }
        };

        if (ispId) {
            cargarCiclos();
        }
    }, [ispId]);

    // Modern cycle item component
    const CycleItem = ({ item }) => {
        const [pressed, setPressed] = useState(false);

        const startDate = new Date(item.inicio);
        const endDate = new Date(item.final);
        const currentDate = new Date();

        // Calculate time progress
        const totalDays =
            (Date.UTC(
                endDate.getUTCFullYear(),
                endDate.getUTCMonth(),
                endDate.getUTCDate()
            ) -
                Date.UTC(
                    startDate.getUTCFullYear(),
                    startDate.getUTCMonth(),
                    startDate.getUTCDate()
                )) /
            (1000 * 60 * 60 * 24);

        const elapsedDays =
            (Date.UTC(
                currentDate.getUTCFullYear(),
                currentDate.getUTCMonth(),
                currentDate.getUTCDate()
            ) -
                Date.UTC(
                    startDate.getUTCFullYear(),
                    startDate.getUTCMonth(),
                    startDate.getUTCDate()
                )) /
            (1000 * 60 * 60 * 24);

        const timeProgress = Math.min(
            Math.max((elapsedDays / totalDays) * 100, 0),
            100
        );

        // Calculate money progress
        const amountProgress = Math.min(
            Math.max((item.dinero_cobrado / item.total_dinero) * 100, 0),
            100
        );

        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                timeZone: 'UTC',
            });
        };

        const handlePress = () => {
            navigation.navigate('DetalleCicloScreen', { ciclo: item });
        };

        return (
            <Pressable
                style={[
                    styles.cycleCard,
                    pressed && styles.cycleCardPressed
                ]}
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
                onPress={handlePress}
            >
                {/* Card Header */}
                <View style={styles.cycleHeader}>
                    <View style={styles.cycleIconContainer}>
                        <Icon name="calendar-today" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.cycleHeaderContent}>
                        <Text style={styles.cycleName}>Ciclo #{item.id_ciclo}</Text>
                        <Text style={styles.cycleDates}>
                            {formatDate(item.inicio)} - {formatDate(item.final)}
                        </Text>
                    </View>
                </View>

                {/* Time Progress */}
                <TimeProgressBar 
                    progress={timeProgress} 
                    isDarkMode={isDarkMode} 
                    styles={styles} 
                />

                {/* Money Progress */}
                <MoneyProgressBar 
                    amountProgress={amountProgress} 
                    isDarkMode={isDarkMode} 
                    styles={styles}
                    collected={item.dinero_cobrado}
                    total={item.total_dinero}
                />

                {/* Invoice Statistics */}
                <View style={styles.invoiceStats}>
                    <View style={styles.invoiceStatItem}>
                        <Text style={styles.invoiceStatNumber}>
                            {item.total_facturas - item.facturas_pendiente}
                        </Text>
                        <Text style={styles.invoiceStatLabel}>Cobradas</Text>
                    </View>
                    <View style={styles.invoiceStatItem}>
                        <Text style={styles.invoiceStatNumber}>
                            {item.facturas_pendiente}
                        </Text>
                        <Text style={styles.invoiceStatLabel}>Pendientes</Text>
                    </View>
                    <View style={styles.invoiceStatItem}>
                        <Text style={styles.invoiceStatNumber}>
                            {item.total_facturas}
                        </Text>
                        <Text style={styles.invoiceStatLabel}>Total</Text>
                    </View>
                </View>
            </Pressable>
        );
    };

    const renderItem = ({ item }) => <CycleItem item={item} />;


    // Loading state
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                <Text style={styles.loadingText}>Cargando ciclos de facturación...</Text>
            </View>
        );
    }

    const botones = [
        { id: '5', screen: 'BusquedaScreen', icon: 'search' },
        { id: '4', screen: null, action: () => setMenuVisible(true), icon: 'menu' },
        { id: '1', title: 'Base de ciclos', screen: 'CiclosBaseScreen', icon: 'event' },
        { id: '2', title: 'Revisiones', screen: 'FacturasEnRevisionScreen', params: { estado: 'en_revision' }, icon: 'rate-review' },
        { id: '3', title: 'Ingresos', screen: 'IngresosScreen', icon: 'trending-up' },
        {
            id: '6',
            title: isDarkMode ? 'Modo Claro' : 'Modo Oscuro',
            icon: isDarkMode ? 'light-mode' : 'dark-mode',
            action: toggleTheme,
        },
    ];

    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Facturaciones</Text>
                    <Text style={styles.headerSubtitle}>Gestión de ciclos de facturación</Text>
                </View>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                <FlatList
                    data={ciclos}
                    keyExtractor={(item) => item.id_ciclo.toString()}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.flatListContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="event-note" size={64} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                            <Text style={styles.emptyMessage}>
                                No hay ciclos de facturación disponibles
                            </Text>
                        </View>
                    }
                />
            </View>


            {/* Menú Horizontal Reutilizable */}
            <HorizontalMenu botones={botones} navigation={navigation} isDarkMode={isDarkMode} />


            {/* Modal del Menú */}
            <MenuModal
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                menuItems={[
                    { title: 'Inicio', action: () => navigation.navigate('HomeScreen') },
                    { title: 'Perfil', action: () => navigation.navigate('ProfileScreen') },
                    { title: 'Configuración', action: () => navigation.navigate('SettingsScreen') },
                    { title: 'Cerrar Sesión', action: () => console.log('Cerrando sesión') },
                ]}
                isDarkMode={isDarkMode}
                onItemPress={(item) => {
                    item.action();
                    setMenuVisible(false);
                }}
            />
        </View>
    );
};

export default FacturacionesScreen;
