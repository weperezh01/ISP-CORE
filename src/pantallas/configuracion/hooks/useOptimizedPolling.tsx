import { useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { POLLING_INTERVALS } from '../constants/configurationConstants';

interface PollingConfig {
  enabled: boolean;
  interval: number;
  immediate?: boolean;
  onFocusOnly?: boolean;
}

export const useOptimizedPolling = (
  callback: () => Promise<void> | void,
  config: PollingConfig
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);

  const startPolling = useCallback(() => {
    if (!config.enabled || isActiveRef.current) return;

    isActiveRef.current = true;

    // Llamada inmediata si se requiere
    if (config.immediate) {
      callback();
    }

    // Configurar intervalo
    intervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        callback();
      }
    }, config.interval);
  }, [callback, config.enabled, config.immediate, config.interval]);

  const stopPolling = useCallback(() => {
    isActiveRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Si onFocusOnly es true, usar useFocusEffect
  useFocusEffect(
    useCallback(() => {
      if (config.onFocusOnly) {
        startPolling();
        return stopPolling;
      }
      return () => {};
    }, [config.onFocusOnly, startPolling, stopPolling])
  );

  // Si onFocusOnly es false, usar useEffect normal
  useEffect(() => {
    if (!config.onFocusOnly) {
      startPolling();
      return stopPolling;
    }
  }, [config.onFocusOnly, startPolling, stopPolling]);

  return {
    startPolling,
    stopPolling,
    isActive: isActiveRef.current,
  };
};

// Hook específico para leases DHCP
export const useLeasesPolling = (
  routerId: string | null,
  callback: (routerId: string) => Promise<void>,
  enabled: boolean = true
) => {
  const pollingCallback = useCallback(async () => {
    if (routerId) {
      await callback(routerId);
    }
  }, [routerId, callback]);

  return useOptimizedPolling(pollingCallback, {
    enabled: enabled && !!routerId,
    interval: POLLING_INTERVALS.LEASES_REFRESH,
    immediate: true,
    onFocusOnly: true, // Solo polling cuando la pantalla está enfocada
  });
};

// Hook específico para redes
export const useNetworksPolling = (
  routerId: string | null,
  callback: (routerId: string) => Promise<void>,
  enabled: boolean = true
) => {
  const pollingCallback = useCallback(async () => {
    if (routerId) {
      await callback(routerId);
    }
  }, [routerId, callback]);

  return useOptimizedPolling(pollingCallback, {
    enabled: enabled && !!routerId,
    interval: POLLING_INTERVALS.NETWORKS_REFRESH,
    immediate: true,
    onFocusOnly: false, // Las redes cambian menos frecuentemente
  });
};

// Hook específico para routers
export const useRoutersPolling = (
  callback: () => Promise<void>,
  enabled: boolean = true
) => {
  return useOptimizedPolling(callback, {
    enabled,
    interval: POLLING_INTERVALS.ROUTERS_REFRESH,
    immediate: true,
    onFocusOnly: false, // Los routers cambian muy raramente
  });
};

export default useOptimizedPolling;