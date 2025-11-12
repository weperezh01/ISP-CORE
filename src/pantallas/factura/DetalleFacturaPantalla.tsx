import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    Alert,
    ScrollView,
    TouchableOpacity,
    Share,
    Linking,
    Platform,
    Modal,
    TextInput,
    FlatList,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BleManager } from 'react-native-ble-plx';
import { getStyles } from './DetalleFacturaStyles';
import ThermalPrinterModule from 'react-native-thermal-printer';
import ThemeSwitch from '../../componentes/themeSwitch';

// Componentes reutilizables
import ConexionCard from './Cards/ConexionCard';
import FacturaCard from './Cards/FacturaCard';
import NotasCard from './Cards/NotasCard';
import ClienteCard from './Cards/ClienteCard';
import PrinterSelectionModal from './Modals/PrinterSelectionModal';
import ReviewNoteModal from './Modals/ReviewNoteModal';
import HorizontalMenu from '../../componentes/HorizontalMenu';
import MenuModal from '../../componentes/MenuModal';

// Funciones y Hooks personalizados
import requestBluetoothPermissions from './Functions/BluetoothPermissionsRequest';
import procesarRecepcion from './Functions/ProcesarRecepcion';
import guardarNuevoMonto from './Functions/GuardarNuevoMonto';
import registrarNavegacion from './Functions/RegisterNavigation';
import formatDate from './Functions/FormatDateUtility';
import handleGuardarNotaRevision from './Functions/GuardarNotaRevision';
import { useFacturaDetails } from './Use/useFacturaDetails'; // (No se está usando en este ejemplo, pero podrías implementarlo)

// === Funciones Auxiliares (utils) ========================================= //
function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return 'N/A';
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    const match = cleaned.match(/^1?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return ['+1 ', '(', match[1], ') ', match[2], '-', match[3]].join('');
    }
    const localMatch = cleaned.match(/(\d{3})(\d{3})(\d{4})$/);
    if (localMatch) {
        return ['(', localMatch[1], ') ', localMatch[2], '-', localMatch[3]].join('');
    }
    return phoneNumber;
}

function calcularSubtotal(facturaData) {
    if (!facturaData || !facturaData.articulos) {
        return 0;
    }
    return facturaData.articulos.reduce((acc, item) => acc + (item.cantidad_articulo * item.precio_unitario), 0);
}

function formatMoney(amount) {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
}

