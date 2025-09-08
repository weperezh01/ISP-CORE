import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, FlatList, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LevelKey = 'provincia' | 'municipio' | 'distrito_municipal' | 'seccion' | 'paraje';

type OneItem = {
  label: string;
  code?: string;
  value?: string; // usually equals label
};

type Selection = {
  provincia: OneItem | null;
  municipio: OneItem | null;
  distrito_municipal: OneItem | null;
  seccion: OneItem | null;
  paraje: OneItem | null;
  manualSeccion?: string;
  manualParaje?: string;
};

interface OneLocationSelectorProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selection: Selection) => void;
  initialSelection?: Partial<Selection>;
  isDarkMode: boolean;
}

const API_BASE = 'https://wellnet-rd.com:444/api';

const getStyles = (isDarkMode: boolean) => ({
  modal: {
    flex: 1,
    backgroundColor: isDarkMode ? '#0B0F14' : '#FFFFFF',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#1F2937' : '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: isDarkMode ? '#E5E7EB' : '#111827',
  },
  body: { flex: 1, padding: 16 },
  searchRow: { flexDirection: 'row' as const, gap: 8, marginBottom: 12 },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: isDarkMode ? '#374151' : '#D1D5DB',
    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
    color: isDarkMode ? '#E5E7EB' : '#111827',
  },
  levelTabs: { flexDirection: 'row' as const, marginBottom: 8, flexWrap: 'wrap' as const },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  tabText: { fontSize: 12, fontWeight: '600' as const },
  listItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#111827' : '#F3F4F6',
  },
  listItemText: { color: isDarkMode ? '#F3F4F6' : '#111827', fontSize: 14 },
  footer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? '#1F2937' : '#E5E7EB',
  },
  button: {
    flexDirection: 'row' as const,
    gap: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  cancelBtn: { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' },
  confirmBtn: { backgroundColor: '#3B82F6' },
  btnText: { color: '#FFFFFF', fontWeight: '700' as const },
  btnTextDark: { color: isDarkMode ? '#F3F4F6' : '#111827', fontWeight: '700' as const },
  inlineRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8, marginTop: 8 },
  manualInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: isDarkMode ? '#374151' : '#D1D5DB',
    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
    color: isDarkMode ? '#E5E7EB' : '#111827',
  },
  helper: { fontSize: 12, color: isDarkMode ? '#9CA3AF' : '#6B7280' },
});

const levels: { key: LevelKey; label: string }[] = [
  { key: 'provincia', label: 'Provincia' },
  { key: 'municipio', label: 'Municipio' },
  { key: 'distrito_municipal', label: 'Distrito' },
  { key: 'seccion', label: 'Sección' },
  { key: 'paraje', label: 'Paraje' },
];

