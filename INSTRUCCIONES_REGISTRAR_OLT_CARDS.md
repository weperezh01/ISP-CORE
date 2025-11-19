# Instrucciones para Registrar OLTCardsScreen en App.tsx

## Paso 1: Agregar el import

En el archivo `App.tsx`, busca la sección donde están los imports de las pantallas de OLTs y agrega:

```typescript
import OLTCardsScreen from './src/pantallas/controles/OLTs/OLTCardsScreen';
```

## Paso 2: Registrar la pantalla en el Stack Navigator

Busca en `App.tsx` donde están registradas las otras pantallas de OLTs (como `OLTDetailsScreen`, `ONUsListScreen`, etc.) y agrega:

```typescript
<Stack.Screen
  name="OLTCards"
  component={OLTCardsScreen}
  options={{ headerShown: false }}
/>
```

## Ubicación sugerida

Colócala después de `OLTDetailsScreen` para mantener la organización:

```typescript
<Stack.Screen
  name="OLTDetailsScreen"
  component={OLTDetailsScreen}
  options={{ headerShown: false }}
/>

<Stack.Screen
  name="OLTCards"
  component={OLTCardsScreen}
  options={{ headerShown: false }}
/>
```

## ✅ Listo

Una vez registrada, al presionar el botón "🎴 OLT Cards" en la pantalla de detalles de OLT, se navegará automáticamente a la nueva pantalla que muestra todas las tarjetas instaladas.

## 📝 Notas

- La pantalla muestra datos mock por defecto
- Para conectar con el backend real, editar el archivo `OLTCardsScreen.tsx` línea ~48
- Descomentar el código del fetch y comentar el mock data
- Endpoint sugerido: `GET /api/olts/{oltId}/cards`
