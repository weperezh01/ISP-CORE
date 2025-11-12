import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NotaPreview, NotaEstado } from '../types';

const getStatusColor = (estado: NotaEstado): string => {
  switch (estado) {
    case 'aprobada':
      return '#10B981'; // Verde - Aprobada
    case 'en_revision':
      return '#F59E0B'; // Naranja - En Revisión
    default:
      return '#64748B'; // Gris - Pendiente (null o cualquier otro)
  }
};

const getStatusText = (estado: NotaEstado): string => {
  switch (estado) {
    case 'aprobada':
      return 'Aprobada';
    case 'en_revision':
      return 'En Revisión';
    default:
      return 'Pendiente';
  }
};

interface EstadoBadgeProps {
  estado: NotaEstado;
  isDarkMode?: boolean;
}

export function EstadoBadge({ estado, isDarkMode = false }: EstadoBadgeProps) {
  const color = getStatusColor(estado);
  return (
    <View style={[
      styles.badge,
      {
        borderColor: color,
        backgroundColor: `${color}20`
      }
    ]}>
      <Text style={[styles.badgeText, { color }]}>
        {getStatusText(estado)}
      </Text>
    </View>
  );
}

interface NotesPreviewProps {
  notes?: NotaPreview[] | null;
  totalCount?: number | null;
  onPress?: () => void;
  isDarkMode?: boolean;
}

export default function NotesPreview({
  notes = [],
  totalCount = 0,
  onPress,
  isDarkMode = false,
}: NotesPreviewProps) {
  const list = (notes ?? []).slice(0, 2);
  const extra = Math.max((totalCount ?? list.length) - list.length, 0);

  if (!list.length) return null;

  return (
    <Pressable
      onPress={onPress}
      style={styles.container}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${list.length} notas, toca para ver detalles`}
      accessibilityHint="Abre la pantalla de detalle de factura con las notas"
    >
      {list.map((n) => {
        const author = `${n.nombre ?? ''} ${n.apellido ?? ''}`.trim() || 'Usuario';
        return (
          <View key={n.id_nota} style={styles.noteRow}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.authorText,
                { color: isDarkMode ? '#E2E8F0' : '#334155' }
              ]}
            >
              {author}
            </Text>
            <EstadoBadge estado={n.estado_revision} isDarkMode={isDarkMode} />
          </View>
        );
      })}
      {extra > 0 && (
        <View style={[
          styles.extraChip,
          {
            borderColor: isDarkMode ? '#64748B' : '#94A3B8',
            backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9'
          }
        ]}>
          <Text style={[
            styles.extraText,
            { color: isDarkMode ? '#94A3B8' : '#64748B' }
          ]}>
            +{extra} más
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    maxWidth: '100%',
  },
  authorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  extraChip: {
    alignSelf: 'flex-end',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
  },
  extraText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
