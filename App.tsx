import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/pantallas/LoginScreen';
import MainScreen from './src/pantallas/superAdmin/MainScreen';
import ConfigScreen from './src/pantallas/ConfigScreen';
import BluetoothDeviceListScreen from './src/pantallas/BluetoothDeviceListScreen';
import FacturacionesScreen from './src/pantallas/factura/Facturaciones';
import DetalleCicloScreen from './src/pantallas/factura/DetalleCiclo';
import ConexionesCicloScreen from './src/pantallas/factura/ConexionesCicloScreen';
import FacturasPendientesScreen from './src/pantallas/FacturasPendientes';
import DetallesFacturaScreen from './src/pantallas/DetallesFactura';
import ReciboScreen from './src/pantallas/ReciboScreen';
import RecibosScreen from './src/pantallas/RecibosScreen';
import FacturasCobradasScreen from './src/pantallas/FacturasCobradasScreen';
import DetalleFacturaScreen from './src/pantallas/DetalleFacturaScreen';
import IspListScreen from './src/pantallas/superAdmin/ispScreen';
import AddIspScreen from './src/pantallas/addIspScreen';
import IspDetailsScreen from './src/pantallas/operaciones/IspDetailsScreen';
import ClientListScreen from './src/pantallas/cliente/ClientesScreen';
import AddClientScreen from './src/pantallas/AddClienteScreen';
import ClientDetailsScreen from './src/pantallas/cliente/ClientDetailsScreen';
import ServiciosScreen from './src/pantallas/ServiciosScreen';
import AddServiceScreen from './src/pantallas/AddServiceScreen';
import AsignacionServicioClienteScreen from './src/pantallas/AsignacionServicioClienteScreen';
import BaseCicloScreen from './src/pantallas/BaseCicloScreen';
import AddCicloBase from './src/pantallas/AddCicloBase';
import ConexionesScreen from './src/pantallas/conexiones/ConexionesScreen';
import ConexionesEstadisticasScreen from './src/pantallas/conexiones/ConexionesEstadisticasScreen';
import ConexionesActivas from './src/pantallas/conexiones/ConexionesActivas';
import ConexionesAveriadas from './src/pantallas/conexiones/ConexionesAveriadas';
import ConexionesBajaBoluntaria from './src/pantallas/conexiones/ConexionesBajaBoluntaria';
import ConexionesBajaForzada from './src/pantallas/conexiones/ConexionesBajaForzada';
import ConexionesEjecucion from './src/pantallas/conexiones/ConexionesEjecucion';
import ConexionesPendientes from './src/pantallas/conexiones/ConexionesPendientes';
import ConexionesReconexion from './src/pantallas/conexiones/ConexionesReconexion';
import ConexionesSuspendidas from './src/pantallas/conexiones/ConexionesSuspendidas';
import ConexionDetalles from './src/pantallas/conexiones/detallesConexion/ConexionDetalles';
import InstalacionForm from './src/pantallas/instalaciones/InstalacionForm';
import ControlDevicesScreen from './src/pantallas/controles/ControlDevicesScreen';
import RouterListScreen from './src/pantallas/controles/Routers/RouterListScreen';
import AddRouterScreen from './src/pantallas/controles/Routers/AddRouterScreen';
import RouterDetailsScreen from './src/pantallas/controles/Routers/RouterDetailsScreen';
import OLTsListScreen from './src/pantallas/controles/OLTs/OLTsListScreen';
import OLTDetailsScreen from './src/pantallas/controles/OLTs/OLTDetailsScreen';
import ONUsListScreen from './src/pantallas/controles/OLTs/ONUsListScreen';
import InterfaceDetailsScreen from './src/pantallas/controles/Routers/InterfaceDetailsScreen';
import AddVlanScreen from './src/pantallas/controles/Routers/AddVlanScreen';
import AddIpAddressScreen from './src/pantallas/controles/Routers/AddIpAddressScreen';
import ConfiguracionScreen from './src/pantallas/configuracion/ConfiguracionScreen';
import ConfiguracionScreenRedes from './src/pantallas/configuracion/ConfiguracionScreenRedes';
import ConfiguracionScreenIp from './src/pantallas/configuracion/ConfiguracionScreenIp';
import ConfiguracionScreenPppoeVelocidad from './src/pantallas/configuracion/ConfiguracionScreenPppoeVelocidad';
import CrearFactura from './src/pantallas/Facturas/CrearFactura';
import UsuariosScreen from './src/pantallas/usuarios/UsuariosScreen';
import UsuarioDetalleScreen from './src/pantallas/usuarios/UsuarioDetalleScreen';
import IpAddressDetailsScreen from './src/pantallas/controles/Routers/IpAddressDetailsScreen';
import AssignConnectionScreen from './src/pantallas/controles/Routers/AssignConnectionScreen';
import ContabilidadScreen from './src/pantallas/contabilidad/screens/ContabilidadScreen';
import ReporteDetailScreen from './src/pantallas/contabilidad/screens/ReporteDetailScreen';
import PlanDeCuentasScreen from './src/pantallas/contabilidad/screens/cuentas/PlanDeCuentasScreen';
import CuentaDetailScreen from './src/pantallas/contabilidad/screens/cuentas/CuentaDetailScreen';
import InsertarTransaccionScreen from './src/pantallas/contabilidad/screens/transacciones/InsertarTransaccionScreen';
import CuentaFormScreen from './src/pantallas/contabilidad/screens/cuentas/CuentaFormScreen';
import TransaccionesScreen from './src/pantallas/contabilidad/screens/transacciones/TransaccionesScreen';
import TransaccionFormScreen from './src/pantallas/contabilidad/screens/transacciones/TransaccionFormScreen';
import LibroDiarioScreen from './src/pantallas/contabilidad/screens/transacciones/LibroDiarioScreen';
import BalanceGeneralScreen from './src/pantallas/contabilidad/screens/BalanceGeneralScreen';
import EstadoResultadosScreen from './src/pantallas/contabilidad/screens/EstadoResultadosScreen';
import ReportExpensesScreen from './src/pantallas/gastos/ReportExpensesScreen';
import ClienteFacturasScreen from './src/pantallas/cliente/ClienteFacturasScreen';
import Recibos1ClienteScreen from './src/pantallas/recibos/Recibos1ClienteScreen';
import IngresosScreen from './src/pantallas/recibos/IngresosScreen';
import DetalleIngresoScreen from './src/pantallas/recibos/DetalleIngresoScreen';
import RecibosUsuarioScreen from './src/pantallas/usuarios/RecibosUsuarioScreen';
import DetalleIngresoUsuarioScreen from './src/pantallas/usuarios/DetalleIngresoUsuarioScreen';
import LlamadasUsuarioScreen from './src/pantallas/usuarios/LlamadasUsuarioScreen';
import DetalleLlamadasScreen from './src/pantallas/usuarios/DetalleLlamadasScreen';
import SmsUsuarioScreen from './src/pantallas/usuarios/SmsUsuarioScreen';
import WhatsappUsuarioScreen from './src/pantallas/usuarios/WhatsappUsuarioScreen';
import DetalleSMScreen from './src/pantallas/usuarios/DetalleSMScreen';
import DetalleWhatsAppScreen from './src/pantallas/usuarios/DetalleWhatsAppScreen';
import CortesUsuarioScreen from './src/pantallas/usuarios/cortes/CortesUsuarioScreen';
import ReconexionesUsuarioScreen from './src/pantallas/usuarios/reconexiones/ReconexionesUsuarioScreen';
import DetalleCortesScreen from './src/pantallas/usuarios/cortes/DetalleCortesScreen';
import DetalleReconexionesScreen from './src/pantallas/usuarios/reconexiones/DetalleReconexionesScreen';
import EventosScreen from './src/pantallas/conexiones/detallesConexion/EventosScreen';
import DesmantelamientoForm from './src/pantallas/instalaciones/DesmantelamientoForm';
import FacturasEnRevisionScreen from './src/pantallas/Facturas/FacturasRevision';
import ConfiguracionFijarIP from './src/pantallas/configuracion/ConfiguracionFijarIP';
import DetalleFacturaPantalla from './src/pantallas/factura/DetalleFacturaPantalla';
import FacturasScreen from './src/pantallas/factura/FacturasScreen';
import listAvailablePrinters from './src/pantallas/dispositivos/BluetoothDevicesScreen';
import AdminUsersScreen from './src/pantallas/superAdmin/AdminUsersScreen';
// import Conexiones from './src/pantallas/conexiones/conexiones';
import { ThemeProvider } from './ThemeContext';
import { Provider as PaperProvider } from 'react-native-paper';
import AgregarArticuloPantalla from './src/pantallas/factura/AgregarArticuloPantalla';
import TiposDeConexionScreen from './src/pantallas/conexiones/trabajos/TiposDeConexionScreen';
import EditarFacturaPantalla from './src/pantallas/factura/EditarFacturaPantalla';
import NuevaFacturaScreen from './src/pantallas/factura/NuevaFacturaScreen';
import FacturasParaMiScreen from './src/pantallas/superAdmin/FacturasParaMiScreen';
import AdminUserDetailScreen from './src/pantallas/superAdmin/AdminUserDetailScreen';
import AssignmentsScreen from './src/pantallas/operaciones/ordenes_servicios/AssignmentsScreen'; 
import OrderTypesScreen from './src/pantallas/operaciones/ordenes_servicios/OrderTypesScreen';
import NewServiceOrderScreen from './src/pantallas/operaciones/ordenes_servicios/NewServiceOrderScreen';
import ExistingServiceOrderScreen from './src/pantallas/operaciones/ordenes_servicios/ExistingServiceOrderScreen';
import TechServiceOrderScreen from './src/pantallas/operaciones/ordenes_servicios/TechServiceOrderScreen';
import DashboardScreenContabilidad from './src/pantallas/contabilidad/screens/Dashboard/DashboardScreenContabilidad';
import ITBISReportScreen from './src/pantallas/contabilidad/screens/ITBIS/ITBISReportScreen';
import ITBISFormScreen from './src/pantallas/contabilidad/screens/ITBIS/ITBISFormScreen';
import NCFReportScreen from './src/pantallas/contabilidad/screens/NFC/NCFReportScreen';
import NCFFormScreen from './src/pantallas/contabilidad/screens/NFC/NCFFormScreen';
import SubscriptionDashboard from './src/pantallas/billing/SubscriptionDashboard';
import TarifasConexionesScreen from './src/pantallas/billing/TarifasConexionesScreen';
import SubscriptionDemo from './src/pantallas/billing/SubscriptionDemo';
import PlanManagementScreen from './src/pantallas/billing/PlanManagementScreen';
import RetencionesReportScreen from './src/pantallas/contabilidad/screens/Retenciones/RetencionesReportScreen';
import RetencionesFormScreen from './src/pantallas/contabilidad/screens/Retenciones/RetencionesFormScreen';
import BalanceGeneralScreen2  from './src/pantallas/contabilidad/screens/BalanceGeneralScreen';
import EstadoResultadosScreen2 from './src/pantallas/contabilidad/screens/EstadoResultadosScreen';
import ConfiguracionScreen2 from './src/pantallas/contabilidad/screens/Configuracion/ConfiguracionScreen2';
import VentasMensualesScreen from './src/pantallas/contabilidad/screens/Dashboard/VentasMensualesScreen';
import ProveedoresScreen from './src/pantallas/operaciones/ProveedoresScreen';
import ServiciosAdicionalesScreen from './src/pantallas/servicios/ServiciosAdicionalesScreen';
import ContabilidadSuscripcionScreen from './src/pantallas/contabilidad/suscripcion/ContabilidadSuscripcionScreen';
import ContabilidadDashboardSuscripcion from './src/pantallas/contabilidad/suscripcion/ContabilidadDashboardSuscripcion';
import ContabilidadPlanManagementScreen from './src/pantallas/contabilidad/admin/ContabilidadPlanManagementScreen';
import IspOwnerBillingDashboard from './src/pantallas/billing/IspOwnerBillingDashboard';
import InvoiceDetailsScreen from './src/pantallas/billing/InvoiceDetailsScreen';
import CompanySettingsScreen from './src/pantallas/billing/CompanySettingsScreenFixed';
import IspTransactionHistoryScreen from './src/pantallas/billing/IspTransactionHistoryScreen';

