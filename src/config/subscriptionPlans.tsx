// WellNet Subscription Plans Configuration
// Professional ISP Management Solution

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number; // USD per month
    connectionLimit: number | null; // null = unlimited connections
    pricePerConnection: number; // USD per connection per month
    features: string[];
    recommended?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
        id: 'free',
        name: 'Gratis',
        price: 0,
        connectionLimit: 50,
        pricePerConnection: 0,
        features: [
            'Hasta 50 conexiones',
            'Gestión básica de conexiones',
            'Facturación simple',
            'Reportes básicos',
            'Soporte por email'
        ]
    },
    {
        id: 'basic',
        name: 'Básico',
        price: 25,
        connectionLimit: 200,
        pricePerConnection: 0.125,
        features: [
            'Hasta 200 conexiones',
            'Gestión completa de conexiones',
            'Facturación avanzada',
            'Reportes detallados',
            'Cortes/reconexiones automáticas',
            'Soporte por chat'
        ]
    },
    {
        id: 'standard',
        name: 'Estándar',
        price: 45,
        connectionLimit: 500,
        pricePerConnection: 0.09,
        recommended: true,
        features: [
            'Hasta 500 conexiones',
            'API de integración',
            'Analytics en tiempo real',
            'Múltiples usuarios',
            'Backup automático',
            'Soporte prioritario'
        ]
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 75,
        connectionLimit: 1000,
        pricePerConnection: 0.075,
        features: [
            'Hasta 1000 conexiones',
            'Dashboard personalizado',
            'Reportes exportables',
            'Integración WhatsApp/SMS',
            'Multi-ISP management',
            'Soporte telefónico'
        ]
    },
    {
        id: 'professional',
        name: 'Professional',
        price: 120,
        connectionLimit: 2000,
        pricePerConnection: 0.06,
        features: [
            'Hasta 2000 conexiones',
            'AI-powered analytics',
            'Facturación automática',
            'Portal de clientes',
            'Gestión de inventario',
            'Account manager dedicado'
        ]
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 180,
        connectionLimit: 3500,
        pricePerConnection: 0.051,
        features: [
            'Hasta 3500 conexiones',
            'White-label solution',
            'Integraciones personalizadas',
            'SLA garantizado 99.9%',
            'Formación personalizada',
            'Soporte 24/7'
        ]
    },
    {
        id: 'unlimited',
        name: 'Ilimitado',
        price: 299,
        connectionLimit: null,
        pricePerConnection: 0,
        features: [
            'Conexiones ilimitadas',
            'Todo incluido',
            'Infraestructura escalable',
            'Desarrollo prioritario',
            'Soporte enterprise',
            'Implementación on-site'
        ]
    }
];

// Helper functions
export const getPlanById = (planId: string): SubscriptionPlan | undefined => {
    if (!planId) return undefined;
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
};

export const getPlanByConnectionCount = (connectionCount: number): SubscriptionPlan => {
    for (const plan of SUBSCRIPTION_PLANS) {
        if (plan.connectionLimit === null || connectionCount <= plan.connectionLimit) {
            return plan;
        }
    }
    return SUBSCRIPTION_PLANS[SUBSCRIPTION_PLANS.length - 1]; // Return unlimited plan
};

export const getRecommendedPlan = (): SubscriptionPlan => {
    return SUBSCRIPTION_PLANS.find(plan => plan.recommended) || SUBSCRIPTION_PLANS[2];
};

export const calculateMonthlyConnectionCost = (plan: SubscriptionPlan, connectionCount: number): number => {
    if (plan.connectionLimit === null) return plan.price; // Unlimited plan
    if (connectionCount <= plan.connectionLimit) return plan.price;
    return connectionCount * plan.pricePerConnection;
};

// Promotional pricing for launch
export const LAUNCH_PROMOTION = {
    discountPercentage: 25, // 25% off first year
    freeMonths: 1, // 1 month free trial
    migrationSupport: true
};