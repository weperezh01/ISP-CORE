import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from '../../estilos/styles';
import Icon from 'react-native-vector-icons/Ionicons';

const Conexiones = ({ route, navigation }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const { ispId, selectedStatusId } = route.params;
    const [connectionDetails, setConnectionDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchConnectionDetails = async (page = 1, estadoId = selectedStatusId, query = searchQuery) => {
        if (!isLoading && hasMore) {
            setIsLoading(true);
            try {
                const response = await fetch(`https://wellnet-rd.com:444/api/obtener-conexiones`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_isp: ispId, id_estado_conexion: estadoId, page, limit: 10, searchQuery: query })
                });
                if (response.ok) {
                    const newConnectionDetails = await response.json();

                    if (newConnectionDetails.length < 10) {
                        setHasMore(false);
                    }

                    setConnectionDetails(prevConnectionDetails => {
                        if (page === 1) {
                            return newConnectionDetails; // Si es la primera página, sobrescribimos los datos
                        } else {
                            return [...prevConnectionDetails, ...newConnectionDetails];
                        }
                    });
                } else {
                    throw new Error('Fallo al obtener detalles de las conexiones');
                }
            } catch (error) {
                console.error('Error al obtener datos:', error);
            } finally {
                setIsLoading(false);
            }
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        fetchConnectionDetails(1, selectedStatusId, searchQuery);
    }, [selectedStatusId, searchQuery]);

    const renderConnectionItem = ({ item }) => (
        <View style={styles.connectionItem}>
            <Text style={styles.connectionItemText}>
                {item.direccion || 'Sin dirección'}
            </Text>
            <Text style={styles.connectionItemText}>
                {item.referencia || 'Sin referencia'}
            </Text>
        </View>
    );

    const keyExtractor = (item, index) => `${item.id_conexion}-${index}`;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={30} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Detalles de Conexiones</Text>
            </View>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar..."
                value={searchQuery}
                onChangeText={text => setSearchQuery(text)}
                onSubmitEditing={() => fetchConnectionDetails(1, selectedStatusId, text)}
            />
            {isLoading && currentPage === 1 ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={connectionDetails}
                    keyExtractor={keyExtractor}
                    renderItem={renderConnectionItem}
                    onEndReached={() => fetchConnectionDetails(currentPage + 1)}
                    onEndReachedThreshold={0.1}
                    ListFooterComponent={isLoading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginTop: 10,
    },
    connectionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    connectionItemText: {
        fontSize: 16,
    },
});

export default Conexiones;