// Funciones para impresión
async function handlePrintFactura(facturaData, selectedPrinter, Alert) {
    if (!facturaData) {
        Alert.alert('Error', 'No hay detalles de factura para imprimir.');
        return;
    }

    if (!selectedPrinter || !selectedPrinter.macAddress) {
        Alert.alert('Error', 'No se ha seleccionado una impresora.');
        return;
    }

    const printerCharactersPerLine = 32;

    const centerText = (text) => {
        let spaces = (printerCharactersPerLine - text.length) / 2;
        return spaces >= 0 ? ' '.repeat(Math.floor(spaces)) + text : text;
    };

    const formatCurrency = (amount) => {
        const parsedAmount = parseFloat(amount) || 0;
        return `RD$ ${parsedAmount.toFixed(2)}`;
    };

    const formatLine = (left, right) => {
        const totalLength = printerCharactersPerLine;
        const spaceLength = totalLength - (left.length + right.length);
        const spaces = ' '.repeat(spaceLength > 0 ? spaceLength : 0);
        return `${left}${spaces}${right}`;
    };

    let facturaString = '\x1B\x40'; // Reset
    facturaString += '\x1B\x5D\x01'; // Seleccionar fuente B

    const ispData = facturaData?.isp || {};
    facturaString += centerText(ispData.nombre || 'NOMBRE DE TU EMPRESA') + '\n';
    if (ispData.direccion) facturaString += centerText(ispData.direccion) + '\n';
    if (ispData.telefono) facturaString += centerText(`Tel: ${ispData.telefono}`) + '\n';
    if (ispData.email) facturaString += centerText(ispData.email) + '\n';
    if (ispData.rnc) facturaString += centerText(`RNC: ${ispData.rnc}`) + '\n';
    if (ispData.pagina_web) facturaString += centerText(ispData.pagina_web) + '\n';
    facturaString += centerText(`--------------------------------`) + '\n';

    facturaString += formatLine(
        `Factura Nº: ${facturaData.factura.id_factura}`,
        `Fecha: ${facturaData.factura.fecha_emision
            ? formatDate(facturaData.factura.fecha_emision)
            : 'N/A'}`
    ) + '\n';
    
    facturaString += centerText(`--------------------------------`) + '\n';

    // Cliente
    facturaString += `Cliente:\n`;
    facturaString += `${facturaData.cliente.nombres} ${facturaData.cliente.apellidos}\n`;
    facturaString += `${facturaData.cliente.direccion}\n`;
    facturaString += `Tel: ${formatPhoneNumber(facturaData.cliente.telefono1)}\n`;
    facturaString += `Correo: ${facturaData.cliente.correo_elect || 'N/A'}\n`;
    facturaString += `NIF/CIF: ${facturaData.cliente.cedula || facturaData.cliente.rnc || 'N/A'}\n`;
    facturaString += centerText(`--------------------------------`) + '\n';

    // Artículos
    facturaString += centerText(`Descripción de servicios:`) + '\n';
    facturaString += formatLine(`Cant`, `Importe`) + '\n';
    facturaString += centerText(`--------------------------------`) + '\n';

    facturaData.articulos.forEach((articulo) => {
        facturaString += `${articulo.descripcion}\n`;
        facturaString += formatLine(
            ` ${articulo.cantidad_articulo}`,
            formatCurrency(articulo.cantidad_articulo * articulo.precio_unitario)
        ) + '\n';
    });

    facturaString += centerText(`--------------------------------`) + '\n';
    facturaString += formatLine('Subtotal:', formatCurrency(calcularSubtotal(facturaData))) + '\n';
    facturaString += formatLine('Descuento:', formatCurrency(facturaData.factura.descuento)) + '\n';
    facturaString += formatLine('ITBIS:', formatCurrency(facturaData.factura.itbis)) + '\n';
    facturaString += formatLine('Total:', formatCurrency(facturaData.factura.monto_total)) + '\n';
    facturaString += centerText(`--------------------------------`) + '\n';

    // Notas de pie
    facturaString += `Forma de pago:\n[Transferencia bancaria]\nNúmero de cuenta:\n[Detalles bancarios]\n`;
    facturaString += centerText(`--------------------------------`) + '\n';
    facturaString += `Notas:\nGracias por su confianza.\nPago vence en 30 días.\nPara dudas, contáctenos.\n`;

    const printerConfig = {
        macAddress: selectedPrinter.macAddress,
        payload: facturaString,
        printerNbrCharactersPerLine: printerCharactersPerLine,
    };

    try {
        await ThermalPrinterModule.printBluetooth(printerConfig);
        Alert.alert('Éxito', 'Factura impresa correctamente.');
    } catch (error) {
        console.error('Error al imprimir:', error);
        Alert.alert('Error', 'No se pudo imprimir la factura. Verifica la conexión con la impresora.');
    }
}

// Función para listar impresoras disponibles
async function listAvailablePrinters(setPrinterList, setModalPrinterVisible, Alert) {
    try {
        const bleManager = new BleManager();
        bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                console.error('Error al obtener dispositivos Bluetooth:', error);
                Alert.alert('Error', 'No se pudieron obtener los dispositivos Bluetooth.');
                return;
            }
            if (device) {
                setPrinterList((prevList) => {
                    if (!prevList.some((d) => d.id === device.id)) {
                        return [...prevList, device];
                    }
                    return prevList;
                });
            }
        });

        setTimeout(() => {
            bleManager.stopDeviceScan();
        }, 5000);
        setModalPrinterVisible(true);
    } catch (error) {
        console.error('Error al obtener dispositivos Bluetooth:', error);
        Alert.alert('Error', 'No se pudieron obtener los dispositivos Bluetooth.');
    }
}

async function loadSelectedPrinter(setSelectedPrinter) {
    try {
        const dispositivoGuardado = await AsyncStorage.getItem('@selected_printer');
        if (dispositivoGuardado !== null) {
            const dispositivo = JSON.parse(dispositivoGuardado);
            setSelectedPrinter(dispositivo);
        }
    } catch (error) {
        console.error('Error al cargar el dispositivo guardado:', error);
    }
}

// === Funciones de Compartir ============================================== //

