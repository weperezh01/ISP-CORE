import { useState, useCallback, useRef } from 'react';
import { useWebSocketProgress } from './useWebSocketProgress';
import { useOperationProgress } from './useOperationProgress';

interface RealTimeProgressStep {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'error';
    message?: string;
    timestamp?: string;
    serverProgress?: number;
    serverMessage?: string;
}

interface UseRealTimeProgressReturn {
    isVisible: boolean;
    steps: RealTimeProgressStep[];
    currentStep: number;
    overallProgress: number;
    isWebSocketConnected: boolean;
    webSocketError: string | null;
    startOperation: (operationId: string, operationSteps: Omit<RealTimeProgressStep, 'status'>[]) => Promise<void>;
    updateStep: (stepId: string, updates: Partial<RealTimeProgressStep>) => void;
    completeStep: (stepId: string, message?: string) => void;
    errorStep: (stepId: string, message?: string) => void;
    nextStep: () => void;
    closeModal: () => void;
}

export const useRealTimeProgress = (): UseRealTimeProgressReturn => {
    const [steps, setSteps] = useState<RealTimeProgressStep[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const currentOperationId = useRef<string | null>(null);
    
    const localProgress = useOperationProgress();
    
    const handleServerUpdate = useCallback((update: any) => {
        console.log('📡 [RT-PROGRESS] Actualización del servidor:', update);
        
        // Actualizar el paso correspondiente con información del servidor
        setSteps(prev => prev.map(step => {
            if (step.id === update.step) {
                return {
                    ...step,
                    status: update.status,
                    serverMessage: update.message,
                    serverProgress: update.progress,
                    timestamp: update.timestamp
                };
            }
            return step;
        }));

        // Si el servidor completó un paso, también actualizarlo localmente
        if (update.status === 'completed') {
            localProgress.completeStep(update.step, update.message);
        } else if (update.status === 'error') {
            localProgress.errorStep(update.step, update.message);
        }
    }, [localProgress]);

    const webSocketProgress = useWebSocketProgress(handleServerUpdate);

    const startOperation = useCallback(async (
        operationId: string, 
        operationSteps: Omit<RealTimeProgressStep, 'status'>[]
    ) => {
        console.log('🚀 [RT-PROGRESS] Iniciando operación:', operationId);
        
        currentOperationId.current = operationId;
        
        // Inicializar pasos
        const initialSteps = operationSteps.map(step => ({
            ...step,
            status: 'pending' as const
        }));
        
        setSteps(initialSteps);
        setCurrentStep(0);
        setIsVisible(true);
        
        // Iniciar WebSocket
        await webSocketProgress.startOperation(operationId);
        
        // Iniciar progreso local
        localProgress.startOperation(operationSteps);
    }, [webSocketProgress, localProgress]);

    const updateStep = useCallback((stepId: string, updates: Partial<RealTimeProgressStep>) => {
        setSteps(prev => prev.map(step => 
            step.id === stepId 
                ? { ...step, ...updates, timestamp: new Date().toLocaleTimeString() }
                : step
        ));
        
        // También actualizar progreso local
        localProgress.updateStep(stepId, updates);
    }, [localProgress]);

    const completeStep = useCallback((stepId: string, message?: string) => {
        setSteps(prev => prev.map(step => 
            step.id === stepId 
                ? { 
                    ...step, 
                    status: 'completed',
                    message: message || step.message,
                    timestamp: new Date().toLocaleTimeString()
                }
                : step
        ));
        
        localProgress.completeStep(stepId, message);
    }, [localProgress]);

    const errorStep = useCallback((stepId: string, message?: string) => {
        setSteps(prev => prev.map(step => 
            step.id === stepId 
                ? { 
                    ...step, 
                    status: 'error',
                    message: message || step.message,
                    timestamp: new Date().toLocaleTimeString()
                }
                : step
        ));
        
        localProgress.errorStep(stepId, message);
    }, [localProgress]);

    const nextStep = useCallback(() => {
        setCurrentStep(prev => {
            const nextIndex = prev + 1;
            
            // Actualizar el siguiente paso a "in_progress"
            setSteps(stepsPrev => stepsPrev.map((step, index) => 
                index === nextIndex 
                    ? { ...step, status: 'in_progress', timestamp: new Date().toLocaleTimeString() }
                    : step
            ));
            
            return nextIndex;
        });
        
        localProgress.nextStep();
    }, [localProgress]);

    const closeModal = useCallback(() => {
        console.log('🔒 [RT-PROGRESS] Cerrando modal');
        
        // Detener WebSocket
        webSocketProgress.stopOperation();
        
        // Limpiar estado
        setIsVisible(false);
        setSteps([]);
        setCurrentStep(0);
        currentOperationId.current = null;
        
        // Cerrar progreso local
        localProgress.closeModal();
    }, [webSocketProgress, localProgress]);

    // Calcular progreso general
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const overallProgress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

    return {
        isVisible,
        steps,
        currentStep,
        overallProgress,
        isWebSocketConnected: webSocketProgress.isConnected,
        webSocketError: webSocketProgress.connectionError,
        startOperation,
        updateStep,
        completeStep,
        errorStep,
        nextStep,
        closeModal
    };
};