const OneLocationSelector: React.FC<OneLocationSelectorProps> = ({ visible, onClose, onConfirm, initialSelection, isDarkMode }) => {
  const styles = getStyles(isDarkMode);
  const [activeLevel, setActiveLevel] = useState<LevelKey>('provincia');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<OneItem[]>([]);
  const [total, setTotal] = useState(0);
  // page size per request
  const [limit, setLimit] = useState(50);
  // offset for server-side pagination
  const [offset, setOffset] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [selection, setSelection] = useState<Selection>({
    provincia: null,
    municipio: null,
    distrito_municipal: null,
    seccion: null,
    paraje: null,
    manualSeccion: '',
    manualParaje: '',
  });

  const debouncer = useRef<NodeJS.Timeout | null>(null);

  const activeCodes = useMemo(() => {
    return {
      provincia: selection.provincia?.code,
      municipio: selection.municipio?.code,
      distrito_municipal: selection.distrito_municipal?.code,
      seccion: selection.seccion?.code,
    };
  }, [selection]);

  useEffect(() => {
    if (!visible) return;
    // Seed initial selection
    if (initialSelection) {
      setSelection(prev => ({
        ...prev,
        provincia: initialSelection.provincia || null,
        municipio: initialSelection.municipio || null,
        distrito_municipal: initialSelection.distrito_municipal || null,
        seccion: initialSelection.seccion || null,
        paraje: initialSelection.paraje || null,
        manualSeccion: initialSelection.manualSeccion || '',
        manualParaje: initialSelection.manualParaje || '',
      }));
      // Set next level to select
      const next = !initialSelection.provincia
        ? 'provincia'
        : !initialSelection.municipio
          ? 'municipio'
          : 'distrito_municipal';
      setActiveLevel(next);
    } else {
      setSelection({ provincia: null, municipio: null, distrito_municipal: null, seccion: null, paraje: null, manualSeccion: '', manualParaje: '' });
      setActiveLevel('provincia');
    }
  }, [visible]);

  const fetchWithFallback = async (url: string, fallback: OneItem[], useOffset: number, useLimit: number): Promise<{ items: OneItem[]; total: number }> => {
    try {
      console.log('[ONE] Fetch (public) ->', { url });
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        const text = await res.text();
        console.warn('[ONE] HTTP error', res.status, 'Response preview:', text?.slice(0, 180));
        throw new Error('HTTP ' + res.status);
      }
      const ct = res.headers?.get && res.headers.get('content-type');
      if (!ct || !ct.includes('application/json')) {
        const preview = await res.text();
        console.warn('[ONE] Unexpected content-type:', ct, 'Preview:', preview?.slice(0, 180));
        throw new Error('Non-JSON response');
      }
      const data = await res.json();
      const parsed: OneItem[] = (data?.items || []).map((it: any) => ({ label: it.label, code: it.code, value: it.value ?? it.label }));
      setUsingFallback(false);
      console.log('[ONE] OK <-', { count: parsed.length, total: typeof data?.total === 'number' ? data.total : parsed.length, sample: parsed.slice(0,3).map(i=>i.label) });
      return { items: parsed, total: typeof data?.total === 'number' ? data.total : parsed.length };
    } catch (e) {
      console.warn('[ONE] Usando dataset local de fallback para', url, 'Error:', (e as any)?.message);
      setUsingFallback(true);
      // Emular paginación sobre el fallback local
      const sliced = fallback.slice(useOffset, useOffset + useLimit);
      return { items: sliced, total: fallback.length };
    }
  };

  const loadItems = useCallback(async () => {
    if (!visible) return;
    setLoading(true);
    let url = '';
    const q = encodeURIComponent(query);
    switch (activeLevel) {
      case 'provincia':
        url = `${API_BASE}/one/provincias?query=${q}&limit=${limit}&offset=${offset}`;
        {
          const fb = SAMPLE_PROVINCIAS.filter(p => p.label.toLowerCase().includes(query.toLowerCase()));
          const { items: its, total } = await fetchWithFallback(url, fb, offset, limit);
          setItems(prev => offset > 0 ? [...prev, ...its] : its); setTotal(total);
          console.log('[ONE] Nivel=Provincia', { query, limit, offset, got: its.length, total });
        }
        break;
      case 'municipio':
        if (!selection.provincia?.code) { setItems([]); break; }
        url = `${API_BASE}/one/municipios?cod_provincia=${encodeURIComponent(selection.provincia.code)}&query=${q}&limit=${limit}&offset=${offset}`;
        {
          const fb = SAMPLE_MUNICIPIOS[selection.provincia.code] || [];
          const { items: its, total } = await fetchWithFallback(url, fb, offset, limit);
          setItems(prev => offset > 0 ? [...prev, ...its] : its); setTotal(total);
          console.log('[ONE] Nivel=Municipio', { prov: selection.provincia?.code, query, limit, offset, got: its.length, total });
        }
        break;
      case 'distrito_municipal':
        if (!selection.municipio?.code) { setItems([]); break; }
        url = `${API_BASE}/one/distritos?cod_municipio=${encodeURIComponent(selection.municipio.code)}&query=${q}&limit=${limit}&offset=${offset}`;
        {
          const fb = SAMPLE_DISTRITOS[selection.municipio.code] || [];
          const { items: its, total } = await fetchWithFallback(url, fb, offset, limit);
          setItems(prev => offset > 0 ? [...prev, ...its] : its); setTotal(total);
          console.log('[ONE] Nivel=Distrito', { muni: selection.municipio?.code, query, limit, offset, got: its.length, total });
        }
        break;
      case 'seccion':
        if (!selection.distrito_municipal?.code) { setItems([]); break; }
        url = `${API_BASE}/one/secciones?cod_distrito=${encodeURIComponent(selection.distrito_municipal.code)}&query=${q}&limit=${limit}&offset=${offset}`;
        {
          const fb = SAMPLE_SECCIONES[selection.distrito_municipal.code] || [];
          const { items: its, total } = await fetchWithFallback(url, fb, offset, limit);
          setItems(prev => offset > 0 ? [...prev, ...its] : its); setTotal(total);
          console.log('[ONE] Nivel=Seccion', { dist: selection.distrito_municipal?.code, query, limit, offset, got: its.length, total });
        }
        break;
      case 'paraje':
        if (!selection.seccion?.code) { setItems([]); break; }
        url = `${API_BASE}/one/parajes?cod_seccion=${encodeURIComponent(selection.seccion.code)}&query=${q}&limit=${limit}&offset=${offset}`;
        {
          const fb = SAMPLE_PARAJES[selection.seccion.code] || [];
          const { items: its, total } = await fetchWithFallback(url, fb, offset, limit);
          setItems(prev => offset > 0 ? [...prev, ...its] : its); setTotal(total);
          console.log('[ONE] Nivel=Paraje', { seccion: selection.seccion?.code, query, limit, offset, got: its.length, total });
        }
        break;
    }
    setLoading(false);
  }, [visible, activeLevel, selection, query, limit, offset]);

  useEffect(() => { loadItems(); }, [loadItems]);

  // Reset pagination when switching level
  useEffect(() => {
    setLimit(50);
    setOffset(0);
    setItems([]);
  }, [activeLevel]);

  const onChangeQuery = (text: string) => {
    setQuery(text);
    // reset pagination
    setLimit(50);
    setOffset(0);
    setItems([]);
    if (debouncer.current) clearTimeout(debouncer.current);
    debouncer.current = setTimeout(() => {
      loadItems();
    }, 300);
  };

  const loadMore = () => {
    if (items.length < total && !loading) {
      setOffset(prev => prev + limit);
    }
  };

  const onPick = (item: OneItem) => {
    // Update selection and clear lower levels
    if (activeLevel === 'provincia') {
      setSelection({ provincia: item, municipio: null, distrito_municipal: null, seccion: null, paraje: null, manualSeccion: '', manualParaje: '' });
      setActiveLevel('municipio');
    } else if (activeLevel === 'municipio') {
      setSelection(prev => ({ ...prev, municipio: item, distrito_municipal: null, seccion: null, paraje: null }));
      setActiveLevel('distrito_municipal');
    } else if (activeLevel === 'distrito_municipal') {
      setSelection(prev => ({ ...prev, distrito_municipal: item, seccion: null, paraje: null }));
      setActiveLevel('seccion');
    } else if (activeLevel === 'seccion') {
      setSelection(prev => ({ ...prev, seccion: item, paraje: null }));
      setActiveLevel('paraje');
    } else if (activeLevel === 'paraje') {
      setSelection(prev => ({ ...prev, paraje: item }));
    }
  };

  const canConfirm = useMemo(() => !!selection.provincia && !!selection.municipio, [selection]);

  const handleConfirm = () => {
    if (!canConfirm) {
      // soft validation
      return;
    }
    onConfirm(selection);
    onClose();
  };

  return (
    <Modal visible={visible} animationType={Platform.OS === 'ios' ? 'slide' : 'fade'} onRequestClose={onClose}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={22} color={isDarkMode ? '#E5E7EB' : '#111827'} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Seleccionar ubicación (ONE)</Text>
            <Text style={styles.helper}>Provincia y Municipio requeridos</Text>
          </View>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.body}>
          {usingFallback && (
            <View style={{ padding: 8, borderWidth: 1, borderColor: isDarkMode ? '#4B5563' : '#E5E7EB', borderRadius: 8, marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: isDarkMode ? '#EAB308' : '#92400E', marginBottom: 6 }}>
                Aviso: mostrando datos locales de ejemplo. Verifica conexión o proxy para /api/one/*.
              </Text>
              <TouchableOpacity onPress={() => { setLimit(50); loadItems(); }} style={{ alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 10, backgroundColor: isDarkMode ? '#374151' : '#E5E7EB', borderRadius: 6 }}>
                <Text style={{ color: isDarkMode ? '#F3F4F6' : '#111827', fontWeight: '600' }}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.levelTabs}>
            {levels.map(l => {
              const active = l.key === activeLevel;
              const selected = (selection as any)[l.key]?.label;
              return (
                <TouchableOpacity
                  key={l.key}
                  onPress={() => setActiveLevel(l.key)}
                  style={{
                    ...styles.tab,
                    backgroundColor: active ? '#3B82F6' : (isDarkMode ? '#0B0F14' : '#FFFFFF'),
                    borderColor: active ? '#3B82F6' : (isDarkMode ? '#374151' : '#D1D5DB'),
                  }}
                >
                  <Text style={{ ...styles.tabText, color: active ? '#FFFFFF' : (isDarkMode ? '#E5E7EB' : '#111827') }}>
                    {l.label}{selected ? `: ${selected}` : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.searchRow}>
            <Icon name="search" size={20} color={isDarkMode ? '#93C5FD' : '#2563EB'} />
            <TextInput
              value={query}
              onChangeText={onChangeQuery}
              placeholder={`Buscar ${levels.find(l => l.key === activeLevel)?.label}…`}
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
              style={styles.searchInput}
              autoCorrect={false}
            />
          </View>

          {activeLevel === 'seccion' || activeLevel === 'paraje' ? (
            <View style={styles.inlineRow}>
              <TouchableOpacity onPress={() => setManualMode(!manualMode)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name={manualMode ? 'check-box' : 'check-box-outline-blank'} size={18} color={isDarkMode ? '#93C5FD' : '#2563EB'} />
                <Text style={{ marginLeft: 6, color: isDarkMode ? '#E5E7EB' : '#111827' }}>No encuentro mi {activeLevel}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {manualMode && (activeLevel === 'seccion' || activeLevel === 'paraje') ? (
            <View style={styles.inlineRow}>
              {activeLevel === 'seccion' ? (
                <TextInput
                  style={styles.manualInput}
                  value={selection.manualSeccion}
                  onChangeText={(t) => setSelection(prev => ({ ...prev, manualSeccion: t }))}
                  placeholder="Escribir Sección"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                />
              ) : (
                <TextInput
                  style={styles.manualInput}
                  value={selection.manualParaje}
                  onChangeText={(t) => setSelection(prev => ({ ...prev, manualParaje: t }))}
                  placeholder="Escribir Paraje"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                />
              )}
            </View>
          ) : null}

          {loading ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={isDarkMode ? '#93C5FD' : '#2563EB'} />
              <Text style={{ marginTop: 8, color: isDarkMode ? '#9CA3AF' : '#6B7280' }}>Cargando…</Text>
            </View>
          ) : (
            <FlatList
              data={manualMode && (activeLevel === 'seccion' || activeLevel === 'paraje') ? [] : items}
              keyExtractor={(item, idx) => (item.code || item.label || 'x') + idx}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.listItem} onPress={() => onPick(item)}>
                  <Text style={styles.listItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <Text style={{ textAlign: 'center', color: isDarkMode ? '#9CA3AF' : '#6B7280', marginTop: 12 }}>Sin resultados</Text>
              )}
              ListFooterComponent={() => (
                items.length < total && !loading ? (
                  <TouchableOpacity onPress={loadMore} style={{ paddingVertical: 12, alignItems: 'center' }}>
                    <Text style={{ color: isDarkMode ? '#93C5FD' : '#2563EB' }}>
                      Mostrar más ({Math.max(total - items.length, 0)} restantes)
                    </Text>
                  </TouchableOpacity>
                ) : null
              )}
            />
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onClose}>
            <Icon name="close" size={18} color={isDarkMode ? '#F3F4F6' : '#111827'} />
            <Text style={styles.btnTextDark}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.confirmBtn, { opacity: canConfirm ? 1 : 0.6 }]}
            onPress={handleConfirm}
            disabled={!canConfirm}
          >
            <Icon name="check" size={18} color="#FFFFFF" />
            <Text style={styles.btnText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Minimal fallback datasets
const SAMPLE_PROVINCIAS: OneItem[] = [
  { label: 'Distrito Nacional', code: '01' },
  { label: 'Santo Domingo', code: '32' },
  { label: 'Espaillat', code: '09' },
];
const SAMPLE_MUNICIPIOS: Record<string, OneItem[]> = {
  '01': [ { label: 'Santo Domingo de Guzmán', code: '01-01' } ],
  '32': [ { label: 'Santo Domingo Este', code: '32-01' }, { label: 'Santo Domingo Norte', code: '32-02' } ],
  '09': [ { label: 'Moca', code: '09-01' } ],
};
const SAMPLE_DISTRITOS: Record<string, OneItem[]> = {
  '09-01': [ { label: 'Moca', code: '09-01-01' } ],
};
const SAMPLE_SECCIONES: Record<string, OneItem[]> = {
  '09-01-01': [ { label: 'Moca (Zona urbana)', code: '09-01-01-01' } ],
};
const SAMPLE_PARAJES: Record<string, OneItem[]> = {
  '09-01-01-01': [ { label: 'El Salitre', code: '09-01-01-01-01' } ],
};

export default OneLocationSelector;
