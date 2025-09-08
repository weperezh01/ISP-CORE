-- Tabla para suscripciones de contabilidad
CREATE TABLE IF NOT EXISTS accounting_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isp_id INT NOT NULL,
    plan_id VARCHAR(50) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    transaction_limit INT NULL COMMENT 'null = ilimitado',
    price_per_transaction DECIMAL(5,2) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'inactive',
    activated_at TIMESTAMP NULL,
    deactivated_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_isp_id (isp_id),
    INDEX idx_status (status),
    INDEX idx_isp_status (isp_id, status)
);

-- Tabla para transacciones contables (si no existe)
CREATE TABLE IF NOT EXISTS accounting_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isp_id INT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    reference_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_isp_id (isp_id),
    INDEX idx_created_at (created_at),
    INDEX idx_isp_date (isp_id, created_at)
);

-- Datos de ejemplo para testing (opcional)
-- INSERT INTO accounting_subscriptions (isp_id, plan_id, plan_name, price, transaction_limit, price_per_transaction, status, activated_at) 
-- VALUES (1, 'contabilidad_profesional', 'Contabilidad Profesional', 500.00, 500, 0.35, 'active', NOW());