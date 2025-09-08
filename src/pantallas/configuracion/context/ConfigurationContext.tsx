import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Tipos para el estado de configuración
export interface ConfigurationState {
  connectionId: string | null;
  clientData: {
    nombres: string;
    apellidos: string;
    direccion: string;
  } | null;
  selectedRouter: {
    id_router: string;
    label: string;
    descripcion: string;
  } | null;
  selectedNetwork: {
    label: string;
    value: string;
  } | null;
  ipConfiguration: {
    direccionIp: string;
    subidaLimite: string;
    bajadaLimite: string;
    unidadSubida: string;
    unidadBajada: string;
    nota: string;
  } | null;
  routers: any[];
  networks: any[];
  leases: any[];
  isLoading: boolean;
  error: string | null;
  currentStep: 'router' | 'network' | 'ip' | 'confirmation';
}

// Tipos para las acciones
type ConfigurationAction =
  | { type: 'SET_CONNECTION_ID'; payload: string }
  | { type: 'SET_CLIENT_DATA'; payload: ConfigurationState['clientData'] }
  | { type: 'SET_SELECTED_ROUTER'; payload: ConfigurationState['selectedRouter'] }
  | { type: 'SET_SELECTED_NETWORK'; payload: ConfigurationState['selectedNetwork'] }
  | { type: 'SET_IP_CONFIGURATION'; payload: ConfigurationState['ipConfiguration'] }
  | { type: 'SET_ROUTERS'; payload: any[] }
  | { type: 'SET_NETWORKS'; payload: any[] }
  | { type: 'SET_LEASES'; payload: any[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_STEP'; payload: ConfigurationState['currentStep'] }
  | { type: 'RESET_CONFIGURATION' };

// Estado inicial
const initialState: ConfigurationState = {
  connectionId: null,
  clientData: null,
  selectedRouter: null,
  selectedNetwork: null,
  ipConfiguration: null,
  routers: [],
  networks: [],
  leases: [],
  isLoading: false,
  error: null,
  currentStep: 'router',
};

// Reducer
const configurationReducer = (
  state: ConfigurationState,
  action: ConfigurationAction
): ConfigurationState => {
  switch (action.type) {
    case 'SET_CONNECTION_ID':
      return { ...state, connectionId: action.payload };
    case 'SET_CLIENT_DATA':
      return { ...state, clientData: action.payload };
    case 'SET_SELECTED_ROUTER':
      return { ...state, selectedRouter: action.payload };
    case 'SET_SELECTED_NETWORK':
      return { ...state, selectedNetwork: action.payload };
    case 'SET_IP_CONFIGURATION':
      return { ...state, ipConfiguration: action.payload };
    case 'SET_ROUTERS':
      return { ...state, routers: action.payload };
    case 'SET_NETWORKS':
      return { ...state, networks: action.payload };
    case 'SET_LEASES':
      return { ...state, leases: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'RESET_CONFIGURATION':
      return initialState;
    default:
      return state;
  }
};

// Contexto
interface ConfigurationContextValue {
  state: ConfigurationState;
  dispatch: React.Dispatch<ConfigurationAction>;
  // Acciones conveniencia
  setConnectionId: (id: string) => void;
  setClientData: (data: ConfigurationState['clientData']) => void;
  setSelectedRouter: (router: ConfigurationState['selectedRouter']) => void;
  setSelectedNetwork: (network: ConfigurationState['selectedNetwork']) => void;
  setIpConfiguration: (config: ConfigurationState['ipConfiguration']) => void;
  setRouters: (routers: any[]) => void;
  setNetworks: (networks: any[]) => void;
  setLeases: (leases: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentStep: (step: ConfigurationState['currentStep']) => void;
  resetConfiguration: () => void;
  // Utilidades
  isConfigurationComplete: () => boolean;
  getProgressPercentage: () => number;
}

const ConfigurationContext = createContext<ConfigurationContextValue | undefined>(undefined);

// Provider
interface ConfigurationProviderProps {
  children: ReactNode;
}

export const ConfigurationProvider: React.FC<ConfigurationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(configurationReducer, initialState);

  // Acciones de conveniencia
  const setConnectionId = (id: string) => {
    dispatch({ type: 'SET_CONNECTION_ID', payload: id });
  };

  const setClientData = (data: ConfigurationState['clientData']) => {
    dispatch({ type: 'SET_CLIENT_DATA', payload: data });
  };

  const setSelectedRouter = (router: ConfigurationState['selectedRouter']) => {
    dispatch({ type: 'SET_SELECTED_ROUTER', payload: router });
  };

  const setSelectedNetwork = (network: ConfigurationState['selectedNetwork']) => {
    dispatch({ type: 'SET_SELECTED_NETWORK', payload: network });
  };

  const setIpConfiguration = (config: ConfigurationState['ipConfiguration']) => {
    dispatch({ type: 'SET_IP_CONFIGURATION', payload: config });
  };

  const setRouters = (routers: any[]) => {
    dispatch({ type: 'SET_ROUTERS', payload: routers });
  };

  const setNetworks = (networks: any[]) => {
    dispatch({ type: 'SET_NETWORKS', payload: networks });
  };

  const setLeases = (leases: any[]) => {
    dispatch({ type: 'SET_LEASES', payload: leases });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setCurrentStep = (step: ConfigurationState['currentStep']) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  };

  const resetConfiguration = () => {
    dispatch({ type: 'RESET_CONFIGURATION' });
  };

  // Utilidades
  const isConfigurationComplete = (): boolean => {
    return !!(
      state.connectionId &&
      state.clientData &&
      state.selectedRouter &&
      (state.selectedNetwork || state.ipConfiguration)
    );
  };

  const getProgressPercentage = (): number => {
    let progress = 0;
    if (state.connectionId && state.clientData) progress += 25;
    if (state.selectedRouter) progress += 25;
    if (state.selectedNetwork || state.ipConfiguration) progress += 25;
    if (isConfigurationComplete()) progress += 25;
    return progress;
  };

  const value: ConfigurationContextValue = {
    state,
    dispatch,
    setConnectionId,
    setClientData,
    setSelectedRouter,
    setSelectedNetwork,
    setIpConfiguration,
    setRouters,
    setNetworks,
    setLeases,
    setLoading,
    setError,
    setCurrentStep,
    resetConfiguration,
    isConfigurationComplete,
    getProgressPercentage,
  };

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
};

// Hook personalizado
export const useConfiguration = (): ConfigurationContextValue => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error('useConfiguration must be used within a ConfigurationProvider');
  }
  return context;
};

export default ConfigurationContext;