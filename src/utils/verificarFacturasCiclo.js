/**
 * Script de Verificación de Facturas del Ciclo
 *
 * Este script ayuda a diagnosticar discrepancias en las facturas
 * asignadas a un ciclo específico.
 */

import axios from 'axios';

/**
 * Verifica las facturas de un ciclo y detecta inconsistencias
 */
export const verificarFacturasCiclo = async (idCiclo) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 VERIFICACIÓN DE FACTURAS - CICLO ${idCiclo}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
        // 1. Obtener información del ciclo
        console.log('📋 Paso 1: Obteniendo información del ciclo...');
        const cicloResponse = await axios.get(
            `https://wellnet-rd.com:444/api/ciclos/${idCiclo}`
        );
        const ciclo = cicloResponse.data;

        console.log(`✅ Ciclo encontrado:`);
        console.log(`   - ID: ${ciclo.id_ciclo}`);
        console.log(`   - ID Ciclo Base: ${ciclo.id_ciclo_base}`);
        console.log(`   - Día del mes: ${ciclo.dia_mes || 'N/A'}`);
        console.log(`   - Inicio: ${ciclo.inicio}`);
        console.log(`   - Final: ${ciclo.final}`);
        console.log(`   - Estado: ${ciclo.estado}`);

        // 2. Obtener estadísticas del ciclo
        console.log('\n📊 Paso 2: Obteniendo estadísticas del ciclo...');
        const statsResponse = await axios.post(
            'https://wellnet-rd.com:444/api/conexiones/estadisticas-por-ciclo',
            { id_ciclo: idCiclo }
        );
        const stats = statsResponse.data.data;

        console.log(`✅ Estadísticas:`);
        console.log(`   - Total facturas: ${ciclo.total_facturas}`);
        console.log(`   - Facturas pendientes: ${ciclo.facturas_pendiente}`);
        console.log(`   - Facturas cobradas: ${ciclo.total_facturas - ciclo.facturas_pendiente}`);
        console.log(`   - Total dinero: RD$ ${ciclo.total_dinero}`);
        console.log(`   - Dinero cobrado: RD$ ${ciclo.dinero_cobrado}`);

        // 3. Obtener lista de facturas del ciclo
        console.log('\n📄 Paso 3: Obteniendo lista de facturas...');
        const facturasResponse = await axios.get(
            `https://wellnet-rd.com:444/api/facturas?id_ciclo=${idCiclo}`
        );
        const facturas = facturasResponse.data.facturas || facturasResponse.data.data || [];

        console.log(`✅ Facturas obtenidas: ${facturas.length}`);

        // 4. Obtener conexiones del ciclo
        console.log('\n🔌 Paso 4: Obteniendo conexiones del ciclo...');
        const conexionesResponse = await axios.post(
            'https://wellnet-rd.com:444/api/conexiones/listar-por-ciclo',
            { id_ciclo: idCiclo }
        );
        const conexiones = conexionesResponse.data.data || [];

        console.log(`✅ Conexiones obtenidas: ${conexiones.length}`);

        // 5. ANÁLISIS DE DISCREPANCIAS
        console.log('\n' + '='.repeat(60));
        console.log('🔍 ANÁLISIS DE DISCREPANCIAS');
        console.log('='.repeat(60));

        const discrepancias = {
            encontradas: false,
            detalles: []
        };

        // Verificación 1: Total de facturas vs facturas listadas
        if (facturas.length !== ciclo.total_facturas) {
            discrepancias.encontradas = true;
            discrepancias.detalles.push({
                tipo: 'CANTIDAD_FACTURAS',
                esperado: ciclo.total_facturas,
                obtenido: facturas.length,
                diferencia: Math.abs(ciclo.total_facturas - facturas.length),
                mensaje: `⚠️ DISCREPANCIA: El ciclo reporta ${ciclo.total_facturas} facturas, pero se obtuvieron ${facturas.length}`
            });
        }

        // Verificación 2: Conexiones vs Facturas
        if (conexiones.length !== facturas.length) {
            discrepancias.encontradas = true;
            discrepancias.detalles.push({
                tipo: 'CONEXIONES_VS_FACTURAS',
                conexiones: conexiones.length,
                facturas: facturas.length,
                diferencia: Math.abs(conexiones.length - facturas.length),
                mensaje: `⚠️ DISCREPANCIA: Hay ${conexiones.length} conexiones pero ${facturas.length} facturas`
            });
        }

        // Verificación 3: Analizar cada factura
        console.log('\n📝 Verificando cada factura...');
        const facturasProblematicas = [];

        for (const factura of facturas) {
            const problemas = [];

            // Verificar que la factura tenga el id_ciclo correcto
            if (factura.id_ciclo && factura.id_ciclo !== idCiclo) {
                problemas.push(`ID ciclo incorrecto: ${factura.id_ciclo} (esperado: ${idCiclo})`);
            }

            // Verificar que la factura tenga id_ciclo_base correcto
            if (factura.id_ciclo_base && ciclo.id_ciclo_base && factura.id_ciclo_base !== ciclo.id_ciclo_base) {
                problemas.push(`ID ciclo base incorrecto: ${factura.id_ciclo_base} (esperado: ${ciclo.id_ciclo_base})`);
            }

            // Verificar fechas
            if (factura.fecha_emision) {
                const fechaFactura = new Date(factura.fecha_emision);
                const fechaInicio = new Date(ciclo.inicio);
                const fechaFinal = new Date(ciclo.final);

                if (fechaFactura < fechaInicio || fechaFactura > fechaFinal) {
                    problemas.push(`Fecha fuera de rango: ${factura.fecha_emision} (ciclo: ${ciclo.inicio} - ${ciclo.final})`);
                }
            }

            if (problemas.length > 0) {
                facturasProblematicas.push({
                    id_factura: factura.id_factura,
                    numero_factura: factura.numero_factura,
                    id_ciclo: factura.id_ciclo,
                    id_ciclo_base: factura.id_ciclo_base,
                    fecha_emision: factura.fecha_emision,
                    id_cliente: factura.id_cliente,
                    id_conexion: factura.id_conexion,
                    total: factura.total,
                    problemas
                });
            }
        }

        // Mostrar facturas problemáticas
        if (facturasProblematicas.length > 0) {
            discrepancias.encontradas = true;
            console.log(`\n❌ FACTURAS PROBLEMÁTICAS: ${facturasProblematicas.length}`);
            console.log('─'.repeat(60));

            facturasProblematicas.forEach((factura, index) => {
                console.log(`\n${index + 1}. Factura #${factura.numero_factura} (ID: ${factura.id_factura})`);
                console.log(`   Cliente ID: ${factura.id_cliente}`);
                console.log(`   Conexión ID: ${factura.id_conexion}`);
                console.log(`   ID Ciclo: ${factura.id_ciclo} ${factura.id_ciclo !== idCiclo ? '⚠️ INCORRECTO' : '✅'}`);
                console.log(`   ID Ciclo Base: ${factura.id_ciclo_base} ${factura.id_ciclo_base !== ciclo.id_ciclo_base ? '⚠️ INCORRECTO' : '✅'}`);
                console.log(`   Fecha Emisión: ${factura.fecha_emision}`);
                console.log(`   Total: RD$ ${factura.total}`);
                console.log(`   Problemas:`);
                factura.problemas.forEach(problema => {
                    console.log(`      - ${problema}`);
                });
            });

            discrepancias.detalles.push({
                tipo: 'FACTURAS_INCORRECTAS',
                cantidad: facturasProblematicas.length,
                facturas: facturasProblematicas,
                mensaje: `⚠️ Se encontraron ${facturasProblematicas.length} facturas con datos incorrectos`
            });
        }

        // Verificación 4: Suma de totales
        console.log('\n💰 Verificando totales de dinero...');
        const sumaTotalFacturas = facturas.reduce((sum, f) => sum + parseFloat(f.total || 0), 0);
        const diferenciaTotal = Math.abs(sumaTotalFacturas - parseFloat(ciclo.total_dinero || 0));

        if (diferenciaTotal > 0.01) { // Tolerancia de 1 centavo por redondeo
            discrepancias.encontradas = true;
            discrepancias.detalles.push({
                tipo: 'SUMA_TOTALES',
                sumaTotalFacturas: sumaTotalFacturas.toFixed(2),
                totalCiclo: parseFloat(ciclo.total_dinero || 0).toFixed(2),
                diferencia: diferenciaTotal.toFixed(2),
                mensaje: `⚠️ DISCREPANCIA: Suma de facturas (${sumaTotalFacturas.toFixed(2)}) ≠ Total ciclo (${ciclo.total_dinero})`
            });
        }

        // RESUMEN FINAL
        console.log('\n' + '='.repeat(60));
        console.log('📋 RESUMEN DE VERIFICACIÓN');
        console.log('='.repeat(60));

        if (discrepancias.encontradas) {
            console.log('\n❌ SE ENCONTRARON DISCREPANCIAS\n');
            discrepancias.detalles.forEach((disc, index) => {
                console.log(`${index + 1}. ${disc.mensaje}`);
            });

            console.log('\n🔧 RECOMENDACIONES:');
            console.log('   1. Revisar el backend para identificar facturas mal asignadas');
            console.log('   2. Verificar la lógica de asignación de id_ciclo en la creación de facturas');
            console.log('   3. Ejecutar un script de corrección de datos');
            console.log('   4. Recalcular las estadísticas del ciclo');
        } else {
            console.log('\n✅ NO SE ENCONTRARON DISCREPANCIAS');
            console.log('   Todas las facturas están correctamente asignadas al ciclo.');
        }

        console.log('\n' + '='.repeat(60) + '\n');

        return {
            ciclo,
            stats,
            totalFacturas: facturas.length,
            totalConexiones: conexiones.length,
            facturasProblematicas,
            discrepancias,
            facturas: facturas.slice(0, 10) // Primeras 10 para referencia
        };

    } catch (error) {
        console.error('\n❌ ERROR durante la verificación:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
        throw error;
    }
};

/**
 * Generar reporte detallado para el backend
 */
export const generarReporteBackend = (resultado) => {
    const reporte = {
        timestamp: new Date().toISOString(),
        ciclo_id: resultado.ciclo.id_ciclo,
        resumen: {
            discrepancias_encontradas: resultado.discrepancias.encontradas,
            total_discrepancias: resultado.discrepancias.detalles.length,
            facturas_problematicas: resultado.facturasProblematicas.length,
            total_facturas_esperadas: resultado.ciclo.total_facturas,
            total_facturas_obtenidas: resultado.totalFacturas,
            total_conexiones: resultado.totalConexiones
        },
        detalles_discrepancias: resultado.discrepancias.detalles,
        facturas_problematicas: resultado.facturasProblematicas,
        ciclo_info: {
            id_ciclo: resultado.ciclo.id_ciclo,
            id_ciclo_base: resultado.ciclo.id_ciclo_base,
            inicio: resultado.ciclo.inicio,
            final: resultado.ciclo.final,
            estado: resultado.ciclo.estado,
            total_dinero: resultado.ciclo.total_dinero,
            dinero_cobrado: resultado.ciclo.dinero_cobrado
        }
    };

    return reporte;
};

export default verificarFacturasCiclo;
