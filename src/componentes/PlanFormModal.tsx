import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../ThemeContext';
import { createStyles } from './PlanFormModal.styles';

const PlanFormModal = ({ visible, onClose, onSave, title, formData, setFormData, loading }) => {
    const { isDarkMode } = useTheme();
    const styles = createStyles(isDarkMode);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {title}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Nombre del Plan *
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Ej: Premium"
                                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Precio Mensual (USD) *
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                value={formData.price}
                                onChangeText={(text) => setFormData({ ...formData, price: text })}
                                placeholder="75"
                                keyboardType="numeric"
                                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Límite de Conexiones (vacío = ilimitado)
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                value={formData.connectionLimit}
                                onChangeText={(text) => setFormData({ ...formData, connectionLimit: text })}
                                placeholder="1000"
                                keyboardType="numeric"
                                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Precio por Conexión (USD) *
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                value={formData.pricePerConnection}
                                onChangeText={(text) => setFormData({ ...formData, pricePerConnection: text })}
                                placeholder="0.075"
                                keyboardType="numeric"
                                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Características (una por línea)
                            </Text>
                            <TextInput
                                style={styles.textAreaInput}
                                value={formData.features}
                                onChangeText={(text) => setFormData({ ...formData, features: text })}
                                placeholder="Dashboard personalizado\nReportes exportables\nSoporte prioritario"
                                multiline
                                numberOfLines={4}
                                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setFormData({ ...formData, recommended: !formData.recommended })}
                        >
                            <Icon 
                                name={formData.recommended ? 'check-box' : 'check-box-outline-blank'} 
                                size={24} 
                                color={formData.recommended ? '#3B82F6' : (isDarkMode ? '#9CA3AF' : '#6B7280')} 
                            />
                            <Text style={styles.checkboxLabel}>
                                Marcar como plan recomendado
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>
                                Cancelar
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.saveButton]}
                            onPress={onSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.saveButtonText}>Guardar</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default PlanFormModal;