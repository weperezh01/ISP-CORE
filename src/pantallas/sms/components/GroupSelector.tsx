import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {StyleSheet} from 'react-native';

interface Group {
  tipo: string;
  id: string | number;
  nombre: string;
  descripcion: string;
  cantidad_clientes: number;
}

interface GroupsData {
  por_red: Group[];
  por_router: Group[];
  por_estado: Group[];
  por_pon: Group[];
  por_vlan: Group[];
  por_tipo_conexion: Group[];
  por_cableado_cobre: Group[];
  por_inalambrico: Group[];
}

interface Cliente {
  id_cliente: number;
  nombre_completo: string;
  telefono1: string;
  direccion_ipv4?: string;
}

interface GroupSelectorProps {
  grupos: GroupsData;
  onFiltroAplicado: (
    filtro: {
      tipo_grupo: string;
      grupo_id: string | number;
      clientes: Cliente[];
    } | null,
  ) => void;
  loadingPreview: boolean;
  isDarkMode: boolean;
  ispId?: number | string;
}

const GroupSelector: React.FC<GroupSelectorProps> = ({
  grupos,
  onFiltroAplicado,
  loadingPreview,
  isDarkMode,
  ispId,
}) => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>('');
  const [direccionSubtipoKey, setDireccionSubtipoKey] = useState<string>('');
  const [filtroActivo, setFiltroActivo] = useState<{
    tipo_grupo: string;
    grupo_id: string | number;
    clientes: Cliente[];
  } | null>(null);

  const styles = getStyles(isDarkMode);

  const tiposGrupo = [
    {key: '', label: 'Selecciona tipo de grupo...'},
    // Dirección (ONE) como grupo contenedor
    {key: 'direccion', label: '🧭 Dirección'},
    // Existentes
    {key: 'por_red', label: '🌐 Por Red/Segmento'},
    {key: 'por_router', label: '📡 Por Router/Equipo'},
    {key: 'por_estado', label: '📊 Por Estado de Conexión'},
    {key: 'por_pon', label: '🔗 Por PON'},
    {key: 'por_vlan', label: '🏷️ Por VLAN'},
    {key: 'por_tipo_conexion', label: '🌐 Por Tipo de Conexión'},
    {key: 'por_cableado_cobre', label: '🟫 Por Cableado de Cobre'},
    {key: 'por_inalambrico', label: '📶 Por Conexión Inalámbrica'},
  ];

  // Subgrupos para Dirección (ONE)
  const direccionSubtipos = [
    { key: 'por_one_provincia', label: 'Provincia' },
    { key: 'por_one_municipio', label: 'Municipio' },
    { key: 'por_one_distrito_municipal', label: 'Distrito municipal' },
    { key: 'por_one_seccion', label: 'Sección' },
    { key: 'por_one_paraje', label: 'Paraje' },
    { key: 'por_one_sector_barrio', label: 'Sector/Barrio' },
  ];

  // Cascada Dirección (ONE)
  const oneLevels = ['provincia','municipio','distrito_municipal','seccion','paraje','sector_barrio'] as const;
  type OneLevel = typeof oneLevels[number];
  const levelToEndpoint: Record<OneLevel, string> = {
    provincia: 'provincias',
    municipio: 'municipios',
    distrito_municipal: 'distritos',
    seccion: 'secciones',
    paraje: 'parajes',
    sector_barrio: 'sectores',
  };
  const [oneFilters, setOneFilters] = useState<Partial<Record<OneLevel, string>>>({});
  const [oneOptions, setOneOptions] = useState<Partial<Record<OneLevel, Group[]>>>({});
  const [oneLoadingLevel, setOneLoadingLevel] = useState<OneLevel | null>(null);
  const [oneCascadeAvailable, setOneCascadeAvailable] = useState<boolean | null>(null);
  const [oneError, setOneError] = useState<string | null>(null);
  const [oneSearch, setOneSearch] = useState<Partial<Record<OneLevel, string>>>({});

  const getGruposDisponibles = () => {
    if (!tipoSeleccionado) return [];
    // Si es dirección, usar el subgrupo seleccionado
    if (tipoSeleccionado === 'direccion') {
      if (!direccionSubtipoKey) return [];
      const arr = (grupos as any)[direccionSubtipoKey] as Group[] | undefined;
      return arr || [];
    }
    const arr = (grupos as any)[tipoSeleccionado] as Group[] | undefined;
    return arr || [];
  };

  const aplicarFiltro = async (tipoGrupo: string, grupo: Group) => {
    try {
      const userData = await import(
        '@react-native-async-storage/async-storage'
      ).then(m => m.default.getItem('@loginData'));
      const user = userData ? JSON.parse(userData) : null;

      const API_BASE = 'https://wellnet-rd.com:444/api';
      const payload = {
        tipo_grupo: grupo.tipo || tipoGrupo,
        grupo_id: grupo.id,
        ...(ispId ? { isp_id: ispId } : {}),
      };
      console.log('📤 [GroupSelector] Preview payload:', payload);
      const response = await fetch(`${API_BASE}/sms-campaigns-simple/preview`, {
        method: 'POST',
        headers: {
          ...(ispId ? { 'X-ISP-ID': String(ispId) } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        let data: any = null;
        try {
          data = await response.json();
        } catch (e) {
          const raw = await response.text();
          console.error('❌ [GroupSelector] JSON parse error. Raw:', raw?.slice(0, 300));
          throw e;
        }
        const nuevoFiltro = {
          tipo_grupo: tipoGrupo,
          grupo_id: grupo.id,
          clientes: data.clientes || [],
        };
        setFiltroActivo(nuevoFiltro);
        onFiltroAplicado(nuevoFiltro);
      } else {
        const raw = await response.text();
        console.error('❌ [GroupSelector] Error preview:', response.status, raw?.slice(0, 300));
      }
    } catch (error) {
      console.error('❌ Error applying filter:', error);
    }
  };

  const limpiarFiltro = () => {
    setTipoSeleccionado('');
    setDireccionSubtipoKey('');
    setOneFilters({});
    setOneOptions({});
    setOneCascadeAvailable(null);
    setFiltroActivo(null);
    onFiltroAplicado(null);
  };

  // Cargar opciones de un nivel (si backend soporta cascada)
  const loadOneOptions = async (level: OneLevel) => {
    try {
      if (!ispId) return;
      setOneLoadingLevel(level);
      setOneError(null);
      const API_BASE = 'https://wellnet-rd.com:444/api';
      const params = new URLSearchParams();
      params.set('isp_id', String(ispId));
      for (const l of oneLevels) {
        if (l === level) break;
        const v = (oneFilters as any)[l];
        if (v) params.set(l, String(v));
      }
      const endpoint = `${API_BASE}/sms-campaigns-simple/one/${levelToEndpoint[level]}?${params.toString()}`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { ...(ispId ? { 'X-ISP-ID': String(ispId) } : {}) },
      });
      if (!res.ok) {
        const raw = await res.text();
        console.log('❌ [ONE Cascade] Options error', level, res.status, raw?.slice(0,200));
        setOneCascadeAvailable(false);
        return;
      }
      const data = await res.json();
      setOneCascadeAvailable(true);
      const items: Group[] = (data.items || []).map((it: any) => ({
        tipo: `one_${level}`,
        id: it.id ?? it.nombre,
        nombre: it.nombre,
        descripcion: it.descripcion,
        cantidad_clientes: it.cantidad_clientes ?? it.count ?? 0,
      }));
      setOneOptions(prev => ({ ...prev, [level]: items }));
    } catch (e: any) {
      console.log('❌ [ONE Cascade] Options exception', level, e?.message);
      setOneCascadeAvailable(false);
      setOneError('Cascada ONE no disponible');
    } finally {
      setOneLoadingLevel(null);
    }
  };

  // Preview por filtros acumulados
  const previewOne = async () => {
    try {
      setOneError(null);
      const API_BASE = 'https://wellnet-rd.com:444/api';
      const body: any = {
        isp_id: ispId ? Number(ispId) : undefined,
        tipo_grupo: 'one',
        filtros: oneFilters,
      };
      const res = await fetch(`${API_BASE}/sms-campaigns-simple/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(ispId ? { 'X-ISP-ID': String(ispId) } : {}) },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const raw = await res.text();
        console.log('❌ [ONE Cascade] Preview error', res.status, raw?.slice(0,200));
        setOneError('No se pudo obtener el preview con filtros');
        return;
      }
      const data = await res.json();
      const nuevoFiltro = {
        tipo_grupo: 'one',
        grupo_id: JSON.stringify(oneFilters),
        clientes: data.clientes || [],
      };
      setFiltroActivo(nuevoFiltro);
      onFiltroAplicado(nuevoFiltro);
    } catch (e: any) {
      console.log('❌ [ONE Cascade] Preview exception', e?.message);
      setOneError('No se pudo obtener el preview con filtros');
    }
  };

  // Al activar Dirección, intentamos cargar provincias
  useEffect(() => {
    if (tipoSeleccionado === 'direccion') {
      setOneFilters({});
      setOneOptions({});
      setOneCascadeAvailable(null);
      loadOneOptions('provincia');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoSeleccionado, ispId]);

  const gruposDisponibles = getGruposDisponibles();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="filter-list" size={24} color="#2196f3" />
        <Text style={styles.title}>🔍 Filtro Avanzado por Grupos</Text>
        {filtroActivo && (
          <TouchableOpacity
            style={styles.limpiarButton}
            onPress={limpiarFiltro}>
            <Icon name="clear" size={20} color="#dc3545" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtro activo */}
      {filtroActivo && (
        <View style={styles.filtroActivoContainer}>
          <View style={styles.filtroActivoHeader}>
            <Icon name="filter-alt" size={20} color="#28a745" />
            <Text style={styles.filtroActivoText}>
              Filtro activo: {filtroActivo.clientes.length} clientes
            </Text>
          </View>
          <Text style={styles.filtroActivoDescripcion}>
            {tiposGrupo.find(t => t.key === filtroActivo.tipo_grupo)?.label}
          </Text>
        </View>
      )}

      {/* Tipo de grupo */}
      <View style={styles.selectorContainer}>
        <Text style={styles.label}>Seleccionar Filtro por Tipo:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tiposScrollContainer}
          contentContainerStyle={styles.tiposScrollContent}>
          {tiposGrupo.slice(1).map(tipo => (
            <TouchableOpacity
              key={tipo.key}
              style={[
                styles.typeButton,
                tipoSeleccionado === tipo.key && styles.typeButtonActive,
              ]}
              onPress={() => {
                if (tipoSeleccionado === tipo.key) {
                  setTipoSeleccionado('');
                  setDireccionSubtipoKey('');
                } else {
                  setTipoSeleccionado(tipo.key);
                  if (tipo.key !== 'direccion') setDireccionSubtipoKey('');
                }
              }}>
              <Text
                style={[
                  styles.typeButtonText,
                  tipoSeleccionado === tipo.key && styles.typeButtonTextActive,
                ]}>
                {tipo.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Subgrupos de Dirección (fallback) */}
      {tipoSeleccionado === 'direccion' && oneCascadeAvailable === false && (
        <View style={styles.selectorContainer}>
          <Text style={styles.label}>Subgrupo de Dirección:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tiposScrollContainer}
            contentContainerStyle={styles.tiposScrollContent}
          >
            {direccionSubtipos.map(sub => (
              <TouchableOpacity
                key={sub.key}
                style={[
                  styles.typeButton,
                  direccionSubtipoKey === sub.key && styles.typeButtonActive,
                ]}
                onPress={() => {
                  setDireccionSubtipoKey(prev => (prev === sub.key ? '' : sub.key));
                }}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    direccionSubtipoKey === sub.key && styles.typeButtonTextActive,
                  ]}
                >
                  {`🧭 ${sub.label}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Grupos disponibles */}
      {(tipoSeleccionado && gruposDisponibles.length > 0 && !(tipoSeleccionado === 'direccion' && oneCascadeAvailable !== false)) && (
        <View style={styles.selectorContainer}>
          <Text style={styles.label}>
            Grupos Disponibles - Toca para Filtrar:
          </Text>
          <View style={styles.groupsList}>
            {gruposDisponibles.map(grupo => (
              <TouchableOpacity
                key={grupo.id}
                style={[
                  styles.groupButton,
                  filtroActivo?.grupo_id === grupo.id &&
                    styles.groupButtonActive,
                ]}
                onPress={() => {
                  if (filtroActivo?.grupo_id === grupo.id) {
                    limpiarFiltro();
                  } else {
                    const effectiveTipo =
                      tipoSeleccionado === 'direccion' ? direccionSubtipoKey : tipoSeleccionado;
                    if (!effectiveTipo) return;
                    aplicarFiltro(effectiveTipo, grupo);
                  }
                }}>
                <View style={styles.groupButtonContent}>
                  <View style={styles.groupButtonInfo}>
                    <Text
                      style={[
                        styles.groupButtonText,
                        filtroActivo?.grupo_id === grupo.id &&
                          styles.groupButtonTextActive,
                      ]}>
                      {grupo.nombre}
                    </Text>
                    <Text style={styles.groupButtonCount}>
                      {grupo.cantidad_clientes} clientes
                    </Text>
                  </View>
                  {loadingPreview && filtroActivo?.grupo_id === grupo.id ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Icon
                      name={
                        filtroActivo?.grupo_id === grupo.id
                          ? 'check-circle'
                          : 'filter-alt'
                      }
                      size={20}
                      color={
                        filtroActivo?.grupo_id === grupo.id
                          ? '#ffffff'
                          : '#2196f3'
                      }
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Estadísticas del tipo seleccionado */}
      {tipoSeleccionado && gruposDisponibles.length > 0 && !(tipoSeleccionado === 'direccion' && oneCascadeAvailable !== false) && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>
            📊 Estadísticas del Tipo "
            {(
              tipoSeleccionado === 'direccion'
                ? `Dirección · ${direccionSubtipos.find(s => s.key === direccionSubtipoKey)?.label || ''}`
                : tiposGrupo.find(t => t.key === tipoSeleccionado)?.label
            )}"
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{gruposDisponibles.length}</Text>
              <Text style={styles.statLabel}>Grupos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {gruposDisponibles.reduce(
                  (sum, g) => sum + g.cantidad_clientes,
                  0,
                )}
              </Text>
              <Text style={styles.statLabel}>Total Clientes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {Math.round(
                  gruposDisponibles.reduce(
                    (sum, g) => sum + g.cantidad_clientes,
                    0,
                  ) / gruposDisponibles.length,
                )}
              </Text>
              <Text style={styles.statLabel}>Promedio</Text>
            </View>
          </View>
        </View>
      )}

      {/* Cascada Dirección (si disponible) */}
      {tipoSeleccionado === 'direccion' && oneCascadeAvailable !== false && (
        <View style={styles.selectorContainer}>
          <Text style={styles.label}>Dirección (ONE) en cascada</Text>

          {/* Mensaje de estado */}
          {oneCascadeAvailable === null && (
            <Text style={{ color: isDarkMode ? '#cccccc' : '#666666', marginBottom: 8 }}>
              Cargando provincias...
            </Text>
          )}
          {oneError && (
            <Text style={{ color: '#dc2626', marginBottom: 8 }}>{oneError}</Text>
          )}

          {/* Bloques por nivel con botones siempre visibles */}
          {oneLevels.map((level, idx) => {
            const prevSelected = idx === 0 ? true : !!(oneFilters as any)[oneLevels[idx - 1]];
            const enabled = prevSelected;
            const options = (oneOptions as any)[level] as Group[] | undefined;
            const selectedValue = (oneFilters as any)[level] as string | undefined;
            return (
              <View key={level} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.label, { marginBottom: 4, opacity: enabled ? 1 : 0.5 }]}>
                    {level === 'provincia' ? 'Provincia' :
                     level === 'municipio' ? 'Municipio' :
                     level === 'distrito_municipal' ? 'Distrito municipal' :
                     level === 'seccion' ? 'Sección' :
                     level === 'paraje' ? 'Paraje' : 'Sector/Barrio'}
                    {selectedValue ? `: ${selectedValue}` : ''}
                  </Text>
                  {selectedValue && (
                    <TouchableOpacity
                      onPress={() => {
                        // Limpiar desde este nivel hacia abajo
                        setOneFilters(prev => {
                          const next: any = { ...prev };
                          for (let i = idx; i < oneLevels.length; i++) delete next[oneLevels[i]];
                          return next;
                        });
                        previewOne();
                      }}
                      style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#fee2e2' }}
                    >
                      <Text style={{ color: '#dc2626', fontWeight: '600' }}>Limpiar</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {enabled ? (
                  <>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {(((options || []) as Group[])
                      .filter(opt => {
                        const q = (oneSearch as any)[level]?.toString().toLowerCase() || '';
                        return q.length === 0 || opt.nombre.toLowerCase().includes(q);
                      }))
                      .map(opt => {
                      const selected = selectedValue === opt.nombre;
                      return (
                        <TouchableOpacity
                          key={`${level}-${opt.id}`}
                          style={[styles.typeButton, selected && styles.typeButtonActive]}
                          onPress={async () => {
                            setOneFilters(prev => {
                              const next: any = { ...prev, [level]: opt.nombre };
                              for (let i = idx + 1; i < oneLevels.length; i++) delete next[oneLevels[i]];
                              return next;
                            });
                            // limpiar búsquedas de niveles siguientes
                            setOneSearch(prev => {
                              const n: any = { ...prev };
                              for (let i = idx + 1; i < oneLevels.length; i++) delete n[oneLevels[i]];
                              return n;
                            });
                            await previewOne();
                            const nextLevel = oneLevels[idx + 1];
                            if (nextLevel) loadOneOptions(nextLevel);
                          }}
                        >
                          <Text style={[styles.typeButtonText, selected && styles.typeButtonTextActive]}>
                            {opt.nombre} ({opt.cantidad_clientes})
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  {oneLoadingLevel === level && (
                    <View style={{ justifyContent: 'center', paddingHorizontal: 8 }}>
                      <ActivityIndicator size="small" color="#2196f3" />
                    </View>
                  )}
                  {(!options || options.length === 0) && oneLoadingLevel !== level && (
                    <TouchableOpacity
                      style={[styles.typeButton, { minWidth: 120 }]}
                      onPress={() => loadOneOptions(level)}
                    >
                      <Text style={styles.typeButtonText}>Cargar {level}</Text>
                    </TouchableOpacity>
                  )}
                  </ScrollView>
                  {/* Buscador por nivel */}
                  {enabled && (options && options.length > 6) && (
                  <View style={{ marginTop: 8 }}>
                    <TextInput
                      value={(oneSearch as any)[level] || ''}
                      onChangeText={(t) => setOneSearch(prev => ({ ...prev, [level]: t }))}
                      placeholder={`Filtrar ${level.replace('_',' ')}...`}
                      placeholderTextColor={'#9CA3AF'}
                      style={{
                        height: 40,
                        borderWidth: 1,
                        borderColor: '#e0e0e0',
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        color: isDarkMode ? '#fff' : '#333',
                        backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
                      }}
                    />
                  </View>
                )}
                </>
                ) : (
                  <Text style={{ color: isDarkMode ? '#888' : '#aaa' }}>
                    Selecciona {idx === 1 ? 'Provincia' : idx === 2 ? 'Municipio' : idx === 3 ? 'Distrito municipal' : idx === 4 ? 'Sección' : 'Paraje'} primero
                  </Text>
                )}
              </View>
            );
          })}

          {/* Acciones */}
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <TouchableOpacity style={[styles.typeButton, { minWidth: 100 }]} onPress={limpiarFiltro}>
              <Text style={styles.typeButtonText}>Limpiar Dirección</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Instrucciones */}
      {!tipoSeleccionado && (
        <View style={styles.instructionsContainer}>
          <Icon name="info-outline" size={20} color="#666666" />
          <Text style={styles.instructionsText}>
            Selecciona un tipo de agrupación para ver los grupos disponibles y
            aplicar filtros
          </Text>
        </View>
      )}
    </View>
  );
};

const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#333333',
      marginLeft: 8,
    },
    selectorContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? '#cccccc' : '#666666',
      marginBottom: 8,
    },
    limpiarButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: isDarkMode ? '#3a1a1a' : '#ffeaea',
    },
    filtroActivoContainer: {
      backgroundColor: '#e8f5e8',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#28a745',
    },
    filtroActivoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    filtroActivoText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#28a745',
      marginLeft: 8,
    },
    filtroActivoDescripcion: {
      fontSize: 14,
      color: '#155724',
      marginLeft: 28,
    },
    tiposScrollContainer: {
      maxHeight: 100,
    },
    tiposScrollContent: {
      paddingRight: 16,
    },
    typeButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDarkMode ? '#444444' : '#e0e0e0',
      marginRight: 8,
      minWidth: 120,
      alignItems: 'center',
    },
    typeButtonActive: {
      backgroundColor: '#2196f3',
      borderColor: '#2196f3',
    },
    typeButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: isDarkMode ? '#cccccc' : '#666666',
      textAlign: 'center',
    },
    typeButtonTextActive: {
      color: '#ffffff',
    },
    groupsList: {
      gap: 8,
    },
    groupButton: {
      backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? '#444444' : '#e0e0e0',
      marginBottom: 8,
    },
    groupButtonActive: {
      backgroundColor: '#28a745',
      borderColor: '#28a745',
    },
    groupButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
    },
    groupButtonInfo: {
      flex: 1,
    },
    groupButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? '#ffffff' : '#333333',
      marginBottom: 2,
    },
    groupButtonTextActive: {
      color: '#ffffff',
    },
    groupButtonCount: {
      fontSize: 12,
      color: isDarkMode ? '#aaaaaa' : '#666666',
    },
    infoContainer: {
      backgroundColor: isDarkMode ? '#1a3a5a' : '#e3f2fd',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? '#2196f3' : '#bbdefb',
    },
    infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: isDarkMode ? '#64b5f6' : '#1976d2',
      marginLeft: 6,
    },
    infoName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#1565c0',
      marginBottom: 4,
    },
    infoDescription: {
      fontSize: 14,
      color: isDarkMode ? '#90caf9' : '#1565c0',
      marginBottom: 8,
    },
    clientsCountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    clientsCount: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#28a745',
      marginLeft: 6,
    },
    previewButton: {
      backgroundColor: '#2196f3',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginBottom: 16,
    },
    previewButtonDisabled: {
      backgroundColor: '#888888',
    },
    previewButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    statsContainer: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? '#333333' : '#e0e0e0',
    },
    statsTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: isDarkMode ? '#cccccc' : '#666666',
      marginBottom: 8,
      textAlign: 'center',
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2196f3',
    },
    statLabel: {
      fontSize: 12,
      color: isDarkMode ? '#aaaaaa' : '#666666',
      marginTop: 2,
    },
    instructionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#1a1a2e' : '#f0f8ff',
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? '#333366' : '#cce7ff',
    },
    instructionsText: {
      fontSize: 14,
      color: isDarkMode ? '#a0a0ff' : '#3366cc',
      marginLeft: 8,
      flex: 1,
      lineHeight: 20,
    },
  });

export default GroupSelector;
