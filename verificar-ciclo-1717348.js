/**
 * Script de Verificación del Ciclo 1717348
 *
 * Ejecutar: node verificar-ciclo-1717348.js
 */

const axios = require('axios');
const fs = require('fs');

// Deshabilitar verificación SSL para desarrollo
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const ID_CICLO = 1717348;

async function verificarCiclo() {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🔍 VERIFICACIÓN DE FACTURAS - CICLO ${ID_CICLO}`);
    console.log(`${'='.repeat(80)}\n`);

    try {
        // 1. Obtener estadísticas del ciclo desde el endpoint de estadísticas
        console.log('📊 Paso 1: Obteniendo estadísticas del ciclo...');
        const statsResponse = await axios.post(
            'https://wellnet-rd.com:444/api/conexiones/estadisticas-por-ciclo',
            { id_ciclo: ID_CICLO }
        );

        console.log('✅ Estadísticas obtenidas:');
        console.log(JSON.stringify(statsResponse.data, null, 2));

        // 2. Obtener información detallada del ciclo
        console.log('\n📋 Paso 2: Obteniendo información del ciclo desde /api/ciclos...');
        let cicloInfo = null;
        try {
            const cicloResponse = await axios.get(
                `https://wellnet-rd.com:444/api/ciclos/${ID_CICLO}`
            );
            cicloInfo = cicloResponse.data;
            console.log('✅ Información del ciclo:');
            console.log(`   - ID Ciclo: ${cicloInfo.id_ciclo}`);
            console.log(`   - ID Ciclo Base: ${cicloInfo.id_ciclo_base}`);
            console.log(`   - Inicio: ${cicloInfo.inicio}`);
            console.log(`   - Final: ${cicloInfo.final}`);
            console.log(`   - Total Facturas: ${cicloInfo.total_facturas}`);
            console.log(`   - Facturas Pendientes: ${cicloInfo.facturas_pendiente}`);
            console.log(`   - Total Dinero: RD$ ${cicloInfo.total_dinero}`);
            console.log(`   - Dinero Cobrado: RD$ ${cicloInfo.dinero_cobrado}`);
        } catch (error) {
            console.log('⚠️ No se pudo obtener info del ciclo desde /api/ciclos');
            console.log(`   Error: ${error.message}`);
        }

        // 3. Obtener lista de facturas del ciclo
        console.log('\n📄 Paso 3: Obteniendo lista de facturas...');
        let facturas = [];
        try {
            const facturasResponse = await axios.get(
                `https://wellnet-rd.com:444/api/facturas?id_ciclo=${ID_CICLO}`
            );
            facturas = facturasResponse.data.facturas || facturasResponse.data.data || facturasResponse.data || [];
            console.log(`✅ Facturas obtenidas del endpoint: ${facturas.length}`);
        } catch (error) {
            console.log('⚠️ Error obteniendo facturas:');
            console.log(`   ${error.message}`);
        }

        // 4. Obtener conexiones del ciclo
        console.log('\n🔌 Paso 4: Obteniendo conexiones del ciclo...');
        const conexionesResponse = await axios.post(
            'https://wellnet-rd.com:444/api/conexiones/listar-por-ciclo',
            { id_ciclo: ID_CICLO }
        );
        const conexiones = conexionesResponse.data.data || [];
        console.log(`✅ Conexiones obtenidas: ${conexiones.length}`);

        // 5. ANÁLISIS DE DISCREPANCIAS
        console.log('\n' + '='.repeat(80));
        console.log('🔍 ANÁLISIS DE DISCREPANCIAS');
        console.log('='.repeat(80));

        const discrepancias = [];
        const facturasProblematicas = [];

        // Comparar facturas del ciclo vs estadísticas
        if (cicloInfo && facturas.length !== cicloInfo.total_facturas) {
            const disc = {
                tipo: 'CANTIDAD_FACTURAS',
                severidad: 'ALTA',
                mensaje: `El ciclo reporta ${cicloInfo.total_facturas} facturas, pero se obtuvieron ${facturas.length} facturas`,
                esperado: cicloInfo.total_facturas,
                obtenido: facturas.length,
                diferencia: Math.abs(cicloInfo.total_facturas - facturas.length)
            };
            discrepancias.push(disc);
            console.log(`\n❌ DISCREPANCIA 1: ${disc.mensaje}`);
            console.log(`   Esperado: ${disc.esperado}`);
            console.log(`   Obtenido: ${disc.obtenido}`);
            console.log(`   Diferencia: ${disc.diferencia} facturas`);
        }

        // Comparar conexiones vs facturas
        if (conexiones.length !== facturas.length) {
            const disc = {
                tipo: 'CONEXIONES_VS_FACTURAS',
                severidad: 'MEDIA',
                mensaje: `Hay ${conexiones.length} conexiones pero ${facturas.length} facturas`,
                conexiones: conexiones.length,
                facturas: facturas.length,
                diferencia: Math.abs(conexiones.length - facturas.length)
            };
            discrepancias.push(disc);
            console.log(`\n⚠️ DISCREPANCIA 2: ${disc.mensaje}`);
            console.log(`   Conexiones: ${disc.conexiones}`);
            console.log(`   Facturas: ${disc.facturas}`);
            console.log(`   Diferencia: ${disc.diferencia}`);
        }

        // Analizar cada factura
        if (facturas.length > 0 && cicloInfo) {
            console.log('\n📝 Analizando cada factura...');
            const fechaInicio = new Date(cicloInfo.inicio);
            const fechaFinal = new Date(cicloInfo.final);

            for (const factura of facturas) {
                const problemas = [];

                // Verificar id_ciclo
                if (factura.id_ciclo && factura.id_ciclo !== ID_CICLO) {
                    problemas.push(`ID ciclo incorrecto: ${factura.id_ciclo} (esperado: ${ID_CICLO})`);
                }

                // Verificar id_ciclo_base
                if (factura.id_ciclo_base && cicloInfo.id_ciclo_base && factura.id_ciclo_base !== cicloInfo.id_ciclo_base) {
                    problemas.push(`ID ciclo base incorrecto: ${factura.id_ciclo_base} (esperado: ${cicloInfo.id_ciclo_base})`);
                }

                // Verificar fecha de emisión
                if (factura.fecha_emision) {
                    const fechaFactura = new Date(factura.fecha_emision);
                    if (fechaFactura < fechaInicio || fechaFactura > fechaFinal) {
                        problemas.push(`Fecha fuera de rango: ${factura.fecha_emision} (ciclo: ${cicloInfo.inicio} - ${cicloInfo.final})`);
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
                        total: factura.total,
                        problemas
                    });
                }
            }

            if (facturasProblematicas.length > 0) {
                const disc = {
                    tipo: 'FACTURAS_INCORRECTAS',
                    severidad: 'CRÍTICA',
                    mensaje: `Se encontraron ${facturasProblematicas.length} facturas con datos incorrectos`,
                    cantidad: facturasProblematicas.length,
                    facturas: facturasProblematicas
                };
                discrepancias.push(disc);

                console.log(`\n❌ DISCREPANCIA 3: ${disc.mensaje}`);
                console.log('─'.repeat(80));

                facturasProblematicas.slice(0, 10).forEach((factura, index) => {
                    console.log(`\n${index + 1}. Factura #${factura.numero_factura} (ID: ${factura.id_factura})`);
                    console.log(`   ID Ciclo: ${factura.id_ciclo} ${factura.id_ciclo !== ID_CICLO ? '⚠️ INCORRECTO' : '✅'}`);
                    console.log(`   ID Ciclo Base: ${factura.id_ciclo_base} ${factura.id_ciclo_base !== cicloInfo.id_ciclo_base ? '⚠️ INCORRECTO' : '✅'}`);
                    console.log(`   Fecha: ${factura.fecha_emision}`);
                    console.log(`   Total: RD$ ${factura.total}`);
                    console.log(`   Problemas:`);
                    factura.problemas.forEach(p => console.log(`      - ${p}`));
                });

                if (facturasProblematicas.length > 10) {
                    console.log(`\n... y ${facturasProblematicas.length - 10} facturas problemáticas más`);
                }
            }
        }

        // Verificar suma de totales
        if (facturas.length > 0 && cicloInfo) {
            console.log('\n💰 Verificando totales...');
            const sumaTotalFacturas = facturas.reduce((sum, f) => sum + parseFloat(f.total || 0), 0);
            const totalCiclo = parseFloat(cicloInfo.total_dinero || 0);
            const diferencia = Math.abs(sumaTotalFacturas - totalCiclo);

            console.log(`   Suma de facturas: RD$ ${sumaTotalFacturas.toFixed(2)}`);
            console.log(`   Total del ciclo: RD$ ${totalCiclo.toFixed(2)}`);
            console.log(`   Diferencia: RD$ ${diferencia.toFixed(2)}`);

            if (diferencia > 0.01) {
                const disc = {
                    tipo: 'SUMA_TOTALES',
                    severidad: 'ALTA',
                    mensaje: `Suma de facturas (${sumaTotalFacturas.toFixed(2)}) ≠ Total ciclo (${totalCiclo.toFixed(2)})`,
                    sumaTotalFacturas: sumaTotalFacturas.toFixed(2),
                    totalCiclo: totalCiclo.toFixed(2),
                    diferencia: diferencia.toFixed(2)
                };
                discrepancias.push(disc);
                console.log(`   ❌ DISCREPANCIA 4: ${disc.mensaje}`);
            } else {
                console.log(`   ✅ Los totales coinciden`);
            }
        }

        // RESUMEN FINAL
        console.log('\n' + '='.repeat(80));
        console.log('📋 RESUMEN DE VERIFICACIÓN');
        console.log('='.repeat(80));

        if (discrepancias.length > 0) {
            console.log(`\n❌ SE ENCONTRARON ${discrepancias.length} DISCREPANCIAS\n`);
            discrepancias.forEach((disc, index) => {
                console.log(`${index + 1}. [${disc.severidad}] ${disc.mensaje}`);
            });

            console.log('\n🔧 RECOMENDACIONES PARA EL BACKEND:');
            console.log('   1. Revisar consulta SQL que obtiene facturas por id_ciclo');
            console.log('   2. Verificar lógica de asignación de id_ciclo al crear facturas');
            console.log('   3. Buscar facturas con id_ciclo incorrecto en la base de datos');
            console.log('   4. Ejecutar script de corrección para reasignar facturas');
            console.log('   5. Recalcular estadísticas del ciclo después de la corrección');
        } else {
            console.log('\n✅ NO SE ENCONTRARON DISCREPANCIAS');
            console.log('   Todas las facturas están correctamente asignadas.');
        }

        // Generar reporte JSON
        const reporte = {
            timestamp: new Date().toISOString(),
            ciclo_id: ID_CICLO,
            resumen: {
                discrepancias_encontradas: discrepancias.length > 0,
                total_discrepancias: discrepancias.length,
                facturas_problematicas: facturasProblematicas.length,
                total_facturas_esperadas: cicloInfo?.total_facturas || 'N/A',
                total_facturas_obtenidas: facturas.length,
                total_conexiones: conexiones.length
            },
            discrepancias,
            facturas_problematicas: facturasProblematicas,
            ciclo_info: cicloInfo,
            muestra_facturas: facturas.slice(0, 5) // Primeras 5 para referencia
        };

        // Guardar reporte
        const nombreArchivo = `reporte-ciclo-${ID_CICLO}-${Date.now()}.json`;
        fs.writeFileSync(nombreArchivo, JSON.stringify(reporte, null, 2));
        console.log(`\n📄 Reporte guardado en: ${nombreArchivo}`);

        console.log('\n' + '='.repeat(80) + '\n');

        return reporte;

    } catch (error) {
        console.error('\n❌ ERROR durante la verificación:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        }
        console.error('   Stack:', error.stack);
        throw error;
    }
}

// Ejecutar verificación
verificarCiclo()
    .then((reporte) => {
        console.log('✅ Verificación completada');
        if (reporte.discrepancias.length > 0) {
            console.log('\n⚠️ Se encontraron discrepancias. Revisar el reporte generado.');
            process.exit(1);
        } else {
            process.exit(0);
        }
    })
    .catch((error) => {
        console.error('❌ Error fatal:', error.message);
        process.exit(1);
    });
