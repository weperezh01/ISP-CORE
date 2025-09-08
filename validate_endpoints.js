#!/usr/bin/env node

/**
 * Script de validación de endpoints para WellNet
 * Valida la disponibilidad de endpoints CRUD para planes de contabilidad
 */

const API_BASE = 'https://wellnet-rd.com:444/api';

// Token de prueba - reemplazar con uno válido
const TEST_TOKEN = 'tu_token_aqui';

const endpoints = [
    {
        method: 'GET',
        url: `${API_BASE}/accounting/plans`,
        description: 'Listar planes de contabilidad',
        expectedToWork: true
    },
    {
        method: 'POST',
        url: `${API_BASE}/accounting/plans`,
        description: 'Crear nuevo plan de contabilidad',
        expectedToWork: false,
        payload: {
            id: 'test_plan_validation',
            name: 'Plan de Validación',
            price: 100.00,
            transaction_limit: 50,
            price_per_transaction: 1.00,
            features: ['Característica de prueba'],
            active: true,
            recommended: false
        }
    },
    {
        method: 'PUT',
        url: `${API_BASE}/accounting/plans/test_plan_validation`,
        description: 'Actualizar plan de contabilidad',
        expectedToWork: false,
        payload: {
            id: 'test_plan_validation',
            name: 'Plan de Validación Actualizado',
            price: 150.00,
            transaction_limit: 75,
            price_per_transaction: 0.75,
            features: ['Característica actualizada'],
            active: true,
            recommended: true
        }
    },
    {
        method: 'DELETE',
        url: `${API_BASE}/accounting/plans/test_plan_validation`,
        description: 'Eliminar plan de contabilidad',
        expectedToWork: false
    }
];

async function validateEndpoint(endpoint) {
    console.log(`\n🔍 Validando: ${endpoint.method} ${endpoint.url}`);
    console.log(`📝 Descripción: ${endpoint.description}`);
    console.log(`🎯 Esperado: ${endpoint.expectedToWork ? 'FUNCIONA' : 'NO IMPLEMENTADO'}`);
    
    try {
        const options = {
            method: endpoint.method,
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json',
            }
        };

        if (endpoint.payload && (endpoint.method === 'POST' || endpoint.method === 'PUT')) {
            options.body = JSON.stringify(endpoint.payload);
        }

        const response = await fetch(endpoint.url, options);
        
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        
        // Obtener texto de respuesta para análisis
        const responseText = await response.text();
        const isHTML = responseText.trim().startsWith('<');
        const isJSON = !isHTML;
        
        console.log(`📄 Tipo de respuesta: ${isJSON ? 'JSON' : 'HTML'}`);
        
        if (isJSON) {
            try {
                const data = JSON.parse(responseText);
                console.log(`✅ ENDPOINT EXISTE - Response:`, data);
                return { exists: true, status: response.status, data };
            } catch (parseError) {
                console.log(`⚠️ JSON inválido:`, responseText.substring(0, 100));
                return { exists: false, status: response.status, error: 'Invalid JSON' };
            }
        } else {
            console.log(`❌ ENDPOINT NO EXISTE - Servidor devolvió HTML`);
            console.log(`🔍 HTML preview:`, responseText.substring(0, 200));
            return { exists: false, status: response.status, error: 'HTML response (404 page)' };
        }
        
    } catch (error) {
        console.log(`💥 ERROR DE RED:`, error.message);
        return { exists: false, error: error.message };
    }
}

async function main() {
    console.log('🚀 VALIDACIÓN DE ENDPOINTS WELLNET');
    console.log('=====================================');
    console.log(`🌐 API Base: ${API_BASE}`);
    console.log(`🔑 Token: ${TEST_TOKEN ? 'Configurado' : 'NO CONFIGURADO'}`);
    
    if (!TEST_TOKEN || TEST_TOKEN === 'tu_token_aqui') {
        console.log('\n⚠️ ADVERTENCIA: Configura un token válido en la variable TEST_TOKEN');
        console.log('   Para obtener un token, inicia sesión en la app WellNet');
    }
    
    const results = [];
    
    for (const endpoint of endpoints) {
        const result = await validateEndpoint(endpoint);
        results.push({
            ...endpoint,
            result
        });
        
        // Pausa entre requests para no sobrecargar el servidor
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 RESUMEN DE RESULTADOS');
    console.log('========================');
    
    results.forEach(({ method, url, description, expectedToWork, result }) => {
        const status = result.exists ? '✅ EXISTE' : '❌ NO EXISTE';
        const expected = expectedToWork ? '(esperado)' : '(esperado no existir)';
        console.log(`${status} ${method} - ${description} ${expected}`);
    });
    
    console.log('\n📋 ENDPOINTS FALTANTES:');
    console.log('=======================');
    
    const missing = results.filter(r => !r.result.exists && !r.expectedToWork);
    if (missing.length === 0) {
        console.log('🎉 ¡Todos los endpoints necesarios están implementados!');
    } else {
        missing.forEach(({ method, url, description }) => {
            console.log(`❌ ${method} ${url} - ${description}`);
        });
        
        console.log('\n🛠️ ACCIÓN REQUERIDA:');
        console.log('Contactar al equipo de backend para implementar los endpoints faltantes.');
    }
}

// Ejecutar validación
main().catch(console.error);