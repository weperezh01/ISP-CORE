import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminUserDetailScreen = () => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const route = useRoute();
    const navigation = useNavigation();
    const { userId } = route.params;

    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usuarioId, setUsuarioId] = useState(null); // Estado para almacenar el id_usuario desde AsyncStorage

    useEffect(() => {
        // Obtener id_usuario desde AsyncStorage
        const obtenerDatosUsuario = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@loginData');
                const userData = jsonValue ? JSON.parse(jsonValue) : null;
                if (userData) {
                    setUsuarioId(userData.id);
                }
            } catch (e) {
                console.error('Error al leer el ID del usuario desde AsyncStorage:', e);
            }
        };

        obtenerDatosUsuario();

        // Obtener detalles del usuario
        const fetchUserDetails = async () => {
            try {
                const response = await fetch(
                    'https://wellnet-rd.com:444/api/usuarios/super-admin-usuario-isp',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: userId }),
                    }
                );

                if (!response.ok) throw new Error('Error al obtener detalles del usuario');
                const data = await response.json();
                setUserDetails(data);
            } catch (error) {
                console.error('Error al cargar detalles del usuario:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [userId]);

    // Función para actualizar ISP en el backend y navegar
    const handleIspPress = async (isp) => {
        try {
            if (!usuarioId) {
                console.error('No se encontró el id_usuario en AsyncStorage');
                return;
            }

            // Comunicar con el backend
            const response = await fetch(
                'https://wellnet-rd.com:444/api/usuarios/actualizar-isp-usuario',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_usuario: usuarioId, // ID recuperado de AsyncStorage
                        id_isp: isp.id_isp, // ID del ISP seleccionado
                    }),
                }
            );

            if (!response.ok) throw new Error('Error al actualizar el ISP en el servidor');

            const result = await response.json();
            console.log('✅ ISP actualizado exitosamente:', result);

            // Navegar a la pantalla de detalles del ISP
            navigation.navigate('IspDetailsScreen', { isp });
        } catch (error) {
            console.error('❌ Error al actualizar ISP:', error);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Detalles del Usuario</Text>
            {userDetails ? (
                <>
                    <View style={styles.detailsContainer}>
                        <Text style={styles.detailText}>Usuario: {userDetails.usuario}</Text>
                        <Text style={styles.detailText}>
                            Nombre: {userDetails.nombre || 'N/A'}
                        </Text>
                        <Text style={styles.detailText}>
                            Apellido: {userDetails.apellido || 'N/A'}
                        </Text>
                        <Text style={styles.detailText}>Email: {userDetails.email}</Text>
                        <Text style={styles.detailText}>
                            Estado: {userDetails.estado_usuario || 'N/A'}
                        </Text>
                        <Text style={styles.detailText}>
                            Nivel: {userDetails.nivel_usuario || 'N/A'}
                        </Text>
                    </View>

                    {/* Mostrar ISPs asignados */}
                    <View style={styles.detailsContainer}>
                        <Text style={styles.sectionTitle}>ISPs Asignados:</Text>
                        {userDetails.isp_asignados && userDetails.isp_asignados.length > 0 ? (
                            <FlatList
                                data={userDetails.isp_asignados}
                                keyExtractor={(item) => item.id_isp.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.ispContainer}
                                        onPress={() => handleIspPress(item)} // Actualizar ISP y navegar
                                    >
                                        <Text style={styles.ispItem}>Nombre: {item.nombre}</Text>
                                        <Text style={styles.ispItem}>RNC: {item.rnc}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        ) : (
                            <Text style={styles.detailText}>No hay ISPs asignados.</Text>
                        )}
                    </View>
                </>
            ) : (
                <Text style={styles.errorText}>No se encontraron detalles del usuario.</Text>
            )}
        </View>
    );
};

const getStyles = (isDarkMode) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#121212' : '#FFF',
            padding: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 20,
            color: isDarkMode ? '#FFF' : '#000',
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginTop: 20,
            marginBottom: 10,
            color: isDarkMode ? '#DDD' : '#333',
        },
        detailsContainer: {
            padding: 10,
            backgroundColor: isDarkMode ? '#1c1c1e' : '#f5f5f5',
            borderRadius: 8,
            elevation: 3,
        },
        ispContainer: {
            marginBottom: 10,
            padding: 10,
            backgroundColor: isDarkMode ? '#2c2c2e' : '#e5e5e5',
            borderRadius: 8,
        },
        detailText: {
            fontSize: 16,
            marginBottom: 10,
            color: isDarkMode ? '#FFF' : '#000',
        },
        ispItem: {
            fontSize: 14,
            marginBottom: 5,
            color: isDarkMode ? '#DDD' : '#444',
        },
        errorText: {
            fontSize: 16,
            color: 'red',
        },
    });

export default AdminUserDetailScreen;
