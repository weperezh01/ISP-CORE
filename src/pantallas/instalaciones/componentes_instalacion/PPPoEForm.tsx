import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PPPoEForm = ({ pppoeUsuario, setPppoeUsuario, pppoeSecret, setPppoeSecret, pppoePerfil, setPppoePerfil }) => {
    const [pppoeSecretVisible, setPppoeSecretVisible] = useState(false);

    return (
        <Card style={styles.card}>
            <Card.Title title="Credenciales PPPoE" />
            <Card.Content>
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
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            value={pppoeSecret}
                            onChangeText={setPppoeSecret}
                            placeholder="Ingrese el secreto PPPoE"
                            placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                            secureTextEntry={!pppoeSecretVisible}
                        />
                        <TouchableOpacity onPress={() => setPppoeSecretVisible(!pppoeSecretVisible)}>
                            <Icon name={pppoeSecretVisible ? 'visibility' : 'visibility-off'} size={24} color={isDarkMode ? '#aaa' : '#555'} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Perfil PPPoE</Text>
                    <TextInput
                        style={styles.input}
                        value={pppoePerfil}
                        onChangeText={setPppoePerfil}
                        placeholder="Ingrese el perfil PPPoE"
                        placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                    />
                </View>
            </Card.Content>
        </Card>
    );
};

export default PPPoEForm;
