import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../ThemeContext';

const PPPoECredentials = ({
    pppoeUsuario,
    pppoeSecret,
    pppoePerfil,
    setPppoeUsuario,
    setPppoeSecret,
    setPppoePerfil,
    pppoePerfiles
}) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    const [showPerfiles, setShowPerfiles] = useState(false);

    const handlePerfilSelect = (perfil) => {
        setPppoePerfil(perfil.pppoe_perfil_nombre);
        setShowPerfiles(false);
    };

    return (
        <View>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Usuario PPPoE</Text>
                <TextInput
                    style={styles.input}
                    value={pppoeUsuario}
                    onChangeText={setPppoeUsuario}
                    placeholder="Ingrese el usuario PPPoE"
                    placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                />
            </View>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Secret PPPoE</Text>
                <TextInput
                    style={styles.input}
                    value={pppoeSecret}
                    onChangeText={setPppoeSecret}
                    placeholder="Ingrese el secreto PPPoE"
                    placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                    secureTextEntry
                />
            </View>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Perfil PPPoE</Text>
                <TouchableOpacity onPress={() => setShowPerfiles(!showPerfiles)}>
                    <TextInput
                        style={styles.input}
                        value={pppoePerfil}
                        onChangeText={setPppoePerfil}
                        placeholder="Seleccione el perfil PPPoE"
                        placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                        editable={false}
                    />
                </TouchableOpacity>
                {showPerfiles && (
                    <FlatList
                        data={pppoePerfiles}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handlePerfilSelect(item)}>
                                <View style={styles.itemContainer}>
                                    <Text style={styles.itemText}>{item.pppoe_perfil_nombre}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item, index) => item.pppoe_perfil_nombre + index}
                        style={styles.flatList}
                    />
                )}
            </View>
        </View>
    );
};

const getStyles = (isDarkMode) => StyleSheet.create({
    formGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: isDarkMode ? '#fff' : '#000',
        marginBottom: 5,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: isDarkMode ? '#444' : '#fff',
        color: isDarkMode ? 'white' : 'black',
    },
    flatList: {
        marginTop: 10,
    },
    itemContainer: {
        padding: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: isDarkMode ? '#444' : '#fff',
    },
    itemText: {
        color: isDarkMode ? 'white' : 'black',
    },
});

export default PPPoECredentials;