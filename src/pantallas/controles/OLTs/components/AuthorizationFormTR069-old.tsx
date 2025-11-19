import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PON_TYPES, GPON_CHANNELS, ONU_MODES, ONU_TYPES, SPEED_OPTIONS, AuthorizeOnuPayload } from '../services/types';

export interface AuthorizationFormValues {
  // OLT / PON Section
  olt_id: string;
  pon_type: 'GPON' | 'EPON';
  gpon_channel: 'GPON' | 'XG-PON' | 'XGS-PON';
  board: string;
  port: string;
  puerto: string;
  sn: string;
  ont_id: string;

  // ONU Type Section
  onu_type: string;
  use_custom_profile: boolean;

  // Service / Network Section
  onu_mode: 'Routing' | 'Bridging';
  user_vlan_id: string;
  download_speed: string;
  upload_speed: string;
  zona: string;
  odb_splitter: string;
  odb_port: string;

  // Identification / Comments Section
  name: string;
  address_comment: string;
  onu_external_id: string;
  use_gps: boolean;
  gps_latitude: number | null;
  gps_longitude: number | null;
}

interface AuthorizationFormTR069Props {
  initialValues?: Partial<AuthorizationFormValues>;
  availableOntIds: number[];
  isLoadingIds: boolean;
  nextSuggestedId: number | null;
  onFetchAvailableOntIds: (puerto: string) => void;
  styles: any;
  isDarkMode: boolean;
  onChange?: (values: AuthorizationFormValues) => void;
}