// Pantallas de sistema de pagos reales
import ProcesarPagoScreen from './src/pantallas/pagos/ProcesarPagoScreen';
import DashboardPagosScreen from './src/pantallas/pagos/DashboardPagosScreen';
import DashboardPagosDemoScreen from './src/pantallas/pagos/DashboardPagosDemoScreen';
import DashboardPagosSimpleScreen from './src/pantallas/pagos/DashboardPagosSimpleScreen';
import NotificacionesPagosScreen from './src/pantallas/pagos/NotificacionesPagosScreen';
import HistorialTransaccionesScreen from './src/pantallas/pagos/HistorialTransaccionesScreen';
import HistorialTransaccionesSimpleScreen from './src/pantallas/pagos/HistorialTransaccionesSimpleScreen';
// SMS Management
import SMSManagementScreen from './src/pantallas/sms/SMSManagementScreen';
import SMSIncomingMessagesScreen from './src/pantallas/sms/SMSIncomingMessagesScreen';
import SMSMassCampaignsScreen from './src/pantallas/sms/SMSMassCampaignsScreen';
import MonitoreoSMSScreen from './src/pantallas/sms/MonitoreoSMSScreen';
import HistorialSMSScreen from './src/pantallas/sms/HistorialSMSScreen';
import ConfiguracionSMSScreen from './src/pantallas/sms/ConfiguracionSMSScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <ThemeProvider>
      <PaperProvider>

        <>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="LoginScreen">
              <Stack.Screen
                name="LoginScreen"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Main"
                component={MainScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ConfigScreen"
                component={ConfigScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="BluetoothDeviceListScreen"
                component={BluetoothDeviceListScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="FacturacionesScreen"
                component={FacturacionesScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="DetalleCicloScreen"
                component={DetalleCicloScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ConexionesCicloScreen"
                component={ConexionesCicloScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="FacturasPendientesScreen"
                component={FacturasPendientesScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="DetallesFacturaScreen"
                component={DetallesFacturaScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ReciboScreen"
                component={ReciboScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="RecibosScreen"
                component={RecibosScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="FacturasCobradasScreen"
                component={FacturasCobradasScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="DetalleFacturaScreen"
                component={DetalleFacturaScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="IspListScreen"
                component={IspListScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="AddIspScreen"
                component={AddIspScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="IspDetailsScreen"
                component={IspDetailsScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ClientListScreen"
                component={ClientListScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="AddClientScreen"
                component={AddClientScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ClientDetailsScreen"
                component={ClientDetailsScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ServiciosScreen"
                component={ServiciosScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="AddServiceScreen"
                component={AddServiceScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="AsignacionServicioClienteScreen"
                component={AsignacionServicioClienteScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="BaseCicloScreen"
                component={BaseCicloScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="AddCicloBase"
                component={AddCicloBase}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ConexionesScreen"
                component={ConexionesScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ConexionesEstadisticasScreen"
                component={ConexionesEstadisticasScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ConexionesActivas"
                component={ConexionesActivas}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ConexionesAveriadas"
                component={ConexionesAveriadas}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ConexionesBajaBoluntaria"
                component={ConexionesBajaBoluntaria}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ConexionesBajaForzada"
                component={ConexionesBajaForzada}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ConexionesEjecucion"
                component={ConexionesEjecucion}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ConexionesPendientes"
                component={ConexionesPendientes}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ConexionesReconexion"
                component={ConexionesReconexion}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ConexionesSuspendidas"
                component={ConexionesSuspendidas}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ConexionDetalles"
                component={ConexionDetalles}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="InstalacionForm"
                component={InstalacionForm}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ControlDevicesScreen"
                component={ControlDevicesScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="RouterListScreen"
                component={RouterListScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="OLTsListScreen"
                component={OLTsListScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="OLTDetailsScreen"
                component={OLTDetailsScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ONUsListScreen"
                component={ONUsListScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="AddRouterScreen"
                component={AddRouterScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="RouterDetailsScreen"
                component={RouterDetailsScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="InterfaceDetailsScreen"
                component={InterfaceDetailsScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="AddVlanScreen"
                component={AddVlanScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="AddIpAddressScreen"
                component={AddIpAddressScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ConfiguracionScreen"
                component={ConfiguracionScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ConfiguracionScreenRedes"
                component={ConfiguracionScreenRedes}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ConfiguracionScreenIp"
                component={ConfiguracionScreenIp}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ConfiguracionScreenPppoeVelocidad"
                component={ConfiguracionScreenPppoeVelocidad}
                options={{ headerShown: false }} />
              {/* <Stack.Screen 
              name="Conexiones" 
              component={Conexiones} 
              options={{ headerShown: false }} /> */}
              <Stack.Screen
                name="CrearFactura"
                component={CrearFactura}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="UsuariosScreen"
                component={UsuariosScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="UsuarioDetalleScreen"
                component={UsuarioDetalleScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="IpAddressDetailsScreen"
                component={IpAddressDetailsScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="AssignConnectionScreen"
                component={AssignConnectionScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ContabilidadScreen"
                component={ContabilidadScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ReporteDetailScreen"
                component={ReporteDetailScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="PlanDeCuentasScreen"
                component={PlanDeCuentasScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="CuentaDetailScreen"
                component={CuentaDetailScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="InsertarTransaccionScreen"
                component={InsertarTransaccionScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="CuentaFormScreen"
                component={CuentaFormScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="TransaccionesScreen"
                component={TransaccionesScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="TransaccionFormScreen"
                component={TransaccionFormScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="LibroDiarioScreen"
                component={LibroDiarioScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="BalanceGeneralScreen"
                component={BalanceGeneralScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="EstadoResultadosScreen"
                component={EstadoResultadosScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ReportExpensesScreen"
                component={ReportExpensesScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ClienteFacturasScreen"
                component={ClienteFacturasScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="Recibos1ClienteScreen"
                component={Recibos1ClienteScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="IngresosScreen"
                component={IngresosScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="DetalleIngresoScreen"
                component={DetalleIngresoScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="RecibosUsuarioScreen"
                component={RecibosUsuarioScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="DetalleIngresoUsuarioScreen"
                component={DetalleIngresoUsuarioScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="LlamadasUsuarioScreen"
                component={LlamadasUsuarioScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="DetalleLlamadasScreen"
                component={DetalleLlamadasScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="SmsUsuarioScreen"
                component={SmsUsuarioScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="WhatsappUsuarioScreen"
                component={WhatsappUsuarioScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="DetalleSMScreen"
                component={DetalleSMScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="DetalleWhatsAppScreen"
                component={DetalleWhatsAppScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="CortesUsuarioScreen"
                component={CortesUsuarioScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="ReconexionesUsuarioScreen"
                component={ReconexionesUsuarioScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="DetalleCortesScreen"
                component={DetalleCortesScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="DetalleReconexionesScreen"
                component={DetalleReconexionesScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="EventosScreen"
                component={EventosScreen}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="DesmantelamientoForm"
                component={DesmantelamientoForm}
                options={{ headerShown: false }} />
              <Stack.Screen
                name="FacturasEnRevisionScreen"
                component={FacturasEnRevisionScreen}
                options={{ headerShown: false }} />
              <Stack.Screen name="ConfiguracionFijarIP" component={ConfiguracionFijarIP} options={{ headerShown: false }} />
              <Stack.Screen name="DetalleFacturaPantalla" component={DetalleFacturaPantalla} options={{ headerShown: false }} />
              <Stack.Screen name="FacturasScreen" component={FacturasScreen} options={{ headerShown: false }} />
              <Stack.Screen name="BluetoothDevicesScreen" component={listAvailablePrinters} options={{ headerShown: false }} />
              <Stack.Screen name="AgregarArticuloPantalla" component={AgregarArticuloPantalla} options={{ headerShown: false }} />
              <Stack.Screen name="AdminUsersScreen" component={AdminUsersScreen} options={{ headerShown: false }} />
              <Stack.Screen name="TiposDeConexionScreen" component={TiposDeConexionScreen} options={{ headerShown: false }} />
              <Stack.Screen name="EditarFacturaPantalla" component={EditarFacturaPantalla} options={{ headerShown: false }} />
              <Stack.Screen name="NuevaFacturaScreen" component={NuevaFacturaScreen} options={{ headerShown: false }} />
              <Stack.Screen name="FacturasParaMiScreen" component={FacturasParaMiScreen} options={{ headerShown: false }} />
              <Stack.Screen name="SubscriptionDashboard" component={SubscriptionDashboard} options={{ headerShown: false }} />
              <Stack.Screen name="TarifasConexionesScreen" component={TarifasConexionesScreen} options={{ headerShown: false }} />
              <Stack.Screen name="SubscriptionDemo" component={SubscriptionDemo} options={{ headerShown: false }} />
              <Stack.Screen name="PlanManagementScreen" component={PlanManagementScreen} options={{ headerShown: false }} />
              <Stack.Screen name="AdminUserDetailScreen" component={AdminUserDetailScreen} options={{ headerShown: false }} />
              <Stack.Screen name="AssignmentsScreen" component={AssignmentsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="OrderTypesScreen" component={OrderTypesScreen} options={{ headerShown: false }} />
              <Stack.Screen name="NewServiceOrderScreen" component={NewServiceOrderScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ExistingServiceOrderScreen" component={ExistingServiceOrderScreen} options={{ headerShown: false }} />
              <Stack.Screen name="TechServiceOrderScreen" component={TechServiceOrderScreen} options={{ headerShown: false }} />
              <Stack.Screen name="DashboardScreenContabilidad" component={DashboardScreenContabilidad} options={{ headerShown: false }} />
              <Stack.Screen name="ITBISReportScreen" component={ITBISReportScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ITBISFormScreen" component={ITBISFormScreen} options={{ headerShown: false }} />
              <Stack.Screen name="NCFReportScreen" component={NCFReportScreen} options={{ headerShown: false }} />
              <Stack.Screen name="NCFFormScreen" component={NCFFormScreen} options={{ headerShown: false }} />
              <Stack.Screen name="RetencionesReportScreen" component={RetencionesReportScreen} options={{ headerShown: false }} />
              <Stack.Screen name="RetencionesFormScreen" component={RetencionesFormScreen} options={{ headerShown: false }} />
              <Stack.Screen name="BalanceGeneralScreen2" component={BalanceGeneralScreen2} options={{ headerShown: false }} />
              <Stack.Screen name="EstadoResultadosScreen2" component={EstadoResultadosScreen2} options={{ headerShown: false }} />
              <Stack.Screen name="ConfiguracionScreen2" component={ConfiguracionScreen2} options={{ headerShown: false }} />
              <Stack.Screen name="VentasMensualesScreen" component={VentasMensualesScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ProveedoresScreen" component={ProveedoresScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ServiciosAdicionalesScreen" component={ServiciosAdicionalesScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ContabilidadSuscripcionScreen" component={ContabilidadSuscripcionScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ContabilidadDashboardSuscripcion" component={ContabilidadDashboardSuscripcion} options={{ headerShown: false }} />
              <Stack.Screen name="ContabilidadPlanManagementScreen" component={ContabilidadPlanManagementScreen} options={{ headerShown: false }} />
              <Stack.Screen name="IspOwnerBillingDashboard" component={IspOwnerBillingDashboard} options={{ headerShown: false }} />
              <Stack.Screen name="InvoiceDetailsScreen" component={InvoiceDetailsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="CompanySettingsScreen" component={CompanySettingsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="IspTransactionHistoryScreen" component={IspTransactionHistoryScreen} options={{ headerShown: false }} />
              
              {/* Pantallas de sistema de pagos reales */}
              <Stack.Screen name="ProcesarPago" component={ProcesarPagoScreen} options={{ headerShown: false }} />
              <Stack.Screen name="DashboardPagos" component={DashboardPagosScreen} options={{ headerShown: false }} />
              <Stack.Screen name="DashboardPagosDemo" component={DashboardPagosDemoScreen} options={{ headerShown: false }} />
              <Stack.Screen name="DashboardPagosSimple" component={DashboardPagosSimpleScreen} options={{ headerShown: false }} />
              <Stack.Screen name="NotificacionesPagos" component={NotificacionesPagosScreen} options={{ headerShown: false }} />
              <Stack.Screen name="HistorialTransacciones" component={HistorialTransaccionesScreen} options={{ headerShown: false }} />
              <Stack.Screen name="HistorialTransaccionesSimple" component={HistorialTransaccionesSimpleScreen} options={{ headerShown: false }} />
              
              {/* SMS Management */}
              <Stack.Screen name="SMSManagementScreen" component={SMSManagementScreen} options={{ headerShown: false }} />
              <Stack.Screen name="SMSIncomingMessagesScreen" component={SMSIncomingMessagesScreen} options={{ headerShown: false }} />
              <Stack.Screen name="SMSMassCampaignsScreen" component={SMSMassCampaignsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="MonitoreoSMSScreen" component={MonitoreoSMSScreen} options={{ headerShown: false }} />
              <Stack.Screen name="HistorialSMSScreen" component={HistorialSMSScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ConfiguracionSMSScreen" component={ConfiguracionSMSScreen} options={{ headerShown: false }} />
              
            </Stack.Navigator>
          </NavigationContainer>
        </>
      </PaperProvider>
    </ThemeProvider>
  );
};

export default App;
