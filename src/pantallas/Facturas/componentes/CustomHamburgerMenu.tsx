import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Menu } from 'react-native-paper';
// import MenuIcon from '../../../assets/icons/menuIcon.svg'; // Importa el archivo SVG

const CustomHamburgerMenu = ({ toggleTheme, handlePrintFactura, listAvailablePrinters, selectedPrinter }) => {
    const [menuVisible, setMenuVisible] = useState(false);

    // Función para abrir/cerrar el menú de hamburguesa
    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };

    return (
        <View>
            <Menu
                visible={menuVisible}
                onDismiss={toggleMenu}
                anchor={
                    <TouchableOpacity onPress={toggleMenu}>
                        <Text style={{ fontSize: 20 }}>☰</Text> {/* Símbolo alternativo para el menú hamburguesa */}
                    </TouchableOpacity>
                }
            >
                {/* Opciones del menú de hamburguesa */}
                <Menu.Item
                    onPress={toggleTheme}
                    title={`Modo ${selectedPrinter ? 'Claro' : 'Oscuro'}`}
                />
                <Menu.Item
                    onPress={handlePrintFactura}
                    title="Imprimir Factura"
                />
                <Menu.Item
                    onPress={listAvailablePrinters}
                    title="Listar Impresoras"
                />
                <Menu.Item
                    title={`Impresora Seleccionada: ${selectedPrinter ? selectedPrinter.deviceName : 'Ninguna'}`}
                />
            </Menu>
        </View>
    );
};

export default CustomHamburgerMenu;
