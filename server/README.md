# WellNet Backend Server

Express/Node.js backend server for the WellNet ISP Management System accounting module.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Database Setup
1. Create MySQL database named `wellnet_db`
2. Run the schema SQL:
```bash
mysql -u your_username -p wellnet_db < database/schema.sql
```

### 3. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wellnet_db
DB_USER=your_username
DB_PASSWORD=your_password
PORT=444
JWT_SECRET=your_jwt_secret_key
```

### 4. Start Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## 📍 Implemented Endpoints

### Accounting Subscription Management

#### 1. Activate/Deactivate Subscription
```http
POST /api/accounting/subscription/toggle
Content-Type: application/json
Authorization: Bearer {token}

{
  "ispId": 1,
  "action": "activate" // or "deactivate"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Servicio de contabilidad activado exitosamente",
  "data": {
    "subscription": {...},
    "recommendedPlan": {...},
    "billing_integration": {...},
    "user_count": 3
  }
}
```

#### 2. Get Subscription Status
```http
GET /api/accounting/subscription/status/{ispId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isSubscribed": true,
    "isActive": true,
    "planId": "contabilidad_profesional",
    "current_plan": {
      "id": "contabilidad_profesional",
      "name": "Contabilidad Profesional",
      "price": 500
    },
    "subscription_date": "2024-01-15T10:30:00.000Z",
    "daysUntilRenewal": 25,
    "nextBillingDate": "2024-02-15"
  }
}
```

#### 3. Get Available Plans
```http
GET /api/accounting/plans
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "contabilidad_basico",
      "name": "Contabilidad Básica",
      "price": 250,
      "price_per_transaction": 0.50,
      "transaction_limit": 100,
      "features": [...],
      "recommended": false,
      "popular": false,
      "color": "#10B981",
      "icon": "account_balance",
      "target_users": "1 usuario"
    },
    // ... más planes
  ]
}
```

#### 4. Get ISP User Count
```http
GET /api/isp/{ispId}/users/count
Authorization: Bearer {token}
```

#### 5. Get Transaction Count
```http
GET /api/accounting/transactions/count?isp_id={ispId}
Authorization: Bearer {token}
```

## 🗃️ Database Schema

### accounting_subscriptions
- `id` - Primary key
- `isp_id` - ISP identifier
- `plan_id` - Plan identifier
- `plan_name` - Plan display name
- `price` - Monthly price
- `transaction_limit` - Monthly transaction limit (NULL = unlimited)
- `price_per_transaction` - Cost per transaction
- `status` - 'active' or 'inactive'
- `activated_at` - Activation timestamp
- `deactivated_at` - Deactivation timestamp

### accounting_transactions
- `id` - Primary key
- `isp_id` - ISP identifier
- `transaction_type` - Type of transaction
- `amount` - Transaction amount
- `description` - Transaction description
- `reference_id` - External reference
- `created_at` - Creation timestamp

## 🔧 Business Logic

### Automatic Plan Assignment
The system automatically assigns plans based on the number of users in the ISP:

- **1 user**: Contabilidad Básica ($250/month, 100 transactions)
- **2-5 users**: Contabilidad Profesional ($500/month, 500 transactions)
- **6+ users**: Contabilidad Enterprise ($1200/month, unlimited transactions)

### Authentication
All endpoints require JWT token authentication via `Authorization: Bearer {token}` header.

### Error Handling
- 400: Bad Request (missing/invalid parameters)
- 401: Unauthorized (missing token)
- 403: Forbidden (invalid token)
- 404: Not Found (endpoint doesn't exist)
- 500: Internal Server Error

## 🧪 Testing

### Health Check
```bash
curl http://localhost:444/health
```

### Test Endpoints
```bash
# Get plans (requires valid token)
curl -X GET "http://localhost:444/api/accounting/plans" \
     -H "Authorization: Bearer YOUR_TOKEN"

# Activate subscription
curl -X POST "http://localhost:444/api/accounting/subscription/toggle" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"ispId": 1, "action": "activate"}'
```

## 🔒 Security Notes

1. **JWT Authentication**: All accounting endpoints require valid JWT tokens
2. **ISP Access Control**: Users can only access data for their assigned ISP
3. **Input Validation**: All inputs are validated before processing
4. **SQL Injection Protection**: Using parameterized queries
5. **Error Information**: Sensitive error details only shown in development mode

## 📝 TODO Integration Tasks

1. **Billing Integration**: Add monthly billing integration logic
2. **User Management**: Implement proper user role verification
3. **ISP Permissions**: Add ISP-specific access control
4. **Audit Logging**: Add transaction audit trails
5. **Backup System**: Implement automated data backups

## 🔄 Frontend Integration

The React Native frontend is already configured to work with these endpoints. The URLs are:

- Base API: `https://wellnet-rd.com:444/api/`
- Used in: `src/pantallas/contabilidad/suscripcion/ContabilidadSuscripcionScreen.tsx`

Make sure to update your production server configuration to match the expected base URL.