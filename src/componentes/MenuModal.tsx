import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Animated,
    StyleSheet,
    Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../ThemeContext';

const screenWidth = Dimensions.get('window').width;

const MenuModal = ({ visible, onClose, menuItems, onItemPress }) => {
    const [translateX] = useState(new Animated.Value(screenWidth));
    const { isDarkMode, toggleTheme } = useTheme();

    // Animación de entrada
    const openModal = () => {
        Animated.timing(translateX, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    // Animación de salida
    const closeModal = () => {
        Animated.timing(translateX, {
            toValue: screenWidth,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    if (visible) {
        openModal();
    }

    // Estilos que dependen del modo (claro u oscuro)
    const dynamicStyles = StyleSheet.create({
        modalContent: {
            width: '80%',
            height: '100%',
            backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
            padding: 20,
            position: 'absolute',
            right: 0,
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5, // Sombra en Android
        },
        closeButtonText: {
            fontSize: 18,
            color: isDarkMode ? '#fff' : '#000',
        },
        menuItem: {
            flexDirection: 'row', // Alinea ícono y texto en línea
            alignItems: 'center',
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#333' : '#ccc',
        },
        menuItemText: {
            fontSize: 16,
            color: isDarkMode ? '#fff' : '#000',
        },
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none" // Controlamos la animación manualmente
            onRequestClose={closeModal}
        >
            <View style={styles.modalOverlay}>
                <Animated.View
                    style={[dynamicStyles.modalContent, { transform: [{ translateX }] }]}
                >
                    {/* Botón para cerrar */}
                    <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                        <Text style={dynamicStyles.closeButtonText}>X</Text>
                    </TouchableOpacity>

                    {/* Primer ítem con ícono de tema */}
                    <TouchableOpacity
                        style={dynamicStyles.menuItem}
                        onPress={toggleTheme} // Cambia el modo
                    >
                        <Icon
                            name={isDarkMode ? 'sunny' : 'moon'} // Cambia el ícono
                            size={24}
                            color={isDarkMode ? '#fff' : '#000'}
                            style={styles.icon}
                        />
                        <Text style={dynamicStyles.menuItemText}>
                            {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'} {/* Cambia el texto */}
                        </Text>
                    </TouchableOpacity>

                    {/* Lista de ítems del menú */}
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={dynamicStyles.menuItem}
                            onPress={() => {
                                onItemPress(item);
                                closeModal();
                            }}
                        >
                            <Text style={dynamicStyles.menuItemText}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 10,
    },
    icon: {
        marginRight: 10, // Espacio entre el ícono y el texto
    },
});

export default MenuModal;
