import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from '../../../estilos/styles';
import { useNavigation } from '@react-navigation/native';

const AddVlanScreen = () => {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [vlanId, setVlanId] = useState('');
    const [name, setName] = useState('');
    const [mtu, setMtu] = useState('');
    const [arp, setArp] = useState('');
    const [interfaceName, setInterfaceName] = useState('');
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        // Aquí puedes manejar el envío del formulario
        console.log({
            vlanId,
            name,
            mtu,
            arp,
            interfaceName,
            comment,
        });
        navigation.goBack(); // Vuelve a la pantalla anterior después de enviar el formulario
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Agregar VLAN</Text>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>VLAN ID:</Text>
                <TextInput
                    style={styles.input}
                    value={vlanId}
                    onChangeText={setVlanId}
                    keyboardType="numeric"
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre:</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>MTU:</Text>
                <TextInput
                    style={styles.input}
                    value={mtu}
                    onChangeText={setMtu}
                    keyboardType="numeric"
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>ARP:</Text>
                <TextInput
                    style={styles.input}
                    value={arp}
                    onChangeText={setArp}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Interface:</Text>
                <TextInput
                    style={styles.input}
                    value={interfaceName}
                    onChangeText={setInterfaceName}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Comentario:</Text>
                <TextInput
                    style={styles.input}
                    value={comment}
                    onChangeText={setComment}
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Guardar VLAN</Text>
            </TouchableOpacity>
        </View>
    );
};

export default AddVlanScreen;
