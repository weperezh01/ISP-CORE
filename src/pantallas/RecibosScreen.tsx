import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../ThemeContext';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ThemeSwitch from '../componentes/themeSwitch';

const RecibosScreen = ({ route }) => {
    const { id_ciclo } = route.params;
    const [recibos, setRecibos] = useState([]);
    const [filteredRecibos, setFilteredRecibos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchText, setSearchText] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const navigation = useNavigation();
    const { isDarkMode } = useTheme();

    const fetchRecibos = async () => {
        console.log('ID del Ciclo:', id_ciclo);

        try {
            const response = await fetch('https://wellnet-rd.com:444/api/facturas-recibo-consulta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_ciclo })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setRecibos(data);
            setFilteredRecibos(data);
            setError('');
        } catch (error) {
            console.error('Error fetching recibos:', error);
            setError('Error al cargar los recibos');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (id_ciclo) {
            fetchRecibos();
        } else {
            setError('No se proporcionó un ID de ciclo válido.');
            setLoading(false);
        }
    }, [id_ciclo]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRecibos();
    };

    useEffect(() => {
        const filterData = (text) => {
            if (!text) {
                setFilteredRecibos(recibos);
            } else {
                const lowercasedFilter = text.toLowerCase();
                const filteredData = recibos.filter(item => {
                    return Object.keys(item).some(key =>
                        String(item[key]).toLowerCase().includes(lowercasedFilter)
                    );
                });
                setFilteredRecibos(filteredData);
            }
        };

        filterData(searchText);
    }, [searchText, recibos]);

    const formatCurrency = (amount) => new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 2
    }).format(amount);

    const handleSelectRecibo = (id_recibo) => {
        navigation.navigate('ReciboScreen', { reciboData: { id_recibo }, isDarkMode });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                <Text style={[styles.loadingText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                    Cargando recibos...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Recibos</Text>
                    <ThemeSwitch />
                </View>
                <View style={[styles.errorContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB' }]}>
                    <Icon name="error-outline" size={48} color="#DC2626" />
                    <Text style={[styles.errorText, { color: isDarkMode ? '#fff' : '#000' }]}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => {
                        setLoading(true);
                        setError('');
                        fetchRecibos();
                    }}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#111827' : '#F9FAFB' }]}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Recibos</Text>
                <ThemeSwitch />
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchInputContainer, { backgroundColor: isDarkMode ? '#374151' : '#fff' }]}>
                    <Icon name="search" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                    <TextInput
                        style={[styles.searchInput, { color: isDarkMode ? '#fff' : '#000' }]}
                        placeholder="Buscar recibos..."
                        placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Icon name="clear" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#1F2937' : '#fff' }]}>
                    <Icon name="receipt" size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                    <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#000' }]}>
                        {filteredRecibos.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        Recibos encontrados
                    </Text>
                </View>
            </View>

            {filteredRecibos.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="receipt-long" size={64} color={isDarkMode ? '#374151' : '#E5E7EB'} />
                    <Text style={[styles.emptyTitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        No se encontraron recibos
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: isDarkMode ? '#6B7280' : '#9CA3AF' }]}>
                        {searchText ? 'Intenta con otros términos de búsqueda' : 'No hay recibos para este ciclo'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredRecibos}
                    keyExtractor={(item, index) => item?.id_recibo?.toString() ?? `unique-${index}`}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.reciboCard, { backgroundColor: isDarkMode ? '#1F2937' : '#fff' }]}
                            onPress={() => handleSelectRecibo(item.id_recibo)}
                        >
                            <View style={styles.reciboHeader}>
                                <View style={styles.reciboIdContainer}>
                                    <Icon name="receipt" size={20} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                                    <Text style={[styles.reciboId, { color: isDarkMode ? '#fff' : '#000' }]}>
                                        #{item.id_recibo}
                                    </Text>
                                </View>
                                <View style={[styles.amountContainer, { backgroundColor: isDarkMode ? '#065F46' : '#D1FAE5' }]}>
                                    <Text style={[styles.amount, { color: isDarkMode ? '#34D399' : '#059669' }]}>
                                        {formatCurrency(item.monto)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.reciboDetails}>
                                <View style={styles.detailRow}>
                                    <Icon name="person" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <Text style={[styles.detailText, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                        {item.nombre_cliente} {item.apellido_cliente}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Icon name="account-circle" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <Text style={[styles.detailText, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                        {item.nombre_usuario}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Icon name="event" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <Text style={[styles.detailText, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                        {item.fecha_formateada}
                                    </Text>
                                </View>

                                {item.nota && (
                                    <View style={styles.detailRow}>
                                        <Icon name="note" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                        <Text style={[styles.noteText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                            {item.nota}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.reciboFooter}>
                                <Icon name="chevron-right" size={20} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                            </View>
                        </TouchableOpacity>
                    )}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '500',
    },
    statsContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        marginLeft: 12,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        fontSize: 16,
        marginTop: 16,
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#2563EB',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 22,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    reciboCard: {
        marginBottom: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    reciboHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    reciboIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reciboId: {
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 8,
    },
    amountContainer: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
    },
    reciboDetails: {
        padding: 16,
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 12,
        flex: 1,
    },
    noteText: {
        fontSize: 14,
        fontStyle: 'italic',
        marginLeft: 12,
        flex: 1,
    },
    reciboFooter: {
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
});

export default RecibosScreen;
