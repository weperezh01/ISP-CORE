import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from './OLTCardsScreenStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../../componentes/themeSwitch';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

const OLTCardsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { oltId, oltName } = route.params || {};
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    // State variables
    const [cards, setCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [authToken, setAuthToken] = useState(null);

    // Get auth token
    useEffect(() => {
        const getAuthToken = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@loginData');
                if (jsonValue != null) {
                    const userData = JSON.parse(jsonValue);
                    setAuthToken(userData.token);
                }
            } catch (e) {
                console.error('Error al leer el token del usuario', e);
            }
        };
        getAuthToken();
    }, []);

    // Fetch cards data
    const fetchCards = useCallback(async (forceRefresh = false) => {
        if (!authToken || !oltId) return;

        try {
            if (forceRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            // TODO: Replace with actual API endpoint
            // const response = await fetch(
            //     `https://wellnet-rd.com:444/api/olts/${oltId}/cards`,
            //     {
            //         headers: { 'Authorization': `Bearer ${authToken}` }
            //     }
            // );
            // const data = await response.json();
            // setCards(data.cards);

            // Mock data for now
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockCards = [
                {
                    slot: 1,
                    type: 'H907CGHF',
                    real_type: 'H907CGHF',
                    ports: 16,
                    sw_version: '',
                    status: 'Normal',
                    role: '',
                    updated_at: '2025-11-17T16:30:28Z'
                },
                {
                    slot: 3,
                    type: 'H907CGHF',
                    real_type: 'H907CGHF',
                    ports: 16,
                    sw_version: '',
                    status: 'Offline',
                    role: '',
                    updated_at: '2025-11-17T16:30:28Z'
                },
                {
                    slot: 4,
                    type: 'H907CGHF',
                    real_type: 'H907CGHF',
                    ports: 16,
                    sw_version: '',
                    status: 'Offline',
                    role: '',
                    updated_at: '2025-11-17T16:30:28Z'
                },
                {
                    slot: 8,
                    type: 'H905MPLB',
                    real_type: 'H905MPLB',
                    ports: 4,
                    sw_version: 'MA5800V100R018C00',
                    status: 'Normal',
                    role: 'Standby',
                    updated_at: '2025-11-17T16:30:28Z'
                },
                {
                    slot: 9,
                    type: 'H905MPLB',
                    real_type: 'H905MPLB',
                    ports: 4,
                    sw_version: 'MA5800V100R018C00',
                    status: 'Normal',
                    role: 'Main',
                    updated_at: '2025-11-17T16:30:28Z'
                },
                {
                    slot: 18,
                    type: 'H901PILA',
                    real_type: 'H901PILA',
                    ports: null,
                    sw_version: '',
                    status: 'Normal',
                    role: '',
                    updated_at: '2025-11-17T16:30:28Z'
                },
                {
                    slot: 19,
                    type: 'H901PILA',
                    real_type: 'H901PILA',
                    ports: null,
                    sw_version: '',
                    status: 'Normal',
                    role: '',
                    updated_at: '2025-11-17T16:30:28Z'
                },
            ];
            setCards(mockCards);

        } catch (err) {
            console.error('Error fetching OLT cards:', err);
            setError(err.message || 'Error desconocido');
            Alert.alert('Error', 'No se pudieron cargar las tarjetas de la OLT');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [authToken, oltId]);

    useEffect(() => {
        if (authToken) {
            fetchCards();
        }
    }, [authToken, fetchCards]);

    const handleRefresh = () => {
        fetchCards(true);
    };

    const handleRebootCard = (card) => {
        Alert.alert(
            'Reiniciar Tarjeta',
            `¿Está seguro que desea reiniciar la tarjeta del Slot ${card.slot}?\n\nTipo: ${card.type}\nEstado: ${card.status}${card.role ? `\nRol: ${card.role}` : ''}`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Reiniciar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // TODO: Implement actual API call
                            // await fetch(
                            //     `https://wellnet-rd.com:444/api/olts/${oltId}/cards/${card.slot}/reboot`,
                            //     {
                            //         method: 'POST',
                            //         headers: { 'Authorization': `Bearer ${authToken}` }
                            //     }
                            // );

                            Alert.alert(
                                'Éxito',
                                `Comando de reinicio enviado a la tarjeta del Slot ${card.slot}`,
                                [{ text: 'OK' }]
                            );
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo reiniciar la tarjeta');
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'normal':
                return '#10B981';
            case 'offline':
                return '#EF4444';
            default:
                return '#9CA3AF';
        }
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#F59E0B" />
                    <Text style={styles.loadingText}>Cargando tarjetas...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={64} color="#EF4444" />
                    <Text style={styles.errorTitle}>Error</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
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
                            <Text style={styles.headerTitle}>Tarjetas OLT</Text>
                            <Text style={styles.headerSubtitle}>
                                {oltName || 'Cargando...'}
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
                        tintColor="#F59E0B"
                    />
                }
            >
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="card-multiple" size={24} color="#F59E0B" />
                        <Text style={styles.cardTitle}>
                            Tarjetas Instaladas ({cards.length})
                        </Text>
                    </View>

                    {/* Table */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <View style={styles.table}>
                            {/* Table Header */}
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, styles.slotColumn]}>Slot</Text>
                                <Text style={[styles.tableHeaderCell, styles.typeColumn]}>Type</Text>
                                <Text style={[styles.tableHeaderCell, styles.typeColumn]}>Real Type</Text>
                                <Text style={[styles.tableHeaderCell, styles.portsColumn]}>Ports</Text>
                                <Text style={[styles.tableHeaderCell, styles.swColumn]}>SW</Text>
                                <Text style={[styles.tableHeaderCell, styles.statusColumn]}>Status</Text>
                                <Text style={[styles.tableHeaderCell, styles.roleColumn]}>Role</Text>
                                <Text style={[styles.tableHeaderCell, styles.updatedColumn]}>Info Updated</Text>
                                <Text style={[styles.tableHeaderCell, styles.actionColumn]}>Action</Text>
                            </View>

                            {/* Table Rows */}
                            {cards.map((card, index) => (
                                <View
                                    key={card.slot}
                                    style={[
                                        styles.tableRow,
                                        index % 2 === 0 && styles.tableRowEven
                                    ]}
                                >
                                    <Text style={[styles.tableCell, styles.slotColumn, styles.tableCellBold]}>
                                        {card.slot}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.typeColumn]}>
                                        {card.type}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.typeColumn]}>
                                        {card.real_type}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.portsColumn]}>
                                        {card.ports || ''}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.swColumn]}>
                                        {card.sw_version}
                                    </Text>
                                    <View style={[styles.tableCell, styles.statusColumn]}>
                                        <View style={[
                                            styles.statusBadge,
                                            { borderColor: getStatusColor(card.status) }
                                        ]}>
                                            <Text style={[
                                                styles.statusText,
                                                { color: getStatusColor(card.status) }
                                            ]}>
                                                {card.status}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.tableCell, styles.roleColumn, styles.roleText]}>
                                        {card.role}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.updatedColumn]}>
                                        {card.updated_at ? format(new Date(card.updated_at), 'yyyy-MM-dd HH:mm:ss') : ''}
                                    </Text>
                                    <View style={[styles.tableCell, styles.actionColumn]}>
                                        <TouchableOpacity
                                            style={styles.rebootButton}
                                            onPress={() => handleRebootCard(card)}
                                        >
                                            <Icon name="restart" size={16} color="#FFFFFF" />
                                            <Text style={styles.rebootButtonText}>Reiniciar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </ScrollView>
        </View>
    );
};

export default OLTCardsScreen;
