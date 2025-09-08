import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PrinterSelectionModal = ({ modalPrinterVisible, styles, printerList, CargarPrinterSeleccionado }) => (
    <Modal visible={modalPrinterVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Selecciona una impresora</Text>
                {printerList.length > 0 ? (
                    <FlatList
                        data={printerList}
                        keyExtractor={(item) => item.macAddress}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.printerItem}
                                onPress={async () => {
                                    try {
                                        // Guardar la impresora seleccionada en AsyncStorage
                                        await AsyncStorage.setItem(
                                            'selectedPrinter',
                                            JSON.stringify(item) // Guarda el objeto impresora como JSON
                                        );
                                        console.log(`Impresora seleccionada: ${item.deviceName} (${item.macAddress})`);
                                        Alert.alert('Impresora seleccionada', item.deviceName);

                                        // Cerrar el modal
                                        CargarPrinterSeleccionado();
                                    } catch (error) {
                                        console.error('Error al guardar la impresora:', error);
                                        Alert.alert('Error', 'No se pudo guardar la impresora seleccionada.');
                                    }
                                }}
                            >
                                <Text style={styles.printerText}>
                                    {item.deviceName || 'Sin nombre'} ({item.macAddress})
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                ) : (
                    <Text style={styles.noPrintersText}>No se encontraron impresoras disponibles.</Text>
                )}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => CargarPrinterSeleccionado()}
                >
                    <Text style={styles.buttonText}>Cerrar</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

export default PrinterSelectionModal;
