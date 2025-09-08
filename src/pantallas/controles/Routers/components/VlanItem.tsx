import React from 'react';
import { View, Text } from 'react-native';

interface VlanItemProps {
    item: any;
    styles: any;
    isDarkMode: boolean;
}

const VlanItem: React.FC<VlanItemProps> = ({ item, styles, isDarkMode }) => {

    const getVlanColor = (vlanId: number) => {
        const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];
        return colors[vlanId % colors.length];
    };

    return (
        <View style={[styles.cardContainer, {
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
        }]}>
            {/* Header */}
            <View style={[styles.cardHeader, { 
                paddingHorizontal: 16, 
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: isDarkMode ? '#374151' : '#F3F4F6'
            }]}>
                <Text style={[styles.cardIcon, { fontSize: 20, marginRight: 12 }]}>🏷️</Text>
                <View style={[styles.cardInfo, { flex: 1 }]}>
                    <View style={[styles.titleRow, { 
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 4
                    }]}>
                        <Text style={[styles.cardTitle, { 
                            fontSize: 16, 
                            fontWeight: '600',
                            color: isDarkMode ? '#F9FAFB' : '#1F2937',
                            marginRight: 8
                        }]}>{item.name || 'VLAN'}</Text>
                        {item.vlan_id && (
                            <View style={[styles.vlanIdBadge, { 
                                backgroundColor: getVlanColor(item.vlan_id),
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 8
                            }]}>
                                <Text style={[styles.vlanIdText, { 
                                    color: '#FFFFFF',
                                    fontSize: 10,
                                    fontWeight: '600'
                                }]}>{item.vlan_id}</Text>
                            </View>
                        )}
                    </View>
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
                    borderBottomColor: '#F9FAFB'
                }]}>
                    <Text style={[styles.cardDetailLabel, { 
                        fontSize: 14,
                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                        fontWeight: '500'
                    }]}>MTU</Text>
                    <Text style={[styles.cardDetailValue, { 
                        fontSize: 14,
                        color: '#1F2937',
                        fontWeight: '600'
                    }]}>{item.mtu || 'N/A'}</Text>
                </View>
                
                <View style={[styles.cardDetailRow, { 
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 8,
                    borderBottomWidth: item.interface || item.comment ? 1 : 0,
                    borderBottomColor: '#F9FAFB'
                }]}>
                    <Text style={[styles.cardDetailLabel, { 
                        fontSize: 14,
                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                        fontWeight: '500'
                    }]}>ARP</Text>
                    <Text style={[styles.cardDetailValue, { 
                        fontSize: 14,
                        color: '#1F2937',
                        fontWeight: '600'
                    }]}>{item.arp || 'N/A'}</Text>
                </View>
                
                {item.interface && (
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
                        }]}>Interface</Text>
                        <Text style={[styles.cardDetailValue, { 
                            fontSize: 14,
                            color: isDarkMode ? '#F9FAFB' : '#1F2937',
                            fontWeight: '600'
                        }]}>{item.interface}</Text>
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
                            color: isDarkMode ? '#F9FAFB' : '#1F2937',
                            fontStyle: 'italic'
                        }]}>{item.comment}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default VlanItem;