// Función para formatear los datos de la factura en texto
function formatFacturaForSharing(facturaData) {
    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("es-DO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: 'America/Santo_Domingo',
        });
    };

    const subtotal = facturaData?.articulos?.reduce((acc, item) => acc + (item.cantidad_articulo * item.precio_unitario), 0) || 0;
    const descuento = facturaData?.factura?.descuento || 0;
    const itbis = facturaData?.factura?.itbis || 0;
    const impuesto_selectivo = facturaData?.factura?.impuesto_selectivo || 0;
    const isr = facturaData?.factura?.isr || 0;
    const cdt = facturaData?.factura?.cdt_monto || 0;
    const impuesto_cheques = facturaData?.factura?.impuesto_cheques || 0;
    const impuesto_patrimonio = facturaData?.factura?.impuesto_patrimonio_monto || 0;
    const impuesto_sucesion = facturaData?.factura?.impuesto_sucesion_monto || 0;
    const impuesto_activos = facturaData?.factura?.impuesto_activos_monto || 0;
    const impuesto_vehiculos = facturaData?.factura?.impuesto_vehiculos_monto || 0;
    const impuesto_ganancia_capital = facturaData?.factura?.impuesto_ganancia_capital_monto || 0;
    const impuesto_transferencia = facturaData?.factura?.impuesto_transferencia_inmobiliaria_monto || 0;
    const montoTotal = facturaData?.factura?.monto_total || 0;

    let facturaText = `
🧾 FACTURA #${facturaData?.factura?.id_factura}
${facturaData?.isp?.nombre || 'ISP'}
${facturaData?.isp?.direccion || ''}
Tel: ${facturaData?.isp?.telefono || 'N/A'}
RNC: ${facturaData?.isp?.rnc || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 CLIENTE:
${facturaData?.cliente?.nombres || ''} ${facturaData?.cliente?.apellidos || ''}
Teléfono: ${facturaData?.cliente?.telefono1 || 'N/A'}
Dirección: ${facturaData?.cliente?.direccion || 'N/A'}
Cédula/RNC: ${facturaData?.cliente?.cedula || facturaData?.cliente?.rnc || 'N/A'}

🔌 CONEXIÓN:
ID: ${facturaData?.conexion?.id_conexion || 'N/A'}
Dirección: ${facturaData?.conexion?.direccion || 'N/A'}
Estado: ${facturaData?.conexion?.estado_conexion || 'N/A'}
IP: ${facturaData?.conexion?.direccion_ipv4 || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 INFORMACIÓN DE FACTURA:
Fecha de Emisión: ${formatDate(facturaData?.factura?.fecha_emision)}
Hora de Emisión: ${facturaData?.factura?.hora_emision || 'N/A'}
NCF: ${facturaData?.factura?.ncf || 'No asignado'}
Estado: ${facturaData?.factura?.estado?.toUpperCase() || 'N/A'}
Descripción: ${facturaData?.factura?.descripcion || 'N/A'}

🔄 CICLO DE FACTURACIÓN:
Período: ${formatDate(facturaData?.ciclo?.inicio)} - ${formatDate(facturaData?.ciclo?.final)}
Días de Gracia: ${facturaData?.ciclo?.dias_gracia || 0} días
Tipo de Corte: ${facturaData?.ciclo?.tipo_corte?.toUpperCase() || 'N/A'}

📋 ARTÍCULOS Y SERVICIOS:`;

    // Agregar artículos
    facturaData?.articulos?.forEach((item, index) => {
        const cantidad = parseFloat(item.cantidad_articulo) % 1 === 0 
            ? parseFloat(item.cantidad_articulo).toFixed(0) 
            : item.cantidad_articulo;
        const importe = item.cantidad_articulo * item.precio_unitario;
        
        facturaText += `
${index + 1}. ${item.descripcion}
   Cant: ${cantidad} x ${formatMoney(item.precio_unitario)} = ${formatMoney(importe)}`;
    });

    facturaText += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 RESUMEN FISCAL (DGII):
Subtotal: ${formatMoney(subtotal)}`;

    if (descuento > 0) {
        facturaText += `
(-) Descuento: -${formatMoney(descuento)}`;
    }

    const subtotalConDescuento = subtotal - descuento;
    facturaText += `
Subtotal después de descuento: ${formatMoney(subtotalConDescuento)}

IMPUESTOS APLICABLES:`;

    if (itbis > 0) facturaText += `
(+) ITBIS (18%): ${formatMoney(itbis)}`;

    if (impuesto_selectivo > 0) facturaText += `
(+) Impuesto Selectivo: ${formatMoney(impuesto_selectivo)}`;

    if (isr > 0) facturaText += `
(+) ISR (Retención): ${formatMoney(isr)}`;

    if (cdt > 0) facturaText += `
(+) CDT (Telecomunicaciones): ${formatMoney(cdt)}`;

    if (impuesto_cheques > 0) facturaText += `
