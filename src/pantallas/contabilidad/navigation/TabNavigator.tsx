import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import ConfiguracionScreen from '../screens/Configuracion/ConfiguracionScreen';
import BalanceGeneralScreen from '../screens/Reportes/BalanceGeneralScreen';
import EstadoResultadosScreen from '../screens/Reportes/EstadoResultadosScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="TabNavigator">
                <Stack.Screen 
                    name="TabNavigator" 
                    component={TabNavigator} 
                    options={{ headerShown: false }} 
                />
                <Stack.Screen 
                    name="Configuracion" 
                    component={ConfiguracionScreen} 
                    options={{ title: 'Configuración' }} 
                />
                <Stack.Screen 
                    name="BalanceGeneral" 
                    component={BalanceGeneralScreen} 
                    options={{ title: 'Balance General' }} 
                />
                <Stack.Screen 
                    name="EstadoResultados" 
                    component={EstadoResultadosScreen} 
                    options={{ title: 'Estado de Resultados' }} 
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
