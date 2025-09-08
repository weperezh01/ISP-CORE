import { useEffect, useRef, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProgressUpdate {
    operation_id: string;
    step: string;
    status: 'in_progress' | 'completed' | 'error';
    message: string;
    progress: number;
    timestamp: string;
}

interface UseWebSocketProgressReturn {
    isConnected: boolean;
    connectionError: string | null;
    startOperation: (operationId: string) => Promise<void>;
    stopOperation: () => void;
    lastUpdate: ProgressUpdate | null;
}

export const useWebSocketProgress = (
    onProgressUpdate: (update: ProgressUpdate) => void
): UseWebSocketProgressReturn => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<ProgressUpdate | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const currentOperationId = useRef<string | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    const connectWebSocket = useCallback(async () => {
        try {
            // Obtener datos del usuario sin token
            const jsonValue = await AsyncStorage.getItem('@loginData');
            const loginData = jsonValue ? JSON.parse(jsonValue) : null;
            
            if (!loginData?.id) {
                throw new Error('No se encontraron datos de usuario');
            }

            // Crear conexión WebSocket con ID de usuario
            const wsUrl = `wss://wellnet-rd.com:444/ws/progress?userId=${loginData.id}`;
            console.log('📡 [WS] Conectando a:', wsUrl);

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('✅ [WS] Conectado exitosamente');
                setIsConnected(true);
                setConnectionError(null);
                reconnectAttempts.current = 0;
            };

            ws.onmessage = (event) => {
                try {
                    const update: ProgressUpdate = JSON.parse(event.data);
                    console.log('📨 [WS] Recibida actualización:', update);
                    
                    // Verificar que el mensaje es para la operación actual
                    if (currentOperationId.current && update.operation_id === currentOperationId.current) {
                        setLastUpdate(update);
                        onProgressUpdate(update);
                    }
                } catch (error) {
                    console.error('❌ [WS] Error parsing message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('❌ [WS] Error de conexión:', error);
                setConnectionError('Error de conexión WebSocket');
                setIsConnected(false);
            };

            ws.onclose = (event) => {
                console.log('🔌 [WS] Conexión cerrada:', event.code, event.reason);
                setIsConnected(false);
                wsRef.current = null;

                // Intentar reconectar si no fue cierre intencional
                if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
                    console.log(`🔄 [WS] Reconectando en ${delay}ms (intento ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
                    
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttempts.current++;
                        connectWebSocket();
                    }, delay);
                }
            };

        } catch (error) {
            console.error('❌ [WS] Error al conectar:', error);
            setConnectionError(error.message);
            setIsConnected(false);
        }
    }, [onProgressUpdate]);

    const startOperation = useCallback(async (operationId: string) => {
        console.log('🚀 [WS] Iniciando operación:', operationId);
        currentOperationId.current = operationId;
        
        // Conectar si no está conectado
        if (!isConnected && !wsRef.current) {
            await connectWebSocket();
        }
        
        // Enviar mensaje de inicio de operación
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'start_operation',
                operation_id: operationId
            }));
        }
    }, [isConnected, connectWebSocket]);

    const stopOperation = useCallback(() => {
        console.log('🛑 [WS] Deteniendo operación:', currentOperationId.current);
        
        // Enviar mensaje de stop si está conectado
        if (wsRef.current?.readyState === WebSocket.OPEN && currentOperationId.current) {
            wsRef.current.send(JSON.stringify({
                type: 'stop_operation',
                operation_id: currentOperationId.current
            }));
        }
        
        currentOperationId.current = null;
        setLastUpdate(null);
    }, []);

    const cleanup = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        
        if (wsRef.current) {
            wsRef.current.close(1000, 'Cleanup');
            wsRef.current = null;
        }
        
        setIsConnected(false);
        setConnectionError(null);
        setLastUpdate(null);
        currentOperationId.current = null;
    }, []);

    // Cleanup al desmontar
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return {
        isConnected,
        connectionError,
        startOperation,
        stopOperation,
        lastUpdate
    };
};