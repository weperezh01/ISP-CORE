const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token de acceso requerido'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Token inválido'
            });
        }
        
        req.user = user;
        next();
    });
};

// Middleware to verify ISP access
const verifyIspAccess = (req, res, next) => {
    const ispId = req.params.ispId || req.body.ispId || req.query.isp_id;
    
    // Add your ISP access validation logic here
    // For now, we'll just pass through
    // You should implement proper ISP access control based on user roles
    
    req.ispId = ispId;
    next();
};

module.exports = {
    authenticateToken,
    verifyIspAccess
};