(+) Impuesto sobre Cheques: ${formatMoney(impuesto_cheques)}`;

    if (impuesto_activos > 0) facturaText += `
(+) Impuesto sobre Activos: ${formatMoney(impuesto_activos)}`;

    if (impuesto_patrimonio > 0) facturaText += `
(+) Impuesto sobre Patrimonio: ${formatMoney(impuesto_patrimonio)}`;

    if (impuesto_sucesion > 0) facturaText += `
(+) Impuesto sobre Sucesiones: ${formatMoney(impuesto_sucesion)}`;

    if (impuesto_vehiculos > 0) facturaText += `
(+) Impuesto sobre Vehículos: ${formatMoney(impuesto_vehiculos)}`;

    if (impuesto_ganancia_capital > 0) facturaText += `
(+) Impuesto Ganancia Capital: ${formatMoney(impuesto_ganancia_capital)}`;

    if (impuesto_transferencia > 0) facturaText += `
(+) Impuesto Transferencia Inmobiliaria: ${formatMoney(impuesto_transferencia)}`;

    const totalImpuestos = itbis + impuesto_selectivo + isr + cdt + impuesto_cheques + 
                          impuesto_activos + impuesto_patrimonio + impuesto_sucesion + 
                          impuesto_vehiculos + impuesto_ganancia_capital + impuesto_transferencia;

    facturaText += `

Total Impuestos: ${formatMoney(totalImpuestos)}

═══════════════════════════════════
TOTAL A PAGAR: ${formatMoney(montoTotal)}
═══════════════════════════════════

NCF: ${facturaData?.factura?.ncf || 'No asignado'}
RNC ISP: ${facturaData?.isp?.rnc || 'N/A'}
Moneda: Pesos Dominicanos (DOP)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gracias por su preferencia
${new Date().toLocaleString('es-DO')}`;

    return facturaText;
}

// Función para compartir por WhatsApp
async function shareViaWhatsApp(facturaData, clientPhone) {
    try {
        const facturaText = formatFacturaForSharing(facturaData);
        const encodedText = encodeURIComponent(facturaText);
        
        // Limpiar número de teléfono (solo números)
        const cleanPhone = clientPhone?.replace(/\D/g, '') || '';
        
        let whatsappUrl;
        if (cleanPhone) {
            // Si hay número, enviar directamente al cliente
            const internationalPhone = cleanPhone.startsWith('1') ? cleanPhone : `1${cleanPhone}`;
            whatsappUrl = `whatsapp://send?phone=${internationalPhone}&text=${encodedText}`;
        } else {
            // Si no hay número, abrir WhatsApp con el texto listo para compartir
            whatsappUrl = `whatsapp://send?text=${encodedText}`;
        }

        const canOpen = await Linking.canOpenURL(whatsappUrl);
        if (canOpen) {
            await Linking.openURL(whatsappUrl);
        } else {
            Alert.alert(
                'WhatsApp no disponible',
                'WhatsApp no está instalado en este dispositivo. El texto se ha copiado al portapapeles.',
                [{ text: 'OK' }]
            );
        }
    } catch (error) {
        console.error('Error al compartir por WhatsApp:', error);
        Alert.alert('Error', 'No se pudo compartir por WhatsApp');
    }
}

// Función para enviar por Email
async function shareViaEmail(facturaData, clientEmail) {
    try {
        const facturaText = formatFacturaForSharing(facturaData);
        const subject = `Factura #${facturaData?.factura?.id_factura} - ${facturaData?.isp?.nombre}`;
        
        const emailBody = `Estimado(a) ${facturaData?.cliente?.nombres} ${facturaData?.cliente?.apellidos},

Adjunto encontrará los detalles de su factura:

${facturaText}

Si tiene alguna pregunta, no dude en contactarnos.

Saludos cordiales,
${facturaData?.isp?.nombre}`;

        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(emailBody);
        
        let emailUrl;
        if (clientEmail) {
            emailUrl = `mailto:${clientEmail}?subject=${encodedSubject}&body=${encodedBody}`;
        } else {
            emailUrl = `mailto:?subject=${encodedSubject}&body=${encodedBody}`;
        }

        const canOpen = await Linking.canOpenURL(emailUrl);
        if (canOpen) {
            await Linking.openURL(emailUrl);
        } else {
            Alert.alert('Error', 'No se pudo abrir la aplicación de email');
        }
    } catch (error) {
        console.error('Error al compartir por email:', error);
        Alert.alert('Error', 'No se pudo compartir por email');
    }
}

