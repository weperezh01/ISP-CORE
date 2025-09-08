import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  Switch,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import ThermalPrinterModule from 'react-native-thermal-printer';
// import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFetchBlob from 'react-native-blob-util';


const ReciboScreen = ({ route }) => {
  const { reciboData, id_isp } = route.params;
  const [reciboDetalles, setReciboDetalles] = useState(null);
  const [ispData, setIspData] = useState(null); // Estado para los datos de la ISP
  const [idCliente, setIdCliente] = useState(null);
  const [darkTheme, setDarkTheme] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);

  console.log('Fecha y hora actual:', new Date().toLocaleString());
  console.log('Datos del recibo:', JSON.stringify(reciboData, null, 2));
  console.log('ID de la ISP:', id_isp);

  useEffect(() => {
    const obtenerDatosUsuario = async () => {
      try {
        const usuarioData = await AsyncStorage.getItem('@loginData');
        const usuarioInfo = usuarioData ? JSON.parse(usuarioData) : {};
        setUsuarioId(usuarioInfo.id || '');

        if (!usuarioInfo.id) {
          console.error('No se pudo obtener el ID del usuario');
        }
      } catch (e) {
        console.error('Error al leer los datos del usuario', e);
      }
    };

    obtenerDatosUsuario();
    consultarIsp(); // Llamar a la consulta de la ISP al cargar la pantalla
  }, []);

  // Función para consultar la ISP
  const consultarIsp = async () => {
    try {
      const response = await fetch('https://wellnet-rd.com:444/api/consultar-isp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_isp }), // Enviar el ID de la ISP como parámetro
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Datos de la ISP:', JSON.stringify(data, null, 2));
        setIspData(data); // Guardar los datos de la ISP en el estado
      } else {
        console.error('Error al consultar la ISP:', data.message);
        Alert.alert('Error', 'No se pudo obtener la información de la ISP');
      }
    } catch (error) {
      console.error('Error al consultar la ISP:', error);
      Alert.alert('Error', 'Hubo un problema al conectarse al servidor');
    }
  };

  const registrarNavegacion = async () => {
    if (!usuarioId) return;

    try {
      const fechaActual = new Date();
      const fecha = fechaActual.toISOString().split('T')[0];
      const hora = fechaActual.toTimeString().split(' ')[0];

      const logData = {
        id_usuario: usuarioId,
        fecha,
        hora,
        pantalla: 'ReciboScreen',
        datos: JSON.stringify({
          reciboData,
          darkTheme,
          reciboDetalles,
        }),
      };

      const response = await fetch('https://wellnet-rd.com:444/api/log-navegacion-registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || 'Error al registrar la navegación');
      }

      console.log('Navegación registrada exitosamente');
    } catch (error) {
      console.error('Error al registrar la navegación:', error);
    }
  };

  useEffect(() => {
    if (reciboData?.id_recibo && usuarioId) {
      consultarReciboPorId();
      registrarNavegacion();  // Registrar la navegación cuando se carga la pantalla
    }
  }, [reciboData.id_recibo, usuarioId, darkTheme]);

  const consultarReciboPorId = async () => {
    try {
      const response = await fetch(
        'https://wellnet-rd.com:444/api/consulta-recibo-id',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id_recibo: reciboData.id_recibo, pdf: 0 }),
        },
      );

      const data = await response.json();
      if (response.ok) {
        console.log('Datos del recibo:', data.recibo);
        console.log('Datos del cliente:', data.cliente);
        console.log('Facturas asociadas al recibo:', data.facturas);

        const totalPendiente = data.facturas.reduce(
          (acc, factura) =>
            acc + (factura.monto_total - factura.monto_recibido_factura),
          0,
        );

        setReciboDetalles({ ...data, totalPendiente });
      } else {
        Alert.alert('Error', 'No se pudo obtener la información del recibo');
      }
    } catch (error) {
      console.error('Error al consultar el recibo:', error);
      Alert.alert('Error', 'Hubo un problema al conectarse al servidor');
    }
  };

  const toggleSwitch = () => setDarkTheme(previousState => !previousState);

  const themeStyles = {
    container: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: darkTheme ? '#121212' : '#FFFFFF',
    },
    text: {
      color: darkTheme ? '#FFFFFF' : '#000000',
    },
    textInfo: {
      color: darkTheme ? '#FFFFFF' : '#000000',
      textAlign: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 0,
      color: darkTheme ? '#FFFFFF' : '#000000',
    },
    subTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 0,
      color: darkTheme ? '#FFFFFF' : '#000000',
    },
    footerText: {
      fontSize: 18,
      textAlign: 'center',
      marginVertical: 5,
      color: darkTheme ? '#FFFFFF' : '#000000',
    },
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
    }).format(amount);
  };

  const handlePrint = async () => {
    if (!reciboDetalles) {
      Alert.alert('Error', 'No hay detalles de recibo para imprimir');
      return;
    }
    const boldOnCommand = '\x1B\x45\x01';
    const boldOffCommand = new Uint8Array([0x1B, 0x45, 0x00]);
    const normalFontCommand = '\x1B\x4D\x00';
    const selectFontBCommand = '\x1B\x5D\x01';
    const selectFontACommand = '\x1B\x4D\x00';
    const normalSizeCommand = '\x1D\x21\x00';
    const smallSizeCommand = '\x1D\x21\x01';
    const initializePrinterCommand = '\x1B\x40';

    const printerCharactersPerLine = 32;

    const centerText = (text) => {
      let spaces = (printerCharactersPerLine - text.length) / 2;
      return spaces >= 0 ? ' '.repeat(spaces) + text : text;
    };

    const printThreeColumns = (left, center, right, width) => {
      const columnWidth = width / 3;
      const leftText = left.length > columnWidth ? left.substring(0, columnWidth) : left.padEnd(columnWidth, ' ');
      const centerText = center.length > columnWidth ? center.substring(0, columnWidth) : center.padStart((columnWidth + center.length) / 2).padEnd(columnWidth, ' ');
      const rightText = right.length > columnWidth ? right.substring(0, columnWidth) : right.padStart(columnWidth, ' ');

      return `${leftText}${centerText}${rightText}`;
    };

    let reciboString = initializePrinterCommand;
    reciboString += selectFontBCommand;

    reciboString += centerText(``) + `\n`;
    reciboString += centerText(`Network`) + `\n`;
    reciboString += selectFontBCommand;

    reciboString += `Recibo de Pago No. ${reciboDetalles.recibo.id_recibo}\n`;
    reciboString += `Cliente No.: ${reciboData.id_cliente}\n`;
    reciboString += `Nombre: ${reciboDetalles.cliente.nombres} ${reciboDetalles.cliente.apellidos}\n`;
    reciboString += `Fecha: ${reciboDetalles.recibo.fecha_formateada} ${reciboDetalles.recibo.hora_formateada}\n`;
    reciboString += centerText(`________________________________`) + "\n";

    reciboDetalles.facturas.forEach(factura => {
      reciboString += `\n`;
      reciboString += `Fact.N° ${factura.id_factura} | Monto: ${formatCurrency(factura.monto_total)} \n`;
      reciboString += `Descripcion: ${factura.descripcion}\n\n`;
      reciboString += printThreeColumns("Acumulado", "Pendiente", "Recibido\n", 32);
      reciboString += printThreeColumns(`${formatCurrency(factura.monto_recibido_factura)}`, `${formatCurrency(factura.monto_total - factura.monto_recibido_factura)}  `, formatCurrency(factura.monto_recibido) + "\n", 32);
      reciboString += centerText(`________________________________\n`);
    });

    reciboString += centerText(`________________________________`) + "\n";
    reciboString += `Total Recibido: ${formatCurrency(reciboDetalles.recibo.monto)}\n`;
    reciboString += `Total Pendiente: ${formatCurrency(reciboDetalles.totalPendiente)}\n\n`;

    reciboString += centerText(`Recibido por`) + "\n\n";
    reciboString += centerText(`________________________________`) + "\n";
    reciboString += centerText(`${reciboDetalles.usuario.nombre}`) + "\n\n";
    reciboString += centerText(`________________________________`) + "\n";
    reciboString += centerText(`Realizado por`);

    try {
      await ThermalPrinterModule.printBluetooth({
        payload: reciboString,
        printerNbrCharactersPerLine: 32,
      });
      Alert.alert('Éxito', 'El recibo se ha impreso correctamente');
    } catch (err) {
      console.log(err.message);
      Alert.alert('Error de Impresión', 'No se pudo imprimir el recibo');
    }
  };

  const handleSendWhatsApp = async () => {
    console.log('Enviando recibo por WhatsApp');
    console.log('Datos del recibo:', reciboDetalles);
    console.log('ID de la ISP:', id_isp);

    if (!reciboDetalles?.recibo.id_recibo) {
      Alert.alert("Error", "No se ha proporcionado un ID de recibo válido.");
      return;
    }
    const recibo = reciboDetalles.recibo.id_recibo;
    const filename = `recibo-${recibo}.pdf`; // Nombre del archivo PDF
    let path = `${RNFetchBlob.fs.dirs.CacheDir}/${filename}`;

    try {
      const response = await fetch(
        'https://wellnet-rd.com:444/api/consulta-recibo-id',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id_recibo: recibo, pdf: 1, id_isp }),
        },
      );

      if (response.ok) {
        let path = `${RNFetchBlob.fs.dirs.CacheDir}/${filename}`;
        RNFetchBlob.config({
          fileCache: true,
          appendExt: 'pdf',
          path: `${RNFetchBlob.fs.dirs.CacheDir}/recibo-${recibo}.pdf`
        })
          .fetch('POST', 'https://wellnet-rd.com:444/api/consulta-recibo-id', {
            'Authorization': 'Bearer your_access_token',
            'Content-Type': 'application/json',
          }, JSON.stringify({
            id_recibo: recibo,
            pdf: 1,
            id_isp
          }))
          .then((res) => {
            let pdfPath = res.path();
            console.log('Archivo PDF guardado en: ', pdfPath);

            let shareOptions = {
              title: "PDF",
              message: "Aquí tienes tu recibo:",
              url: 'file://' + pdfPath,
              type: 'application/pdf'
            };

            Share.open(shareOptions)
              .then((res) => { console.log(res); })
              .catch((err) => { err && console.log(err); });
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        console.log('Server response was not ok.');
      }
    } catch (error) {
      console.error('Error al enviar WhatsApp y obtener PDF:', error);
      Alert.alert('Error de Conexión', 'No se pudo conectar al servidor para obtener el PDF');
    }
  };

  const Header = () => (
    <View style={styles.header}>
      {/* <Text style={themeStyles.title}></Text> */}
      {/* <Text style={themeStyles.subTitle}>Network</Text> */}
      <Text style={themeStyles.title}>{ispData?.nombre}</Text>
      <Text style={themeStyles.textInfo}>
        {ispData?.telefono ? `+1 (${ispData.telefono.slice(0, 3)}) ${ispData.telefono.slice(3, 6)}-${ispData.telefono.slice(6)}` : ''}
      </Text>
      <Text style={themeStyles.textInfo}>Sucursal</Text>
      <Text style={themeStyles.textInfo}>
        {/* C/ Duarte #15 Guaucí Abajo, Moca, Espaillat, República Dominicana */}
        <Text> {ispData?.direccion || 'Dirección de la ISP'}</Text>
      </Text>
      <Text style={themeStyles.title}>Recibo de Pago</Text>
      <Text style={themeStyles.subTitle}>
        N° de Recibo: {reciboDetalles?.recibo.id_recibo}
      </Text>
      <Text style={themeStyles.text}>
        Cliente No.: {reciboData.id_cliente}
      </Text>
      <Text style={themeStyles.text}>
        Nombre: {reciboDetalles?.cliente.nombres} {reciboDetalles?.cliente.apellidos}
      </Text>
      <Text style={themeStyles.text}>
        Dirección: {reciboDetalles?.cliente.direccion || '-'}
      </Text>
      <Text style={themeStyles.text}>
        Teléfono: {reciboDetalles?.cliente.telefono || '-'}
      </Text>
      <View style={styles.dateContainer}>
        <Text style={themeStyles.text}>
          Fecha: {reciboDetalles?.recibo.fecha_formateada}
          <Text> </Text>
          {reciboDetalles?.recibo.hora_formateada}
        </Text>
      </View>
      <Text style={themeStyles.text}>Periodo: {reciboDetalles?.periodo}</Text>
    </View>
  );

  const Footer = () => (
    <View style={styles.footer}>
      <View style={styles.footerContainer}>
        <Text style={themeStyles.footerText}>Total Recibido:</Text>
        <Text style={themeStyles.footerText}>
          {formatCurrency(reciboDetalles?.recibo.monto)}
        </Text>
      </View>

      <View style={styles.footerContainer}>
        <Text style={themeStyles.footerText}>Total Pendiente:</Text>
        <Text style={themeStyles.footerText}>
          {formatCurrency(reciboDetalles?.totalPendiente)}
        </Text>
      </View>

      <View style={styles.signatures}>
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine} />
          <Text style={themeStyles.footerText}>
            Recibido por: {reciboDetalles?.usuario.nombre}
          </Text>
        </View>
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine} />
          <Text style={themeStyles.footerText}>Realizado por</Text>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={handlePrint}>
          <Text style={styles.buttonText}>Imprimir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSendWhatsApp}>
          <Text style={styles.buttonText}>Compartir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFacturaItem = ({ item }) => (
    <View style={[styles.item, themeStyles]}>
      <View style={styles.montosContainer}>
        <Text style={themeStyles.text}>Fact.N° {item.id_factura} | </Text>
        <Text style={themeStyles.text}>
          Monto: {formatCurrency(item.monto_total)} |
        </Text>
      </View>

      <View style={styles.montosContainer}>
        <View style={styles.recepcionesContainer}>
          <Text style={themeStyles.text}>Acumulado:</Text>
          <Text style={themeStyles.text}>
            {formatCurrency(item.monto_recibido_factura)}
          </Text>
        </View>

        <View style={styles.recepcionesContainer}>
          <Text style={themeStyles.text}>Pendiente</Text>
          <Text style={themeStyles.text}>
            {formatCurrency(item.monto_total - item.monto_recibido_factura)}
          </Text>
        </View>
        <View style={styles.recepcionesContainer}>
          <Text style={themeStyles.text}>Recibido</Text>
          <Text style={themeStyles.text}>
            {formatCurrency(item.monto_recibido)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={themeStyles.container}>
      <Switch onValueChange={toggleSwitch} value={darkTheme} />
      <FlatList
        data={reciboDetalles?.facturas}
        renderItem={renderFacturaItem}
        keyExtractor={item => item.id_factura.toString()}
        ListHeaderComponent={Header}
        ListFooterComponent={Footer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 10,
  },
  footer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#000',
  },
  footerText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 5,
  },
  signatures: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  signatureBox: {
    alignItems: 'center',
    marginTop: 20,
  },
  signatureText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  signatureLine: {
    width: 250,
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 10,
  },
  montosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recepcionesContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    padding: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    flex: 1,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default ReciboScreen;
