import { useState, useCallback } from 'react';

interface ProgressStep {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'error';
    message?: string;
    timestamp?: string;
}

interface UseOperationProgressReturn {
    isVisible: boolean;
    steps: ProgressStep[];
    currentStep: number;
    overallProgress: number;
    startOperation: (operationSteps: Omit<ProgressStep, 'status'>[]) => void;
    updateStep: (stepId: string, updates: Partial<ProgressStep>) => void;
    completeStep: (stepId: string, message?: string) => void;
    errorStep: (stepId: string, message?: string) => void;
    nextStep: () => void;
    closeModal: () => void;
}

export const useOperationProgress = (): UseOperationProgressReturn => {
    const [isVisible, setIsVisible] = useState(false);
    const [steps, setSteps] = useState<ProgressStep[]>([]);
    const [currentStep, setCurrentStep] = useState(0);

    const startOperation = useCallback((operationSteps: Omit<ProgressStep, 'status'>[]) => {
        const initialSteps = operationSteps.map(step => ({
            ...step,
            status: 'pending' as const
        }));
        
        setSteps(initialSteps);
        setCurrentStep(0);
        setIsVisible(true);
        
        // Iniciar el primer paso
        if (initialSteps.length > 0) {
            setSteps(prev => prev.map((step, index) => 
                index === 0 
                    ? { ...step, status: 'in_progress', timestamp: new Date().toLocaleTimeString() }
                    : step
            ));
        }
    }, []);

    const updateStep = useCallback((stepId: string, updates: Partial<ProgressStep>) => {
        setSteps(prev => prev.map(step => 
            step.id === stepId 
                ? { ...step, ...updates, timestamp: new Date().toLocaleTimeString() }
                : step
        ));
    }, []);

    const completeStep = useCallback((stepId: string, message?: string) => {
        setSteps(prev => prev.map(step => 
            step.id === stepId 
                ? { 
                    ...step, 
                    status: 'completed', 
                    message,
                    timestamp: new Date().toLocaleTimeString()
                }
                : step
        ));
    }, []);

    const errorStep = useCallback((stepId: string, message?: string) => {
        setSteps(prev => prev.map(step => 
            step.id === stepId 
                ? { 
                    ...step, 
                    status: 'error', 
                    message,
                    timestamp: new Date().toLocaleTimeString()
                }
                : step
        ));
    }, []);

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
    }, []);

    const closeModal = useCallback(() => {
        setIsVisible(false);
        setSteps([]);
        setCurrentStep(0);
    }, []);

    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const overallProgress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

    return {
        isVisible,
        steps,
        currentStep,
        overallProgress,
        startOperation,
        updateStep,
        completeStep,
        errorStep,
        nextStep,
        closeModal
    };
};