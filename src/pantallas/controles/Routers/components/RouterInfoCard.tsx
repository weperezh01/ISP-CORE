import React from 'react';
import { View, Text } from 'react-native';

interface RouterInfoCardProps {
    router: any;
    getRouterStatus: any;
    styles: any;
}

const RouterInfoCard: React.FC<RouterInfoCardProps> = ({ router, getRouterStatus, styles }) => {
    return (
        <View style={styles.routerInfoCard}>
            <View style={styles.routerInfoHeader}>
                <Text style={styles.routerIcon}>🌐</Text>
                <View style={styles.routerMainInfo}>
                    <Text style={styles.routerName}>
                        {router.nombre_router || 'Router Sin Nombre'}
                    </Text>
                    <Text style={styles.routerId}>ID: {router.id_router}</Text>
                </View>
                {getRouterStatus && (
                    <View style={[styles.routerStatusIndicator, getRouterStatus.badge]}>
                        <Text style={getRouterStatus.text}>
                            {getRouterStatus.label}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.routerDetailsGrid}>
                <View style={styles.routerDetailRow}>
                    <Text style={styles.routerDetailLabel}>Usuario del Router</Text>
                    <Text style={styles.routerDetailValue}>
                        {router.router_username || 'No configurado'}
                    </Text>
                </View>
                <View style={styles.routerDetailRow}>
                    <Text style={styles.routerDetailLabel}>IP Pública</Text>
                    <Text style={styles.routerDetailValue}>
                        {router.ip_publica || 'No configurada'}
                    </Text>
                </View>
                <View style={styles.routerDetailRow}>
                    <Text style={styles.routerDetailLabel}>IP WAN</Text>
                    <Text style={styles.routerDetailValue}>
                        {router.ip_wan || 'No configurada'}
                    </Text>
                </View>
                <View style={styles.routerDetailRow}>
                    <Text style={styles.routerDetailLabel}>IP LAN</Text>
                    <Text style={styles.routerDetailValue}>
                        {router.ip_router || 'No configurada'}
                    </Text>
                </View>
                {router.descripcion && (
                    <View style={styles.routerDetailRow}>
                        <Text style={styles.routerDetailLabel}>Descripción</Text>
                        <Text style={styles.routerDetailValue}>{router.descripcion}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default RouterInfoCard;