import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BleManager from 'react-native-ble-manager';
import ThermalPrinterModule from 'react-native-thermal-printer';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';

import { Buffer } from 'buffer';

import { Linking } from 'react-native';
// import {TextInput} from 'react-native';

// Función para formatear números como dinero
const formatearDinero = cantidad => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
  }).format(cantidad);
};

const DetallesFacturaScreen = ({ route }) => {
  const navigation = useNavigation(); // Obtén el objeto de navegación
  const { factura, id_ciclo } = route.params;
  const [facturasAnteriores, setFacturasAnteriores] = useState([]);
  const [totalRecibir, setTotalRecibir] = useState(0);
  const [facturasSeleccionadas, setFacturasSeleccionadas] = useState({});
  const [idUsuario, setIdUsuario] = useState('');
  const [montosRecibir, setMontosRecibir] = useState({});
  const [montosPersonalizados, setMontosPersonalizados] = useState({});
  const [notasFacturas, setNotasFacturas] = useState({}); // Nuevo estado para manejar las notas
  const [notaTemporal, setNotaTemporal] = useState(''); // Para manejar la entrada de texto temporal de la nota
  const [facturaEditandoNota, setFacturaEditandoNota] = useState(null); // Para saber cuál factura está editando su nota
  const [permisoOperacion, setPermisoOperacion] = useState(false); // Nuevo estado para manejar el permiso de operación

  useEffect(() => {
    const handleInputChange = (id_factura, text) => {
      const nuevoMontosPersonalizados = {
        ...montosPersonalizados,
        [id_factura]: text,
      };
      setMontosPersonalizados(nuevoMontosPersonalizados);
    };

    const cargarFacturasAnteriores = async () => {
      // Obtener el id del usuario del almacenamiento local
      const obtenerIdUsuario = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('@loginData'); // Obtener datos de AsyncStorage
          const userData = jsonValue != null ? JSON.parse(jsonValue) : null; // Parsear el string a un objeto
          if (userData && userData.id) {
            setIdUsuario(userData.id); // Establecer el nombre de usuario en el estado
            // Obtener permisos de operación del usuario
            const permisos = await axios.post('https://wellnet-rd.com:444/api/usuarios/obtener-permisos-usuario', {
              id_usuario: userData.id,
            });
            const permisoFacturaciones = permisos.data.find(p => p.permiso === 'permiso_facturaciones');
            if (permisoFacturaciones) {
              setPermisoOperacion(permisoFacturaciones.activo === 1); // Convertir el bit a booleano
            }
          }
        } catch (e) {
          console.error('Error al leer el nombre del usuario', e); // Manejar posibles errores
        }
      };
      obtenerIdUsuario();
      BleManager.start({ showAlert: false }); // Inicializa el BleManager sin mostrar alertas
      // Aquí podrías también chequear permisos o realizar otras configuraciones iniciales necesarias

      if (factura?.factura?.id_cliente) {
        try {
          const response = await axios.post(
            'https://wellnet-rd.com:444/api/facturas-cliente',
            { id_cliente: factura.factura.id_cliente, id_ciclo: id_ciclo },
          );
          setFacturasAnteriores(response.data);
        } catch (error) {
          console.error('Error al cargar facturas anteriores:', error);
        }
      }
    };

    const mostrarDispositivoGuardado = async () => {
      try {
        const dispositivoGuardado = await AsyncStorage.getItem(
          '@selected_printer',
        );
        if (dispositivoGuardado !== null) {
          // Asumiendo que dispositivoGuardado es una cadena de texto en formato JSON:
          const dispositivo = JSON.parse(dispositivoGuardado);
          console.log(
            'Dispositivo guardado recuperado al abrir DetallesFacturaScreen:',
            dispositivo,
          );
        } else {
          console.log('No hay dispositivo guardado.');
        }
      } catch (error) {
        console.error('Error al recuperar el dispositivo guardado:', error);
      }
    };

    cargarFacturasAnteriores();
    mostrarDispositivoGuardado();
  }, [factura?.factura?.id_cliente]);

  // Nueva función para actualizar la nota de una factura
  const actualizarNota = (id_factura, nota) => {
    setNotasFacturas(notasPrevias => ({
      ...notasPrevias,
      [id_factura]: nota,
    }));
    // Limpiar la nota temporal y resetear el estado de edición
    setNotaTemporal('');
    setFacturaEditandoNota(null);
  };

  const cancelarNota = () => {
    // Simplemente limpia y resetea los estados sin guardar cambios
    setNotaTemporal('');
    setFacturaEditandoNota(null);
  };

  // // Calcula la suma total de todas las facturas restando el monto recibido
  // const sumaTotal = facturasAnteriores.reduce((acumulador, item) => {
  //   // Asegúrate de que tanto monto_total como monto_recibido sean números
  //   const montoTotal = parseFloat(item.factura.monto_total || 0);
  //   const montoRecibido = parseFloat(item.factura.monto_recibido || 0);
  //   return acumulador + (montoTotal - montoRecibido); // Resta el monto recibido del total
  // }, 0);


  // Calcula la suma total de todas las facturas restando el monto recibido
  const sumaTotal = facturasAnteriores.reduce((acumulador, item) => {
    // Verifica si `item` y `item.factura` existen
    if (!item || !item.factura) {
      return acumulador; // Si no existen, simplemente continúa con el siguiente elemento
    }

    // Asegúrate de que tanto `monto_total` como `monto_recibido` sean números
    const montoTotal = parseFloat(item.factura.monto_total || 0);
    const montoRecibido = parseFloat(item.factura.monto_recibido || 0);

    // Resta el monto recibido del total y suma al acumulador
    return acumulador + (montoTotal - montoRecibido);
  }, 0);





  const manejarSeleccion = (id, montoTotal) => {
    // Determinar si la factura ya estaba seleccionada.
    const facturaYaSeleccionada = facturasSeleccionadas[id]?.seleccionada;

    // Calcular el monto a sumar/restar.
    const montoParaOperacion =
      montosPersonalizados[id] && montosPersonalizados[id] !== ''
        ? parseFloat(montosPersonalizados[id])
        : montoTotal;

    if (facturaYaSeleccionada) {
      // Restar el monto previamente sumado.
      setTotalRecibir(
        prevTotal =>
          prevTotal - (facturasSeleccionadas[id]?.monto || montoParaOperacion),
      );

      // Marcar la factura como deseleccionada (podría eliminarse del estado si prefieres).
      const nuevasFacturasSeleccionadas = { ...facturasSeleccionadas };
      delete nuevasFacturasSeleccionadas[id]; // O marcar como deseleccionada sin eliminar.
      setFacturasSeleccionadas(nuevasFacturasSeleccionadas);
    } else {
      // Sumar el monto.
      setTotalRecibir(prevTotal => prevTotal + montoParaOperacion);

      // Guardar el monto sumado y marcar como seleccionada.
      const nuevasFacturasSeleccionadas = {
        ...facturasSeleccionadas,
        [id]: { seleccionada: true, monto: montoParaOperacion },
      };
      setFacturasSeleccionadas(nuevasFacturasSeleccionadas);
    }
  };

  const renderItem = ({ item }) => {
    // Función para manejar el cambio en el monto a recibir ingresado por el usuario
    const handleInputChange = (id_factura, text) => {
      const nuevoMontosRecibir = { ...montosRecibir, [id_factura]: text };
      setMontosRecibir(nuevoMontosRecibir);
    };

    // Función para manejar la selección de una factura
    const manejarSeleccion = (id, montoTotal) => {
      const montoPersonalizado =
        montosRecibir[id] && montosRecibir[id] !== ''
          ? parseFloat(montosRecibir[id])
          : null; // Usamos null como indicador de que no hay monto personalizado válido.

      let montoParaOperacion;
      if (facturasSeleccionadas[id]?.seleccionada) {
        // Si estaba seleccionada y ahora se deselecciona, restamos el monto que habíamos sumado previamente.
        montoParaOperacion = facturasSeleccionadas[id].monto; // Monto previamente sumado.
        setTotalRecibir(prevTotal => prevTotal - montoParaOperacion);
        // Marcar la factura como deseleccionada o simplemente eliminarla de 'facturasSeleccionadas'.
        const nuevasFacturasSeleccionadas = { ...facturasSeleccionadas };
        delete nuevasFacturasSeleccionadas[id];
        setFacturasSeleccionadas(nuevasFacturasSeleccionadas);
      } else {
        // Si no estaba seleccionada y ahora se selecciona, sumamos el monto personalizado o el monto total.
        montoParaOperacion =
          montoPersonalizado !== null ? montoPersonalizado : montoTotal;
        setTotalRecibir(prevTotal => prevTotal + montoParaOperacion);
        // Guardamos el monto que estamos sumando para futuras referencias.
        const nuevasFacturasSeleccionadas = {
          ...facturasSeleccionadas,
          [id]: { seleccionada: true, monto: montoParaOperacion },
        };
        setFacturasSeleccionadas(nuevasFacturasSeleccionadas);
      }
    };

    return (
      <View
        style={[
          styles.itemContainer,
          // Aplicar estilo adicional si la factura está seleccionada
          facturasSeleccionadas[item.factura.id_factura] &&
          styles.itemSeleccionado,
        ]}>
        <TouchableOpacity
          style={styles.touchableArea}
          onPress={() =>
            manejarSeleccion(
              item.factura.id_factura,
              parseFloat(item.factura.monto_total),
            )
          }>
          {/* Información de la factura */}
          <Text style={styles.itemText}>
            ID Factura: {item.factura.id_factura}
          </Text>
          <Text style={styles.itemText}>
            Fecha de Emisión: {item.factura.fecha_formateada}
          </Text>
          <Text style={styles.itemText}>N.C.F.: {item.factura?.nfc || ''}</Text>
          <Text style={styles.itemText}>
            Plan: {item.conexion?.velocidad || 'No disponible'} Mbps
          </Text>
          <Text style={styles.itemText}>
            Descripcion: {item.factura.descripcion}
          </Text>
          <Text style={styles.itemText}>Estado: {item.factura.estado}</Text>
          <Text style={styles.itemText}>
            Monto: {formatearDinero(item.factura.monto_total)}
          </Text>
          {/* Agregando Monto Recibido */}
          <Text style={styles.itemText}>
            Monto Recibido: {formatearDinero(item.factura.monto_recibido || 0)}
          </Text>
          {/* ... otros datos de la factura ... */}
        </TouchableOpacity>
        <View style={styles.inputWithClearButtonContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            onChangeText={text =>
              handleInputChange(item.factura.id_factura, text)
            }
            value={montosRecibir[item.factura.id_factura]}
            placeholder="Monto a recibir"
            keyboardType="numeric"
            editable={!facturasSeleccionadas[item.factura.id_factura]} // Hace el campo no editable si el ítem está seleccionado
          />
          {montosRecibir[item.factura.id_factura] &&
            !facturasSeleccionadas[item.factura.id_factura] && (
              <TouchableOpacity
                onPress={() => handleInputChange(item.factura.id_factura, '')}
                style={styles.clearButton}>
                <Text style={styles.clearButtonText}>X</Text>
              </TouchableOpacity>
            )}
        </View>
        <View>
          <TouchableOpacity
            onPress={() => setFacturaEditandoNota(item.factura.id_factura)}>
            <Text style={styles.buttonText}>
              {notasFacturas[item.factura.id_factura]
                ? 'Editar Nota'
                : 'Agregar Nota'}
            </Text>
          </TouchableOpacity>
          {facturaEditandoNota === item.factura.id_factura && (
            <View>
              <TextInput
                style={styles.input}
                onChangeText={setNotaTemporal}
                value={notaTemporal}
                placeholder="Escribe una nota..."
              />
              <View style={styles.buttonContainerNotas}>
                <TouchableOpacity
                  onPress={() =>
                    actualizarNota(item.factura.id_factura, notaTemporal)
                  }>
                  <Text style={styles.buttonText}>OK</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={cancelarNota}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {notasFacturas[item.factura.id_factura] && (
            <Text style={styles.itemText}>
              Nota: {notasFacturas[item.factura.id_factura]}
            </Text>
          )}
        </View>
      </View>
    );
  };

  // Manejar la recepción del dinero
  const onRecibir = async () => {
    if (!idUsuario) {
      Alert.alert('Error', 'El ID del usuario no está disponible.');
      return;
    }

    // Mostrar el cuadro de diálogo de confirmación antes de proceder
    Alert.alert(
      'Confirmar Recepción', // Título del cuadro de diálogo
      '¿Estás seguro de que quieres recibir el dinero?', // Mensaje del cuadro de diálogo
      [
        {
          text: 'Cancelar',
          onPress: () => console.log('Cancelado'),
          style: 'cancel',
        },
        { text: 'Aceptar', onPress: () => procesarRecepcion() }, // Continuar con la recepción en caso de confirmar
      ],
    );
  };

  // Lógica para procesar la recepción del dinero
  const procesarRecepcion = async () => {
    const totalRecibirFormatted = totalRecibir.toFixed(2);

    // Extrayendo los IDs de las facturas seleccionadas y sus montos
    const facturasAEnviar = Object.entries(facturasSeleccionadas)
      .filter(([id, { seleccionada }]) => seleccionada)
      .map(([id, { monto }]) => ({
        id_factura: parseInt(id),
        monto_cobrado: parseFloat(monto).toFixed(2), // Asegurarse de que sea un string con dos decimales
        nota: notasFacturas[id] || '', // Incluye la nota aquí, usa un string vacío como valor por defecto
      }));

    const datosParaEnviar = {
      id_cliente: factura.factura.id_cliente,
      monto: totalRecibirFormatted,
      id_usuario: idUsuario,
      id_ciclo: id_ciclo,
      facturas: facturasAEnviar, // Aquí cambiamos la estructura para incluir montos
      cargos: [], // Asumiendo que no estás manejando cargos adicionales por ahora
    };

    console.log('Enviando datos al backend:', datosParaEnviar);

    try {
      const response = await axios.post(
        'https://wellnet-rd.com:444/api/facturas-procesar-cobro',
        datosParaEnviar,
      );
      const reciboData = response.data;
      // Navegar a ReciboScreen con los datos del recibo
      // También incluye cualquier otro dato que necesites presentar en ReciboScreen
      navigation.navigate('ReciboScreen', {
        reciboData: {
          ...reciboData, // Esto incluirá id_recibo y cualquier otro dato directamente desde la respuesta del backend
          // Aquí puedes añadir más datos si es necesario, por ejemplo:
          totalRecibir: totalRecibirFormatted,
          facturas: facturasAnteriores.filter(factura =>
            facturasAEnviar.includes(factura.factura.id_factura),
          ),
          // Asegúrate de ajustar la estructura de datos según sea necesario para tu implementación
        },
      });
    } catch (error) {
      console.error('Error al enviar datos:', error);
      Alert.alert('Error', 'No se pudo procesar el cobro correctamente.');
    }
  };

  const onImprimir = () => {
    console.log(prepararDatosImpresion());
    imprimirFactura(prepararDatosImpresion);
    // Aquí va tu lógica para manejar la impresión de la factura
  };

  const prepararDatosImpresion = () => {
    let datosParaImprimir = '';

    // Comandos ESC/POS para resetear la impresora
    // datosParaImprimir += '\x1b@';

    // Ejemplo de comando para texto en negrita
    // datosParaImprimir += '\x1bE\x01'; // Activa negrita
    // datosParaImprimir += '\x1b\x61\x01'; // Comando para centralizar texto
    // datosParaImprimir += '\x1D\x21\x11'; // Comando para aumentar el tamaño de la letra
    datosParaImprimir += '    WellNet TECHNOLOGIES\n';
    // datosParaImprimir += '\x1D\x21\x00'; // Comando para restablecer el tamaño de letra
    // datosParaImprimir += '\x1b\x61\x00'; // Comando para volver a alinear a la izquierda si es necesario
    // datosParaImprimir += '\x1bE\x00'; // Desactiva negrita

    datosParaImprimir += '      (829)839-1756\n';
    datosParaImprimir += '   info@wellnet-rd.com\n';
    datosParaImprimir +=
      'C/ Duarte #15 Guaucí Abajo, Moca, Espaillat, República Dominicana\n\n';

    datosParaImprimir += `Cliente: ${factura.cliente?.nombres} ${factura.cliente?.apellidos}\n`;
    datosParaImprimir += `ID de cliente: ${factura.factura?.id_cliente}\n`;
    datosParaImprimir += `Dirección: ${factura.conexion?.direccion || 'No disponible'
      }\n`;
    datosParaImprimir += `R.N.C.: ${factura.cliente?.rnc || 'No disponible'
      }\n\n`;

    // Iterar sobre facturas anteriores y añadirlas al texto
    facturasAnteriores.forEach(item => {
      datosParaImprimir += `ID Factura: ${item.factura.id_factura}\n`;
      datosParaImprimir += `Fecha de Emisión: ${item.factura.fecha_formateada}\n`;
      datosParaImprimir += `N.C.F.: ${item.factura?.nfc || ''}\n`;
      datosParaImprimir += `Plan: ${item.conexion?.velocidad || 'No disponible'
        } Mbps\n`;
      datosParaImprimir += `Descripcion: ${item.factura.descripcion}\n`;
      datosParaImprimir += `Estado: ${item.factura.estado}\n`;
      datosParaImprimir += `Monto: ${formatearDinero(
        item.factura.monto_total,
      )}\n\n`;
    });

    // Ejemplo de cómo añadir el total
    datosParaImprimir += `Suma Total: ${formatearDinero(sumaTotal)}\n`;
    // datosParaImprimir += `Recibir: ${formatearDinero(totalRecibir)}\n`;

    // Ejemplo de comando para cortar el papel automáticamente
    // datosParaImprimir += '\x1dV\x41\x03'; // Este comando puede variar dependiendo de la impresora

    // console.log(datosParaImprimir());
    return datosParaImprimir;
  };

  // Preparar argumentos para la función printBluetooth

  // Esta función asincrónica recupera la impresora desde el almacenamiento y luego imprime
  async function imprimirFactura(datosParaImprimir: () => string) {
    console.log('entro a la fubcion imprimir');

    console.log(datosParaImprimir);
    console.log(prepararDatosImpresion);
    console.log(prepararDatosImpresion());
    // inside async function
    // let  hola String = 'datos datos datos';
    try {
      await ThermalPrinterModule.printBluetooth({
        payload: datosParaImprimir(),
        printerNbrCharactersPerLine: 38,
      });
    } catch (err) {
      //error handling
      console.log(err.message);
    }
  }

  // Para enviar por correo electrónico
  const enviarCorreo = () => {
    const email = 'correo_del_cliente@example.com'; // Aquí deberías tener el correo del cliente
    const subject = encodeURIComponent('Detalles de tu Factura');
    const body = encodeURIComponent('Aquí van los detalles de la factura...');
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  // Para enviar por SMS
  const enviarSMS = () => {
    const numeroTelefono = '1234567890'; // Aquí deberías tener el número de teléfono del cliente
    const body = encodeURIComponent('Detalles de tu factura...');
    Linking.openURL(`sms:${numeroTelefono}?body=${body}`);
  };

  // Para enviar por WhatsApp
  const enviarWhatsApp = () => {
    const numeroTelefono = '1234567890'; // Aquí deberías tener el número de teléfono del cliente
    const mensaje = encodeURIComponent('Detalles de tu factura...');
    Linking.openURL(
      `https://api.whatsapp.com/send?phone=${numeroTelefono}&text=${mensaje}`,
    );
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.titleInfo}>WellNet</Text>
        <Text style={styles.info}>TECHNOLOGIES</Text>
        <Text style={styles.info}>(829)839-1756</Text>
        <Text style={styles.info}>info@wellnet-rd.com</Text>
        <Text style={styles.info}>
          C/ Duarte #15 Guaucí Abajo, Moca, Espaillat, República Dominicana
        </Text>
        <Text style={styles.title}>Factura</Text>
        <Text style={styles.detail}>
          Cliente: {factura.cliente?.nombres} {factura.cliente?.apellidos}
        </Text>
        <Text style={styles.detail}>
          ID de cliente: {factura.factura?.id_cliente}
        </Text>
        <Text style={styles.detail}>
          Dirección: {factura.cliente?.direccion || 'No disponible'}
        </Text>
        <Text style={styles.detail}>
          R.N.C.: {factura.cliente?.rnc || 'No disponible'}
        </Text>

        {facturasAnteriores.map((item, index) => (
          <View
            key={`factura-${item.factura.id_factura}`}
            style={styles.itemContainer}>
            {renderItem({ item })}
          </View>
        ))}
        {/* Muestra la suma total */}
        {/* Muestra la suma total con formato de dinero */}
        <Text style={styles.totalSum}>
          Total a Pagar: {formatearDinero(sumaTotal)}
        </Text>
        <Text style={styles.totalSum}>
          Recibir: {formatearDinero(totalRecibir)}
        </Text>
      </View>

      {!permisoOperacion && (
        <Text style={styles.permisoErrorText}>
          No tiene permiso para recibir dinero.
        </Text>
      )}

      {/* Botones en la parte inferior */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            (totalRecibir === 0 || !permisoOperacion) && styles.buttonDisabled,
          ]} // Añadir estilos condicionales
          onPress={onRecibir}
          disabled={totalRecibir === 0 || !permisoOperacion} // Deshabilitar el botón basado en el valor de totalRecibir y permisoOperacion
        >
          <Text style={styles.buttonText}>Recibir Dinero</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={onImprimir}>
          <Text style={styles.buttonText}>Imprimir Factura</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.button} onPress={enviarCorreo}>
          <Text style={styles.buttonText}>Enviar por Correo</Text>
        </TouchableOpacity> */}

        {/* <TouchableOpacity style={styles.button} onPress={enviarSMS}>
          <Text style={styles.buttonText}>Enviar por SMS</Text>
        </TouchableOpacity> */}

        {/* <TouchableOpacity style={styles.button} onPress={enviarWhatsApp}>
          <Text style={styles.buttonText}>Enviar por WhatsApp</Text>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    marginTop: 20,
  },
  titleInfo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 1,
    textAlign: 'center',
  },
  detail: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  info: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 1,
    textAlign: 'center',
  },
  itemContainer: {
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#1e1e1e',
    marginTop: 10,
  },
  itemText: {
    color: '#FFFFFF',
    marginBottom: 5,
  },
  totalSum: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 1,
    textAlign: 'right',
  },
  itemSeleccionado: {
    backgroundColor: '#585858', // O cualquier otro color que indique la selección
  },
  buttonContainer: {
    flexDirection: 'column', // Alinea los botones verticalmente
    justifyContent: 'center', // Centra los botones en el contenedor
    alignItems: 'stretch', // Estira los botones para que llenen el contenedor
    marginTop: 20,
    marginBottom: 20, // Espacio arriba y abajo del contenedor de botones
  },
  button: {
    backgroundColor: '#4e9f3d', // Un color verde para el botón de recibir dinero
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 2, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 10, // Asegúrate de tener un pequeño margen debajo de cada botón si pasan a la siguiente línea
    flex: 1, // Da a cada botón la capacidad de crecer y ocupar espacio disponible
    marginHorizontal: 5, // Añade un pequeño espacio entre los botones
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc', // Un color gris para indicar que el botón está deshabilitado
  },
  inputWithClearButtonContainer: {
    flexDirection: 'row', // Alinea horizontalmente el TextInput y el botón
    alignItems: 'center', // Centra los elementos verticalmente
    borderWidth: 1,
    borderRadius: 5,
    margin: 12,
  },
  input: {
    flex: 1, // Permite que el TextInput ocupe todo el espacio menos el del botón
    padding: 10,
    color: 'white',
    backgroundColor: '#333333',
  },
  clearButton: {
    // Estiliza tu botón de borrado aquí
    padding: 10,
  },
  clearButtonText: {
    color: '#FFFFFF', // Puedes ajustar el color según tu tema
  },
  buttonContainerNotas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10, // Ajusta este valor según necesites
  },
  permisoErrorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default DetallesFacturaScreen;
