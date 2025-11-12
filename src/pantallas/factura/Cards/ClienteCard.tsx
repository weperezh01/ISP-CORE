import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Linking, Share } from 'react-native';
import { buildAddressInfo } from '../../../utils/addressFormatter';

const ClienteCard = ({ facturaData, styles, formatPhoneNumber }) => {
    const getClientInitials = () => {
        const firstName = facturaData?.cliente?.nombres?.charAt(0) || '';
        const lastName = facturaData?.cliente?.apellidos?.charAt(0) || '';
        return (firstName + lastName).toUpperCase();
    };

    const addressInfo = useMemo(() => buildAddressInfo(facturaData?.cliente?.direccion, facturaData?.cliente?.referencia), [facturaData?.cliente?.direccion, facturaData?.cliente?.referencia]);
    const direccionPrincipal = addressInfo.principal || addressInfo.original;
    const referenciaDireccion = addressInfo.referencia;
    const gpsDireccion = addressInfo.gps;
    const mostrarDireccion = direccionPrincipal !== '' || Boolean(referenciaDireccion) || Boolean(gpsDireccion);
    const [addressModalVisible, setAddressModalVisible] = useState(false);

    const handleDireccionPress = () => {
        if (!direccionPrincipal && !addressInfo.coords) {
            return;
        }
        setAddressModalVisible(true);
    };

    const handleAbrirMapa = () => {
        if (!addressInfo.coords) {
            setAddressModalVisible(false);
            return;
        }
        const query = `${addressInfo.coords.lat},${addressInfo.coords.lng}`;
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
        Linking.openURL(url)
            .catch(() => {})
            .finally(() => setAddressModalVisible(false));
    };

    const handleCompartirUbicacion = async () => {
        const query = addressInfo.coords ? `${addressInfo.coords.lat},${addressInfo.coords.lng}` : direccionPrincipal;
        if (!query) {
            return;
        }
        const mapsUrl = addressInfo.coords
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${addressInfo.coords.lat},${addressInfo.coords.lng}`)}`
            : direccionPrincipal;
        const message = [
            `Ubicación del cliente: ${direccionPrincipal || 'Sin dirección'}`,
            referenciaDireccion ? `Referencia: ${referenciaDireccion}` : null,
            addressInfo.coords ? `Coordenadas: ${addressInfo.coords.lat}, ${addressInfo.coords.lng}` : null,
            mapsUrl
        ].filter(Boolean).join('\n');

        try {
            await Share.share({ message });
        } catch (error) {
            // noop
        } finally {
            setAddressModalVisible(false);
        }
    };

    const [phoneModalVisible, setPhoneModalVisible] = useState(false);
    const [selectedPhone, setSelectedPhone] = useState('');

    const openPhoneModal = (phone: string) => {
        if (!phone) {
            return;
        }
        setSelectedPhone(phone);
        setPhoneModalVisible(true);
    };

    const handlePhoneCall = () => {
        if (!selectedPhone) return;
        Linking.openURL(`tel:${selectedPhone}`).catch(() => {});
        setPhoneModalVisible(false);
    };

    const handlePhoneSms = () => {
        if (!selectedPhone) return;
        Linking.openURL(`sms:${selectedPhone}`).catch(() => {});
        setPhoneModalVisible(false);
    };

    const handlePhoneWhatsApp = () => {
        if (!selectedPhone) return;
        const phone = selectedPhone.replace(/\D/g, '');
        Linking.openURL(`https://wa.me/${phone}`).catch(() => {});
        setPhoneModalVisible(false);
    };

    const renderDireccionModal = () => (
        <Modal
            transparent
            visible={addressModalVisible}
            animationType="fade"
            onRequestClose={() => setAddressModalVisible(false)}
        >
            <View style={styles.addressModalOverlay}>
                <View style={styles.addressModalCard}>
                    <Text style={styles.addressModalTitle}>Ubicación del cliente</Text>
                    {direccionPrincipal ? (
                        <Text style={styles.addressModalSubtitle}>{direccionPrincipal}</Text>
                    ) : null}
                    {addressInfo.coords && (
                        <Text style={styles.addressModalCoords}>
                            {addressInfo.coords.lat}, {addressInfo.coords.lng}
                        </Text>
                    )}
                    <View style={styles.addressModalButtons}>
                        {addressInfo.coords && (
                            <TouchableOpacity
                                style={[styles.addressModalButton, styles.addressModalPrimary]}
                                onPress={handleAbrirMapa}
                            >
                                <Text style={styles.addressModalButtonText}>Abrir en Google Maps</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.addressModalButton, styles.addressModalSecondary]}
                            onPress={handleCompartirUbicacion}
                        >
                            <Text style={styles.addressModalSecondaryText}>Compartir ubicación</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                        <Text style={styles.addressModalCancel}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const renderPhoneModal = () => (
        <Modal
            transparent
            visible={phoneModalVisible}
            animationType="fade"
            onRequestClose={() => setPhoneModalVisible(false)}
        >
            <View style={styles.phoneModalOverlay}>
                <View style={styles.phoneModalCard}>
                    <Text style={styles.phoneModalTitle}>Contacto</Text>
                    <Text style={styles.phoneModalNumber}>{selectedPhone}</Text>
                    <View style={styles.phoneModalButtons}>
                        <TouchableOpacity style={[styles.phoneModalButton, styles.phoneModalPrimary]} onPress={handlePhoneCall}>
                            <Text style={styles.phoneModalButtonText}>Llamar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.phoneModalButton, styles.phoneModalPrimary]} onPress={handlePhoneSms}>
                            <Text style={styles.phoneModalButtonText}>Enviar SMS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.phoneModalButton, styles.phoneModalSecondary]} onPress={handlePhoneWhatsApp}>
                            <Text style={styles.phoneModalSecondaryText}>WhatsApp</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => setPhoneModalVisible(false)}>
                        <Text style={styles.phoneModalCancel}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <>
        {renderDireccionModal()}
        {renderPhoneModal()}
        <View style={styles.cardStyle}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>👤 Información del Cliente</Text>
                <View style={styles.clientBadge}>
                    <Text style={styles.clientBadgeText}>{getClientInitials()}</Text>
                </View>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Text>🆔</Text>
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>ID Cliente</Text>
                        <Text style={styles.value}>{facturaData?.cliente?.id_cliente || 'N/A'}</Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Text>👨‍💼</Text>
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>Nombre Completo</Text>
                        <Text style={styles.value}>
                            {`${facturaData?.cliente?.nombres?.trim() || ''} ${facturaData?.cliente?.apellidos?.trim() || ''}`.trim() || 'N/A'}
                        </Text>
                    </View>
                </View>

                {facturaData?.cliente?.telefono1 && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>📞</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.label}>Teléfono Principal</Text>
                            <TouchableOpacity
                                style={styles.phoneButton}
                                onPress={() => openPhoneModal(facturaData.cliente.telefono1)}
                            >
                                <Text style={styles.phoneButtonText}>{formatPhoneNumber(facturaData.cliente.telefono1)}</Text>
                                <Text style={styles.phoneButtonHint}>Toca para llamar o enviar mensaje</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {facturaData?.cliente?.telefono2 && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>📱</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.label}>Teléfono Secundario</Text>
                            <TouchableOpacity
                                style={styles.phoneButton}
                                onPress={() => openPhoneModal(facturaData.cliente.telefono2)}
                            >
                                <Text style={styles.phoneButtonText}>{formatPhoneNumber(facturaData.cliente.telefono2)}</Text>
                                <Text style={styles.phoneButtonHint}>Llamar / SMS / WhatsApp</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {mostrarDireccion && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>📍</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <TouchableOpacity
                                onPress={handleDireccionPress}
                                style={[styles.clientAddressBlock, styles.clientAddressPressable]}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.clientInfoLabel}>Dirección</Text>
                                {direccionPrincipal !== '' && (
                                    <Text style={styles.detailValue}>{direccionPrincipal}</Text>
                                )}
                                {(referenciaDireccion || gpsDireccion) && (
                                    <View style={styles.detailSubList}>
                                        {referenciaDireccion && (
                                            <View style={styles.detailSubItem}>
                                                <Text style={styles.detailSubLabel}>Referencia</Text>
                                                <Text style={styles.detailSubValue}>{referenciaDireccion}</Text>
                                            </View>
                                        )}
                                        {gpsDireccion && (
                                            <View style={styles.detailSubItem}>
                                                <Text style={styles.detailSubLabel}>GPS</Text>
                                                <Text style={styles.detailSubValue}>{gpsDireccion}</Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                                <Text style={styles.clientAddressHint}>Toca para abrir o compartir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {facturaData?.cliente?.correo_elect && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>📧</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.label}>Correo Electrónico</Text>
                            <Text style={styles.value}>{facturaData.cliente.correo_elect}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Text>🆔</Text>
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>Cédula/RNC</Text>
                        <Text style={styles.value}>
                            {facturaData?.cliente?.cedula || facturaData?.cliente?.rnc || 'N/A'}
                        </Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Text>📅</Text>
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>Cliente desde</Text>
                        <Text style={styles.value}>
                            {facturaData?.cliente?.fecha_creacion_cliente
                                ? new Date(facturaData.cliente.fecha_creacion_cliente).toLocaleDateString('es-DO', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                }).replace(/\bde\b/g, 'de')
                                : 'N/A'}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
        </>
    );
};

export default ClienteCard;
