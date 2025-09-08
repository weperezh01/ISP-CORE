import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Switch } from 'react-native';
import { Modal } from 'react-native';

const ReviewNoteModal = ({
    modalNotaRevisionVisible,
    styles,
    notaRevisada,
    setNotaRevisada,
    notaMarcadaComoRevisada,
    setNotaMarcadaComoRevisada,
    handleCerrarModal,
    handleGuardarNotaRevision
}) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={modalNotaRevisionVisible}
        onRequestClose={handleCerrarModal}
    >
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalBackground}
        >
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Escribir nota de revisión</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Escribe tu nota"
                            value={notaRevisada}
                            onChangeText={setNotaRevisada}
                            multiline
                        />

                        {/* Check para marcar la nota como revisada */}
                        <View style={styles.checkboxContainer}>
                            <Switch
                                value={notaMarcadaComoRevisada}
                                onValueChange={(value) => setNotaMarcadaComoRevisada(value)}
                            />
                            <Text style={styles.checkboxLabel}>Marcar como revisada</Text>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButton} onPress={handleCerrarModal}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButton} onPress={handleGuardarNotaRevision}>
                                <Text style={styles.buttonText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    </Modal>
);

export default ReviewNoteModal;