// Función para compartir como texto plano
async function shareAsText(facturaData) {
    try {
        const facturaText = formatFacturaForSharing(facturaData);
        
        const result = await Share.share({
            message: facturaText,
            title: `Factura #${facturaData?.factura?.id_factura}`,
        });

        if (result.action === Share.sharedAction) {
            console.log('Contenido compartido exitosamente');
        }
    } catch (error) {
        console.error('Error al compartir:', error);
        Alert.alert('Error', 'No se pudo compartir el contenido');
    }
}

// Función para generar PDF (requiere backend)
async function generateAndSharePDF(facturaData) {
    try {
        Alert.alert(
            'Generando PDF',
            'Se está generando el PDF de la factura...',
            [{ text: 'OK' }]
        );

        // Aquí harías la llamada al backend para generar el PDF
        const response = await axios.post('https://wellnet-rd.com:444/api/generar-pdf-factura', {
            id_factura: facturaData?.factura?.id_factura,
            datos_factura: facturaData
        });

        if (response.data.success && response.data.pdfUrl) {
            // Compartir el URL del PDF generado
            await Share.share({
                message: `Factura #${facturaData?.factura?.id_factura} - PDF: ${response.data.pdfUrl}`,
                url: response.data.pdfUrl,
                title: `Factura #${facturaData?.factura?.id_factura} - PDF`,
            });
        } else {
            Alert.alert('Error', 'No se pudo generar el PDF');
        }
    } catch (error) {
        console.error('Error al generar PDF:', error);
        Alert.alert('Error', 'No se pudo generar el PDF. Verifique su conexión a internet.');
    }
}

// Función principal para mostrar opciones de compartir
function handleShareFactura(facturaData) {
    const clientPhone = facturaData?.cliente?.telefono1;
    const clientEmail = facturaData?.cliente?.correo_elect;
    
    Alert.alert(
        '📤 Compartir Factura',
        'Seleccione cómo desea compartir esta factura:',
        [
            {
                text: '📱 WhatsApp',
                onPress: () => shareViaWhatsApp(facturaData, clientPhone),
            },
            {
                text: '📧 Email',
                onPress: () => shareViaEmail(facturaData, clientEmail),
            },
            {
                text: '📄 PDF',
                onPress: () => generateAndSharePDF(facturaData),
            },
            {
                text: '📋 Texto',
                onPress: () => shareAsText(facturaData),
            },
            {
                text: 'Cancelar',
                style: 'cancel',
            },
        ],
        { cancelable: true }
    );
}

