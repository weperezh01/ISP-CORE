import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EventoSMSCard = ({ 
  evento, 
  index, 
  onUpdate, 
  onDelete, 
  onInsertVariable,
  momentosEnvio,
  tiposMensaje,
  variables,
  isDarkMode,
  styles 
}) => {
  const [showVariables, setShowVariables] = useState(false);
  const [showMomentos, setShowMomentos] = useState(false);
  const [showTipos, setShowTipos] = useState(false);

  const getColorByTipo = (tipo: string) => {
    switch (tipo) {
      case 'recordatorio': return '#28a745';
      case 'urgente': return '#ffc107';
      case 'mora': return '#fd7e14';
      case 'corte': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const reemplazarVariables = (mensaje: string) => {
    let mensajeEjemplo = mensaje;
    variables.forEach(variable => {
      mensajeEjemplo = mensajeEjemplo.replace(new RegExp(variable.key, 'g'), variable.example);
    });
    return mensajeEjemplo;
  };

  // Función para calcular segmentación SMS real
  const calcularSegmentosSMS = (mensaje: string) => {
    const mensajeCompleto = reemplazarVariables(mensaje);
    
    // Verificar si contiene caracteres no GSM7 (tildes, ñ, emojis, etc.)
    const gsm7Regex = /^[\r\n\f\t !"#$%&'()*+,\-.\/0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\\]^_`abcdefghijklmnopqrstuvwxyz{|}~¡£¤¥§¿ÄÅÆÇÉÑÖØÜßàäåæèéìñòöøùüΓΔΘΛΞΠΣΦΨΩ]*$/;
    
    const esGSM7 = gsm7Regex.test(mensajeCompleto);
    const longitud = mensajeCompleto.length;
    
    if (esGSM7) {
      // GSM7 encoding
      if (longitud <= 160) {
        return {
          encoding: 'GSM7',
          caracteres: longitud,
          limite: 160,
          segmentos: 1,
          estado: 'ok'
        };
      } else {
        const segmentos = Math.ceil(longitud / 153); // 153 chars per segment for multipart GSM7
        return {
          encoding: 'GSM7',
          caracteres: longitud,
          limite: 153,
          segmentos: segmentos,
          estado: segmentos > 2 ? 'warning' : 'multipart'
        };
      }
    } else {
      // UCS-2/Unicode encoding
      if (longitud <= 70) {
        return {
          encoding: 'UCS-2',
          caracteres: longitud,
          limite: 70,
          segmentos: 1,
          estado: 'ok'
        };
      } else {
        const segmentos = Math.ceil(longitud / 67); // 67 chars per segment for multipart UCS-2
        return {
          encoding: 'UCS-2',
          caracteres: longitud,
          limite: 67,
          segmentos: segmentos,
          estado: segmentos > 2 ? 'warning' : 'multipart'
        };
      }
    }
  };

  const smsInfo = calcularSegmentosSMS(evento.mensaje);

  return (
    <View style={[styles.innerCard, { 
      marginBottom: 16, 
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? '#3a3a3a' : '#e5e5e5'
    }]}>
      {/* Header mejorado con estado accesible */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: 16
      }}>
        {/* Título y estado */}
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text style={[styles.itemName, { 
            fontSize: 16, 
            fontWeight: '600',
            marginBottom: 4,
            color: isDarkMode ? '#ffffff' : '#1a1a1a'
          }]}>
            Recordatorio #{index + 1}
          </Text>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            backgroundColor: evento.activo 
              ? (isDarkMode ? '#1a4a2a' : '#e8f5e8') 
              : (isDarkMode ? '#4a4a4a' : '#f5f5f5'),
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            alignSelf: 'flex-start'
          }}>
            <Icon 
              name={evento.activo ? 'check-circle' : 'pause-circle-outline'} 
              size={14} 
              color={evento.activo ? '#28a745' : '#6c757d'} 
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.itemDetails, { 
              fontSize: 12,
              fontWeight: '500',
              color: evento.activo ? '#28a745' : '#6c757d'
            }]}>
              {evento.activo ? 'Activo' : 'Pausado'}
            </Text>
          </View>
        </View>
        
        {/* Controles con mejor separación */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <TouchableOpacity
            onPress={() => onUpdate(index, 'activo', !evento.activo)}
            style={{ 
              padding: 12,
              backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa',
              borderRadius: 8,
              marginRight: 8,
              minWidth: 44,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center'
            }}
            accessibilityLabel={evento.activo ? 'Pausar recordatorio' : 'Activar recordatorio'}
          >
            <Icon
              name={evento.activo ? 'pause' : 'play-arrow'}
              size={20}
              color={evento.activo ? '#ffc107' : '#28a745'}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => {
              Alert.alert(
                "Confirmar Eliminación",
                "¿Estás seguro de que deseas eliminar este recordatorio?",
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Eliminar", onPress: () => onDelete(index), style: "destructive" }
                ]
              );
            }}
            style={{ 
              padding: 12,
              backgroundColor: isDarkMode ? '#4a2a2a' : '#ffeaea',
              borderRadius: 8,
              minWidth: 44,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center'
            }}
            accessibilityLabel="Eliminar recordatorio"
          >
            <Icon name="delete-outline" size={20} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid de selectores normalizado */}
      <View style={{ marginBottom: 16 }}>
        {/* Selector de Momento mejorado */}
        <View style={{ marginBottom: 12 }}>
          <Text style={[styles.label, { 
            marginBottom: 6, 
            fontSize: 13,
            fontWeight: '500',
            color: isDarkMode ? '#e5e5e5' : '#2a2a2a'
          }]}>
            Cuándo enviar
          </Text>
          <TouchableOpacity 
            style={[styles.inputTouchable, { 
              minHeight: 48,
              paddingHorizontal: 12,
              paddingVertical: 8,
              justifyContent: 'flex-start',
              borderWidth: 1,
              borderColor: isDarkMode ? '#4a4a4a' : '#d0d0d0',
              borderRadius: 8
            }]}
            onPress={() => setShowMomentos(true)}
            accessibilityLabel="Seleccionar momento de envío"
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputText, { 
                  fontSize: 14,
                  fontWeight: '500',
                  color: isDarkMode ? '#ffffff' : '#1a1a1a'
                }]}>
                  {momentosEnvio.find(m => m.value === evento.dias_antes_vencimiento)?.label || 'Seleccionar momento'}
                </Text>
                <Text style={[styles.itemDetails, { 
                  fontSize: 12,
                  marginTop: 2,
                  color: isDarkMode ? '#b0b0b0' : '#666666'
                }]}>
                  Relativo a la fecha de vencimiento
                </Text>
              </View>
              <Icon name="keyboard-arrow-down" size={20} color={isDarkMode ? '#b0b0b0' : '#666666'} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Selector de Tipo mejorado */}
        <View>
          <Text style={[styles.label, { 
            marginBottom: 6, 
            fontSize: 13,
            fontWeight: '500',
            color: isDarkMode ? '#e5e5e5' : '#2a2a2a'
          }]}>
            Tipo de mensaje
          </Text>
          <TouchableOpacity 
            style={[styles.inputTouchable, { 
              minHeight: 48,
              paddingHorizontal: 12,
              paddingVertical: 8,
              justifyContent: 'flex-start',
              borderWidth: 1,
              borderColor: isDarkMode ? '#4a4a4a' : '#d0d0d0',
              borderRadius: 8
            }]}
            onPress={() => setShowTipos(true)}
            accessibilityLabel="Seleccionar tipo de mensaje"
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: getColorByTipo(evento.tipo_mensaje),
                  marginRight: 8
                }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputText, { 
                    fontSize: 14,
                    fontWeight: '500',
                    color: isDarkMode ? '#ffffff' : '#1a1a1a'
                  }]}>
                    {tiposMensaje.find(t => t.value === evento.tipo_mensaje)?.label || 'Seleccionar tipo'}
                  </Text>
                  <Text style={[styles.itemDetails, { 
                    fontSize: 12,
                    marginTop: 2,
                    color: isDarkMode ? '#b0b0b0' : '#666666'
                  }]}>
                    Determina el tono y urgencia del mensaje
                  </Text>
                </View>
              </View>
              <Icon name="keyboard-arrow-down" size={20} color={isDarkMode ? '#b0b0b0' : '#666666'} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Editor de Mensaje mejorado */}
      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={[styles.label, { 
            fontSize: 13,
            fontWeight: '500',
            color: isDarkMode ? '#e5e5e5' : '#2a2a2a'
          }]}>
            Contenido del mensaje
          </Text>
          <TouchableOpacity
            style={[styles.editButton, { 
              paddingHorizontal: 12, 
              paddingVertical: 6,
              minHeight: 32,
              borderRadius: 6,
              backgroundColor: isDarkMode ? '#3a3a3a' : '#f0f0f0'
            }]}
            onPress={() => setShowVariables(true)}
            accessibilityLabel="Insertar variables"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="code" size={16} color={isDarkMode ? '#b0b0b0' : '#666666'} style={{ marginRight: 4 }} />
              <Text style={[styles.buttonText, { 
                fontSize: 12, 
                fontWeight: '500',
                color: isDarkMode ? '#ffffff' : '#1a1a1a'
              }]}>Variables</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={[styles.notebox, { 
            minHeight: 80, 
            fontSize: 14,
            paddingHorizontal: 12,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: isDarkMode ? '#4a4a4a' : '#d0d0d0',
            borderRadius: 8,
            textAlignVertical: 'top'
          }]}
          value={evento.mensaje}
          onChangeText={(text) => onUpdate(index, 'mensaje', text)}
          placeholder="Escribe tu mensaje SMS aquí. Usa variables como {cliente} para personalizar."
          placeholderTextColor={isDarkMode ? '#888' : '#999'}
          multiline
        />
        
        {/* Contador SMS inteligente */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: 8,
          paddingHorizontal: 4
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: smsInfo.estado === 'ok' ? '#28a745' : 
                              smsInfo.estado === 'multipart' ? '#ffc107' : '#dc3545',
              marginRight: 6
            }} />
            <Text style={[styles.itemDetails, { 
              fontSize: 11,
              color: smsInfo.estado === 'ok' ? '#28a745' : 
                     smsInfo.estado === 'multipart' ? '#ffc107' : '#dc3545'
            }]}>
              {smsInfo.encoding}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.itemDetails, { 
              fontSize: 11,
              color: isDarkMode ? '#b0b0b0' : '#666666',
              marginRight: 8
            }]}>
              {smsInfo.caracteres}/{smsInfo.limite} · {smsInfo.segmentos} SMS
            </Text>
            {smsInfo.estado === 'warning' && (
              <Icon name="warning" size={14} color="#ffc107" />
            )}
          </View>
        </View>

        {smsInfo.estado === 'multipart' && (
          <Text style={[styles.itemDetails, { 
            fontSize: 11, 
            color: '#ffc107',
            marginTop: 4,
            fontStyle: 'italic'
          }]}>
            ⚠️ Mensaje dividido en {smsInfo.segmentos} SMS
          </Text>
        )}

        {smsInfo.estado === 'warning' && (
          <Text style={[styles.itemDetails, { 
            fontSize: 11, 
            color: '#dc3545',
            marginTop: 4,
            fontStyle: 'italic'
          }]}>
            ⚠️ Mensaje muy largo ({smsInfo.segmentos} SMS) - considera reducir
          </Text>
        )}
      </View>

      {/* Vista previa mejorada */}
      {evento.mensaje.length > 0 && (
        <View style={{
          backgroundColor: isDarkMode ? '#2a3a2a' : '#f0f8f0', 
          borderWidth: 1,
          borderColor: isDarkMode ? '#3a4a3a' : '#d0e0d0',
          padding: 12, 
          borderRadius: 8,
          marginBottom: 8
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon name="visibility" size={16} color={isDarkMode ? '#90c090' : '#4a8a4a'} style={{ marginRight: 6 }} />
            <Text style={[styles.label, { 
              fontSize: 12, 
              fontWeight: '500',
              color: isDarkMode ? '#90c090' : '#4a8a4a'
            }]}>
              Vista previa del mensaje
            </Text>
          </View>
          
          <View style={{
            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
            padding: 12,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: isDarkMode ? '#4a4a4a' : '#e0e0e0'
          }}>
            <Text style={[styles.itemDetails, { 
              lineHeight: 18, 
              fontSize: 14,
              color: isDarkMode ? '#ffffff' : '#1a1a1a'
            }]}>
              {reemplazarVariables(evento.mensaje)}
            </Text>
          </View>
          
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: 6
          }}>
            <Text style={[styles.itemDetails, { 
              fontSize: 10,
              color: isDarkMode ? '#b0b0b0' : '#666666'
            }]}>
              Con variables reemplazadas
            </Text>
            <Text style={[styles.itemDetails, { 
              fontSize: 10,
              color: smsInfo.estado === 'ok' ? '#28a745' : 
                     smsInfo.estado === 'multipart' ? '#ffc107' : '#dc3545'
            }]}>
              {smsInfo.segmentos === 1 ? 'Un SMS' : `${smsInfo.segmentos} SMS`}
            </Text>
          </View>
        </View>
      )}

      {/* Modal de Variables mejorado */}
      <Modal visible={showVariables} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={[styles.card, { 
            width: '90%', 
            maxHeight: '80%',
            borderRadius: 16,
            padding: 20
          }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View>
                <Text style={[styles.cardTitle, { fontSize: 18, fontWeight: '600' }]}>Variables Disponibles</Text>
                <Text style={[styles.itemDetails, { 
                  fontSize: 13,
                  marginTop: 2,
                  color: isDarkMode ? '#b0b0b0' : '#666666'
                }]}>
                  Toca para insertar en tu mensaje
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowVariables(false)}
                style={{
                  padding: 8,
                  backgroundColor: isDarkMode ? '#3a3a3a' : '#f0f0f0',
                  borderRadius: 8,
                  minWidth: 40,
                  minHeight: 40,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                accessibilityLabel="Cerrar selector de variables"
              >
                <Icon name="close" size={20} color={isDarkMode ? '#b0b0b0' : '#666666'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ 
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                gap: 8,
                marginBottom: 16
              }}>
                {variables.map((variable) => (
                  <TouchableOpacity
                    key={variable.key}
                    style={{
                      backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: isDarkMode ? '#4a4a4a' : '#e0e0e0',
                      flexDirection: 'row',
                      alignItems: 'center',
                      minHeight: 36
                    }}
                    onPress={() => {
                      onInsertVariable(index, variable.key);
                      setShowVariables(false);
                    }}
                    accessibilityLabel={`Insertar variable ${variable.key}`}
                  >
                    <Icon name="code" size={14} color={isDarkMode ? '#90c090' : '#4a8a4a'} style={{ marginRight: 4 }} />
                    <Text style={{
                      fontWeight: '600',
                      fontSize: 12,
                      color: isDarkMode ? '#ffffff' : '#1a1a1a'
                    }}>
                      {variable.key}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Lista detallada */}
              <Text style={[styles.label, { 
                fontSize: 14, 
                fontWeight: '600',
                marginBottom: 12,
                color: isDarkMode ? '#e5e5e5' : '#2a2a2a'
              }]}>
                Descripción de Variables
              </Text>
              
              {variables.map((variable) => (
                <TouchableOpacity
                  key={`detail-${variable.key}`}
                  style={{
                    backgroundColor: isDarkMode ? '#2a2a2a' : '#fafafa',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: isDarkMode ? '#3a3a3a' : '#eeeeee'
                  }}
                  onPress={() => {
                    onInsertVariable(index, variable.key);
                    setShowVariables(false);
                  }}
                  accessibilityLabel={`Insertar ${variable.key}: ${variable.example}`}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <View style={{
                      backgroundColor: isDarkMode ? '#4a4a4a' : '#e8e8e8',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 12,
                      marginRight: 8
                    }}>
                      <Text style={{
                        fontFamily: 'monospace',
                        fontSize: 11,
                        fontWeight: '600',
                        color: isDarkMode ? '#90c090' : '#4a8a4a'
                      }}>
                        {variable.key}
                      </Text>
                    </View>
                    <Icon name="add" size={16} color={isDarkMode ? '#90c090' : '#4a8a4a'} />
                  </View>
                  <Text style={{
                    fontSize: 12,
                    color: isDarkMode ? '#b0b0b0' : '#666666',
                    lineHeight: 16
                  }}>
                    Ejemplo: <Text style={{ fontStyle: 'italic' }}>"{variable.example}"</Text>
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Momentos mejorado */}
      <Modal visible={showMomentos} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={[styles.card, { 
            width: '90%', 
            maxHeight: '80%',
            borderRadius: 16,
            padding: 20
          }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View>
                <Text style={[styles.cardTitle, { fontSize: 18, fontWeight: '600' }]}>Cuándo Enviar</Text>
                <Text style={[styles.itemDetails, { 
                  fontSize: 13,
                  marginTop: 2,
                  color: isDarkMode ? '#b0b0b0' : '#666666'
                }]}>
                  Selecciona el momento relativo al vencimiento
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowMomentos(false)}
                style={{
                  padding: 8,
                  backgroundColor: isDarkMode ? '#3a3a3a' : '#f0f0f0',
                  borderRadius: 8,
                  minWidth: 40,
                  minHeight: 40,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon name="close" size={20} color={isDarkMode ? '#b0b0b0' : '#666666'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {momentosEnvio.map((momento) => (
                <TouchableOpacity
                  key={momento.value}
                  style={[{
                    backgroundColor: momento.value === evento.dias_antes_vencimiento 
                      ? (isDarkMode ? '#1a4a2a' : '#e8f5e8')
                      : (isDarkMode ? '#2a2a2a' : '#fafafa'),
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 8,
                    borderWidth: 2,
                    borderColor: momento.value === evento.dias_antes_vencimiento 
                      ? '#28a745' 
                      : (isDarkMode ? '#3a3a3a' : '#e0e0e0'),
                    minHeight: 60
                  }]}
                  onPress={() => {
                    onUpdate(index, 'dias_antes_vencimiento', momento.value);
                    setShowMomentos(false);
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon 
                      name={momento.value === evento.dias_antes_vencimiento ? 'radio-button-checked' : 'radio-button-unchecked'} 
                      size={20} 
                      color={momento.value === evento.dias_antes_vencimiento ? '#28a745' : (isDarkMode ? '#6c757d' : '#999999')}
                      style={{ marginRight: 12 }}
                    />
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: momento.value === evento.dias_antes_vencimiento 
                        ? '#28a745' 
                        : (isDarkMode ? '#ffffff' : '#1a1a1a')
                    }}>
                      {momento.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Tipos mejorado */}
      <Modal visible={showTipos} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={[styles.card, { 
            width: '90%', 
            maxHeight: '80%',
            borderRadius: 16,
            padding: 20
          }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View>
                <Text style={[styles.cardTitle, { fontSize: 18, fontWeight: '600' }]}>Tipo de Mensaje</Text>
                <Text style={[styles.itemDetails, { 
                  fontSize: 13,
                  marginTop: 2,
                  color: isDarkMode ? '#b0b0b0' : '#666666'
                }]}>
                  El tipo determina el tono y urgencia
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowTipos(false)}
                style={{
                  padding: 8,
                  backgroundColor: isDarkMode ? '#3a3a3a' : '#f0f0f0',
                  borderRadius: 8,
                  minWidth: 40,
                  minHeight: 40,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon name="close" size={20} color={isDarkMode ? '#b0b0b0' : '#666666'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {tiposMensaje.map((tipo) => (
                <TouchableOpacity
                  key={tipo.value}
                  style={[{
                    backgroundColor: tipo.value === evento.tipo_mensaje 
                      ? (isDarkMode ? '#2a2a2a' : '#f8f9fa')
                      : (isDarkMode ? '#1a1a1a' : '#fafafa'),
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 8,
                    borderWidth: 2,
                    borderColor: tipo.value === evento.tipo_mensaje 
                      ? getColorByTipo(tipo.value) 
                      : (isDarkMode ? '#3a3a3a' : '#e0e0e0'),
                    minHeight: 60
                  }]}
                  onPress={() => {
                    onUpdate(index, 'tipo_mensaje', tipo.value);
                    setShowTipos(false);
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: getColorByTipo(tipo.value),
                      marginRight: 12,
                      opacity: tipo.value === evento.tipo_mensaje ? 1 : 0.5
                    }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '500',
                        color: tipo.value === evento.tipo_mensaje 
                          ? getColorByTipo(tipo.value)
                          : (isDarkMode ? '#ffffff' : '#1a1a1a'),
                        marginBottom: 2
                      }}>
                        {tipo.label}
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: isDarkMode ? '#b0b0b0' : '#666666'
                      }}>
                        {tipo.value === 'recordatorio' && 'Mensaje amigable de recordatorio'}
                        {tipo.value === 'urgente' && 'Tono más directo y urgente'}
                        {tipo.value === 'mora' && 'Notificación de retraso en pago'}
                        {tipo.value === 'corte' && 'Aviso de suspensión de servicio'}
                      </Text>
                    </View>
                    <Icon 
                      name={tipo.value === evento.tipo_mensaje ? 'check-circle' : 'radio-button-unchecked'} 
                      size={20} 
                      color={tipo.value === evento.tipo_mensaje ? getColorByTipo(tipo.value) : (isDarkMode ? '#6c757d' : '#999999')}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EventoSMSCard;