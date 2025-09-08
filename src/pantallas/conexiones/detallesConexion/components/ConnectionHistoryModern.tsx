import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Type definitions
interface ConnectionHistoryModernProps {
    connectionId: string;
    realtimeData?: any;
    uptimeData?: any;
    styles: any;
    isDarkMode: boolean;
}

interface Session {
    id: string;
    type: string;
    status: string;
    startTime: Date;
    endTime?: Date;
    duration: number;
    averageDownload: number;
    averageUpload: number;
    peakDownload: number;
    peakUpload: number;
    bytesDownloaded: number;
    bytesUploaded: number;
    reason: string;
    connectionMethod?: string;
    clientIp?: string;
    routerInfo?: any;
    dataSource?: string;
}

const ConnectionHistoryModern: React.FC<ConnectionHistoryModernProps> = ({ 
    connectionId, 
    realtimeData: propRealtimeData, 
    uptimeData: propUptimeData, 
    styles, 
    isDarkMode 
}) => {
    try {
    // Función para sanitizar cualquier valor que pueda causar errores de renderizado
    const sanitizeValue = (value: any): string => {
        if (value === null || value === undefined) return 'unknown';
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return String(value);
        if (typeof value === 'boolean') return String(value);
        return 'unknown';
    };

    // Estados para los diferentes tipos de datos
    const [realtimeData, setRealtimeData] = useState<any>(propRealtimeData || null);
    const [uptimeData, setUptimeData] = useState<any>(propUptimeData || null);
    const [historyData, setHistoryData] = useState<any>(null);
    const [pollingData, setPollingData] = useState<any>(null);
    
    // Estados para historial extendido
    const [extendedHistoryData, setExtendedHistoryData] = useState<any>(null);
    const [bestHistoryEndpoint, setBestHistoryEndpoint] = useState<any>(null);
    
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    
    // Estados para envío de datos de debugging a Claude
    const [debugDataSent, setDebugDataSent] = useState(false);

    // Función helper para generar parámetros de tiempo
    const getTimeParam = (hoursAgo: number): string => {
        const date = new Date();
        date.setHours(date.getHours() - hoursAgo);
        return date.toISOString();
    };

    // Función para obtener historial extendido desde el mejor endpoint
    const fetchExtendedHistory = async (endpoint: string) => {
        try {
            console.log(`📅 Obteniendo historial extendido desde: ${endpoint}`);
            
            const response = await fetch(`https://wellnet-rd.com:444${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Historial extendido obtenido:`, data);
                
                // Normalizar estructura de datos (priorizando nuevas estructuras del backend)
                let normalizedData = [];
                let sourceInfo = '';
                
                // Detectar nuevas estructuras del backend extendido
                if (data.query_info && data.statistics && data.sessions) {
                    // Nueva estructura de /extended endpoint
                    normalizedData = data.sessions;
                    sourceInfo = `[EXTENDED API] ${data.statistics.time_span_hours}h span, ${data.statistics.total_sessions} sesiones`;
                    console.log(`🏆 [EXTENDED API] Usando estructura extendida oficial`);
                    console.log(`   📊 Query info:`, data.query_info);
                    console.log(`   📈 Statistics:`, data.statistics);
                } else if (data.periods && Array.isArray(data.periods)) {
                    // Múltiples períodos analizados
                    const bestPeriod = data.periods.find(p => p.has_data && p.session_count > 0);
                    if (bestPeriod) {
                        normalizedData = bestPeriod.sessions || [];
                        sourceInfo = `[EXTENDED API] Período ${bestPeriod.period}: ${bestPeriod.session_count} sesiones`;
                        console.log(`🎯 [EXTENDED API] Usando mejor período: ${bestPeriod.period}`);
                    }
                } else if (data.sessions && Array.isArray(data.sessions)) {
                    normalizedData = data.sessions;
                    sourceInfo = '[LEGACY] Sessions array';
                } else if (data.events && Array.isArray(data.events)) {
                    normalizedData = data.events;
                    sourceInfo = '[LEGACY] Events array';
                } else if (data.timeline && Array.isArray(data.timeline)) {
                    normalizedData = data.timeline;
                    sourceInfo = '[LEGACY] Timeline array';
                } else if (data.history && Array.isArray(data.history)) {
                    normalizedData = data.history;
                    sourceInfo = '[LEGACY] History array';
                } else if (Array.isArray(data)) {
                    normalizedData = data;
                    sourceInfo = '[LEGACY] Direct array';
                }
                
                console.log(`📊 Datos normalizados: ${normalizedData.length} registros`);
                console.log(`📋 Fuente: ${sourceInfo}`);
                setExtendedHistoryData(normalizedData);
                
                // Actualizar historyData si el historial extendido tiene más datos
                if (normalizedData.length > (historyData?.length || 0)) {
                    console.log(`🔄 ÉXITO: Reemplazando historial limitado con extendido`);
                    console.log(`   📊 Antes: ${historyData?.length || 0} registros`);
                    console.log(`   📈 Después: ${normalizedData.length} registros`);
                    console.log(`   🎯 Ganancia: +${normalizedData.length - (historyData?.length || 0)} registros históricos`);
                    setHistoryData(normalizedData);
                } else {
                    console.log(`⚠️ Historial extendido no mejora los datos actuales (${normalizedData.length} vs ${historyData?.length || 0})`);
                }
                
                return normalizedData;
            } else {
                console.log(`❌ Error historial extendido: HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error obteniendo historial extendido:', error);
        }
        return null;
    };

    // Función para obtener datos en tiempo real
    const fetchRealtimeData = async () => {
        try {
            console.log(`📊 Obteniendo datos en tiempo real para conexión ${connectionId}`);
            
            const response = await fetch(`https://wellnet-rd.com:444/api/connection-realtime/${connectionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Datos realtime obtenidos:`, data);
                setRealtimeData(data);
                return data;
            } else {
                console.log(`❌ Error realtime: HTTP ${response.status}`);
            }
        } catch (error) {
            console.log(`ℹ️ Sin datos realtime para conexión ${connectionId}:`, error.message);
        }
        return null;
    };

    // Función para obtener datos de uptime
    const fetchUptimeData = async () => {
        try {
            console.log(`📊 Obteniendo datos de uptime para conexión ${connectionId}`);
            
            const response = await fetch(`https://wellnet-rd.com:444/api/connection-uptime/${connectionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Datos uptime obtenidos:`, data);
                setUptimeData(data);
                return data;
            } else {
                console.log(`❌ Error uptime: HTTP ${response.status}`);
            }
        } catch (error) {
            console.log(`ℹ️ Sin datos uptime para conexión ${connectionId}:`, error.message);
        }
        return null;
    };

    // Función para obtener historial de eventos
    const fetchHistoryData = async () => {
        try {
            console.log(`📊 Obteniendo historial para conexión ${connectionId}`);
            
            const response = await fetch(`https://wellnet-rd.com:444/api/connection-history/${connectionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Historial obtenido:`, data);
                setHistoryData(data);
                return data;
            } else {
                console.log(`❌ Error historial: HTTP ${response.status}`);
            }
        } catch (error) {
            console.log(`ℹ️ Sin datos de historial para conexión ${connectionId}:`, error.message);
        }
        return null;
    };

    // Función para investigar estructura completa de datos del backend
    const investigateBackendData = async () => {
        if (!connectionId) {
            console.log(`⚠️ No se puede investigar sin connectionId`);
            return;
        }
        
        console.log(`🔍 INVESTIGACIÓN COMPLETA - Conexión ${connectionId}`);
        console.log(`📅 BÚSQUEDA DE HISTORIAL TEMPORAL EXTENDIDO`);
        
        // Solo probar los endpoints más importantes para acelerar la carga
        const endpoints = [
            // Endpoints prioritarios con historial extendido (NUEVOS DEL BACKEND)
            `/api/connection-history/${connectionId}/extended`,           // Análisis automático
            `/api/connection-history/${connectionId}?period=7d`,          // 7 días específicos  
            `/api/connection-history/${connectionId}?limit=500`,          // Hasta 500 sesiones
            `/api/connection-events/${connectionId}?limit=100`,           // Eventos con límite
            `/api/connection-history/${connectionId}?days=7`,             // 7 días alternativos
            
            // Endpoints básicos para fallback rápido
            `/api/connection-history/${connectionId}?hours=24`,
            `/api/sessions/${connectionId}/history`,
            `/api/conexiones/${connectionId}/timeline/extended`,
            `/api/monitoring/${connectionId}/timeline`,
            `/api/analytics/connection/${connectionId}/timeline`
        ];
        
        console.log(`📋 Probando ${endpoints.length} endpoints para análisis de datos...`);
        
        const successfulEndpoints = [];
        const extendedHistoryEndpoints = [];
        
        for (const endpoint of endpoints) {
            try {
                console.log(`🔍 Probando: ${endpoint}`);
                
                // Agregar timeout de 3 segundos para evitar colgarse
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                
                const response = await fetch(`https://wellnet-rd.com:444${endpoint}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const data = await response.json();
                    successfulEndpoints.push(endpoint);
                    
                    // Analizar si contiene historial extendido
                    const hasExtendedHistory = analyzeHistoricalDataExtent(data, endpoint);
                    if (hasExtendedHistory) {
                        extendedHistoryEndpoints.push({
                            endpoint,
                            dataCount: hasExtendedHistory.count,
                            timeSpan: hasExtendedHistory.span,
                            dataType: hasExtendedHistory.type
                        });
                    }
                    
                    console.log(`✅ ${endpoint}:`, data);
                    
                    // Analizar estructura específica
                    if (endpoint.includes('uptime')) {
                        analyzeUptimeStructure(data);
                    } else if (endpoint.includes('history')) {
                        analyzeHistoryStructure(data);
                    } else if (endpoint.includes('realtime')) {
                        analyzeRealtimeStructure(data);
                    }
                } else {
                    console.log(`❌ ${endpoint}: HTTP ${response.status}`);
                }
            } catch (error) {
                console.log(`❌ ${endpoint}: Error - ${error.message}`);
            }
        }
        
        // Resumen de endpoints con historial extendido
        console.log(`\n🎯 RESUMEN DE INVESTIGACIÓN:`);
        console.log(`   📊 Endpoints exitosos: ${successfulEndpoints.length}/${endpoints.length}`);
        console.log(`   📅 Endpoints con historial extendido: ${extendedHistoryEndpoints.length}`);
        
        if (extendedHistoryEndpoints.length > 0) {
            console.log(`\n🏆 ENDPOINTS CON HISTORIAL TEMPORAL:`);
            extendedHistoryEndpoints.forEach(item => {
                console.log(`   📈 ${item.endpoint}`);
                console.log(`      - Registros: ${item.dataCount}`);
                console.log(`      - Período: ${item.timeSpan}`);
                console.log(`      - Tipo: ${item.dataType}`);
            });
            
            // Recomendar el mejor endpoint (por prioridad primero, luego por cantidad de datos)
            const bestEndpoint = extendedHistoryEndpoints.reduce((best, current) => {
                if (current.priority > best.priority) return current;
                if (current.priority === best.priority && current.dataCount > best.dataCount) return current;
                return best;
            });
            
            const apiType = bestEndpoint.isNewAPI ? '[EXTENDED API]' : '[LEGACY API]';
            console.log(`\n🎯 RECOMENDACIÓN: Usar ${bestEndpoint.endpoint}`);
            console.log(`   ${apiType} ${bestEndpoint.dataCount} registros, prioridad ${bestEndpoint.priority}/100`);
            
            // Automáticamente usar el mejor endpoint encontrado
            setBestHistoryEndpoint(bestEndpoint);
            await fetchExtendedHistory(bestEndpoint.endpoint);
        } else {
            console.log(`\n⚠️ PROBLEMA: No se encontraron endpoints con historial temporal extendido`);
            console.log(`   💡 El backend parece estar limitado a las últimas 2 sesiones`);
            console.log(`   🔧 Solicitar al equipo backend endpoints para historial de 24h/7d`);
            console.log(`\n📧 SUGERENCIAS PARA EL BACKEND TEAM:`);
            console.log(`   1. /api/connection-history/${connectionId}?hours=24`);
            console.log(`   2. /api/connection-history/${connectionId}?days=7`);
            console.log(`   3. /api/connection-events/${connectionId}?limit=100`);
            console.log(`   4. /api/sessions/${connectionId}/history`);
        }
    };

    // Función para analizar si los datos contienen historial extendido
    const analyzeHistoricalDataExtent = (data: any, endpoint: string) => {
        if (!data) return null;
        
        // Detectar nuevas estructuras del backend con análisis automático
        if (data.query_info?.has_extended_history === true) {
            console.log(`🎯 [EXTENDED API] Backend confirma historial extendido disponible`);
        }
        
        if (data.statistics?.time_span_hours > 2) {
            console.log(`📊 [EXTENDED API] Span temporal detectado: ${data.statistics.time_span_hours} horas`);
        }
        
        if (data.analysis?.has_extended_history === true) {
            console.log(`🔍 [EXTENDED API] Análisis backend confirma historial extendido`);
        }
        
        let events = [];
        let dataType = 'unknown';
        let isNewExtendedAPI = false;
        
        // Detectar nuevas estructuras del backend extendido
        if (data.query_info && data.statistics && data.sessions) {
            // Nueva estructura de /extended endpoint
            events = data.sessions;
            dataType = 'extended_sessions';
            isNewExtendedAPI = true;
            console.log(`🏆 [EXTENDED API] Detectado nuevo formato extendido`);
        } else if (data.periods && Array.isArray(data.periods)) {
            // Múltiples períodos analizados
            const bestPeriod = data.periods.find(p => p.has_data && p.session_count > 0);
            if (bestPeriod) {
                events = bestPeriod.sessions || [];
                dataType = 'multi_period';
                isNewExtendedAPI = true;
                console.log(`🎯 [EXTENDED API] Mejor período: ${bestPeriod.period} (${bestPeriod.session_count} sesiones)`);
            }
        } else if (data.sessions && Array.isArray(data.sessions)) {
            events = data.sessions;
            dataType = 'sessions';
        } else if (data.events && Array.isArray(data.events)) {
            events = data.events;
            dataType = 'events';
        } else if (data.recent_events && Array.isArray(data.recent_events)) {
            events = data.recent_events;
            dataType = 'recent_events';
        } else if (data.timeline && Array.isArray(data.timeline)) {
            events = data.timeline;
            dataType = 'timeline';
        } else if (data.history && Array.isArray(data.history)) {
            events = data.history;
            dataType = 'history';
        } else if (data.logs && Array.isArray(data.logs)) {
            events = data.logs;
            dataType = 'logs';
        } else if (Array.isArray(data)) {
            events = data;
            dataType = 'array';
        }
        
        if (events.length === 0) return null;
        
        // Analizar extensión temporal
        const now = new Date();
        const timestamps = events
            .map(event => {
                // Buscar campo de timestamp en diferentes formatos
                return event.start_time || event.time || event.timestamp || 
                       event.created_at || event.event_time || event.last_event_time;
            })
            .filter(Boolean)
            .map(ts => new Date(ts))
            .filter(date => !isNaN(date.getTime()));
        
        if (timestamps.length === 0) return null;
        
        // Encontrar el rango temporal
        const oldestTime = Math.min(...timestamps.map(date => date.getTime()));
        const newestTime = Math.max(...timestamps.map(date => date.getTime()));
        const oldest = new Date(oldestTime);
        const newest = new Date(newestTime);
        const timeSpanHours = (newest.getTime() - oldest.getTime()) / (1000 * 60 * 60);
        
        // Determinar si es historial extendido
        let isExtended = false;
        let priority = 0;
        
        // Prioridad máxima para nuevos endpoints del backend
        if (isNewExtendedAPI || data.query_info?.has_extended_history === true) {
            isExtended = true;
            priority = 100;
            console.log(`🏆 [EXTENDED API] Endpoint prioritario detectado`);
        } else if (timeSpanHours > 24 || events.length > 50) {
            // Alto: más de 1 día o muchos eventos
            isExtended = true;
            priority = 80;
        } else if (timeSpanHours > 2 || events.length > 10) {
            // Medio: más de 2 horas o eventos moderados
            isExtended = true;
            priority = 60;
        }
        
        if (isExtended) {
            let spanDescription;
            if (timeSpanHours < 24) {
                spanDescription = `${Math.round(timeSpanHours)} horas`;
            } else {
                spanDescription = `${Math.round(timeSpanHours / 24)} días`;
            }
            
            const logPrefix = isNewExtendedAPI ? '[EXTENDED API]' : '[LEGACY API]';
            console.log(`📅 HISTORIAL EXTENDIDO ENCONTRADO ${logPrefix} en ${endpoint}:`);
            console.log(`   📊 Registros: ${events.length}`);
            console.log(`   ⏰ Período: ${spanDescription} (${oldest.toLocaleString()} → ${newest.toLocaleString()})`);
            console.log(`   📝 Tipo: ${dataType}`);
            console.log(`   🎯 Prioridad: ${priority}/100`);
            console.log(`   🔍 Muestra:`, events.slice(0, 2));
            
            return {
                count: events.length,
                span: spanDescription,
                type: dataType,
                oldest: oldest.toISOString(),
                newest: newest.toISOString(),
                spanHours: timeSpanHours,
                priority: priority,
                isNewAPI: isNewExtendedAPI
            };
        }
        
        return null;
    };

    // Función para analizar estructura de datos de uptime
    const analyzeUptimeStructure = (data: any) => {
        console.log(`🔬 ANÁLISIS UPTIME:`);
        console.log(`   Status: ${data.status}`);
        console.log(`   Last Event: ${data.last_event?.type} at ${data.last_event?.time}`);
        console.log(`   Events Count: ${data.recent_events?.length || 0}`);
        console.log(`   Offline Time: ${data.offline_time} seconds`);
        console.log(`   Monitoring Since: ${data.statistics?.monitoring_since}`);
        
        if (data.recent_events) {
            console.log(`   📊 Recent Events:`, data.recent_events.map(e => ({
                type: e.type,
                time: e.time,
                ago: e.formatted_time
            })));
        }
    };

    // Función para analizar estructura de datos de historia
    const analyzeHistoryStructure = (data: any) => {
        console.log(`🔬 ANÁLISIS HISTORIA:`);
        console.log(`   Total Sessions: ${data.total_sessions}`);
        console.log(`   Sessions Count: ${data.sessions?.length || 0}`);
        
        if (data.sessions) {
            data.sessions.forEach((session, i) => {
                console.log(`   📋 Sesión ${i + 1}:`, {
                    id: sanitizeValue(session.session_id),
                    type: sanitizeValue(session.type),
                    status: sanitizeValue(session.status),
                    start: sanitizeValue(session.start_time),
                    end: sanitizeValue(session.end_time),
                    duration: Number(session.duration_seconds || 0),
                    source: sanitizeValue(session.data_source)
                });
            });
        }
        
        if (data.summary) {
            console.log(`   📊 Summary:`, data.summary);
        }
    };

    // Función para analizar estructura de datos real-time
    const analyzeRealtimeStructure = (data: any) => {
        console.log(`🔬 ANÁLISIS REALTIME:`);
        console.log(`   Status: ${data.status}`);
        console.log(`   Download: ${data.download_rate} bps`);
        console.log(`   Upload: ${data.upload_rate} bps`);
        console.log(`   Last Event: ${data.last_event_time}`);
        console.log(`   Uptime Status: ${data.uptime_status}`);
        console.log(`   Uptime Seconds: ${data.uptime_seconds}`);
    };

    // Función para obtener datos de polling/monitoreo
    const fetchPollingData = async () => {
        try {
            console.log(`📊 Obteniendo datos de polling para conexión ${connectionId}`);
            
            const response = await fetch(`https://wellnet-rd.com:444/api/polling-monitor/connection/${connectionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Datos polling obtenidos:`, data);
                setPollingData(data);
                return data;
            } else {
                console.log(`❌ Error polling: HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error obteniendo datos polling:', error);
        }
        return null;
    };

    // Función para reconciliar datos y construir timeline real
    const buildConnectionTimeline = () => {
        console.log(`🏗️ CONSTRUYENDO TIMELINE TEMPORAL - Conexión ${connectionId}`);
        
        const events = [];
        const inconsistencies = [];
        const now = new Date();
        
        // Verificar si tenemos datos para procesar
        if (!historyData && !uptimeData && !realtimeData) {
            console.log(`ℹ️ No hay datos disponibles para construir timeline`);
            console.log(`   💡 Esto es normal para conexiones nuevas sin historial`);
            return {
                connection_id: connectionId,
                events: [],
                inconsistencies: [],
                gaps: [],
                current_status: {
                    status: 'unknown',
                    confidence: 'low',
                    determined_at: now.toISOString(),
                    sources_used: []
                },
                last_verified: now.toISOString(),
                confidence_score: 0
            };
        }
        
        // 1. Procesar datos de historia con corrección de timestamps futuros
        if (historyData && historyData.length > 0) {
            historyData.forEach(session => {
                const originalStartTime = new Date(session.start_time);
                const timeDiffFromNow = now.getTime() - originalStartTime.getTime();
                
                // Detectar timestamps futuros (más de 1 minuto en el futuro)
                const isFutureTimestamp = timeDiffFromNow < -60000;
                
                // Corregir timestamp si está en el futuro
                let correctedStartTime = originalStartTime;
                if (isFutureTimestamp) {
                    // Restar 5 minutos si parece ser el error común
                    correctedStartTime = new Date(originalStartTime.getTime() - (5 * 60 * 1000));
                    
                    inconsistencies.push({
                        type: 'future_timestamp',
                        description: `Timestamp futuro detectado: ${session.start_time} → Corregido: ${correctedStartTime.toISOString()}`,
                        impact: 'timestamp_corrected',
                        original: session.start_time,
                        corrected: correctedStartTime.toISOString()
                    });
                }
                
                // Calcular duración real (no usar duration_seconds del backend si es estático)
                let realDuration = session.duration_seconds;
                if (session.status === 'current') {
                    // Para sesiones actuales, calcular duración real
                    realDuration = Math.floor((now.getTime() - correctedStartTime.getTime()) / 1000);
                } else if (session.duration_seconds === 300) {
                    // Detectar duraciones estáticas de 5 minutos
                    if (session.end_time) {
                        const endTime = new Date(session.end_time);
                        const actualDuration = Math.floor((endTime.getTime() - correctedStartTime.getTime()) / 1000);
                        if (Math.abs(actualDuration - 300) > 60) { // Más de 1 minuto de diferencia
                            realDuration = actualDuration;
                            inconsistencies.push({
                                type: 'static_duration',
                                description: `Duración estática detectada: ${session.duration_seconds}s → Real: ${realDuration}s`,
                                impact: 'duration_corrected',
                                backend_duration: session.duration_seconds,
                                calculated_duration: realDuration
                            });
                        }
                    }
                }
                
                const startEvent = {
                    timestamp: correctedStartTime.toISOString(),
                    type: 'connect',
                    source: 'history',
                    confidence: isFutureTimestamp ? 'medium' : 'high',
                    metadata: {
                        session_id: session.session_id,
                        data_source: session.data_source,
                        duration_seconds: realDuration,
                        original_timestamp: session.start_time,
                        timestamp_corrected: isFutureTimestamp,
                        duration_corrected: realDuration !== session.duration_seconds
                    }
                };
                events.push(startEvent);
                
                // Si tiene end_time, agregar evento de desconexión
                if (session.end_time && session.status !== 'current') {
                    const originalEndTime = new Date(session.end_time);
                    let correctedEndTime = originalEndTime;
                    
                    // Corregir end_time si también está en el futuro
                    if (now.getTime() - originalEndTime.getTime() < -60000) {
                        correctedEndTime = new Date(originalEndTime.getTime() - (5 * 60 * 1000));
                    }
                    
                    const endEvent = {
                        timestamp: correctedEndTime.toISOString(),
                        type: 'disconnect',
                        source: 'history',
                        confidence: 'high',
                        metadata: {
                            session_id: session.session_id,
                            duration_seconds: realDuration,
                            disconnection_reason: session.disconnection_reason || 'unknown',
                            original_end_time: session.end_time
                        }
                    };
                    events.push(endEvent);
                }
            });
        }
        
        // 2. Validar con datos de uptime
        if (uptimeData && uptimeData.recent_events) {
            uptimeData.recent_events.forEach(event => {
                const timelineEvent = {
                    timestamp: event.time,
                    type: event.type === 'offline' ? 'disconnect' : 'connect',
                    source: 'uptime',
                    confidence: 'medium',
                    metadata: {
                        detection_method: event.detection_method,
                        seconds_ago: event.seconds_ago,
                        formatted_time: event.formatted_time
                    }
                };
                
                // Verificar si ya existe este evento en historia
                const existsInHistory = events.some(e => 
                    Math.abs(new Date(e.timestamp).getTime() - new Date(event.time).getTime()) < 60000 // 1 minuto de tolerancia
                );
                
                if (!existsInHistory) {
                    events.push(timelineEvent);
                    console.log(`📊 Evento de uptime agregado: ${event.type} at ${event.time}`);
                }
            });
        }
        
        // 3. Validar consistencia con datos real-time
        if (realtimeData) {
            const rtStatus = realtimeData.status;
            const uptimeStatus = uptimeData?.status;
            
            if (rtStatus !== uptimeStatus) {
                inconsistencies.push({
                    type: 'status_mismatch',
                    description: `RT status "${rtStatus}" vs Uptime status "${uptimeStatus}"`,
                    impact: 'current_status_unclear'
                });
            }
            
            // Verificar last_event_time
            if (realtimeData.last_event_time) {
                const lastEventInTimeline = events
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                    
                if (lastEventInTimeline && lastEventInTimeline.timestamp !== realtimeData.last_event_time) {
                    inconsistencies.push({
                        type: 'last_event_mismatch',
                        description: `Timeline last event: ${lastEventInTimeline.timestamp} vs RT last event: ${realtimeData.last_event_time}`,
                        impact: 'timeline_synchronization'
                    });
                }
            }
        }
        
        // 4. Ordenar eventos cronológicamente
        events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        // 5. Detectar gaps temporales
        const gaps = [];
        for (let i = 0; i < events.length - 1; i++) {
            const current = events[i];
            const next = events[i + 1];
            const timeDiff = new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            
            if (hoursDiff > 1) { // Gap mayor a 1 hora
                gaps.push({
                    start: current.timestamp,
                    end: next.timestamp,
                    duration_hours: hoursDiff,
                    description: `Gap de ${hoursDiff.toFixed(1)} horas entre eventos`
                });
            }
        }
        
        const timeline = {
            connection_id: connectionId,
            events: events,
            inconsistencies: inconsistencies,
            gaps: gaps,
            current_status: determineCurrentStatus(),
            last_verified: new Date().toISOString(),
            confidence_score: calculateTimelineConfidence(events, inconsistencies)
        };
        
        console.log(`🏗️ TIMELINE CONSTRUIDO:`, timeline);
        console.log(`   📊 Total eventos: ${events.length}`);
        console.log(`   ⚠️ Inconsistencias: ${inconsistencies.length}`);
        console.log(`   🕳️ Gaps detectados: ${gaps.length}`);
        console.log(`   🎯 Confianza: ${timeline.confidence_score}%`);
        
        return timeline;
    };

    // Función para determinar estado actual basado en todas las fuentes
    const determineCurrentStatus = () => {
        const now = new Date();
        let status = 'unknown';
        let confidence = 'low';
        
        // Prioridad 1: Datos de historia más recientes
        if (historyData && historyData.length > 0) {
            const currentSession = historyData.find(s => s.status === 'current');
            if (currentSession) {
                status = 'online';
                confidence = 'high';
            }
        }
        
        // Prioridad 2: Real-time data
        if (realtimeData && realtimeData.status) {
            if (status === 'unknown') {
                status = realtimeData.status === 'online' ? 'online' : 'offline';
                confidence = 'medium';
            }
        }
        
        // Prioridad 3: Uptime data (menos confiable para estado actual)
        if (uptimeData && status === 'unknown') {
            status = uptimeData.status === 'offline' ? 'offline' : 'online';
            confidence = 'low';
        }
        
        return {
            status: status,
            confidence: confidence,
            determined_at: now.toISOString(),
            sources_used: [
                historyData ? 'history' : null,
                realtimeData ? 'realtime' : null,
                uptimeData ? 'uptime' : null
            ].filter(Boolean)
        };
    };

    // Función para calcular confianza del timeline
    const calculateTimelineConfidence = (events: any[], inconsistencies: any[]): number => {
        let score = 100;
        
        // Penalizar por inconsistencias
        score -= inconsistencies.length * 15;
        
        // Penalizar por falta de datos
        if (events.length === 0) score -= 50;
        if (events.length < 3) score -= 20;
        
        // Bonus por diversidad de fuentes
        const uniqueSources = new Set(events.map(e => e.source));
        const sources = Array.from(uniqueSources);
        if (sources.length > 1) score += 10;
        
        return Math.max(0, Math.min(100, score));
    };

    // Función para enviar datos de debugging a Claude para análisis
    const sendDebugDataToClaude = async () => {
        if (debugDataSent) return; // Solo enviar una vez por sesión

        try {
            console.log(`🤖 Enviando datos de debugging a Claude para análisis...`);

            // Detectar problemas automáticamente
            const issues = [];
            if (error) issues.push(`Error: ${error}`);
            
            const dataIssue = detectDataIssues();
            if (dataIssue) issues.push(`Data issue: ${dataIssue}`);
            
            if (realtimeData?.status === 'online' && uptimeData?.status === 'offline') {
                issues.push('Inconsistencia RT/Uptime');
            }
            
            if (historyData?.some(s => s.duration_seconds === 300)) {
                issues.push('Duraciones estáticas 5min');
            }

            // Solo enviar si hay problemas detectados
            if (issues.length === 0) return;

            const debugMessage = `🔧 DEBUGGING REPORT - Conexión ${connectionId}:
            
Problemas detectados: ${issues.join(', ')}

Datos técnicos:
- Realtime: ${JSON.stringify(realtimeData, null, 2)}
- Uptime: ${JSON.stringify(uptimeData, null, 2)} 
- History: ${JSON.stringify(historyData?.slice(0, 2), null, 2)}
- Error actual: ${error}

¿Qué análisis y recomendaciones tienes para estos problemas?`;

            const contextData = {
                connectionId: connectionId,
                screen: 'ConexionDetalles',
                debugSession: true,
                issues: issues,
                timestamp: new Date().toISOString(),
                userAgent: 'React Native App'
            };

            const response = await fetch('https://wellnet-rd.com:444/api/claude/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: debugMessage,
                    userId: 999, // ID especial para debugging
                    userName: 'Debug System',
                    sessionId: `debug_${connectionId}_${Date.now()}`,
                    contextData: contextData
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Datos de debugging enviados a Claude exitosamente`);
                console.log(`📋 Session ID: ${data.data.sessionId}`);
                setDebugDataSent(true);
            } else {
                console.log(`❌ Error enviando debug a Claude: HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error enviando debugging a Claude:', error);
        }
    };

    // Función principal para obtener todos los datos
    const fetchAllConnectionData = async () => {
        if (!connectionId) {
            console.log(`⚠️ No hay connectionId definido, saltando fetch de datos`);
            // setLoading removed - component shows immediately
            return;
        }
        
        try {
            // Nunca usar loading, la página se muestra inmediatamente
            setError(null);
            console.log(`📊 Obteniendo datos en background para conexión ${connectionId}`);
            
            // Ejecutar todas las llamadas en paralelo para mejor performance
            const promises = [
                fetchRealtimeData(),
                fetchUptimeData(), 
                fetchHistoryData(),
                fetchPollingData()
            ];
            
            const results = await Promise.allSettled(promises);
            
            // Log de resultados
            results.forEach((result, index) => {
                const names = ['realtime', 'uptime', 'history', 'polling'];
                if (result.status === 'fulfilled' && result.value) {
                    console.log(`✅ ${names[index]} data: OK`);
                } else {
                    console.log(`❌ ${names[index]} data: Failed`);
                }
            });
            
            // Verificar si tenemos al menos algunos datos básicos
            const hasRealtimeData = results[0].status === 'fulfilled' && results[0].value;
            const hasUptimeData = results[1].status === 'fulfilled' && results[1].value;
            const hasHistoryData = results[2].status === 'fulfilled' && results[2].value;
            const hasPollingData = results[3].status === 'fulfilled' && results[3].value;
            
            const hasAnyData = hasRealtimeData || hasUptimeData || hasHistoryData || hasPollingData;
            
            if (!hasAnyData) {
                console.log(`🆕 CONEXIÓN NUEVA DETECTADA - ID ${connectionId}`);
                console.log(`   💡 Sin datos históricos - esto es normal para conexiones nuevas`);
                console.log(`   📊 Mostrando interfaz para configuración inicial`);
                console.log(`   🎯 Usuario podrá asignar configuración desde esta pantalla`);
                setError(null); // No es error, es conexión nueva
                
                // Para conexiones nuevas, salir del loading inmediatamente
                console.log(`⚡ Finalizando loading para permitir configuración`);
            } else {
                console.log(`✅ Datos obtenidos exitosamente:`);
                console.log(`   📡 Realtime: ${hasRealtimeData ? 'Sí' : 'No'}`);
                console.log(`   ⏱️ Uptime: ${hasUptimeData ? 'Sí' : 'No'}`);
                console.log(`   📚 History: ${hasHistoryData ? 'Sí' : 'No'}`);
                console.log(`   🔄 Polling: ${hasPollingData ? 'Sí' : 'No'}`);
            }
            
            // Solo investigar el backend si tenemos al menos algunos datos (pero sin bloquear la UI)
            if (hasAnyData) {
                // Ejecutar investigaciones en background sin bloquear la UI
                Promise.resolve().then(async () => {
                    try {
                        console.log(`🔍 Iniciando investigación en background...`);
                        await investigateBackendData();
                        
                        const timeline = buildConnectionTimeline();
                        console.log(`📈 TIMELINE FINAL CONSTRUIDO PARA CONEXIÓN ${connectionId}:`, timeline);
                        
                        await sendDebugDataToClaude();
                    } catch (error) {
                        console.log(`⚠️ Error en investigación background:`, error.message);
                    }
                });
            } else {
                console.log(`⏭️ Saltando investigación avanzada - conexión sin datos históricos`);
            }
            
        } catch (error) {
            console.error('❌ Error obteniendo todos los datos:', error);
            setError('Error de conexión al obtener datos');
            
            // También enviar error crítico a Claude
            setTimeout(() => {
                sendDebugDataToClaude();
            }, 1000);
        } finally {
            // No hay loading que limpiar, la página ya está visible
            console.log(`✅ Datos de background completados para conexión ${connectionId}`);
        }
    };

    // Effect para actualizar estados cuando cambien las props
    useEffect(() => {
        if (propRealtimeData) {
            setRealtimeData(propRealtimeData);
        }
        if (propUptimeData) {
            setUptimeData(propUptimeData);
        }
    }, [propRealtimeData, propUptimeData]);

    // Effect para obtener datos al cargar el componente con estrategia de polling inteligente
    useEffect(() => {
        if (connectionId) {
            fetchAllConnectionData();
        } else {
            console.log(`ℹ️ Esperando connectionId para cargar datos...`);
            // No necesitamos setLoading, la página ya está visible
        }
        
        // Solo configurar intervalos si tenemos connectionId
        let realtimeInterval: NodeJS.Timeout | undefined, uptimeInterval: NodeJS.Timeout | undefined, historyInterval: NodeJS.Timeout | undefined;
        
        if (connectionId) {
            // Actualizar datos en tiempo real cada 8 segundos
            realtimeInterval = setInterval(fetchRealtimeData, 8 * 1000);
            
            // Actualizar uptime y polling cada 5 minutos
            uptimeInterval = setInterval(() => {
                fetchUptimeData();
                fetchPollingData();
            }, 5 * 60 * 1000);
            
            // Actualizar historial cada 30 segundos
            historyInterval = setInterval(fetchHistoryData, 30 * 1000);
        }
        
        return () => {
            if (realtimeInterval) clearInterval(realtimeInterval);
            if (uptimeInterval) clearInterval(uptimeInterval);
            if (historyInterval) clearInterval(historyInterval);
        };
    }, [connectionId]);

    // Effect para actualizar tiempo actual cada minuto (para duraciones en tiempo real)
    useEffect(() => {
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60 * 1000); // Actualizar cada minuto

        return () => clearInterval(timeInterval);
    }, []);

    // Función para validar coherencia de datos
    const validateSessionCoherence = (sessions: any[]) => {
        const now = new Date();
        const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);
        
        console.log(`🕐 Validación de coherencia temporal:`);
        console.log(`- Hora actual: ${now.toLocaleString()}`);
        console.log(`- Hace 20 min: ${twentyMinutesAgo.toLocaleString()}`);
        
        sessions.forEach((session, index) => {
            const startTime = new Date(session.start_time);
            const endTime = session.end_time ? new Date(session.end_time) : null;
            
            console.log(`🔍 Sesión ${index + 1} - Análisis temporal:`);
            console.log(`  - Inicio: ${startTime.toLocaleString()}`);
            console.log(`  - Fin: ${endTime ? endTime.toLocaleString() : 'ACTUAL'}`);
            console.log(`  - Estado: ${session.status}`);
            console.log(`  - Tipo: ${session.type}`);
            
            // Detectar inconsistencias
            if (session.status === 'current' && session.type === 'connected') {
                if (startTime > now) {
                    console.warn(`⚠️ INCONSISTENCIA: Sesión actual inicia en el futuro`);
                }
                if (endTime) {
                    console.warn(`⚠️ INCONSISTENCIA: Sesión actual tiene fecha fin`);
                }
            }
            
            if (session.type === 'connected' && session.status === 'completed') {
                if (!endTime) {
                    console.warn(`⚠️ INCONSISTENCIA: Sesión completada sin fecha fin`);
                }
                if (endTime && endTime > now) {
                    console.warn(`⚠️ INCONSISTENCIA: Sesión completada termina en futuro`);
                }
            }
        });
    };

    // Función para calcular duración en tiempo real
    const calculateCurrentDuration = (startTime: string, endTime: Date | null = null): number => {
        // USAR HORA REAL DEL SISTEMA, no currentTime state
        const now = endTime || new Date();
        const start = new Date(startTime);
        const durationMs = now.getTime() - start.getTime();
        
        // Si el start time está en el futuro, corregir automáticamente
        if (durationMs < 0) {
            console.log(`🔧 CORRIGIENDO TIMESTAMP FUTURO:`);
            console.log(`   - Original: ${start.toISOString()}`);
            console.log(`   - Now: ${now.toISOString()}`);
            console.log(`   - Diferencia: ${durationMs}ms`);
            
            // Asumir que el backend está adelantado 5 minutos y corregir
            const correctedStart = new Date(start.getTime() - (5 * 60 * 1000));
            const correctedDurationMs = now.getTime() - correctedStart.getTime();
            const correctedDurationSeconds = Math.floor(correctedDurationMs / 1000);
            
            console.log(`   - Corregido: ${correctedStart.toISOString()}`);
            console.log(`   - Nueva duración: ${correctedDurationSeconds}s`);
            
            // Si aún es negativo después de la corrección, usar duración mínima
            return correctedDurationSeconds > 0 ? correctedDurationSeconds : 60;
        }
        
        const durationSeconds = Math.floor(durationMs / 1000);
        return durationSeconds;
    };

    // Función para transformar datos del backend al formato del componente
    const transformBackendSession = (session: any): Session => {
        const startTime = new Date(session.start_time);
        const endTime = session.end_time ? new Date(session.end_time) : null;
        
        // Para sesiones actuales, SIEMPRE calcular duración en tiempo real
        // Para sesiones completadas, usar backend solo si es confiable, sino calcular
        let duration;
        if (session.status === 'current') {
            // Sesión actual: siempre calcular en tiempo real
            duration = calculateCurrentDuration(session.start_time);
        } else if (session.end_time && session.start_time) {
            // Sesión completada: calcular basado en timestamps reales
            duration = calculateCurrentDuration(session.start_time, endTime);
        } else {
            // Fallback: usar valor del backend
            duration = session.duration_seconds || 0;
        }
            
        return {
            id: sanitizeValue(session.session_id || `session_${Date.now()}_${Math.random()}`),
            type: sanitizeValue(session.type || 'connected'),
            status: sanitizeValue(session.status || 'unknown'),
            startTime: startTime,
            endTime: endTime,
            duration: duration,
            averageDownload: session.traffic_stats?.average_download_bps || 0,
            averageUpload: session.traffic_stats?.average_upload_bps || 0,
            peakDownload: session.traffic_stats?.peak_download_bps || 0,
            peakUpload: session.traffic_stats?.peak_upload_bps || 0,
            bytesDownloaded: session.traffic_stats?.bytes_downloaded || 0,
            bytesUploaded: session.traffic_stats?.bytes_uploaded || 0,
            reason: sanitizeValue(session.disconnection_reason || session.status || 'Activa'),
            connectionMethod: sanitizeValue(session.connection_method || 'unknown'),
            clientIp: sanitizeValue(session.client_ip || 'N/A'),
            routerInfo: session.router_info,
            dataSource: sanitizeValue(session.data_source || session.source || 'unknown')
        };
    };

    const formatDuration = (seconds: number): string => {
        if (!seconds) return '0m';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('es-DO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatSpeed = (bps: number): string => {
        try {
            if (!bps || bps === 0 || isNaN(Number(bps))) return '0 bps';
            
            const k = 1000;
            const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps'];
            const numBps = Number(bps);
            if (numBps <= 0 || isNaN(numBps)) return '0 bps';
            
            const i = Math.max(0, Math.min(sizes.length - 1, Math.floor(Math.log(numBps) / Math.log(k))));
            const value = parseFloat((numBps / Math.pow(k, i)).toFixed(1));
            return `${value} ${sizes[i]}`;
        } catch (error) {
            console.error('Error formatting speed:', error);
            return '0 bps';
        }
    };

    const getSessionIcon = (session: Session): string => {
        if (session.type === 'connected') {
            return session.status === 'current' ? 'wifi' : 'check-circle';
        } else {
            return 'wifi-off';
        }
    };

    const getSessionColor = (session: Session): string => {
        if (session.type === 'connected') {
            return session.status === 'current' ? '#10B981' : '#059669';
        } else {
            return '#EF4444';
        }
    };

    const getSessionBorderColor = (session: Session): string => {
        if (session.type === 'connected') {
            return session.status === 'current' ? '#10B981' : '#D1FAE5';
        } else {
            return '#FEE2E2';
        }
    };

    // Si hay datos del backend, úsalos; sino, no mostrar nada
    // Recalcular cuando cambie currentTime para actualizar duraciones en tiempo real
    const sessions: Session[] = historyData && Array.isArray(historyData) ? historyData.map(transformBackendSession) : [];
    const totalSessions = sessions.length;

    // Definir summary a partir de uptimeData o null si no existe
    const summary = uptimeData && uptimeData.summary ? uptimeData.summary : null;

    // Función para renderizar timeline temporal corregido
    const renderTemporalTimeline = () => {
        const timeline = buildConnectionTimeline();
        
        if (!timeline || timeline.events.length === 0) {
            // Determinar si es conexión nueva o hay problema de datos
            const isNewConnection = !historyData && !uptimeData && !extendedHistoryData;
            
            return (
                <View style={{
                    backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 15,
                    alignItems: 'center'
                }}>
                    <Icon 
                        name={isNewConnection ? "schedule" : "timeline"} 
                        size={40} 
                        color={isDarkMode ? '#6B7280' : '#9CA3AF'} 
                    />
                    <Text style={{
                        marginTop: 8,
                        fontSize: 14,
                        fontWeight: '600',
                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                        textAlign: 'center'
                    }}>
                        {isNewConnection ? 'Conexión Nueva' : 'Sin eventos temporales disponibles'}
                    </Text>
                    <Text style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: isDarkMode ? '#6B7280' : '#9CA3AF',
                        textAlign: 'center'
                    }}>
                        {isNewConnection 
                            ? 'El historial se generará una vez que la conexión esté activa'
                            : 'No se encontraron eventos de conexión en las últimas 48 horas'
                        }
                    </Text>
                </View>
            );
        }

        return (
            <View style={{
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                borderRadius: 12,
                padding: 16,
                marginBottom: 15,
                ...styles.cardShadow
            }}>
                {/* Header del timeline */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="timeline" size={20} color={isDarkMode ? '#10B981' : '#059669'} />
                        <Text style={{
                            marginLeft: 8,
                            fontSize: 16,
                            fontWeight: '600',
                            color: isDarkMode ? '#F9FAFB' : '#111827'
                        }}>
                            Timeline Temporal
                        </Text>
                    </View>
                    <View style={{
                        backgroundColor: timeline.confidence_score > 80 ? '#10B981' : 
                                        timeline.confidence_score > 60 ? '#F59E0B' : '#EF4444',
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 2
                    }}>
                        <Text style={{
                            color: 'white',
                            fontSize: 10,
                            fontWeight: '600'
                        }}>
                            {timeline.confidence_score}% CONFIANZA
                        </Text>
                    </View>
                </View>

                {/* Inconsistencias detectadas */}
                {!!(timeline.inconsistencies.length > 0) && (
                    <View style={{
                        backgroundColor: isDarkMode ? '#7F1D1D' : '#FEF2F2',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 16,
                        borderLeftWidth: 4,
                        borderLeftColor: '#EF4444'
                    }}>
                        <Text style={{
                            fontSize: 12,
                            fontWeight: '600',
                            color: isDarkMode ? '#FCA5A5' : '#DC2626',
                            marginBottom: 4
                        }}>
                            Inconsistencias Detectadas:
                        </Text>
                        {timeline.inconsistencies.map((issue, index) => (
                            <Text key={index} style={{
                                fontSize: 11,
                                color: isDarkMode ? '#F87171' : '#B91C1C',
                                marginBottom: 2
                            }}>
                                • {issue.description}
                            </Text>
                        ))}
                    </View>
                )}

                {/* Eventos del timeline */}
                <ScrollView style={{ maxHeight: 300 }}>
                    {timeline.events.map((event, index) => (
                        <View key={index} style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 12,
                            paddingLeft: 8
                        }}>
                            {/* Línea vertical del timeline */}
                            <View style={{
                                width: 2,
                                height: index === timeline.events.length - 1 ? 20 : 32,
                                backgroundColor: event.type === 'connect' ? '#10B981' : '#EF4444',
                                marginRight: 12
                            }} />
                            
                            {/* Círculo del evento */}
                            <View style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: event.type === 'connect' ? '#10B981' : '#EF4444',
                                marginRight: 12,
                                marginLeft: -18
                            }} />
                            
                            {/* Contenido del evento */}
                            <View style={{ flex: 1 }}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <Text style={{
                                        fontSize: 14,
                                        fontWeight: '600',
                                        color: isDarkMode ? '#F9FAFB' : '#111827'
                                    }}>
                                        {event.type === 'connect' ? 'Conexión Establecida' : 'Conexión Perdida'}
                                    </Text>
                                    <Text style={{
                                        fontSize: 10,
                                        color: event.confidence === 'high' ? '#10B981' : 
                                               event.confidence === 'medium' ? '#F59E0B' : '#EF4444',
                                        fontWeight: '600'
                                    }}>
                                        {String(event.confidence || 'unknown').toUpperCase()}
                                    </Text>
                                </View>
                                
                                <Text style={{
                                    fontSize: 12,
                                    color: isDarkMode ? '#9CA3AF' : '#6B7280',
                                    marginTop: 2
                                }}>
                                    {new Date(event.timestamp).toLocaleString()}
                                </Text>
                                
                                {!!event.metadata.timestamp_corrected && (
                                    <Text style={{
                                        fontSize: 10,
                                        color: '#F59E0B',
                                        marginTop: 2,
                                        fontStyle: 'italic'
                                    }}>
                                        ⚠️ Timestamp corregido desde futuro
                                    </Text>
                                )}
                                
                                {!!event.metadata.duration_corrected && (
                                    <Text style={{
                                        fontSize: 10,
                                        color: '#F59E0B',
                                        marginTop: 2,
                                        fontStyle: 'italic'
                                    }}>
                                        ⚠️ Duración corregida (era estática)
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Estado actual */}
                <View style={{
                    backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                    borderRadius: 8,
                    padding: 12,
                    marginTop: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon 
                            name="wifi" 
                            size={16} 
                            color={timeline.current_status.status === 'online' ? '#10B981' : '#EF4444'} 
                        />
                        <Text style={{
                            marginLeft: 8,
                            fontSize: 14,
                            fontWeight: '600',
                            color: isDarkMode ? '#F9FAFB' : '#111827'
                        }}>
                            Estado Actual: {String(timeline.current_status.status || 'DESCONOCIDO').toUpperCase()}
                        </Text>
                    </View>
                    <Text style={{
                        fontSize: 10,
                        color: isDarkMode ? '#9CA3AF' : '#6B7280'
                    }}>
                        Verificado: {new Date(timeline.last_verified).toLocaleTimeString()}
                    </Text>
                </View>
            </View>
        );
    };

    // Detectar si los datos parecen ser mock o incoherentes
    const detectDataIssues = (): string | null => {
        if (sessions.length === 0) return null;
        
        const now = new Date();
        const hasCurrentSession = sessions.some(s => s.status === 'current');
        const hasRecentData = sessions.some(s => {
            const timeDiff = now.getTime() - s.startTime.getTime();
            return timeDiff < 2 * 60 * 60 * 1000; // Últimas 2 horas
        });
        
        // Detectar problemas con timestamps y duraciones (reutilizar 'now' ya declarado)
        const hasFutureTimestamps = historyData && historyData.some(s => 
            new Date(s.start_time).getTime() > now.getTime()
        );
        
        if (hasFutureTimestamps) {
            return `⚠️ Backend enviando timestamps futuros. Problema de sincronización de relojes. Usando cálculo corregido del frontend.`;
        }
        
        const staticDurationValue = historyData && historyData.length > 0 ? historyData[0].duration_seconds : null;
        const hasStaticDurations = historyData && historyData.every(s => s.duration_seconds === staticDurationValue);
        if (hasStaticDurations && (staticDurationValue === 300 || staticDurationValue === 240)) {
            return `⚠️ Backend enviando duraciones estáticas (${Math.floor(staticDurationValue/60)} min). Usando cálculo en tiempo real del frontend.`;
        }
        
        if (!hasCurrentSession && realtimeData?.status === 'online') {
            return 'La conexión está en línea pero no hay sesión actual en el historial.';
        }
        
        if (!hasRecentData) {
            return 'Los datos del historial parecen antiguos. Si la conexión es activa, deberían aparecer sesiones recientes.';
        }
        
        return null;
    };

    const dataIssueWarning = detectDataIssues();

    return (
        <View style={[styles.sectionCard, { marginTop: 15 }]}>
            <View style={styles.sectionHeader}>
                <View style={styles.headerLeft}>
                    <Icon name="monitor-heart" size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                    <Text style={styles.sectionTitle}>Monitoreo de Conexión</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {!!bestHistoryEndpoint && (
                        <View style={{
                            backgroundColor: '#10B981',
                            borderRadius: 6,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            marginRight: 8
                        }}>
                            <Text style={{
                                color: 'white',
                                fontSize: 9,
                                fontWeight: '600'
                            }}>
                                EXTENDIDO
                            </Text>
                        </View>
                    )}
                    <View style={[styles.headerBadge, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                        <Text style={[styles.badgeText, { fontSize: 10 }]}>
                            {totalSessions}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Loading eliminado - La página se muestra inmediatamente */}

            {/* Estado de error */}
            {!!error && (
                <View style={{
                    backgroundColor: isDarkMode ? '#1F2937' : '#FEF2F2',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 15,
                    borderLeftWidth: 4,
                    borderLeftColor: '#EF4444'
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="error" size={16} color="#EF4444" />
                        <Text style={{
                            marginLeft: 8,
                            fontSize: 12,
                            color: isDarkMode ? '#F87171' : '#DC2626',
                            fontWeight: '600'
                        }}>
                            Error al obtener historial
                        </Text>
                    </View>
                    <Text style={{
                        fontSize: 11,
                        color: isDarkMode ? '#F87171' : '#DC2626',
                        marginTop: 4,
                        lineHeight: 16
                    }}>
                        {error}
                    </Text>
                    <TouchableOpacity 
                        style={{
                            marginTop: 12,
                            backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                            borderRadius: 6,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            alignSelf: 'flex-start'
                        }}
                        onPress={fetchAllConnectionData}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="refresh" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <Text style={{
                                marginLeft: 6,
                                fontSize: 12,
                                color: isDarkMode ? '#9CA3AF' : '#6B7280',
                                fontWeight: '600'
                            }}>
                                Reintentar
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* Timeline Temporal - Nueva funcionalidad - Siempre visible */}
            {!error && (
                renderTemporalTimeline()
            )}

            {/* Resumen de estadísticas */}
            {!!summary && !error && (
                <View style={{
                    backgroundColor: isDarkMode ? '#1F2937' : '#F0F9FF',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 15,
                    borderLeftWidth: 4,
                    borderLeftColor: '#3B82F6'
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Icon name="analytics" size={16} color="#3B82F6" />
                        <Text style={{
                            marginLeft: 8,
                            fontSize: 12,
                            color: isDarkMode ? '#93C5FD' : '#1D4ED8',
                            fontWeight: '600'
                        }}>
                            Estadísticas 24h
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{
                            fontSize: 11,
                            color: isDarkMode ? '#93C5FD' : '#1D4ED8'
                        }}>
                            Uptime: {summary.uptime_percentage_24h ? summary.uptime_percentage_24h.toFixed(1) : '0'}%
                        </Text>
                        <Text style={{
                            fontSize: 11,
                            color: isDarkMode ? '#93C5FD' : '#1D4ED8'
                        }}>
                            Desconexiones: {summary.total_disconnections_24h || 0}
                        </Text>
                    </View>
                </View>
            )}

            {/* Alerta de datos incoherentes */}
            {!!dataIssueWarning && !error && (
                <View style={{
                    backgroundColor: isDarkMode ? '#1F2937' : '#FEF3C7',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 15,
                    borderLeftWidth: 4,
                    borderLeftColor: '#F59E0B'
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="warning" size={16} color="#F59E0B" />
                        <Text style={{
                            marginLeft: 8,
                            fontSize: 12,
                            color: isDarkMode ? '#FCD34D' : '#92400E',
                            fontWeight: '600'
                        }}>
                            Datos incoherentes detectados
                        </Text>
                    </View>
                    <Text style={{
                        fontSize: 11,
                        color: isDarkMode ? '#FCD34D' : '#92400E',
                        marginTop: 4,
                        lineHeight: 16
                    }}>
                        {dataIssueWarning}
                    </Text>
                    <Text style={{
                        fontSize: 10,
                        color: isDarkMode ? '#A78BFA' : '#7C3AED',
                        marginTop: 8,
                        fontStyle: 'italic'
                    }}>
                        💡 Revisa los logs de consola para análisis detallado de coherencia temporal.
                    </Text>
                </View>
            )}

            {/* Estado sin datos */}
            {!error && !!(sessions.length === 0) && (
                <View style={{
                    backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
                    borderRadius: 8,
                    padding: 20,
                    marginBottom: 15,
                    alignItems: 'center'
                }}>
                    <Icon name="timeline" size={48} color={isDarkMode ? '#6B7280' : '#9CA3AF'} />
                    <Text style={{
                        marginTop: 12,
                        fontSize: 14,
                        fontWeight: '600',
                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                        textAlign: 'center'
                    }}>
                        Sin historial disponible
                    </Text>
                    <Text style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: isDarkMode ? '#6B7280' : '#9CA3AF',
                        textAlign: 'center'
                    }}>
                        No se encontraron sesiones de conexión en las últimas 48 horas
                    </Text>
                </View>
            )}

            {/* Lista de sesiones */}
            {!error && !!(sessions.length > 0) && (
                <ScrollView style={{ maxHeight: 400 }}>
                    {sessions.map((session, index) => (
                    <View key={String(session.id || index)} style={{
                        backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                        borderRadius: 12,
                        padding: 15,
                        marginBottom: 12,
                        borderLeftWidth: 4,
                        borderLeftColor: getSessionBorderColor(session),
                        ...styles.cardShadow
                    }}>
                        {/* Header de la sesión */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 10
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon 
                                    name={getSessionIcon(session)} 
                                    size={20} 
                                    color={getSessionColor(session)} 
                                />
                                <Text style={{
                                    marginLeft: 8,
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: isDarkMode ? '#F9FAFB' : '#111827'
                                }}>
                                    {sanitizeValue(session.type) === 'connected' ? 
                                        (sanitizeValue(session.status) === 'current' ? 'Sesión Actual' : `Sesión ${String(sanitizeValue(session.id)).replace('session_', '') || String(index + 1)}`) :
                                        `Desconexión ${String(index + 1)}`
                                    }
                                </Text>
                            </View>
                            
                            {!!(String(sanitizeValue(session.status)) === 'current') && (
                                <View style={{
                                    backgroundColor: '#10B981',
                                    borderRadius: 6,
                                    paddingHorizontal: 8,
                                    paddingVertical: 2
                                }}>
                                    <Text style={{
                                        color: 'white',
                                        fontSize: 10,
                                        fontWeight: '600'
                                    }}>
                                        EN LÍNEA
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Detalles de la sesión */}
                        <View style={{ marginLeft: 28 }}>
                            {/* Duración */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                <Icon name="schedule" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <Text style={{
                                    marginLeft: 6,
                                    fontSize: 13,
                                    color: isDarkMode ? '#D1D5DB' : '#374151'
                                }}>
                                    {String(sanitizeValue(session.type)) === 'connected' ? 'Conectado' : 'Desconectado'}: {formatDuration(session.duration)}
                                </Text>
                            </View>

                            {/* Tiempo */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                <Icon name="access-time" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <Text style={{
                                    marginLeft: 6,
                                    fontSize: 13,
                                    color: isDarkMode ? '#D1D5DB' : '#374151'
                                }}>
                                    {session.endTime ? 
                                        `${formatTime(session.startTime)} - ${formatTime(session.endTime)}` :
                                        `Desde ${formatTime(session.startTime)}`
                                    }
                                </Text>
                            </View>

                            {/* Velocidades (solo para sesiones conectadas) */}
                            {!!(String(sanitizeValue(session.type)) === 'connected') && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                    <Icon name="speed" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <Text style={{
                                        marginLeft: 6,
                                        fontSize: 13,
                                        color: isDarkMode ? '#D1D5DB' : '#374151'
                                    }}>
                                        {`${String(sanitizeValue(session.status)) === 'current' ? 'Actual' : 'Promedio'}: ⬇${formatSpeed(session.averageDownload || 0)} ⬆${formatSpeed(session.averageUpload || 0)}`}
                                    </Text>
                                </View>
                            )}

                            {/* IP del cliente */}
                            {!!session.clientIp && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                    <Icon name="language" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <Text style={{
                                        marginLeft: 6,
                                        fontSize: 13,
                                        color: isDarkMode ? '#D1D5DB' : '#374151'
                                    }}>
                                        IP: {String(sanitizeValue(session.clientIp) || 'No disponible')}
                                        {!!(session.connectionMethod && sanitizeValue(session.connectionMethod) !== 'unknown') && (
                                            <Text style={{ color: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 11 }}>
                                                {' '}({String(sanitizeValue(session.connectionMethod)).toUpperCase()})
                                            </Text>
                                        )}
                                    </Text>
                                </View>
                            )}

                            {/* Router info */}
                            {!!session.routerInfo && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                    <Icon name="router" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <Text style={{
                                        marginLeft: 6,
                                        fontSize: 13,
                                        color: isDarkMode ? '#D1D5DB' : '#374151'
                                    }}>
                                        Router: {String(sanitizeValue(session.routerInfo?.router_name) || 'No especificado')}
                                    </Text>
                                </View>
                            )}

                            {/* Fuente de datos */}
                            {!!(session.dataSource && String(sanitizeValue(session.dataSource)) !== 'unknown') && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                    <Icon name="source" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <Text style={{
                                        marginLeft: 6,
                                        fontSize: 11,
                                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                                        fontStyle: 'italic'
                                    }}>
                                        Fuente: {String(sanitizeValue(session.dataSource)) === 'mikrotik' ? '📡 Mikrotik' : '💾 Base de datos'}
                                    </Text>
                                </View>
                            )}

                            {/* Razón */}
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name="info" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <Text style={{
                                    marginLeft: 6,
                                    fontSize: 13,
                                    color: isDarkMode ? '#9CA3AF' : '#6B7280',
                                    fontStyle: 'italic'
                                }}>
                                    {String(sanitizeValue(session.reason) || 'Sin información')}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
                </ScrollView>
            )}

            {/* Footer con información técnica */}
            {(
                <View style={{
                    marginTop: 15,
                    padding: 12,
                    backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6',
                    borderRadius: 8
                }}>
                    <Text style={{
                        fontSize: 11,
                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                        textAlign: 'center',
                        fontStyle: 'italic'
                    }}>
                        {error ? 
                            '⚠️ Error al consultar sistema de monitoreo. Verificando endpoints disponibles...' :
                            sessions.length > 0 ?
                            `📊 Sistema de polling activo - Mostrando datos de monitoreo${debugDataSent ? ' 🤖' : ''}` :
                            '💡 Sistema de polling configurado - Datos de monitoreo disponibles'
                        }
                    </Text>
                </View>
            )}
        </View>
    );
    } catch (error) {
        console.error('🚨 ConnectionHistoryModern render error:', error);
        return (
            <View style={[styles.sectionCard, { marginTop: 15 }]}>
                <View style={styles.sectionHeader}>
                    <View style={styles.headerLeft}>
                        <Icon name="error" size={24} color="#EF4444" />
                        <Text style={styles.sectionTitle}>Error de Renderizado</Text>
                    </View>
                </View>
                <View style={styles.sectionContent}>
                    <Text style={{ color: isDarkMode ? '#ccc' : '#666' }}>
                        Error al mostrar historial de conexión. Revise la consola para más detalles.
                    </Text>
                </View>
            </View>
        );
    }
};

export default ConnectionHistoryModern;