// === Componente Principal ================================================ //
const DetalleFacturaPantalla = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const scrollViewRef = React.useRef(null);

    const [facturaData, setFacturaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [nuevoMontoTotal, setNuevoMontoTotal] = useState('');
    const [idUsuario, setIdUsuario] = useState('');
    const [permisoOperacion, setPermisoOperacion] = useState(false);

    const id_factura = route.params?.id_factura;
    const id_ciclo = route.params?.id_ciclo;
    const id_usuario = route.params?.id_usuario;
    const focus = route.params?.focus;

    const [notaRevisada, setNotaRevisada] = useState('');
    const [notaActual, setNotaActual] = useState(null);
    const [modalNotaRevisionVisible, setModalNotaRevisionVisible] = useState(false);
    const [notaMarcadaComoRevisada, setNotaMarcadaComoRevisada] = useState(false);

    const [modalPrinterVisible, setModalPrinterVisible] = useState(false);
    const [printerList, setPrinterList] = useState([]);
    const [selectedPrinter, setSelectedPrinter] = useState(null);

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [refreshFlag, setRefreshFlag] = useState(false);

    const [addArticleVisible, setAddArticleVisible] = useState(false); // Estado para mostrar/ocultar el formulario
    const [newArticle, setNewArticle] = useState({
        descripcion: '',
        cantidad_articulo: 1,
        precio_unitario: 0,
    });

    // Estados para el modal de nota
    const [modalNotaVisible, setModalNotaVisible] = useState(false);
    const [nota, setNota] = useState('');
    const [checklist, setChecklist] = useState([
        { id: 1, label: 'Factura en revisión', checked: false },
        { id: 2, label: 'Pago parcial', checked: false },
        { id: 3, label: 'Pendiente de aprobación', checked: false }
    ]);
    const [ispId, setIspId] = useState(null);


    // Toggle tema
    const toggleTheme = async () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        await AsyncStorage.setItem('@theme', newMode ? 'dark' : 'light');
    };

    // Cargar modo inicial
    useEffect(() => {
        const loadTheme = async () => {
            const theme = await AsyncStorage.getItem('@theme');
            setIsDarkMode(theme === 'dark');
        };
        loadTheme();
    }, []);

    // Refrescar tema
    useEffect(() => {
        const refreshTheme = async () => {
            try {
                const theme = await AsyncStorage.getItem('@theme');
                setIsDarkMode(theme === 'dark');
            } catch (error) {
                console.error('Error al cargar el tema', error);
            }
        };
        refreshTheme();
    }, [menuVisible, refreshFlag]);

    // Obtener detalles de factura cada vez que tiene el foco
    useFocusEffect(
        React.useCallback(() => {
            const fetchFacturaDetails = async () => {
                setLoading(true);
                try {
                    const response = await axios.post('https://wellnet-rd.com:444/api/consulta-facturas-cobradas-por-id_factura', {
                        id_factura,
                    });
                    setFacturaData(response.data);
                    setError('');
                } catch (error) {
                    console.error('Error fetching data:', error);
                    setError('Failed to fetch data: ' + error.message);
                } finally {
                    setLoading(false);
                }
            };

            if (id_factura) {
                fetchFacturaDetails();
            } else {
                setError('ID de factura no proporcionado.');
                setLoading(false);
            }
        }, [id_factura])
    );

    // Cargar factura una sola vez
    useEffect(() => {
        const controller = new AbortController();
        const fetchFacturaDetails = async () => {
            try {
                const response = await fetch('https://wellnet-rd.com:444/api/consulta-facturas-cobradas-por-id_factura', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_factura }),
                    signal: controller.signal
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setFacturaData(data);
            } catch (error) {
                if (!controller.signal.aborted) {
                    setError('Failed to fetch data: ' + error.message);
                    console.error('Error fetching data:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        if (id_factura) {
            fetchFacturaDetails();
        } else {
            setError('ID de factura no proporcionado.');
            setLoading(false);
        }

        return () => {
            controller.abort();
        };
    }, [id_factura]);

    // Obtener permisos de usuario
    useEffect(() => {
        const obtenerIdUsuarioYPermisos = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@loginData');
                const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
                if (userData && userData.id) {
                    setIdUsuario(userData.id);
                    // Fetch permisos
                    const permisosResponse = await axios.post('https://wellnet-rd.com:444/api/usuarios/obtener-permisos-usuario', {
                        id_usuario: userData.id,
                    });
                    const permisos = permisosResponse.data;
                    const permisoFacturacion = permisos.find(p => p.permiso === 'permiso_facturaciones');
                    if (permisoFacturacion) {
                        setPermisoOperacion(permisoFacturacion.activo === 1);
                    }
                }
            } catch (e) {
                console.error('Error al leer el nombre del usuario', e);
            }
        };
        obtenerIdUsuarioYPermisos();
        registrarNavegacion();
    }, []);

    // Permisos Bluetooth
    useEffect(() => {
        const checkPermissions = async () => {
            await requestBluetoothPermissions();
        };
        checkPermissions();
    }, []);

    // Cargar impresora seleccionada
    useEffect(() => {
        loadSelectedPrinter(setSelectedPrinter);
    }, []);

    // Obtener ISP ID
    useEffect(() => {
        const obtenerIspId = async () => {
            try {
                const ispIdValue = await AsyncStorage.getItem('@selectedIspId');
                if (ispIdValue) {
                    setIspId(ispIdValue);
                }
            } catch (error) {
                console.error('Error al recuperar el ID del ISP', error);
            }
        };
        obtenerIspId();
    }, []);

    // Toggle checklist item
    const toggleChecklistItem = (id) => {
        setChecklist(prevChecklist =>
            prevChecklist.map(item =>
                item.id === id ? { ...item, checked: !item.checked } : item
            )
        );
    };

    // Función para guardar nota
    const guardarNota = async () => {
        if (!nota.trim()) {
            Alert.alert('Error', 'La nota no puede estar vacía.');
            return;
        }

        try {
            // 1. Guardar la nota
            const responseNota = await fetch('https://wellnet-rd.com:444/api/guardar-nota-factura', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nota,
                    id_usuario: idUsuario,
                    id_factura: id_factura,
                    id_recibo: 0,
                    fecha: new Date().toISOString().split('T')[0],
                    hora: new Date().toLocaleTimeString('en-GB')
                })
            });

            const notaData = await responseNota.json();

            if (!responseNota.ok) {
                throw new Error('Error al guardar la nota');
            }

            const idNota = notaData.id_nota;
            Alert.alert('Nota guardada', 'La nota ha sido guardada exitosamente.');
            setNota('');
            setModalNotaVisible(false);

            // 2. Registrar la revisión de la factura con el id_nota recién creado
            const facturaEnRevision = checklist.find(item => item.id === 1).checked;
            if (facturaEnRevision) {
                const responseRevision = await fetch('https://wellnet-rd.com:444/api/registrar-revision', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id_usuario: idUsuario,
                        id_factura: id_factura,
                        id_nota: idNota,
                        id_isp: ispId
                    })
                });

                const revisionData = await responseRevision.json();
                if (responseRevision.ok) {
                    Alert.alert('Revisión actualizada', revisionData.message);
                } else {
                    throw new Error(revisionData.message || 'Error al registrar la revisión');
                }
            }

            // Recargar los detalles de la factura para mostrar la nueva nota
            const response = await axios.post('https://wellnet-rd.com:444/api/consulta-facturas-cobradas-por-id_factura', {
                id_factura,
            });
            setFacturaData(response.data);
        } catch (error) {
            console.error('Error al guardar la nota o registrar la revisión:', error);
            Alert.alert('Error', 'No se pudo guardar la nota o actualizar la revisión.');
        }
    };

    // Acciones sobre notas
    const handlePressNotaPendiente = (nota) => {
        setNotaActual(nota);
        setNotaRevisada('');
        setNotaMarcadaComoRevisada(false);
        setModalNotaRevisionVisible(true);
    };

    const handleCerrarModal = () => {
        setModalNotaRevisionVisible(false);
    };

    // Wrapper para guardar nota de revisión
    const handleGuardarNotaRevisionWrapper = async () => {
        await handleGuardarNotaRevision(
            notaRevisada,
            notaActual,
            facturaData,
            idUsuario,
            setFacturaData,
            setModalNotaRevisionVisible,
            setNotaRevisada,
            setNotaMarcadaComoRevisada,
            setNotaActual,
            notaMarcadaComoRevisada
        );
    };

    // Scroll automático a sección de notas cuando focus === 'notas'
    useEffect(() => {
        if (focus === 'notas' && !loading && facturaData && scrollViewRef.current) {
            // Pequeño delay para asegurar que el layout esté completo
            const timer = setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [focus, loading, facturaData]);

    const styles = getStyles(isDarkMode);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#3B82F6'} />
                <Text style={styles.loadingText}>Cargando detalles de la factura...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!facturaData) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>No se encontraron datos para esta factura.</Text>
            </View>
        );
    }

    // ', { clientId, usuarioId })}Fi

    const botones = [
        { id: '4', screen: null, action: () => setMenuVisible(true), icon: 'menu' },
        { id: '9', icon: 'attach-money', action: () => navigation.navigate('ClienteFacturasScreen', {  clientId: facturaData?.cliente?.id_cliente, usuarioId: id_usuario  }) },
        // { id: '9', screen: null, action: () => setMenuVisible(true), icon: 'money' },
        { id: '5', icon: 'person', action: () => navigation.navigate('ClientDetailsScreen', { clientId: facturaData?.cliente?.id_cliente }) },
        { id: '10', icon: 'note-add', action: () => setModalNotaVisible(true) },
        { id: '1', icon: 'add', action: () => navigation.navigate('AgregarArticuloPantalla', { id_factura, facturaData }) },
        {
            id: '6',
            icon: 'edit',
            action: () => navigation.navigate('EditarFacturaPantalla', { facturaData, isDarkMode }) // Navegación a la pantalla de edición
        },
        { id: '7', icon: 'print', action: () => handlePrintFactura(facturaData, selectedPrinter, Alert) },
        { id: '8', icon: 'share', action: () => handleShareFactura(facturaData) },
        { id: '2', title: 'Revisiones', screen: 'FacturasEnRevisionScreen', params: { estado: 'en_revision' } },
        { id: '3', title: 'Ingresos', screen: 'IngresosScreen' },
    ];

    const getInvoiceStatus = () => {
        const estado = facturaData?.factura?.estado;
        if (estado === 'pagado') return { text: 'PAGADO', color: '#10B981' };
        if (estado === 'pendiente') return { text: 'PENDIENTE', color: '#F59E0B' };
        return { text: 'VENCIDO', color: '#EF4444' };
    };

    const status = getInvoiceStatus();

    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerTitle}>Factura #{facturaData?.factura?.id_factura}</Text>
                        <Text style={styles.headerSubtitle}>
                            {facturaData?.cliente?.nombres} {facturaData?.cliente?.apellidos}
                        </Text>
                    </View>
                    <View style={styles.headerActions}>
                        <View style={styles.invoiceStatusBadge}>
                            <Text style={[styles.invoiceStatusText, { color: status.color }]}>
                                {status.text}
                            </Text>
                        </View>
                        <ThemeSwitch />
                    </View>
                </View>
            </View>

            {/* Printer Info Card */}
            <View style={styles.printerInfoContainer}>
                {selectedPrinter ? (
                    <Text style={styles.printerText}>
                        🖨️ Impresora: <Text style={styles.printerName}>{selectedPrinter.deviceName}</Text>
                    </Text>
                ) : (
                    <Text style={styles.noPrinterText}>🖨️ No hay impresora seleccionada</Text>
                )}
            </View>

            {/* Modal para seleccionar la impresora */}
            <PrinterSelectionModal
                modalPrinterVisible={modalPrinterVisible}
                styles={styles}
                printerList={printerList}
                CargarPrinterSeleccionado={async () => {
                    await loadSelectedPrinter(setSelectedPrinter);
                    setModalPrinterVisible(false);
                }}
            />

            {/* Modal para la nota de revisión */}
            <ReviewNoteModal
                modalNotaRevisionVisible={modalNotaRevisionVisible}
                styles={styles}
                notaRevisada={notaRevisada}
                setNotaRevisada={setNotaRevisada}
                notaMarcadaComoRevisada={notaMarcadaComoRevisada}
                setNotaMarcadaComoRevisada={setNotaMarcadaComoRevisada}
                handleCerrarModal={handleCerrarModal}
                handleGuardarNotaRevision={handleGuardarNotaRevisionWrapper}
            />

            {/* Modal del Menú */}
            <MenuModal
                visible={menuVisible}
                onClose={() => {
                    setMenuVisible(false);
                    setRefreshFlag((prevFlag) => !prevFlag);
                }}
                menuItems={[
                    { title: 'Inicio', action: () => navigation.navigate('HomeScreen') },
                    { title: 'Perfil', action: () => navigation.navigate('ProfileScreen') },
                    { title: 'Configuración', action: () => navigation.navigate('SettingsScreen') },
                    { title: 'Dispositivos Bluetooth', action: () => navigation.navigate('BluetoothDevicesScreen') },
                    { title: 'Cerrar Sesión', action: () => console.log('Cerrando sesión') },
                ]}
                isDarkMode={isDarkMode}
                onItemPress={(item) => {
                    item.action();
                    setMenuVisible(false);
                    setRefreshFlag((prevFlag) => !prevFlag);
                }}
                toggleTheme={toggleTheme}
            />

            {/* Modal de Nota */}
            <Modal
                visible={modalNotaVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalNotaVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Escribe una Nota</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Escribe la nota aquí..."
                            placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
                            multiline={true}
                            value={nota}
                            onChangeText={setNota}
                        />

                        {/* Checklist */}
                        <FlatList
                            data={checklist}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => toggleChecklistItem(item.id)} style={styles.checklistItem}>
                                    <Text style={styles.checklistLabel}>{item.label}</Text>
                                    <Text>{item.checked ? '✔️' : '⬜'}</Text>
                                </TouchableOpacity>
                            )}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalNotaVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.acceptButton]}
                                onPress={guardarNota}
                            >
                                <Text style={styles.modalButtonText}>Aceptar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ScrollView
                ref={scrollViewRef}
                style={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                <ClienteCard
                    facturaData={facturaData}
                    styles={styles}
                    formatPhoneNumber={formatPhoneNumber}
                />

                <FacturaCard
                    facturaData={facturaData}
                    isDarkMode={isDarkMode}
                    styles={styles}
                    formatMoney={formatMoney}
                />

                <ConexionCard
                    conexionData={facturaData?.conexion}
                    styles={styles}
                />

                <NotasCard
                    facturaData={facturaData}
                    styles={styles}
                    handlePressNotaPendiente={handlePressNotaPendiente}
                    formatDate={formatDate}
                />
            </ScrollView>

            <HorizontalMenu
                botones={botones}
                navigation={navigation}
                isDarkMode={isDarkMode}
            />
        </View>
    );
};

export default DetalleFacturaPantalla;
