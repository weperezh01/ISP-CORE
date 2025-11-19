import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, ActivityIndicator, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  VlanCatalog,
  ZoneCatalog,
  OdbCatalog,
  OdbPortCatalog,
  SpeedProfileCatalog,
  OnuTypeCatalog,
} from '../services/types';

// ==================== Interfaz Simplificada ====================
export interface AuthorizationFormValues {
  // Campos que el técnico llena
  onu_type: string;              // Desplegable
  user_vlan_id: string;          // Desplegable
  zona: string;                  // Desplegable (ID de zona)
  zona_nombre?: string;          // Nombre de zona (para mostrar)
  download_speed: string;        // Desplegable
  upload_speed: string;          // Desplegable (auto-llenado simétrico)
  odb_splitter: string;          // Desplegable o texto libre
  odb_port: string;              // Desplegable (1-16)
  name: string;                  // Texto libre
  address_comment: string;       // Texto libre

  // Ubicación PON
  board: string;                 // Board/Frame (ej: 0, 1)
  port: string;                  // Puerto PON (ej: 0, 1, 5)

  // GPS (opcional)
  use_gps: boolean;
  gps_latitude: number | null;
  gps_longitude: number | null;
}

interface AuthorizationFormTR069Props {
  // Catálogos desde backend
  vlans: VlanCatalog[];
  zones: ZoneCatalog[];
  odbs: OdbCatalog[];
  speedProfiles: SpeedProfileCatalog[];
  onuTypes: OnuTypeCatalog[];

  // Loading states
  isLoadingCatalogs: boolean;

  // ODB Ports (dependiente de splitter seleccionado)
  odbPorts: OdbPortCatalog[];
  onLoadOdbPorts: (odbId: string) => void;

  // Valores iniciales
  initialValues?: Partial<AuthorizationFormValues>;

  // Estilos y tema
  styles: any;
  isDarkMode: boolean;

  // Callback de cambios
  onChange?: (values: AuthorizationFormValues) => void;
}

