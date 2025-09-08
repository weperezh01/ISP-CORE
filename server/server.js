const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { testConnection } = require('./config/database');
const accountingRoutes = require('./routes/accounting');

const app = express();
const PORT = process.env.PORT || 444;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8081'], // React Native Metro bundler
    credentials: true
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'WellNet Backend Server is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Routes
app.use('/api/accounting', accountingRoutes);

// Additional endpoint for user count (alternative location)
app.get('/api/isp/:ispId/users/count', require('./routes/accounting'));

// Catch-all for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint no encontrado: ${req.method} ${req.originalUrl}`,
        suggestion: 'Revisa la documentación de la API para endpoints disponibles'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.warn('⚠️  Database connection failed, but server will continue to run');
            console.warn('⚠️  Please check your database configuration in .env file');
        }

        app.listen(PORT, () => {
            console.log(`🚀 WellNet Backend Server running on port ${PORT}`);
            console.log(`📍 Base URL: http://localhost:${PORT}`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health`);
            console.log(`📊 Accounting API: http://localhost:${PORT}/api/accounting/*`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            
            if (dbConnected) {
                console.log('✅ Database connection successful');
            }
            
            console.log('\n📚 Available Endpoints:');
            console.log('POST /api/accounting/subscription/toggle');
            console.log('GET  /api/accounting/subscription/status/:ispId');
            console.log('GET  /api/accounting/plans');
            console.log('GET  /api/isp/:ispId/users/count');
            console.log('GET  /api/accounting/transactions/count?isp_id=X');
            console.log('GET  /health');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

startServer();