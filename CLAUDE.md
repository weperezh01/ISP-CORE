# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WellNet is a comprehensive ISP (Internet Service Provider) management React Native application that handles billing, customer management, network configurations, and financial reporting. It supports multi-ISP operations with role-based access (Mega Admin → Super Admin → Admin).

## Development Commands

```bash
# Start Metro bundler
npx react-native start

# Run on Android
npx react-native run-android

# Run on iOS
npx react-native run-ios

# Install dependencies
yarn install

# Clean and reset
npx react-native clean

# Run tests
yarn test

# Run linting
yarn lint
```

## Architecture Overview

### Core Structure
- **Entry Point**: `index.js` → `App.tsx` (main navigation container)
- **Navigation**: Single Stack Navigator with 108 registered screens, all with `headerShown: false`
- **API Base**: `https://wellnet-rd.com:444/api/` with token-based authentication
- **Storage**: AsyncStorage for user data, theme preferences, and session management

### Directory Organization
```
src/
├── componentes/          # Reusable UI components (forms, charts, selectors)
├── config/              # Configuration files (dual ThemeContext setup)
├── estilos/             # Global styles system with theme support
├── pantallas/           # Feature-organized screens
│   ├── cliente/         # Customer management
│   ├── conexiones/      # Network connections & technical operations
│   ├── contabilidad/    # Accounting & financial reporting
│   ├── factura/         # Billing & invoicing system
│   ├── operaciones/     # ISP operations & service orders
│   ├── usuarios/        # User management & communications
│   └── superAdmin/      # Administrative functions
```

### Key Architectural Patterns

#### Dual Theme System
- Two separate ThemeContext implementations: root-level (`ThemeContext.tsx`) and modular (`src/config/ThemeContext.tsx`)
- Global styling pattern: `getStyles(isDarkMode)` functions returning StyleSheet objects
- Theme state persisted in AsyncStorage with `isDarkMode` boolean

#### API Integration
- Feature-specific API service files (e.g., `src/pantallas/conexiones/services/api.tsx`)
- Consistent error handling with Alert.alert() and console.error()
- Token authentication with user role-based data filtering

#### Screen Architecture
- Complex features use nested directory structure with components, services, and utils subdirectories
- Shared utilities in feature directories (e.g., `formatCurrency.tsx`, `applyFilters.tsx`)
- Custom navigation registration in `App.tsx` with parameter typing

## Key Business Logic

### ISP Management
- Multi-ISP support with hierarchical user roles
- ISP-specific data filtering throughout the application
- User authentication determines accessible features and data scope

### Billing System
- Invoice creation with line items and tax calculations
- Bluetooth printer integration for receipts (ESC/POS thermal printers)
- Payment processing with multiple payment methods
- Financial reporting with chart visualizations

### Network Operations
- Connection lifecycle management (installation, maintenance, disconnection)
- Router configuration and IP address management
- Technical service orders with technician assignments
- Real-time connection status monitoring

## Technical Integration

### Hardware Integration
- **Bluetooth Printing**: ESC/POS thermal printer support for invoices/receipts
- **Location Services**: GPS integration for installation and service locations
- **Device Permissions**: Bluetooth, location, and storage permissions management

### Data Visualization
- React Native Chart Kit for financial and operational reporting
- Custom chart components in `src/componentes/` (BarChartWithLabels, LineChart, etc.)
- PDF generation for invoices and reports

### External Services
- SMS and WhatsApp integration for customer communications
- Call logging and management system
- Socket.io for real-time updates

## Development Guidelines

### Styling Approach
- Use the global theme system: `const styles = getStyles(isDarkMode)`
- Import theme context: `const { isDarkMode } = useContext(ThemeContext)`
- Maintain consistency with existing color schemes and component patterns

### Navigation Patterns
- All screens registered in `App.tsx` Stack Navigator
- Use navigation.navigate() with proper parameter typing
- Custom headers implemented per screen (no native headers)

### Error Handling
- Use Alert.alert() for user-facing errors
- Console.error() for debugging
- Consistent try-catch patterns in API calls

### Component Organization
- Reusable components go in `src/componentes/`
- Feature-specific components stay within their feature directory
- Maintain existing naming conventions (PascalCase for components)

## Common Patterns

### API Calls
```javascript
const response = await fetch(`${API_BASE}/endpoint`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
```

### Theme Usage
```javascript
const { isDarkMode } = useContext(ThemeContext);
const styles = getStyles(isDarkMode);
```

### Navigation
```javascript
navigation.navigate('ScreenName', { param: value });
```

When working with this codebase, prioritize consistency with existing patterns, maintain the dual theme system, and ensure proper error handling throughout all features.