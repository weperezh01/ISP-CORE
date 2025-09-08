import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import EthernetPortIcon from './EthernetPortIcon';
import SfpPortIcon from './SfpPortIcon';

interface InterfaceItemProps {
    item: any;
    traffic: { upload_bps: number; download_bps: number } | undefined;
    styles: any;
    isDarkMode: boolean;
    formatBps: (bps: number) => string;
    onPress?: () => void;
}

const InterfaceItem: React.FC<InterfaceItemProps> = ({ item, traffic, styles, isDarkMode, formatBps, onPress }) => {

    const getTrafficColor = (bps: number) => {
        if (!bps || bps === 0) return '#6B7280';
        if (bps < 1000000) return '#10B981'; // Verde para < 1 Mbps
        if (bps < 100000000) return '#F59E0B'; // Amarillo para < 100 Mbps
        return '#EF4444'; // Rojo para >= 100 Mbps
    };

    // Usar los valores correctos sin intercambiar
    const uploadSpeed = traffic ? (traffic.upload_bps || 0) : 0;
    const downloadSpeed = traffic ? (traffic.download_bps || 0) : 0;
    
    // Determinar el tipo de interfaz para mostrar el icono apropiado
    const isSfpInterface = item.name && item.name.toLowerCase().includes('sfp');
    const iconSize = isSfpInterface ? 40 : 34; // SFP más grande, ethernet 20% más grande
    
    // DEBUG: Solo mostrar interfaces SFP+ con tráfico >= 1 Gbps
    if (traffic && item.name.toLowerCase().includes('sfp') && (uploadSpeed >= 1000000000 || downloadSpeed >= 1000000000)) {
        console.log(`🔍 ${item.name}: ↑${formatBps(uploadSpeed)} ↓${formatBps(downloadSpeed)}`);
    }

    return (
        <TouchableOpacity 
            onPress={onPress || (() => {})}
            style={[styles.cardContainer, {
                marginHorizontal: 8,
                marginVertical: 4,
                borderRadius: 12,
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                shadowColor: isDarkMode ? '#000' : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                borderWidth: 1,
                borderColor: isDarkMode ? '#374151' : '#E5E7EB'
            }]}
        >
            {/* Header */}
            <View style={[styles.cardHeader, { 
                paddingHorizontal: 16, 
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: isDarkMode ? '#374151' : '#F3F4F6'
            }]}>
                <View style={{ marginRight: 12 }}>
                    {isSfpInterface ? (
                        <SfpPortIcon 
                            size={iconSize} 
                            color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                        />
                    ) : (
                        <EthernetPortIcon 
                            size={iconSize} 
                            color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                        />
                    )}
                </View>
                <View style={[styles.cardInfo, { flex: 1 }]}>
                    <Text style={[styles.cardTitle, { 
                        fontSize: 16, 
                        fontWeight: '600',
                        color: isDarkMode ? '#F9FAFB' : '#1F2937',
                        marginBottom: 4
                    }]}>{item.name || 'Interface'}</Text>
                </View>
            </View>

            {/* Body */}
            <View style={[styles.cardBody, { padding: 16 }]}>
                <View style={[styles.cardDetailRow, { 
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: isDarkMode ? '#374151' : '#F9FAFB'
                }]}>
                    <Text style={[styles.cardDetailLabel, { 
                        fontSize: 14,
                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                        fontWeight: '500'
                    }]}>MTU</Text>
                    <Text style={[styles.cardDetailValue, { 
                        fontSize: 14,
                        color: isDarkMode ? '#F3F4F6' : '#1F2937',
                        fontWeight: '600'
                    }]}>{item.mtu || 'N/A'}</Text>
                </View>
                
                <View style={[styles.cardDetailRow, { 
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: isDarkMode ? '#374151' : '#F9FAFB'
                }]}>
                    <Text style={[styles.cardDetailLabel, { 
                        fontSize: 14,
                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                        fontWeight: '500'
                    }]}>ARP</Text>
                    <Text style={[styles.cardDetailValue, { 
                        fontSize: 14,
                        color: isDarkMode ? '#F3F4F6' : '#1F2937',
                        fontWeight: '600'
                    }]}>{item.arp || 'N/A'}</Text>
                </View>
                
                {/* Traffic Section */}
                <View style={[styles.trafficSection, { 
                    backgroundColor: isDarkMode ? '#111827' : '#F8FAFC',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    marginHorizontal: -16,
                    marginBottom: 8
                }]}>
                    <View style={[styles.trafficHeader, { 
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 8
                    }]}>
                        <Text style={[styles.trafficTitle, { 
                            fontSize: 13,
                            fontWeight: '600',
                            color: isDarkMode ? '#D1D5DB' : '#374151',
                            marginRight: 6
                        }]}>📊 Tráfico en Tiempo Real</Text>
                        <View style={[styles.liveDot, {
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#10B981',
                            marginRight: 4
                        }]} />
                        <Text style={[styles.liveText, {
                            fontSize: 10,
                            color: '#10B981',
                            fontWeight: '500'
                        }]}>LIVE</Text>
                    </View>
                    
                    <View style={[styles.trafficStats, { 
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }]}>
                        <View style={[styles.trafficItem, { flex: 1, marginRight: 8 }]}>
                            <View style={[styles.trafficRow, { 
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 4
                            }]}>
                                <Text style={[styles.trafficLabel, { 
                                    fontSize: 11,
                                    color: isDarkMode ? '#9CA3AF' : '#6B7280',
                                    fontWeight: '500',
                                    marginRight: 4
                                }]}>↗️ Subida</Text>
                                <Text style={[styles.trafficValue, { 
                                    fontSize: 12,
                                    color: getTrafficColor(uploadSpeed),
                                    fontWeight: '600'
                                }]}>{formatBps(uploadSpeed)}</Text>
                            </View>
                        </View>
                        
                        <View style={[styles.trafficItem, { flex: 1, marginLeft: 8 }]}>
                            <View style={[styles.trafficRow, { 
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 4
                            }]}>
                                <Text style={[styles.trafficLabel, { 
                                    fontSize: 11,
                                    color: isDarkMode ? '#9CA3AF' : '#6B7280',
                                    fontWeight: '500',
                                    marginRight: 4
                                }]}>↙️ Bajada</Text>
                                <Text style={[styles.trafficValue, { 
                                    fontSize: 12,
                                    color: getTrafficColor(downloadSpeed),
                                    fontWeight: '600'
                                }]}>{formatBps(downloadSpeed)}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                
                <View style={[styles.cardDetailRow, { 
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 8,
                    borderBottomWidth: item['switch-info'] || item.comment ? 1 : 0,
                    borderBottomColor: isDarkMode ? '#374151' : '#F9FAFB'
                }]}>
                    <Text style={[styles.cardDetailLabel, { 
                        fontSize: 14,
                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                        fontWeight: '500'
                    }]}>MAC Address</Text>
                    <Text style={[styles.cardDetailValue, { 
                        fontSize: 14,
                        color: isDarkMode ? '#F3F4F6' : '#1F2937',
                        fontWeight: '600'
                    }]}>{item['mac-address'] || 'N/A'}</Text>
                </View>
                
                {item['switch-info'] && (
                    <View style={[styles.cardDetailRow, { 
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 8,
                        borderBottomWidth: item.comment ? 1 : 0,
                        borderBottomColor: isDarkMode ? '#374151' : '#F9FAFB'
                    }]}>
                        <Text style={[styles.cardDetailLabel, { 
                            fontSize: 14,
                            color: isDarkMode ? '#9CA3AF' : '#6B7280',
                            fontWeight: '500'
                        }]}>Switch Puerto</Text>
                        <Text style={[styles.cardDetailValue, { 
                            fontSize: 14,
                            color: isDarkMode ? '#F3F4F6' : '#1F2937',
                            fontWeight: '600'
                        }]}>{item['switch-info'].port || 'N/A'}</Text>
                    </View>
                )}
                
                {item.comment && (
                    <View style={[styles.cardDetailRow, { 
                        paddingVertical: 8
                    }]}>
                        <Text style={[styles.cardDetailLabel, { 
                            fontSize: 14,
                            color: isDarkMode ? '#9CA3AF' : '#6B7280',
                            fontWeight: '500',
                            marginBottom: 4
                        }]}>Comentario</Text>
                        <Text style={[styles.cardDetailValue, { 
                            fontSize: 14,
                            color: isDarkMode ? '#F3F4F6' : '#1F2937',
                            fontStyle: 'italic'
                        }]}>{item.comment}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default InterfaceItem;