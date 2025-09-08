import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { format } from 'date-fns';

interface SystemResourcesProps {
    systemResources: any;
    isUpdatingResources: boolean;
    lastResourcesUpdate: Date | null;
    resourcesError: string | null;
    showMockData: boolean;
    isDarkMode: boolean;
    calculatePercentage: (used: number, total: number) => number;
    getResourceStatus: (percentage: number) => { color: string; level: string };
    formatUptime: (seconds: number) => string;
    formatBytes: (bytes: number) => string;
    formatNumber: (num: number) => string;
    getTemperatureStatus: (temp: number) => { color: string; icon: string };
    getPowerStatus: (status: string) => { color: string; icon: string; level: string };
    getFanStatus: (speed: number) => { color: string; icon: string };
    styles: any;
}

const SystemResources: React.FC<SystemResourcesProps> = ({
    systemResources,
    isUpdatingResources,
    lastResourcesUpdate,
    resourcesError,
    showMockData,
    isDarkMode,
    calculatePercentage,
    getResourceStatus,
    formatUptime,
    formatBytes,
    formatNumber,
    getTemperatureStatus,
    getPowerStatus,
    getFanStatus,
    styles
}) => {
    // Silenciar logs de debug para evitar problemas de performance
    if (!systemResources) {
        return (
            <View style={styles.systemResourcesCard}>
                <View style={styles.systemResourcesHeader}>
                    <Text style={styles.systemResourcesIcon}>⚡</Text>
                    <Text style={styles.systemResourcesTitle}>Recursos del Sistema</Text>
                    {isUpdatingResources && (
                        <View style={styles.updatingIndicator}>
                            <ActivityIndicator size="small" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                            <Text style={styles.updatingText}>Actualizando...</Text>
                        </View>
                    )}
                </View>
                <View style={styles.resourceSection}>
                    <View style={styles.resourceItem}>
                        <Text style={styles.resourceLabel}>Estado</Text>
                        <Text style={styles.resourceValue}>
                            {resourcesError ? '❌ Error al cargar' : '🔄 Cargando recursos...'}
                        </Text>
                    </View>
                    {resourcesError && (
                        <View style={styles.resourceItem}>
                            <Text style={styles.resourceLabel}>Error</Text>
                            <Text style={[styles.resourceValue, { color: '#EF4444' }]}>
                                {resourcesError}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.systemResourcesCard}>
            <View style={styles.systemResourcesHeader}>
                <Text style={styles.systemResourcesIcon}>⚡</Text>
                <Text style={styles.systemResourcesTitle}>Recursos del Sistema</Text>
                {isUpdatingResources && (
                    <View style={styles.updatingIndicator}>
                        <ActivityIndicator size="small" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                        <Text style={styles.updatingText}>Actualizando...</Text>
                    </View>
                )}
            </View>

            {/* CPU Section */}
            <View style={styles.resourceSection}>
                <Text style={styles.resourceSectionTitle}>💻 CPU</Text>
                <View style={styles.resourceGrid}>
                    <View style={styles.resourceItem}>
                        <Text style={styles.resourceLabel}>Uso CPU</Text>
                        <Text style={[
                            styles.resourceValue,
                            { color: getResourceStatus(systemResources.cpu_load || 0).color }
                        ]}>
                            {systemResources.cpu_load || 0}%
                        </Text>
                    </View>
                    <View style={styles.resourceItem}>
                        <Text style={styles.resourceLabel}>Carga promedio</Text>
                        <Text style={styles.resourceValue}>
                            {systemResources.average_load || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.resourceItem}>
                        <Text style={styles.resourceLabel}>Arquitectura</Text>
                        <Text style={styles.resourceValue}>
                            {systemResources.architecture || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.resourceItem}>
                        <Text style={styles.resourceLabel}>Modelo CPU</Text>
                        <Text style={styles.resourceValue}>
                            {systemResources.cpu_model || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.resourceItem}>
                        <Text style={styles.resourceLabel}>Frecuencia</Text>
                        <Text style={styles.resourceValue}>
                            {systemResources.cpu_frequency || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.resourceItem}>
                        <Text style={styles.resourceLabel}>Núcleos</Text>
                        <Text style={styles.resourceValue}>
                            {systemResources.cpu_count || 'N/A'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Memory Section */}
            <View style={styles.resourceSection}>
                <Text style={styles.resourceSectionTitle}>🧠 Memoria</Text>
                <View style={styles.resourceGrid}>
                    <View style={styles.resourceItem}>
                        <Text style={styles.resourceLabel}>Uso RAM</Text>
                        <Text style={[
                            styles.resourceValue,
                            { color: getResourceStatus(calculatePercentage(systemResources.used_memory, systemResources.total_memory)).color }
                        ]}>
                            {calculatePercentage(systemResources.used_memory, systemResources.total_memory)}%
                        </Text>
                    </View>
                    <View style={styles.resourceItem}>
                        <Text style={styles.resourceLabel}>RAM Total</Text>
                        <Text style={styles.resourceValue}>
                            {formatBytes(systemResources.total_memory || 0)}
                        </Text>
                    </View>
                    <View style={styles.resourceItem}>
                        <Text style={styles.resourceLabel}>RAM Usada</Text>
                        <Text style={styles.resourceValue}>
                            {formatBytes(systemResources.used_memory || 0)}
                        </Text>
                    </View>
                    <View style={styles.resourceItem}>
                        <Text style={styles.resourceLabel}>RAM Libre</Text>
                        <Text style={styles.resourceValue}>
                            {formatBytes(systemResources.free_memory || 0)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* System Info Section */}
            <View style={styles.resourceSection}>
                <Text style={styles.resourceSectionTitle}>🔧 Sistema</Text>
                <View style={styles.resourceGrid}>
                    <View style={styles.resourceItem}>
                        <Text style={styles.resourceLabel}>Uptime</Text>
                        <Text style={styles.resourceValue}>
                            {formatUptime(systemResources.uptime || 0)}
                        </Text>
                    </View>
                    <View style={styles.resourceItem}>
                        <Text style={styles.resourceLabel}>Versión</Text>
                        <Text style={styles.resourceValue}>
                            {systemResources.version || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.resourceItem}>
                        <Text style={styles.resourceLabel}>Build Time</Text>
                        <Text style={styles.resourceValue}>
                            {systemResources.build_time || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.resourceItem}>
                        <Text style={styles.resourceLabel}>Placa</Text>
                        <Text style={styles.resourceValue}>
                            {systemResources.board_name || 'N/A'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Storage Section */}
            {systemResources.total_hdd_space && (
                <View style={styles.resourceSection}>
                    <Text style={styles.resourceSectionTitle}>💾 Almacenamiento</Text>
                    <View style={styles.resourceGrid}>
                        <View style={styles.resourceItem}>
                            <Text style={styles.resourceLabel}>Espacio Total</Text>
                            <Text style={styles.resourceValue}>
                                {formatBytes(systemResources.total_hdd_space || 0)}
                            </Text>
                        </View>
                        <View style={styles.resourceItem}>
                            <Text style={styles.resourceLabel}>Espacio Usado</Text>
                            <Text style={styles.resourceValue}>
                                {formatBytes(systemResources.used_hdd_space || 0)}
                            </Text>
                        </View>
                        <View style={styles.resourceItem}>
                            <Text style={styles.resourceLabel}>Espacio Libre</Text>
                            <Text style={styles.resourceValue}>
                                {formatBytes(systemResources.free_hdd_space || 0)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.resourceProgress}>
                        <View style={styles.progressBar}>
                            <View 
                                style={[
                                    styles.progressFill,
                                    { 
                                        width: `${calculatePercentage(systemResources.used_hdd_space, systemResources.total_hdd_space)}%`,
                                        backgroundColor: getResourceStatus(calculatePercentage(systemResources.used_hdd_space, systemResources.total_hdd_space)).color
                                    }
                                ]} 
                            />
                        </View>
                    </View>
                </View>
            )}

            {/* Additional Info */}
            {(systemResources.bad_blocks !== undefined || systemResources.write_sect_since_reboot) && (
                <View style={styles.resourceSection}>
                    <Text style={styles.resourceSectionTitle}>🔧 Información Adicional</Text>
                    <View style={styles.resourceGrid}>
                        {systemResources.bad_blocks !== undefined && (
                            <View style={styles.resourceItem}>
                                <Text style={styles.resourceLabel}>Bloques Defectuosos</Text>
                                <Text style={[
                                    styles.resourceValue,
                                    { color: systemResources.bad_blocks > 0.5 ? '#EF4444' : systemResources.bad_blocks > 0 ? '#F59E0B' : '#10B981' }
                                ]}>
                                    {systemResources.bad_blocks}% {systemResources.bad_blocks === 0 ? '✅' : systemResources.bad_blocks <= 0.5 ? '⚠️' : '🔴'}
                                </Text>
                            </View>
                        )}
                        {systemResources.write_sect_since_reboot && (
                            <View style={styles.resourceItem}>
                                <Text style={styles.resourceLabel}>Escrituras desde reinicio</Text>
                                <Text style={styles.resourceValue}>
                                    {formatNumber(systemResources.write_sect_since_reboot)} sectores
                                </Text>
                            </View>
                        )}
                        {systemResources.write_sect_total && (
                            <View style={styles.resourceItem}>
                                <Text style={styles.resourceLabel}>Escrituras totales</Text>
                                <Text style={styles.resourceValue}>
                                    {formatNumber(systemResources.write_sect_total)} sectores
                                </Text>
                            </View>
                        )}
                        {systemResources.serial_number && (
                            <View style={styles.resourceItem}>
                                <Text style={styles.resourceLabel}>Número de Serie</Text>
                                <Text style={styles.resourceValue}>{systemResources.serial_number}</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Hardware Sensors */}
            <View style={styles.resourceSection}>
                <Text style={styles.resourceSectionTitle}>🌡️ Sensores de Hardware</Text>
                
                
                {(() => {
                    // Verificar si hay datos reales de sensores
                    const hasTemperatures = systemResources.sensors?.temperatures && Object.keys(systemResources.sensors.temperatures).length > 0;
                    const hasPowerSupplies = systemResources.sensors?.power_supplies && Object.keys(systemResources.sensors.power_supplies).length > 0;
                    const hasFans = systemResources.sensors?.fans && Object.keys(systemResources.sensors.fans).length > 0;
                    const hasVoltages = systemResources.sensors?.voltages && Object.keys(systemResources.sensors.voltages).length > 0;
                    const hasOtherSensors = systemResources.temperature || systemResources.psu_status || systemResources.fan_speed;
                    
                    const hasRealSensorData = hasTemperatures || hasPowerSupplies || hasFans || hasVoltages || hasOtherSensors;
                    
                    return hasRealSensorData;
                })() ? (
                    <View>
                        {/* Temperature Sensors */}
                        {systemResources.sensors?.temperatures && (
                            <View style={styles.metricCard}>
                                <View style={styles.metricHeader}>
                                    <Text style={styles.metricTitle}>Temperaturas</Text>
                                </View>
                                <View style={styles.resourceGrid}>
                                    {systemResources.sensors.temperatures['cpu-temperature'] !== undefined && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>CPU {getTemperatureStatus(systemResources.sensors.temperatures['cpu-temperature']).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getTemperatureStatus(systemResources.sensors.temperatures['cpu-temperature']).color }
                                            ]}>
                                                {systemResources.sensors.temperatures['cpu-temperature']}°C
                                            </Text>
                                        </View>
                                    )}
                                    {systemResources.sensors.temperatures['board-temperature1'] !== undefined && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>Placa {getTemperatureStatus(systemResources.sensors.temperatures['board-temperature1']).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getTemperatureStatus(systemResources.sensors.temperatures['board-temperature1']).color }
                                            ]}>
                                                {systemResources.sensors.temperatures['board-temperature1']}°C
                                            </Text>
                                        </View>
                                    )}
                                    {systemResources.sensors.temperatures['switch-temperature'] !== undefined && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>Switch {getTemperatureStatus(systemResources.sensors.temperatures['switch-temperature']).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getTemperatureStatus(systemResources.sensors.temperatures['switch-temperature']).color }
                                            ]}>
                                                {systemResources.sensors.temperatures['switch-temperature']}°C
                                            </Text>
                                        </View>
                                    )}
                                    {systemResources.sensors.temperatures['sfp-temperature'] !== undefined && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>SFP {getTemperatureStatus(systemResources.sensors.temperatures['sfp-temperature']).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getTemperatureStatus(systemResources.sensors.temperatures['sfp-temperature']).color }
                                            ]}>
                                                {systemResources.sensors.temperatures['sfp-temperature']}°C
                                            </Text>
                                        </View>
                                    )}
                                    {systemResources.sensors.temperatures['ambient-temperature'] !== undefined && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>Ambiente {getTemperatureStatus(systemResources.sensors.temperatures['ambient-temperature']).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getTemperatureStatus(systemResources.sensors.temperatures['ambient-temperature']).color }
                                            ]}>
                                                {systemResources.sensors.temperatures['ambient-temperature']}°C
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.metricSubtext, { marginTop: 12 }]}>
                                    ✅ Óptimo (hasta 50°C)  🌡️ Normal (51-65°C)  🔥 Cálido (66-70°C)  🚨 Crítico (+70°C)
                                </Text>
                            </View>
                        )}

                        {/* Power Supply Status */}
                        {systemResources.sensors?.power_supplies && (
                            <View style={styles.metricCard}>
                                <View style={styles.metricHeader}>
                                    <Text style={styles.metricTitle}>Fuentes de Poder</Text>
                                </View>
                                <View style={styles.resourceGrid}>
                                    {systemResources.sensors.power_supplies['psu1-state'] && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>PSU 1 {getPowerStatus(systemResources.sensors.power_supplies['psu1-state']).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getPowerStatus(systemResources.sensors.power_supplies['psu1-state']).color }
                                            ]}>
                                                {getPowerStatus(systemResources.sensors.power_supplies['psu1-state']).level}
                                            </Text>
                                        </View>
                                    )}
                                    {systemResources.sensors.power_supplies['psu2-state'] && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>PSU 2 {getPowerStatus(systemResources.sensors.power_supplies['psu2-state']).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getPowerStatus(systemResources.sensors.power_supplies['psu2-state']).color }
                                            ]}>
                                                {getPowerStatus(systemResources.sensors.power_supplies['psu2-state']).level}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.metricSubtext, { marginTop: 12 }]}>
                                    ✅ Operativa  🔴 Falla  ⚠️ Advertencia
                                </Text>
                            </View>
                        )}

                        {/* Fan Status */}
                        {systemResources.sensors?.fans && (
                            <View style={styles.metricCard}>
                                <View style={styles.metricHeader}>
                                    <Text style={styles.metricTitle}>Ventiladores</Text>
                                </View>
                                <View style={styles.resourceGrid}>
                                    {systemResources.sensors.fans['fan1-speed'] !== undefined && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>Fan 1 {getFanStatus(systemResources.sensors.fans['fan1-speed']).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getFanStatus(systemResources.sensors.fans['fan1-speed']).color }
                                            ]}>
                                                {systemResources.sensors.fans['fan1-speed']} RPM
                                            </Text>
                                        </View>
                                    )}
                                    {systemResources.sensors.fans['fan2-speed'] !== undefined && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>Fan 2 {getFanStatus(systemResources.sensors.fans['fan2-speed']).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getFanStatus(systemResources.sensors.fans['fan2-speed']).color }
                                            ]}>
                                                {systemResources.sensors.fans['fan2-speed']} RPM
                                            </Text>
                                        </View>
                                    )}
                                    {systemResources.sensors.fans['fan3-speed'] !== undefined && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>Fan 3 {getFanStatus(systemResources.sensors.fans['fan3-speed']).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getFanStatus(systemResources.sensors.fans['fan3-speed']).color }
                                            ]}>
                                                {systemResources.sensors.fans['fan3-speed']} RPM
                                            </Text>
                                        </View>
                                    )}
                                    {systemResources.sensors.fans['fan4-speed'] !== undefined && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>Fan 4 {getFanStatus(systemResources.sensors.fans['fan4-speed']).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getFanStatus(systemResources.sensors.fans['fan4-speed']).color }
                                            ]}>
                                                {systemResources.sensors.fans['fan4-speed']} RPM
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.metricSubtext, { marginTop: 12 }]}>
                                    💨 Normal (+1000 RPM)  ⚠️ Lento (-1000 RPM)  🔴 Detenido (0 RPM)
                                </Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.metricCard}>
                        <View style={styles.metricHeader}>
                            <Text style={styles.metricTitle}>Estado de Sensores</Text>
                        </View>
                        <View style={styles.resourceItem}>
                            <Text style={styles.resourceLabel}>Estado</Text>
                            <Text style={styles.resourceValue}>
                                {showMockData ? '🚧 Datos mock cargados' : '❌ Backend no está enviando datos de sensores'}
                            </Text>
                        </View>
                        <Text style={[styles.metricSubtext, { textAlign: 'center', marginTop: 12 }]}>
                            🌡️ El backend necesita implementar datos de sensores:
                        </Text>
                        <Text style={[styles.metricSubtext, { textAlign: 'center', marginTop: 8 }]}>
                            • Temperaturas de hardware (CPU, placa, switch, SFP)
                        </Text>
                        <Text style={[styles.metricSubtext, { textAlign: 'center', marginTop: 4 }]}>
                            • Estado de fuentes de poder (PSU 1 y PSU 2)
                        </Text>
                        <Text style={[styles.metricSubtext, { textAlign: 'center', marginTop: 4 }]}>
                            • Velocidad de ventiladores (4 ventiladores)
                        </Text>
                        <Text style={[styles.metricSubtext, { textAlign: 'center', marginTop: 8 }]}>
                            📋 Ver: SOLICITUD_BACKEND_SENSORES_HARDWARE.md
                        </Text>
                    </View>
                )}

                {/* Last Update Timestamp */}
                {lastResourcesUpdate && (
                    <View style={styles.resourceSection}>
                        <Text style={[styles.metricSubtext, { textAlign: 'center', opacity: 0.7 }]}>
                            Última actualización: {format(lastResourcesUpdate, 'HH:mm:ss')} • 
                            Próxima actualización en 30 segundos
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default SystemResources;