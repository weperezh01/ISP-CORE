import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from './OLTDashboardScreenStyles';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../../componentes/themeSwitch';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getOltsSummary } from './services/api';
import { OltSummary } from './services/types';

const OLTDashboardScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [summary, setSummary] = useState<OltSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user data from storage
  const obtenerDatosUsuario = useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@loginData');
      if (jsonValue != null) {
        const userData = JSON.parse(jsonValue);
        setAuthToken(userData.token);
      }
    } catch (e) {
      console.error('Error al leer el token del usuario', e);
    }
  }, []);

  // Fetch summary data
  const fetchSummary = useCallback(
    async (forceRefresh = false) => {
      if (!authToken) {
        console.log('⚠️ [Dashboard] No auth token available yet');
        return;
      }

      try {
        if (forceRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        console.log('🔍 [Dashboard] Fetching OLT summary...');
        const response = await getOltsSummary(authToken);

        if (response.success && response.data) {
          setSummary(response.data);
          console.log('✅ [Dashboard] Summary loaded:', response.data);
        } else {
          throw new Error(response.error || 'Error desconocido');
        }
      } catch (error: any) {
        console.error('❌ [Dashboard] Error:', error);
        setError(error.message || 'Error al cargar el dashboard');
        Alert.alert('Error', 'No se pudo cargar el resumen de OLTs');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [authToken]
  );

  // Initial load
  useEffect(() => {
    obtenerDatosUsuario();
  }, [obtenerDatosUsuario]);

  useEffect(() => {
    if (authToken) {
      fetchSummary();
    }
  }, [authToken, fetchSummary]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      if (authToken) {
        fetchSummary(true);
      }
      return () => {};
    }, [authToken, fetchSummary])
  );

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    fetchSummary(true);
  }, [fetchSummary]);

  // Handle card press
  const handleCardPress = (filterType: string) => {
    // Navigate to ONUs list with filter pre-applied
    navigation.navigate('ONUsListScreen', {
      defaultFilter: filterType,
    });
  };

  // Render loading state
  if (isLoading && !summary) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Cargando dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Dashboard OLTs</Text>
              <Text style={styles.headerSubtitle}>Estado general de ONUs</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={isRefreshing}
            >
              <Icon
                name={isRefreshing ? 'loading' : 'refresh'}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <ThemeSwitch />
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#10B981"
          />
        }
      >
        {error && !summary ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={64} color="#EF4444" />
            <Text style={styles.errorTitle}>Error al cargar</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Waiting Authorization Card */}
            <TouchableOpacity
              style={[styles.card, styles.cardWaiting]}
              onPress={() => handleCardPress('pending')}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Icon name="clock-alert" size={40} color="#3B82F6" />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Waiting Authorization</Text>
                  <Text style={[styles.cardCount, { color: '#3B82F6' }]}>
                    {summary?.waiting_authorization?.total || 0}
                  </Text>
                </View>
              </View>
              <View style={styles.cardBreakdown}>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>D</Text>
                  <Text style={styles.breakdownValue}>
                    {summary?.waiting_authorization?.discovered || 0}
                  </Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Resync</Text>
                  <Text style={styles.breakdownValue}>
                    {summary?.waiting_authorization?.resync || 0}
                  </Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>New</Text>
                  <Text style={styles.breakdownValue}>
                    {summary?.waiting_authorization?.new || 0}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Online Card */}
            <TouchableOpacity
              style={[styles.card, styles.cardOnline]}
              onPress={() => handleCardPress('online')}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Icon name="check-circle" size={40} color="#10B981" />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Online</Text>
                  <Text style={[styles.cardCount, { color: '#10B981' }]}>
                    {summary?.online?.total || 0}
                  </Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardFooterText}>
                  Total authorized: {summary?.online?.authorized || 0}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Total Offline Card */}
            <TouchableOpacity
              style={[styles.card, styles.cardOffline]}
              onPress={() => handleCardPress('offline')}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Icon name="close-circle" size={40} color="#6B7280" />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Total Offline</Text>
                  <Text style={[styles.cardCount, { color: '#6B7280' }]}>
                    {summary?.offline?.total || 0}
                  </Text>
                </View>
              </View>
              <View style={styles.cardBreakdown}>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>PwrFail</Text>
                  <Text style={styles.breakdownValue}>
                    {summary?.offline?.power_fail || 0}
                  </Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>LoS</Text>
                  <Text style={styles.breakdownValue}>
                    {summary?.offline?.los || 0}
                  </Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>N/A</Text>
                  <Text style={styles.breakdownValue}>
                    {summary?.offline?.na || 0}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Low Signals Card */}
            <TouchableOpacity
              style={[styles.card, styles.cardLowSignal]}
              onPress={() => handleCardPress('low_signal')}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Icon name="signal-variant" size={40} color="#F59E0B" />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Low Signals</Text>
                  <Text style={[styles.cardCount, { color: '#F59E0B' }]}>
                    {summary?.low_signals?.total || 0}
                  </Text>
                </View>
              </View>
              <View style={styles.cardBreakdown}>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Warning</Text>
                  <Text style={styles.breakdownValue}>
                    {summary?.low_signals?.warning || 0}
                  </Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Critical</Text>
                  <Text style={styles.breakdownValue}>
                    {summary?.low_signals?.critical || 0}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Quick Actions */}
            <View style={styles.actionsSection}>
              <Text style={styles.actionsSectionTitle}>Acciones Rápidas</Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  navigation.navigate('ONUsListScreen', { defaultFilter: 'all' })
                }
              >
                <Icon name="format-list-bulleted" size={24} color="#3B82F6" />
                <Text style={styles.actionButtonText}>Ver Todas las ONUs</Text>
                <Icon name="chevron-right" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default OLTDashboardScreen;
