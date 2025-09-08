import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StyleSheet } from 'react-native';

interface Cliente {
  id_cliente: number;
  nombre_completo: string;
  telefono1: string;
  direccion_ipv4?: string;
}

interface Group {
  tipo: string;
  id: string | number;
  nombre: string;
  descripcion: string;
  cantidad_clientes: number;
}

interface ClientPreviewProps {
  clientes: Cliente[];
  grupoSeleccionado: Group | null;
  isDarkMode: boolean;
}

const ClientPreview: React.FC<ClientPreviewProps> = ({
  clientes,
  grupoSeleccionado,
  isDarkMode
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const styles = getStyles(isDarkMode);

  const clientesToShow = showAll ? clientes : clientes.slice(0, 5);

  const renderClientItem = ({ item }: { item: Cliente }) => (
    <View style={styles.clientItem}>
      <View style={styles.clientInfo}>
        <View style={styles.clientHeader}>
          <Icon name="person" size={16} color="#2196f3" />
          <Text style={styles.clientName}>{item.nombre_completo}</Text>
        </View>
        <View style={styles.clientDetails}>
          <View style={styles.clientDetailItem}>
            <Icon name="phone" size={14} color="#28a745" />
            <Text style={styles.clientPhone}>{item.telefono1}</Text>
          </View>
          {item.direccion_ipv4 && (
            <View style={styles.clientDetailItem}>
              <Icon name="computer" size={14} color="#6c757d" />
              <Text style={styles.clientIp}>{item.direccion_ipv4}</Text>
            </View>
          )}
          <View style={styles.clientDetailItem}>
            <Icon name="tag" size={14} color="#6c757d" />
            <Text style={styles.clientId}>ID: {item.id_cliente}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.headerLeft}>
          <Icon name="people" size={24} color="#28a745" />
          <Text style={styles.title}>👥 Clientes que recibirán el SMS</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{clientes.length}</Text>
          </View>
          <Icon
            name={expanded ? 'expand-less' : 'expand-more'}
            size={24}
            color={isDarkMode ? '#cccccc' : '#666666'}
          />
        </View>
      </TouchableOpacity>

      {/* Información del grupo */}
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>
          📊 {grupoSeleccionado?.nombre}
        </Text>
        <Text style={styles.groupDescription}>
          {grupoSeleccionado?.descripcion}
        </Text>
      </View>

      {/* Lista de clientes */}
      {expanded && (
        <View style={styles.clientsContainer}>
          <FlatList
            data={clientesToShow}
            renderItem={renderClientItem}
            keyExtractor={(item) => item.id_cliente.toString()}
            showsVerticalScrollIndicator={false}
            style={styles.clientsList}
            maxHeight={300}
          />

          {/* Botón para mostrar más/menos */}
          {clientes.length > 5 && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setShowAll(!showAll)}
            >
              <Icon
                name={showAll ? 'expand-less' : 'expand-more'}
                size={20}
                color="#2196f3"
              />
              <Text style={styles.showMoreText}>
                {showAll
                  ? 'Mostrar menos'
                  : `Mostrar todos (${clientes.length - 5} más)`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Estadísticas rápidas */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="sms" size={16} color="#2196f3" />
              <Text style={styles.statLabel}>SMS a enviar</Text>
              <Text style={styles.statValue}>{clientes.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="phone" size={16} color="#28a745" />
              <Text style={styles.statLabel}>Teléfonos únicos</Text>
              <Text style={styles.statValue}>
                {new Set(clientes.map(c => c.telefono1)).size}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Resumen compacto cuando está colapsado */}
      {!expanded && (
        <View style={styles.compactSummary}>
          <Text style={styles.summaryText}>
            📱 {clientes.length} clientes • {new Set(clientes.map(c => c.telefono1)).size} teléfonos únicos
          </Text>
          <Text style={styles.summaryHint}>
            Toca para ver la lista completa
          </Text>
        </View>
      )}

      {/* Alerta si hay números duplicados */}
      {clientes.length !== new Set(clientes.map(c => c.telefono1)).size && (
        <View style={styles.warningContainer}>
          <Icon name="warning" size={16} color="#ff9800" />
          <Text style={styles.warningText}>
            Algunos clientes comparten números de teléfono. Se enviará un SMS por número único.
          </Text>
        </View>
      )}
    </View>
  );
};

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#333333' : '#e0e0e0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#333333',
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  countText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  groupInfo: {
    padding: 16,
    backgroundColor: isDarkMode ? '#1a3a5a' : '#e8f4f8',
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#333333' : '#e0e0e0',
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDarkMode ? '#64b5f6' : '#1976d2',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: isDarkMode ? '#90caf9' : '#1565c0',
  },
  clientsContainer: {
    padding: 16,
  },
  clientsList: {
    maxHeight: 300,
  },
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196f3',
  },
  clientInfo: {
    flex: 1,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#333333',
    marginLeft: 6,
    flex: 1,
  },
  clientDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  clientDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientPhone: {
    fontSize: 12,
    color: '#28a745',
    marginLeft: 4,
    fontWeight: '600',
  },
  clientIp: {
    fontSize: 12,
    color: isDarkMode ? '#aaaaaa' : '#666666',
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  clientId: {
    fontSize: 12,
    color: isDarkMode ? '#aaaaaa' : '#666666',
    marginLeft: 4,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: isDarkMode ? '#1a3a5a' : '#e3f2fd',
    borderRadius: 8,
  },
  showMoreText: {
    color: '#2196f3',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? '#333333' : '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: isDarkMode ? '#aaaaaa' : '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196f3',
    marginTop: 2,
  },
  compactSummary: {
    padding: 16,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: isDarkMode ? '#cccccc' : '#666666',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryHint: {
    fontSize: 12,
    color: isDarkMode ? '#aaaaaa' : '#888888',
    textAlign: 'center',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#3a2a1a' : '#fff8e1',
    padding: 12,
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  warningText: {
    fontSize: 12,
    color: '#ff9800',
    marginLeft: 6,
    flex: 1,
  },
});

export default ClientPreview;