const AuthorizationFormTR069: React.FC<AuthorizationFormTR069Props> = ({
  initialValues = {},
  availableOntIds,
  isLoadingIds,
  nextSuggestedId,
  onFetchAvailableOntIds,
  styles,
  isDarkMode,
  onChange,
}) => {
  const [formValues, setFormValues] = useState<AuthorizationFormValues>({
    // OLT / PON Section
    olt_id: initialValues.olt_id || '',
    pon_type: initialValues.pon_type || 'GPON',
    gpon_channel: initialValues.gpon_channel || 'GPON',
    board: initialValues.board || '',
    port: initialValues.port || '',
    puerto: initialValues.puerto || '',
    sn: initialValues.sn || '',
    ont_id: initialValues.ont_id || '',

    // ONU Type Section
    onu_type: initialValues.onu_type || '',
    use_custom_profile: initialValues.use_custom_profile || false,

    // Service / Network Section
    onu_mode: initialValues.onu_mode || 'Routing',
    user_vlan_id: initialValues.user_vlan_id || '100',
    download_speed: initialValues.download_speed || '100M',
    upload_speed: initialValues.upload_speed || '50M',
    zona: initialValues.zona || '',
    odb_splitter: initialValues.odb_splitter || '',
    odb_port: initialValues.odb_port || '',

    // Identification / Comments Section
    name: initialValues.name || '',
    address_comment: initialValues.address_comment || '',
    onu_external_id: initialValues.onu_external_id || initialValues.sn || '',
    use_gps: initialValues.use_gps || false,
    gps_latitude: initialValues.gps_latitude || null,
    gps_longitude: initialValues.gps_longitude || null,
  });

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange(formValues);
    }
  }, [formValues]);

  const updateField = (field: keyof AuthorizationFormValues, value: any) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };
  return (
    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
      {/* =============== SECCIÓN 1: OLT / PON =============== */}
      <View style={styles.modalSection}>
        <View style={styles.modalSectionHeader}>
          <Icon name="router-network" size={20} color="#3B82F6" />
          <Text style={styles.modalSectionTitle}>OLT / PON Configuration</Text>
        </View>

        {/* PON Type */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>PON Type *</Text>
          <View style={styles.radioGroup}>
            {PON_TYPES.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.radioButton,
                  formValues.pon_type === option.value && styles.radioButtonSelected,
                ]}
                onPress={() => updateField('pon_type', option.value)}
              >
                <View style={[
                  styles.radioCircle,
                  formValues.pon_type === option.value && styles.radioCircleSelected,
                ]}>
                  {formValues.pon_type === option.value && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* GPON Channel (only if GPON) */}
        {authForm.pon_type === 'GPON' && (
          <View style={styles.modalFormGroup}>
            <Text style={styles.modalLabel}>GPON Channel *</Text>
            <View style={styles.radioGroup}>
              {GPON_CHANNELS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.radioButton,
                    authForm.gpon_channel === option.value && styles.radioButtonSelected,
                  ]}
                  onPress={() => setAuthForm({ ...authForm, gpon_channel: option.value })}
                >
                  <View style={[
                    styles.radioCircle,
                    authForm.gpon_channel === option.value && styles.radioCircleSelected,
                  ]}>
                    {authForm.gpon_channel === option.value && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Board (read-only) */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>Board (Read-only)</Text>
          <TextInput
            style={[styles.modalInput, styles.modalInputReadonly]}
            value={String(authForm.board || '')}
            editable={false}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Port (read-only) */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>Port (Read-only)</Text>
          <TextInput
            style={[styles.modalInput, styles.modalInputReadonly]}
            value={String(authForm.port || '')}
            editable={false}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Puerto PON */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>Puerto PON *</Text>
          <TextInput
            style={styles.modalInput}
            value={authForm.puerto}
            onChangeText={(text) => {
              setAuthForm({ ...authForm, puerto: text });
              if (text && text.includes('/')) {
                fetchAvailableOntIds(text);
              }
            }}
            placeholder="Ej: 0/1/5 o 1/1/5"
            placeholderTextColor="#9CA3AF"
          />
          <Text style={styles.modalHint}>
            Formato Huawei: frame/slot/port (0/1/5){'\n'}
            Formato ZTE: rack/slot/port (1/1/5)
          </Text>
        </View>

        {/* Serial Number (read-only) */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>Serial Number (SN)</Text>
          <TextInput
            style={[styles.modalInput, styles.modalInputReadonly]}
            value={authForm.sn}
            editable={false}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* ONT ID */}
        <View style={styles.modalFormGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.modalLabel}>ONT ID *</Text>
            {isLoadingIds && <ActivityIndicator size="small" color="#10B981" />}
          </View>
          <TextInput
            style={styles.modalInput}
            value={authForm.ont_id}
            onChangeText={(text) => setAuthForm({ ...authForm, ont_id: text })}
            placeholder={nextSuggestedId ? `Sugerido: ${nextSuggestedId}` : "Ej: 10"}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />

          {/* Available IDs Display */}
          {availableOntIds.length > 0 && (
            <View style={styles.availableIdsContainer}>
              <View style={styles.availableIdsHeader}>
                <Icon name="check-circle-outline" size={16} color="#10B981" />
                <Text style={styles.availableIdsTitle}>
                  IDs Disponibles ({availableOntIds.length > 10 ? '10+' : availableOntIds.length})
                </Text>
              </View>
              <View style={styles.availableIdsList}>
                {availableOntIds.slice(0, 10).map((id) => (
                  <TouchableOpacity
                    key={id}
                    style={[
                      styles.availableIdChip,
                      String(authForm.ont_id) === String(id) && styles.availableIdChipSelected,
                    ]}
                    onPress={() => setAuthForm({ ...authForm, ont_id: String(id) })}
                  >
                    <Text
                      style={[
                        styles.availableIdText,
                        String(authForm.ont_id) === String(id) && styles.availableIdTextSelected,
                      ]}
                    >
                      {id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {nextSuggestedId && (
                <Text style={styles.suggestedIdText}>
                  💡 Próximo sugerido: {nextSuggestedId}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* =============== SECCIÓN 2: ONU TYPE =============== */}
      <View style={styles.modalSection}>
        <View style={styles.modalSectionHeader}>
          <Icon name="access-point" size={20} color="#8B5CF6" />
          <Text style={styles.modalSectionTitle}>ONU Type & Profile</Text>
        </View>

        {/* ONU Type */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>ONU Type *</Text>
          <View style={styles.dropdownContainer}>
            {ONU_TYPES.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownOption,
                  authForm.onu_type === option.value && styles.dropdownOptionSelected,
                ]}
                onPress={() => setAuthForm({ ...authForm, onu_type: option.value })}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    authForm.onu_type === option.value && styles.dropdownOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {authForm.onu_type === option.value && (
                  <Icon name="check" size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Use Custom Profile */}
        <View style={styles.modalFormGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.modalLabel}>Use Custom Profile</Text>
            <Switch
              value={authForm.use_custom_profile}
              onValueChange={(value) => setAuthForm({ ...authForm, use_custom_profile: value })}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor={authForm.use_custom_profile ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        </View>
      </View>

      {/* =============== SECCIÓN 3: SERVICE / NETWORK =============== */}
      <View style={styles.modalSection}>
        <View style={styles.modalSectionHeader}>
          <Icon name="network" size={20} color="#10B981" />
          <Text style={styles.modalSectionTitle}>Service / Network</Text>
        </View>

        {/* ONU Mode */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>ONU Mode *</Text>
          <View style={styles.radioGroup}>
            {ONU_MODES.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.radioButton,
                  authForm.onu_mode === option.value && styles.radioButtonSelected,
                ]}
                onPress={() => setAuthForm({ ...authForm, onu_mode: option.value })}
              >
                <View style={[
                  styles.radioCircle,
                  authForm.onu_mode === option.value && styles.radioCircleSelected,
                ]}>
                  {authForm.onu_mode === option.value && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* User VLAN-ID */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>User VLAN-ID *</Text>
          <TextInput
            style={styles.modalInput}
            value={authForm.user_vlan_id}
            onChangeText={(text) => setAuthForm({ ...authForm, user_vlan_id: text })}
            placeholder="Ej: 100"
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Download Speed */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>Download Speed *</Text>
          <View style={styles.speedGrid}>
            {SPEED_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.speedChip,
                  authForm.download_speed === option.value && styles.speedChipSelected,
                ]}
                onPress={() => setAuthForm({ ...authForm, download_speed: option.value })}
              >
                <Text
                  style={[
                    styles.speedChipText,
                    authForm.download_speed === option.value && styles.speedChipTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upload Speed */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>Upload Speed *</Text>
          <View style={styles.speedGrid}>
            {SPEED_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.speedChip,
                  authForm.upload_speed === option.value && styles.speedChipSelected,
                ]}
                onPress={() => setAuthForm({ ...authForm, upload_speed: option.value })}
              >
                <Text
                  style={[
                    styles.speedChipText,
                    authForm.upload_speed === option.value && styles.speedChipTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Zone */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>Zone *</Text>
          <TextInput
            style={styles.modalInput}
            value={authForm.zona}
            onChangeText={(text) => setAuthForm({ ...authForm, zona: text })}
            placeholder="Ej: 30 de Mayo, Centro, Villa Mella"
            placeholderTextColor="#9CA3AF"
          />
          <Text style={styles.modalHint}>Sector o área geográfica del cliente</Text>
        </View>

        {/* ODB Splitter */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>ODB (Splitter) (Opcional)</Text>
          <TextInput
            style={styles.modalInput}
            value={authForm.odb_splitter}
            onChangeText={(text) => setAuthForm({ ...authForm, odb_splitter: text })}
            placeholder="Seleccione splitter"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* ODB Port */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>ODB Port (Opcional)</Text>
          <TextInput
            style={styles.modalInput}
            value={authForm.odb_port}
            onChangeText={(text) => setAuthForm({ ...authForm, odb_port: text })}
            placeholder="Puerto del splitter"
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* =============== SECCIÓN 4: IDENTIFICATION =============== */}
      <View style={styles.modalSection}>
        <View style={styles.modalSectionHeader}>
          <Icon name="card-account-details" size={20} color="#F59E0B" />
          <Text style={styles.modalSectionTitle}>Identification & Comments</Text>
        </View>

        {/* Name */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>Name *</Text>
          <TextInput
            style={styles.modalInput}
            value={authForm.name}
            onChangeText={(text) => setAuthForm({ ...authForm, name: text })}
            placeholder="Ej: prueba casa well"
            placeholderTextColor="#9CA3AF"
          />
          <Text style={styles.modalHint}>Nombre descriptivo para esta ONU</Text>
        </View>

        {/* Address or Comment */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>Address or Comment (Opcional)</Text>
          <TextInput
            style={[styles.modalInput, styles.modalTextArea]}
            value={authForm.address_comment}
            onChangeText={(text) => setAuthForm({ ...authForm, address_comment: text })}
            placeholder="Dirección física o comentarios adicionales"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* ONU External ID */}
        <View style={styles.modalFormGroup}>
          <Text style={styles.modalLabel}>ONU External ID</Text>
          <TextInput
            style={styles.modalInput}
            value={authForm.onu_external_id}
            onChangeText={(text) => setAuthForm({ ...authForm, onu_external_id: text })}
            placeholder="Por defecto: Serial Number"
            placeholderTextColor="#9CA3AF"
          />
          <Text style={styles.modalHint}>ID externo/personalizado (default: SN)</Text>
        </View>

        {/* Use GPS */}
        <View style={styles.modalFormGroup}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalLabel}>Use GPS Location</Text>
              <Text style={styles.modalHint}>Capturar coordenadas GPS de la instalación</Text>
            </View>
            <Switch
              value={authForm.use_gps}
              onValueChange={(value) => setAuthForm({ ...authForm, use_gps: value })}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor={authForm.use_gps ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* GPS Coordinates (if enabled) */}
        {authForm.use_gps && (
          <>
            <View style={styles.modalFormGroup}>
              <Text style={styles.modalLabel}>GPS Latitude</Text>
              <TextInput
                style={styles.modalInput}
                value={authForm.gps_latitude ? String(authForm.gps_latitude) : ''}
                onChangeText={(text) => setAuthForm({ ...authForm, gps_latitude: parseFloat(text) || null })}
                placeholder="Ej: 18.4861"
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.modalFormGroup}>
              <Text style={styles.modalLabel}>GPS Longitude</Text>
              <TextInput
                style={styles.modalInput}
                value={authForm.gps_longitude ? String(authForm.gps_longitude) : ''}
                onChangeText={(text) => setAuthForm({ ...authForm, gps_longitude: parseFloat(text) || null })}
                placeholder="Ej: -69.9312"
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </>
        )}
      </View>

      {/* Warning */}
      <View style={styles.modalWarning}>
        <Icon name="alert-circle" size={20} color="#F59E0B" />
        <Text style={styles.modalWarningText}>
          La autorización es permanente. Verifique que todos los datos sean correctos antes de continuar.
        </Text>
      </View>
    </ScrollView>
  );
};

export default AuthorizationFormTR069;
