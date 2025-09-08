import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ThemeSwitch from './themeSwitch';
import { useTheme } from '../../ThemeContext';
import { getStyles } from '../estilos/styles';

const HeaderComponent = ({ nombreUsuario, titulo }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    return (
        <View style={styles.containerSuperior}>
            <TouchableOpacity onPress={() => { }}>
                <Text style={styles.buttonText}>{nombreUsuario || 'Usuario'}</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{titulo || 'Título'}</Text>
            <ThemeSwitch />
        </View>
    );
};


export default HeaderComponent;
