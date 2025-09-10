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
      const endpoints = [
        'https://wellnet-rd.com:444/api/facturas/consulta-recibo-id', // nuevo endpoint
        'https://wellnet-rd.com:444/api/consulta-recibo-id', // compatibilidad
      ];

      let data: any = null;
      let ok = false;
      let lastErr: any = null;

      for (const url of endpoints) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_recibo: reciboData.id_recibo, pdf: 0 }),
          });
          const body = await response.json();
          if (response.ok) {
            data = body;
            ok = true;
            break;
          } else {
            lastErr = new Error(body?.message || `HTTP ${response.status}`);
          }
        } catch (e) {
          lastErr = e;
        }
      }

      if (!ok || !data) throw lastErr || new Error('Sin datos');

      console.log('Datos del recibo:', data.recibo);
      console.log('Datos del cliente:', data.cliente);
      console.log('Facturas asociadas al recibo:', data.facturas);

      const totalPendiente = (data.facturas || []).reduce((acc: number, f: any) => {
        const mt = Number(f?.monto_total || 0);
        const acum = Number(f?.monto_recibido_factura || f?.monto_recibido_acumulado || 0);
        const pendiente = Number.isFinite(mt - acum) ? (mt - acum) : 0;
        return acc + Math.max(0, pendiente);
      }, 0);

      setReciboDetalles({ ...data, totalPendiente });
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

    // ===== Config =====
    const W = 32;                         // 58mm: 32 | 80mm: 42/48
    const line = (ch = '=') => ch.repeat(W);
    const dash = () => '-'.repeat(W);

    // Formato moneda: usa espacio normal (no NBSP) para contar bien caracteres
    const fmt = (n?: number) =>
      new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' })
        .format(Number(n || 0)).replace(/\u00A0/g, ' '); // 'RD$ 800.00'

    // Envoltura por palabras (no corta en mitad)
    const wrapWords = (txt?: string, width = W) => {
      const s = (txt ?? '').toString().trim();
      if (!s) return [];
      const out: string[] = [];
      let line = '';
      for (const w of s.split(/\s+/)) {
        const next = (line ? line + ' ' : '') + w;
        if (next.length <= width) line = next;
        else { if (line) out.push(line); line = w.length > width ? w.slice(0, width) : w; }
      }
      if (line) out.push(line);
      return out;
    };

    // Hora en formato 12h con AM/PM (ej: 12:25 PM)
    const toAmPm = (input?: string | null) => {
      const fallback = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      if (!input) return fallback;
      let s = String(input).trim();
      if (!s) return fallback;
      // normaliza variantes españolas
      s = s
        .replace(/\b(p\s*\.?\s*m\.?)/i, 'PM')
        .replace(/\b(a\s*\.?\s*m\.?)/i, 'AM');
      const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
      if (!m) {
        // intenta extraer de 24h: HH:MM[:SS]
        const m24 = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
        if (m24) {
          let h = parseInt(m24[1], 10);
          const mm = m24[2];
          const ampm = h >= 12 ? 'PM' : 'AM';
          h = h % 12; if (h === 0) h = 12;
          return `${h}:${mm} ${ampm}`;
        }
        return fallback;
      }
      let h = parseInt(m[1], 10);
      const mm = m[2];
      let ampm = (m[4] || '').toUpperCase();
      if (!ampm) {
        // si no trae AM/PM, asumir 24h
        const h24 = h;
        ampm = h24 >= 12 ? 'PM' : 'AM';
        h = h24 % 12; if (h === 0) h = 12;
      } else {
        // asegura 12h coherente si el valor es 0/>=13 por error
        if (h === 0) h = 12;
        if (h > 12) h = h % 12;
      }
      return `${h}:${mm} ${ampm}`;
    };

    // 2 columnas (izq/der) sobre una línea
    const col2 = (left: string, right: string) => `[L]${left}[R]${right}\n`;

    // 3 columnas compactas "Monto | Pagado | Saldo" (ajusta anchos si cambias W)
    const trio = (a: string, b: string, c: string) => {
      if (W === 32) return `[L]${a.padEnd(10)}${b.padEnd(10)}[R]${c}\n`;
      if (W === 42) return `[L]${a.padEnd(14)}${b.padEnd(14)}[R]${c}\n`;
      /* W=48 */    return `[L]${a.padEnd(16)}${b.padEnd(16)}[R]${c}\n`;
    };

    // Datos seguros (fecha/hora nunca vacías)
    const safe = (v?: any) => (v && v !== 'N/A' ? v : null);
    const fecha = safe(reciboDetalles.recibo.fecha_formateada)
               ?? new Date().toLocaleDateString('es-DO');
    const hora  = toAmPm(safe(reciboDetalles.recibo.hora_formateada));

    const empresa = (ispData?.nombre || 'Well Net').toUpperCase();
    const tel = ispData?.telefono;
    const dir = ispData?.direccion;

    // ===== Build payload =====
    let t = '';

    // Encabezado corporativo
    // t += `[C]<b><font size='big'>${empresa}</font></b>\n`; // Comentado: Título con nombre de empresa (reservado para futuro)
    if (tel) t += `[C]${tel}\n`;
    if (dir) t += `[C]${dir}\n`;
    t += `[C]${line('=')}\n`;

    // Título del documento
    t += `[C]<b>Recibo de pago</b>\n`;
    t += `[C]N.º ${reciboDetalles.recibo.id_recibo}\n\n`;

    // Información del cliente
    t += `[L]<b>Información del cliente</b>\n`;
    t += `Cliente N.º: ${reciboDetalles.cliente.id_cliente ?? reciboDetalles.recibo.id_cliente ?? '—'}\n`;
    wrapWords(`Nombre: ${reciboDetalles.cliente.nombres} ${reciboDetalles.cliente.apellidos}`).forEach(l => t += `${l}\n`);
    if (reciboDetalles?.cliente?.telefono)  t += `Teléfono: ${reciboDetalles.cliente.telefono}\n`;
    if (reciboDetalles?.cliente?.direccion) wrapWords(`Dirección: ${reciboDetalles.cliente.direccion}`).forEach(l => t += `${l}\n`);
    t += `\n`;

    // Información del recibo (bloque derecho del PDF, aquí como 2 columnas)
    t += `[L]<b>Información del recibo</b>\n`;
    t += col2(`Fecha: ${fecha}`, `Hora: ${hora}`);
    t += col2(`Cajero: ${reciboDetalles?.usuario?.nombre ?? reciboDetalles?.recibo?.cajero ?? '—'}`,
              `Método: ${reciboDetalles?.recibo?.metodo_pago ?? '—'}`);
    // Detalle de pago (si existe)
    const dp: any = (reciboDetalles as any)?.recibo?.detalle_pago || {};
    const addIf = (label: string, v?: any) => {
      const s = (v ?? '').toString().trim();
      if (s) t += `${label}: ${s}\n`;
    };
    addIf('Banco', dp.banco);
    addIf('Referencia', dp.referencia);
    addIf('Cuenta destino', dp.cuenta_destino);
    addIf('Titular', dp.titular);
    addIf('Fecha cheque', dp.fecha_cheque);
    addIf('Nota', dp.nota);
    t += `[C]${dash()}\n`;

    // Detalle de facturas
    t += `[C]<b>Detalle de facturas</b>\n`;
    t += `[L]Factura  Descripción\n`;
    t += `[R]Pagado\n`;
    t += `[C]${dash()}\n`;

    for (const f of reciboDetalles.facturas) {
      // Fila 1: Factura + Descripción
      const fact = String(f.id_factura).padEnd(6).slice(0, 6);
      const desc = (f.descripcion || '—').slice(0, W - 7);
      t += `[L]${fact}${desc}\n`;

      // Fila 2: Periodo (DD/MM/AAAA - DD/MM/AAAA) o texto de periodo
      const val = (x?: any) => {
        if (x === null || x === undefined) return null;
        const s = String(x).trim();
        if (!s || /^N\/?A$/i.test(s) || /^null$/i.test(s) || /^undefined$/i.test(s)) return null;
        return s;
      };
      const fmtDate = (s?: string | null) => {
        const v = val(s);
        if (!v) return null;
        // YYYY-MM-DD o YYYY/MM/DD
        const m = v.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
        if (m) {
          const dd = m[3].padStart(2, '0');
          const mm = m[2].padStart(2, '0');
          const yy = m[1];
          return `${dd}/${mm}/${yy}`;
        }
        // DD-MM-YYYY o DD/MM/YYYY
        const m2 = v.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/);
        if (m2) {
          const dd = m2[1].padStart(2, '0');
          const mm = m2[2].padStart(2, '0');
          const yy = m2[3];
          return `${dd}/${mm}/${yy}`;
        }
        // YYYY-MM (mes-año)
        const m3 = v.match(/^(\d{4})[-\/.](\d{1,2})$/);
        if (m3) {
          const yy = m3[1];
          const mm = m3[2].padStart(2, '0');
          return `01/${mm}/${yy}`;
        }
        return v;
      };
      const periodoTexto = val(f.periodo) || val(f.periodo_texto) || val(f.periodo_facturacion)
        || val((f as any)?.factura?.periodo) || val((f as any)?.detalle?.periodo);
      const desde = fmtDate(
        val(f.periodo_desde) || val(f.periodo_inicio) || val(f.fecha_desde) || val(f.fecha_inicio) || val(f.desde) || val(f.inicio)
        || val((f as any)?.factura?.periodo_desde) || val((f as any)?.factura?.periodo_inicio) || val((f as any)?.factura?.fecha_desde)
        || val((f as any)?.detalle?.periodo_desde) || val((f as any)?.detalle?.periodo_inicio) || val((f as any)?.detalle?.fecha_desde)
      );
      const hasta = fmtDate(
        val(f.periodo_hasta) || val(f.periodo_fin) || val(f.fecha_hasta) || val(f.fecha_fin) || val(f.hasta) || val(f.fin)
        || val((f as any)?.factura?.periodo_hasta) || val((f as any)?.factura?.periodo_fin) || val((f as any)?.factura?.fecha_hasta)
        || val((f as any)?.detalle?.periodo_hasta) || val((f as any)?.detalle?.periodo_fin) || val((f as any)?.detalle?.fecha_hasta)
      );
      const mesNombre = val((f as any)?.mes_nombre) || val((f as any)?.mesNombre) || val((f as any)?.mes_texto);
      const mesNum = val((f as any)?.mes) || val((f as any)?.month);
      const anio = val((f as any)?.anio) || val((f as any)?.ano) || val((f as any)?.year);
      const periodoMes = (mesNombre && anio)
        ? `${mesNombre} ${anio}`
        : (mesNum && anio)
          ? `${mesNum}/${anio}`
          : null;
      // Requisito: siempre presentar dos fechas (inicio y fin)
      // Si faltan ambas, omitimos la línea; si falta una, mostramos '-'
      const periodo = (desde || hasta)
        ? `Periodo: ${desde || '-' } - ${hasta || '-' }`
        : '';
      if (periodo) wrapWords(periodo).forEach(l => t += `[L]${l}\n`);

      // Fila 3: Monto | Pagado | Saldo (alineado y con espacio visual)
      const monto  = fmt(f.monto_total);
      const pagado = fmt(f.monto_recibido);
      const saldo  = fmt(Math.max(0, (f.monto_total || 0) - (f.monto_recibido || 0)));
      t += trio(`Monto ${monto}`, `Pagado ${pagado}`, `Saldo ${saldo}`);

      t += `[C]${dash()}\n`;
    }

    // Totales
    t += `[C]${line('=')}\n`;
    t += col2(`<b>Total recibido</b>`, `<b>${fmt(reciboDetalles.recibo.monto)}</b>`);
    t += col2(`Total pendiente`, `${fmt(reciboDetalles.totalPendiente)}`);
    t += `\n`;

    // Footer
    t += `[C]¡Gracias por su pago!\n`;
    t += `[C]Este recibo es válido como\n`;
    t += `[C]comprobante de pago\n`;
    const now = new Date();
    const auditDate = now.toLocaleDateString('es-DO');
    const auditTime = toAmPm(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    const auditStr = `${auditDate} ${auditTime}`;
    // Separar en 2 líneas y quitar el '|'
    t += `[C]Generado: ${auditStr}\n`;
    t += `[C]Sistema ISP Core v1.2.0\n`;
    t += `[L]\n[L]\n`; // feed extra

    // Reemplazo de acentos y símbolos no ASCII (algunas térmicas no los soportan)
    const sanitize = (s: string) => s
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita diacríticos (áéíóúñ -> aeioun)
      .replace(/[–—]/g, '-')
      .replace(/\u00A0/g, ' ')            // NBSP -> espacio normal
      .replace(/\u00A1/g, '')             // elimina '¡' para evitar que se "coma" la G
      .replace(/\u00BF/g, '?')            // '¿' -> '?'
      .replace(/[“”«»]/g, '"');

    const payload = sanitize(t);

    try {
      await ThermalPrinterModule.printBluetooth({
        payload,
        printerNbrCharactersPerLine: W,
      });
      Alert.alert('Éxito', 'El recibo se ha impreso correctamente');
    } catch (err: any) {
      console.log(err?.message);
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
      {/* Método y detalles de pago */}
      <Text style={themeStyles.text}>
        Método de pago: {reciboDetalles?.recibo?.metodo_pago || '—'}
      </Text>
      {reciboDetalles?.recibo?.detalle_pago && (
        <View>
          {!!reciboDetalles?.recibo?.detalle_pago?.banco && (
            <Text style={themeStyles.text}>Banco: {reciboDetalles.recibo.detalle_pago.banco}</Text>
          )}
          {!!reciboDetalles?.recibo?.detalle_pago?.referencia && (
            <Text style={themeStyles.text}>Referencia: {reciboDetalles.recibo.detalle_pago.referencia}</Text>
          )}
          {!!reciboDetalles?.recibo?.detalle_pago?.cuenta_destino && (
            <Text style={themeStyles.text}>Cuenta destino: {reciboDetalles.recibo.detalle_pago.cuenta_destino}</Text>
          )}
          {!!reciboDetalles?.recibo?.detalle_pago?.titular && (
            <Text style={themeStyles.text}>Titular: {reciboDetalles.recibo.detalle_pago.titular}</Text>
          )}
          {!!reciboDetalles?.recibo?.detalle_pago?.fecha_cheque && (
            <Text style={themeStyles.text}>Fecha cheque: {reciboDetalles.recibo.detalle_pago.fecha_cheque}</Text>
          )}
          {!!reciboDetalles?.recibo?.detalle_pago?.nota && (
            <Text style={themeStyles.text}>Nota: {reciboDetalles.recibo.detalle_pago.nota}</Text>
          )}
        </View>
      )}
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
