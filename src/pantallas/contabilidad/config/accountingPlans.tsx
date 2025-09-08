// Planes de suscripción para servicios de contabilidad

export interface AccountingPlan {
    id: string;
    name: string;
    price: number;
    pricePerTransaction: number;
    transactionLimit: number | null; // null = ilimitado
    features: string[];
    recommended: boolean;
    popular?: boolean;
    color: string;
    icon: string;
}

export const ACCOUNTING_PLANS: AccountingPlan[] = [
    {
        id: 'contabilidad_basico',
        name: 'Contabilidad Básica',
        price: 250,
        pricePerTransaction: 0.50,
        transactionLimit: 100,
        features: [
            'Facturación mensual',
            'Estados financieros básicos',
            'Conciliación bancaria',
            'Hasta 100 transacciones/mes',
            'Soporte por email',
            'Backup automático'
        ],
        recommended: false,
        color: '#10B981',
        icon: 'account_balance'
    },
    {
        id: 'contabilidad_profesional',
        name: 'Contabilidad Profesional',
        price: 500,
        pricePerTransaction: 0.35,
        transactionLimit: 500,
        features: [
            'Todo lo del plan básico',
            'Análisis de rentabilidad',
            'Reportes de cobranza',
            'Control de inventario',
            'Hasta 500 transacciones/mes',
            'Dashboard avanzado',
            'Soporte telefónico',
            'Reportes personalizados'
        ],
        recommended: true,
        popular: true,
        color: '#3B82F6',
        icon: 'analytics'
    },
    {
        id: 'contabilidad_enterprise',
        name: 'Contabilidad Enterprise',
        price: 1200,
        pricePerTransaction: 0.25,
        transactionLimit: null, // Ilimitado
        features: [
            'Todo lo del plan profesional',
            'Transacciones ilimitadas',
            'Dashboard ejecutivo en tiempo real',
            'Análisis predictivo financiero',
            'Gestión multi-ISP',
            'Soporte 24/7',
            'Consultoría mensual incluida',
            'API personalizada',
            'Auditoría trimestral'
        ],
        recommended: false,
        color: '#7C3AED',
        icon: 'business_center'
    }
];

export const ACCOUNTING_FEATURES = {
    basic: [
        'Libro Diario',
        'Balance General',
        'Estado de Resultados',
        'Plan de Cuentas',
        'Transacciones Básicas'
    ],
    professional: [
        'Reportes ITBIS',
        'Retenciones',
        'NCF (Numeración)',
        'Análisis Financiero',
        'Dashboard Contabilidad',
        'Exportar a Excel/PDF'
    ],
    enterprise: [
        'Consultoría Financiera',
        'Auditoría Automática',
        'Alertas Inteligentes',
        'Análisis Predictivo',
        'API Integración',
        'Soporte Prioritario'
    ]
};

export const getAccountingPlanById = (planId: string): AccountingPlan | null => {
    return ACCOUNTING_PLANS.find(plan => plan.id === planId) || null;
};

export const calculateAccountingAnnualSavings = (monthlyPrice: number): number => {
    const annualPrice = monthlyPrice * 12;
    const discountedAnnual = annualPrice * 0.85; // 15% descuento anual
    return annualPrice - discountedAnnual;
};

export const getAccountingPlanRecommendation = (monthlyTransactions: number): AccountingPlan => {
    if (monthlyTransactions <= 100) {
        return ACCOUNTING_PLANS[0]; // Básico
    } else if (monthlyTransactions <= 500) {
        return ACCOUNTING_PLANS[1]; // Profesional
    } else {
        return ACCOUNTING_PLANS[2]; // Enterprise
    }
};

export const ACCOUNTING_PLAN_BENEFITS = {
    migration: [
        'Migración gratuita de datos contables',
        'Configuración inicial sin costo',
        'Capacitación del equipo incluida',
        'Soporte durante transición'
    ],
    support: [
        'Soporte técnico especializado',
        'Actualizaciones automáticas',
        'Backup diario de información',
        'Cumplimiento normativo RD'
    ],
    integration: [
        'Integración con sistema ISP',
        'Sincronización automática',
        'Reportes en tiempo real',
        'Dashboard unificado'
    ]
};

// Colores para los tipos de planes
export const PLAN_COLORS = {
    basic: {
        primary: '#10B981',
        light: '#D1FAE5',
        dark: '#047857'
    },
    professional: {
        primary: '#3B82F6',
        light: '#DBEAFE',
        dark: '#1D4ED8'
    },
    enterprise: {
        primary: '#7C3AED',
        light: '#EDE9FE',
        dark: '#5B21B6'
    }
};

export default ACCOUNTING_PLANS;