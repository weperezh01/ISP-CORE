import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    Modal,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../ThemeContext';
import getStyles from './MainScreenStyles';
import HorizontalMenu from '../../componentes/HorizontalMenu';
import Icon from 'react-native-vector-icons/FontAwesome';

const AdminUsersScreen = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const styles = getStyles(isDarkMode);
    const navigation = useNavigation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [newUser, setNewUser] = useState({ usuario: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [usuarioDisponible, setUsuarioDisponible] = useState(true);
    const [emailDisponible, setEmailDisponible] = useState(true);
    const [usuarioDebounceTimer, setUsuarioDebounceTimer] = useState(null);
    const [emailDebounceTimer, setEmailDebounceTimer] = useState(null);

    // Validar disponibilidad de usuario
    useEffect(() => {
        if (usuarioDebounceTimer) clearTimeout(usuarioDebounceTimer);
        if (newUser.usuario) {
            setUsuarioDebounceTimer(
                setTimeout(() => verificarDisponibilidadUsuario(newUser.usuario), 500)
            );
        }
    }, [newUser.usuario]);

    // Validar disponibilidad de email
    useEffect(() => {
        if (emailDebounceTimer) clearTimeout(emailDebounceTimer);
        if (newUser.email) {
            setEmailDebounceTimer(
                setTimeout(() => verificarDisponibilidadEmail(newUser.email), 500)
            );
        }
    }, [newUser.email]);

    // Obtener usuarios administradores
    useEffect(() => {
        const fetchAdminUsers = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    'https://wellnet-rd.com:444/api/usuarios/listar-super-administradores'
                );
                if (!response.ok) throw new Error('Error al obtener la lista de usuarios administradores');
                const data = await response.json();
                setUsers(data.usuarios || []);
            } catch (error) {
                console.error('Error al cargar usuarios administradores:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminUsers();
    }, []);

    // Verificar disponibilidad de usuario
    const verificarDisponibilidadUsuario = async (usuario) => {
        try {
            const response = await fetch(
                'https://wellnet-rd.com:444/api/usuarios/verificar-usuario',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario }),
                }
            );
            const data = await response.json();
            setUsuarioDisponible(data.disponible);
        } catch (error) {
            console.error('Error al verificar usuario:', error);
        }
    };

    // Verificar disponibilidad de email
    const verificarDisponibilidadEmail = async (email) => {
        try {
            const response = await fetch(
                'https://wellnet-rd.com:444/api/usuarios/verificar-email',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                }
            );
            const data = await response.json();
            setEmailDisponible(data.disponible);
        } catch (error) {
            console.error('Error al verificar email:', error);
        }
    };

    // Agregar un nuevo usuario
    const handleAddUserConfirmation = () => {
        Alert.alert(
            'Confirmación',
            '¿Estás seguro de que deseas agregar este usuario?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Agregar', onPress: handleAddUser },
            ]
        );
    };

    const handleAddUser = async () => {
        try {
            const userToSend = {
                ...newUser,
                contrasena: newUser.password,
                mega_administrador: 'N',
                super_administrador: 'Y',
                administrador: 'Y',
                operador: 'Y',
                cliente: 'N',
                nivel_usuario: 'SUPER ADMINISTRADOR',
            };
            delete userToSend.password;

            const response = await fetch(
                'https://wellnet-rd.com:444/api/usuarios/agregar-usuario-administrador',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userToSend),
                }
            );

            if (!response.ok) throw new Error('Error al agregar el usuario');

            const addedUser = await response.json();
            setUsers((prevUsers) => [...prevUsers, { ...userToSend, id: addedUser.usuarioId }]);
            setModalVisible(false);
            setNewUser({ usuario: '', email: '', password: '' });
            Alert.alert('Éxito', 'Usuario agregado exitosamente');
        } catch (error) {
            console.error('Error al agregar usuario:', error);
            Alert.alert('Error', 'No se pudo agregar el usuario');
        }
    };

    // Configuración del menú
    const menuButtons = (setMenuVisible, toggleTheme, isDarkMode) => [
        { id: '4', action: () => setMenuVisible(true), icon: 'bars' },
        { id: '1', icon: 'plus', action: () => setModalVisible(true) },
        { id: '7', screen: null, icon: isDarkMode ? 'sun-o' : 'moon-o', action: () => toggleTheme() },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Usuarios Administradores</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.userItem}
                            onPress={() => navigation.navigate('AdminUserDetailScreen', { userId: item.id })}
                        >
                            <Text style={styles.userName}>
                                {item.nombre || item.apellido
                                    ? `${item.nombre || ''} ${item.apellido || ''}`.trim()
                                    : item.usuario}
                            </Text>
                            <Text style={styles.userEmail}>{item.email || 'Sin Email'}</Text>
                        </TouchableOpacity>
                    )}
                />


            )}
            <HorizontalMenu
                botones={menuButtons(setMenuVisible, toggleTheme, isDarkMode)}
                navigation={navigation}
                isDarkMode={isDarkMode}
            />
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Agregar Usuario Administrador</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Usuario"
                            placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
                            value={newUser.usuario}
                            onChangeText={(text) => setNewUser((prev) => ({ ...prev, usuario: text }))}
                        />
                        {newUser.usuario.length > 2 && (
                            <Text style={{ color: usuarioDisponible ? 'green' : 'red', marginBottom: 10 }}>
                                {usuarioDisponible ? 'Usuario disponible' : 'Usuario no disponible'}
                            </Text>
                        )}
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
                            value={newUser.email}
                            onChangeText={(text) => setNewUser((prev) => ({ ...prev, email: text }))}
                            keyboardType="email-address"
                        />
                        {newUser.email.length > 5 && (
                            <Text style={{ color: emailDisponible ? 'green' : 'red', marginBottom: 10 }}>
                                {emailDisponible ? 'Email disponible' : 'Email no disponible'}
                            </Text>
                        )}
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.inputPasswd, { flex: 1 }]}
                                placeholder="Contraseña"
                                placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
                                value={newUser.password}
                                onChangeText={(text) => setNewUser((prev) => ({ ...prev, password: text }))}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword((prev) => !prev)}
                                style={styles.eyeIcon}
                            >
                                <Icon
                                    name={showPassword ? 'eye' : 'eye-slash'}
                                    size={20}
                                    color={isDarkMode ? '#888' : '#555'}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.button} onPress={handleAddUserConfirmation}>
                                <Text style={styles.buttonText}>Agregar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: 'red' }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default AdminUsersScreen;