const AuthorizationFormTR069: React.FC<AuthorizationFormTR069Props> = ({
  vlans,
  zones,
  odbs,
  speedProfiles,
  onuTypes,
  isLoadingCatalogs,
  odbPorts,
  onLoadOdbPorts,
  initialValues = {},
  styles,
  isDarkMode,
  onChange,
}) => {
  // Inicializar formValues solo una vez con initialValues
  const [formValues, setFormValues] = useState<AuthorizationFormValues>(() => ({
    onu_type: '',
    user_vlan_id: '',
    zona: '',
    zona_nombre: '',
    download_speed: '',
    upload_speed: '',
    odb_splitter: '',
    odb_port: '',
    name: '',
    address_comment: '',
    board: '',
    port: '',
    use_gps: false,
    gps_latitude: null,
    gps_longitude: null,
    ...initialValues,
  }));

  // Estado para controlar qué dropdown está expandido
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);

  // Notificar cambios al padre
  useEffect(() => {
    if (onChange) {
      onChange(formValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues]);

  // Helper para actualizar un campo
  const updateField = (field: keyof AuthorizationFormValues, value: any) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-llenar upload_speed cuando cambia download_speed
  useEffect(() => {
    if (formValues.download_speed && !formValues.upload_speed) {
      updateField('upload_speed', formValues.download_speed);
    }
  }, [formValues.download_speed]);

  // Cargar puertos cuando cambia el ODB Splitter
  useEffect(() => {
    if (formValues.odb_splitter && onLoadOdbPorts) {
      onLoadOdbPorts(formValues.odb_splitter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.odb_splitter]);

  // Obtener ubicación GPS
  const handleGetGPS = () => {
    // TODO: Implementar geolocalización
    Alert.alert('GPS', 'Función de geolocalización en desarrollo');
  };

  // Toggle dropdown
  const toggleDropdown = (dropdownId: string) => {
    setExpandedDropdown(expandedDropdown === dropdownId ? null : dropdownId);
  };

  // Get display text for selected value
  const getOnuTypeLabel = () => {
    const selected = onuTypes.find((t) => t.value === formValues.onu_type);
    return selected ? selected.label : 'Seleccionar tipo de ONU';
  };

  const getVlanLabel = () => {
    const selected = vlans.find((v) => String(v.vlan_id) === formValues.user_vlan_id);
    return selected ? selected.display : 'Seleccionar VLAN';
  };

  const getZoneLabel = () => {
    return formValues.zona_nombre || 'Seleccionar zona';
  };

  // Get unique speeds sorted
  const getUniqueDownloadSpeeds = () => {
    const uniqueSpeeds = new Map<string, number>();
    speedProfiles.forEach((profile) => {
      if (!uniqueSpeeds.has(profile.download_speed)) {
        uniqueSpeeds.set(profile.download_speed, profile.download_mbps);
      }
    });

    // Sort by Mbps value
    return Array.from(uniqueSpeeds.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([speed]) => speed);
  };

  const getUniqueUploadSpeeds = () => {
    const uniqueSpeeds = new Map<string, number>();
    speedProfiles.forEach((profile) => {
      if (!uniqueSpeeds.has(profile.upload_speed)) {
        uniqueSpeeds.set(profile.upload_speed, profile.upload_mbps);
      }
    });

    // Sort by Mbps value
    return Array.from(uniqueSpeeds.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([speed]) => speed);
  };

  if (isLoadingCatalogs) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={[styles.modalLabel, { marginTop: 16 }]}>
          Cargando catálogos...
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* =============== SECCIÓN 1: Tipo de ONU =============== */}
      <View style={styles.modalSection}>
        <View style={styles.modalSectionHeader}>
          <Icon name="router-network" size={20} color="#3B82F6" />
          <Text style={styles.modalSectionTitle}>Tipo de ONU</Text>
        </View>

        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>ONU Type *</Text>

          {/* Dropdown Header */}
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => toggleDropdown('onu_type')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.dropdownHeaderText,
              !formValues.onu_type && styles.dropdownHeaderTextPlaceholder
            ]}>
              {getOnuTypeLabel()}
            </Text>
            <Icon
              name={expandedDropdown === 'onu_type' ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#6B7280"
            />
          </TouchableOpacity>

          {/* Dropdown Options */}
          {expandedDropdown === 'onu_type' && (
            <View style={styles.dropdownOptionsContainer}>
              <ScrollView
                style={styles.dropdownScrollView}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {onuTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.dropdownOption,
                      formValues.onu_type === type.value && styles.dropdownOptionSelected,
                    ]}
                    onPress={() => {
                      updateField('onu_type', type.value);
                      setExpandedDropdown(null);
                    }}
                  >
                    <Icon
                      name={formValues.onu_type === type.value ? 'radiobox-marked' : 'radiobox-blank'}
                      size={20}
                      color={formValues.onu_type === type.value ? '#10B981' : '#6B7280'}
                    />
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        formValues.onu_type === type.value && styles.dropdownOptionTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* =============== SECCIÓN 2: Ubicación PON =============== */}
      <View style={styles.modalSection}>
        <View style={styles.modalSectionHeader}>
          <Icon name="access-point" size={20} color="#EF4444" />
          <Text style={styles.modalSectionTitle}>Ubicación PON</Text>
        </View>

        {/* Info Box */}
        <View style={styles.modalInfoBox}>
          <Icon name="information" size={16} color="#3B82F6" />
          <Text style={styles.modalInfoText}>
            Puerto PON formato: 0/Board/Port (Ej: 0/1/5)
          </Text>
        </View>

        {/* Board */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>Board / Frame *</Text>
          <TextInput
            style={[styles.modalInput, styles.modalInputReadonly]}
            value={formValues.board}
            editable={false}
            placeholder="Ej: 0, 1"
            placeholderTextColor="#9CA3AF"
          />
          <Text style={styles.modalHint}>Automático desde la ONU detectada</Text>
        </View>

        {/* Port */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>Port (Slot) *</Text>
          <TextInput
            style={[styles.modalInput, styles.modalInputReadonly]}
            value={formValues.port}
            editable={false}
            placeholder="Ej: 0, 1, 5"
            placeholderTextColor="#9CA3AF"
          />
          <Text style={styles.modalHint}>Automático desde la ONU detectada</Text>
        </View>

        {/* Puerto PON preview */}
        {formValues.board && formValues.port && (
          <View style={styles.modalInfoBox}>
            <Icon name="check-circle" size={16} color="#10B981" />
            <Text style={styles.modalInfoText}>
              Puerto PON: 0/{formValues.board}/{formValues.port}
            </Text>
          </View>
        )}
      </View>

      {/* =============== SECCIÓN 3: Configuración de Red =============== */}
      <View style={styles.modalSection}>
        <View style={styles.modalSectionHeader}>
          <Icon name="network" size={20} color="#8B5CF6" />
          <Text style={styles.modalSectionTitle}>Configuración de Red</Text>
        </View>

        {/* VLAN */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>User VLAN-ID *</Text>

          {/* Dropdown Header */}
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => toggleDropdown('vlan')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.dropdownHeaderText,
              !formValues.user_vlan_id && styles.dropdownHeaderTextPlaceholder
            ]}>
              {getVlanLabel()}
            </Text>
            <Icon
              name={expandedDropdown === 'vlan' ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#6B7280"
            />
          </TouchableOpacity>

          {/* Dropdown Options */}
          {expandedDropdown === 'vlan' && (
            <View style={styles.dropdownOptionsContainer}>
              <ScrollView
                style={styles.dropdownScrollView}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {vlans.map((vlan) => (
                  <TouchableOpacity
                    key={vlan.vlan_id}
                    style={[
                      styles.dropdownOption,
                      formValues.user_vlan_id === String(vlan.vlan_id) && styles.dropdownOptionSelected,
                    ]}
                    onPress={() => {
                      updateField('user_vlan_id', String(vlan.vlan_id));
                      setExpandedDropdown(null);
                    }}
                  >
                    <Icon
                      name={
                        formValues.user_vlan_id === String(vlan.vlan_id)
                          ? 'radiobox-marked'
                          : 'radiobox-blank'
                      }
                      size={20}
                      color={formValues.user_vlan_id === String(vlan.vlan_id) ? '#10B981' : '#6B7280'}
                    />
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        formValues.user_vlan_id === String(vlan.vlan_id) &&
                          styles.dropdownOptionTextSelected,
                      ]}
                    >
                      {vlan.display}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Download Speed */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>Download Speed *</Text>
          <View style={styles.speedChipsContainer}>
            {getUniqueDownloadSpeeds().map((speed) => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.speedChip,
                  formValues.download_speed === speed && styles.speedChipSelected,
                ]}
                onPress={() => {
                  updateField('download_speed', speed);
                  updateField('upload_speed', speed); // Simétrico por defecto
                }}
              >
                <Text
                  style={[
                    styles.speedChipText,
                    formValues.download_speed === speed && styles.speedChipTextSelected,
                  ]}
                >
                  {speed}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upload Speed */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>Upload Speed *</Text>
          <View style={styles.speedChipsContainer}>
            {getUniqueUploadSpeeds().map((speed) => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.speedChip,
                  formValues.upload_speed === speed && styles.speedChipSelected,
                ]}
                onPress={() => updateField('upload_speed', speed)}
              >
                <Text
                  style={[
                    styles.speedChipText,
                    formValues.upload_speed === speed && styles.speedChipTextSelected,
                  ]}
                >
                  {speed}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.modalHint}>
            Por defecto es simétrico (igual que download). Puede editarlo.
          </Text>
        </View>
      </View>

      {/* =============== SECCIÓN 4: Ubicación del Cliente =============== */}
      <View style={styles.modalSection}>
        <View style={styles.modalSectionHeader}>
          <Icon name="map-marker" size={20} color="#F59E0B" />
          <Text style={styles.modalSectionTitle}>Ubicación del Cliente</Text>
        </View>

        {/* Zone */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>Zone (Zona) *</Text>

          {/* Dropdown Header */}
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => toggleDropdown('zone')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.dropdownHeaderText,
              !formValues.zona && styles.dropdownHeaderTextPlaceholder
            ]}>
              {getZoneLabel()}
            </Text>
            <Icon
              name={expandedDropdown === 'zone' ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#6B7280"
            />
          </TouchableOpacity>

          {/* Dropdown Options */}
          {expandedDropdown === 'zone' && (
            <View style={styles.dropdownOptionsContainer}>
              <ScrollView
                style={styles.dropdownScrollView}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {zones.slice(0, 20).map((zone) => (
                  <TouchableOpacity
                    key={zone.id}
                    style={[
                      styles.dropdownOption,
                      formValues.zona === String(zone.id) && styles.dropdownOptionSelected,
                    ]}
                    onPress={() => {
                      updateField('zona', String(zone.id));
                      updateField('zona_nombre', zone.nombre);
                      setExpandedDropdown(null);
                    }}
                  >
                    <Icon
                      name={formValues.zona === String(zone.id) ? 'radiobox-marked' : 'radiobox-blank'}
                      size={20}
                      color={formValues.zona === String(zone.id) ? '#10B981' : '#6B7280'}
                    />
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        formValues.zona === String(zone.id) && styles.dropdownOptionTextSelected,
                      ]}
                    >
                      {zone.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          <Text style={styles.modalHint}>
            Mostrando primeras 20 zonas disponibles
          </Text>
        </View>

        {/* ODB Splitter */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>ODB (Splitter)</Text>
          <TextInput
            style={styles.modalInput}
            value={formValues.odb_splitter}
            onChangeText={(text) => updateField('odb_splitter', text)}
            placeholder="Ej: ODB-15, ODB-25"
            placeholderTextColor="#9CA3AF"
          />
          <Text style={styles.modalHint}>Ingrese el código del splitter ODB</Text>
        </View>

        {/* ODB Port */}
        {formValues.odb_splitter && odbPorts.length > 0 && (
          <View style={styles.modalFormGroup}>
            <Text style={styles.modalLabel}>ODB Port</Text>
            <View style={styles.speedChipsContainer}>
              {odbPorts.map((port) => (
                <TouchableOpacity
                  key={port.value}
                  style={[
                    styles.speedChip,
                    formValues.odb_port === port.value && styles.speedChipSelected,
                  ]}
                  onPress={() => updateField('odb_port', port.value)}
                >
                  <Text
                    style={[
                      styles.speedChipText,
                      formValues.odb_port === port.value && styles.speedChipTextSelected,
                    ]}
                  >
                    {port.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* =============== SECCIÓN 5: Identificación y Comentarios =============== */}
      <View style={styles.modalSection}>
        <View style={styles.modalSectionHeader}>
          <Icon name="card-account-details" size={20} color="#10B981" />
          <Text style={styles.modalSectionTitle}>Identificación</Text>
        </View>

        {/* Name */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>Name (Nombre del Servicio) *</Text>
          <TextInput
            style={styles.modalInput}
            value={formValues.name}
            onChangeText={(text) => updateField('name', text)}
            placeholder="Ej: Juan Perez - Plan 100M"
            placeholderTextColor="#9CA3AF"
          />
          <Text style={styles.modalHint}>Descripción del servicio para identificación</Text>
        </View>

        {/* Address Comment */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>Address / Comment (Dirección)</Text>
          <TextInput
            style={[styles.modalInput, styles.modalTextArea]}
            value={formValues.address_comment}
            onChangeText={(text) => updateField('address_comment', text)}
            placeholder="Ej: Casa esquina color verde, portón negro"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* GPS */}
        <View style={styles.modalFormGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.modalLabel}>Use GPS</Text>
            <Switch
              value={formValues.use_gps}
              onValueChange={(value) => updateField('use_gps', value)}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor={formValues.use_gps ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {formValues.use_gps && (
          <>
            <View style={styles.modalFormGroup}>
              <Text style={styles.modalLabel}>GPS Latitude</Text>
              <TextInput
                style={styles.modalInput}
                value={formValues.gps_latitude ? String(formValues.gps_latitude) : ''}
                onChangeText={(text) => updateField('gps_latitude', parseFloat(text) || null)}
                placeholder="Ej: 18.4861"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.modalFormGroup}>
              <Text style={styles.modalLabel}>GPS Longitude</Text>
              <TextInput
                style={styles.modalInput}
                value={formValues.gps_longitude ? String(formValues.gps_longitude) : ''}
                onChangeText={(text) => updateField('gps_longitude', parseFloat(text) || null)}
                placeholder="Ej: -69.9312"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity style={styles.gpsButton} onPress={handleGetGPS}>
              <Icon name="crosshairs-gps" size={20} color="#FFFFFF" />
              <Text style={styles.gpsButtonText}>Obtener ubicación actual</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default AuthorizationFormTR069;
