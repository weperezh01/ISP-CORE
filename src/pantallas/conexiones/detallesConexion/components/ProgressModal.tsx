import React from 'react';
import {
    View,
    Text,
    Modal,
    ActivityIndicator,
    Dimensions,
    ScrollView
} from 'react-native';
import { useTheme } from '../../../../../ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

interface ProgressStep {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'error';
    message?: string;
    timestamp?: string;
    serverProgress?: number;
    serverMessage?: string;
}

interface ProgressModalProps {
    visible: boolean;
    title: string;
    steps: ProgressStep[];
    onComplete?: () => void;
    currentStep?: number;
    overallProgress?: number;
    isWebSocketConnected?: boolean;
    webSocketError?: string | null;
}

const ProgressModal: React.FC<ProgressModalProps> = ({
    visible,
    title,
    steps,
    onComplete,
    currentStep = 0,
    overallProgress = 0,
    isWebSocketConnected = false,
    webSocketError = null
}) => {
    const { isDarkMode } = useTheme();

    const getStepIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <Icon name="check-circle" size={24} color="#10B981" />;
            case 'in_progress':
                return <ActivityIndicator size="small" color="#3B82F6" />;
            case 'error':
                return <Icon name="error" size={24} color="#EF4444" />;
            default:
                return <Icon name="radio-button-unchecked" size={24} color={isDarkMode ? '#6B7280' : '#9CA3AF'} />;
        }
    };

    const getStepTextColor = (status: string) => {
        switch (status) {
            case 'completed':
                return '#10B981';
            case 'in_progress':
                return '#3B82F6';
            case 'error':
                return '#EF4444';
            default:
                return isDarkMode ? '#9CA3AF' : '#6B7280';
        }
    };

    const styles = {
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContainer: {
            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
            borderRadius: 16,
            padding: 24,
            width: width * 0.9,
            maxWidth: 400,
            maxHeight: '80%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
        },
        title: {
            fontSize: 20,
            fontWeight: '600',
            color: isDarkMode ? '#F9FAFB' : '#1F2937',
            textAlign: 'center',
            marginBottom: 16,
        },
        connectionStatus: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
        },
        connectionStatusText: {
            fontSize: 12,
            marginLeft: 8,
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
        },
        connectionError: {
            backgroundColor: '#FEF2F2',
            borderColor: '#FECACA',
            borderWidth: 1,
        },
        connectionErrorText: {
            color: '#DC2626',
        },
        progressBarContainer: {
            backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
            borderRadius: 8,
            height: 8,
            marginBottom: 24,
            overflow: 'hidden',
        },
        progressBar: {
            backgroundColor: '#3B82F6',
            height: '100%',
            borderRadius: 8,
            transition: 'width 0.3s ease',
        },
        progressText: {
            textAlign: 'center',
            fontSize: 12,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            marginBottom: 16,
        },
        stepsContainer: {
            flex: 1,
        },
        stepItem: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 16,
            paddingVertical: 8,
        },
        stepIcon: {
            marginRight: 12,
            marginTop: 2,
        },
        stepContent: {
            flex: 1,
        },
        stepTitle: {
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 4,
        },
        stepDescription: {
            fontSize: 12,
            marginBottom: 4,
        },
        stepMessage: {
            fontSize: 11,
            fontStyle: 'italic',
            opacity: 0.8,
        },
        stepTimestamp: {
            fontSize: 10,
            color: isDarkMode ? '#6B7280' : '#9CA3AF',
            marginTop: 4,
        },
        currentStepHighlight: {
            backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
            borderRadius: 8,
            paddingHorizontal: 8,
        },
        serverProgressContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
        },
        serverProgressBar: {
            flex: 1,
            height: 4,
            backgroundColor: isDarkMode ? '#4B5563' : '#E5E7EB',
            borderRadius: 2,
            marginRight: 8,
            overflow: 'hidden',
        },
        serverProgressFill: {
            height: '100%',
            backgroundColor: '#3B82F6',
            borderRadius: 2,
        },
        serverProgressText: {
            fontSize: 10,
            color: '#3B82F6',
            fontWeight: '600',
            minWidth: 35,
            textAlign: 'right',
        },
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {}}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>{title}</Text>
                    
                    {/* Connection Status */}
                    <View style={[
                        styles.connectionStatus,
                        webSocketError && styles.connectionError
                    ]}>
                        <Icon 
                            name={webSocketError ? "error" : (isWebSocketConnected ? "wifi" : "wifi_off")} 
                            size={16} 
                            color={webSocketError ? "#DC2626" : (isWebSocketConnected ? "#10B981" : "#6B7280")} 
                        />
                        <Text style={[
                            styles.connectionStatusText,
                            webSocketError && styles.connectionErrorText
                        ]}>
                            {webSocketError ? 'Error de conexión' : 
                             (isWebSocketConnected ? 'Conectado al servidor' : 'Desconectado')}
                        </Text>
                    </View>
                    
                    {/* Progress Bar */}
                    <View style={styles.progressBarContainer}>
                        <View 
                            style={[
                                styles.progressBar, 
                                { width: `${overallProgress}%` }
                            ]} 
                        />
                    </View>
                    
                    <Text style={styles.progressText}>
                        {Math.round(overallProgress)}% completado
                    </Text>

                    {/* Steps List */}
                    <ScrollView style={styles.stepsContainer} showsVerticalScrollIndicator={false}>
                        {steps.map((step, index) => (
                            <View 
                                key={step.id}
                                style={[
                                    styles.stepItem,
                                    currentStep === index && styles.currentStepHighlight
                                ]}
                            >
                                <View style={styles.stepIcon}>
                                    {getStepIcon(step.status)}
                                </View>
                                
                                <View style={styles.stepContent}>
                                    <Text 
                                        style={[
                                            styles.stepTitle,
                                            { color: getStepTextColor(step.status) }
                                        ]}
                                    >
                                        {step.title}
                                    </Text>
                                    
                                    <Text 
                                        style={[
                                            styles.stepDescription,
                                            { color: isDarkMode ? '#D1D5DB' : '#4B5563' }
                                        ]}
                                    >
                                        {step.description}
                                    </Text>
                                    
                                    {step.message && (
                                        <Text 
                                            style={[
                                                styles.stepMessage,
                                                { color: getStepTextColor(step.status) }
                                            ]}
                                        >
                                            {step.message}
                                        </Text>
                                    )}
                                    
                                    {step.serverMessage && (
                                        <Text 
                                            style={[
                                                styles.stepMessage,
                                                { 
                                                    color: '#3B82F6',
                                                    fontWeight: '500'
                                                }
                                            ]}
                                        >
                                            🌐 {step.serverMessage}
                                        </Text>
                                    )}
                                    
                                    {step.serverProgress !== undefined && (
                                        <View style={styles.serverProgressContainer}>
                                            <View style={styles.serverProgressBar}>
                                                <View 
                                                    style={[
                                                        styles.serverProgressFill,
                                                        { width: `${step.serverProgress}%` }
                                                    ]}
                                                />
                                            </View>
                                            <Text style={styles.serverProgressText}>
                                                {step.serverProgress}%
                                            </Text>
                                        </View>
                                    )}
                                    
                                    {step.timestamp && (
                                        <Text style={styles.stepTimestamp}>
                                            {step.timestamp}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default ProgressModal;