# Ciclistas Mobile App

Aplicación móvil React Native (Expo) para rastreo de ciclistas en tiempo real.

## Características

- 🔐 Autenticación con Firebase Auth (teléfono + OTP)
- 🗺️ Integración con Google Maps usando react-native-maps
- 📍 Rastreo de ubicación en tiempo real
- 💬 WebSocket para actualizaciones en tiempo real
- 🏁 Visualización de carreras y resultados

## Requisitos Previos

- Node.js 18+
- npm o yarn
- Expo CLI: `npm install -g expo-cli`
- Cuenta de Firebase
- Google Maps API Key

## Instalación

1. Instalar dependencias:
```bash
cd app
npm install
```

2. Configurar variables de entorno:
Crear un archivo `.env` en la carpeta `app/`:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_WS_URL=http://localhost:3000
```

3. Configurar Google Maps:
- Para iOS: Agregar la API key en `app.json` bajo `ios.config.googleMapsApiKey`
- Para Android: Agregar la API key en `app.json` bajo `android.config.googleMapsApiKey`

## Ejecución

### Desarrollo
```bash
npm start
```

Luego escanear el código QR con la app Expo Go en tu dispositivo móvil, o presionar:
- `a` para Android emulator
- `i` para iOS simulator

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

## Estructura del Proyecto

```
app/
├── src/
│   ├── screens/          # Pantallas de la aplicación
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   └── RaceDetailScreen.tsx
│   ├── services/         # Servicios de API y WebSocket
│   │   ├── api.ts
│   │   └── websocket.ts
│   ├── context/          # Contextos de React
│   │   └── AuthContext.tsx
│   └── config/           # Configuración
│       └── firebase.ts
├── App.tsx               # Componente principal
└── app.json              # Configuración de Expo
```

## Notas

- La autenticación con teléfono requiere configuración adicional de Firebase Phone Auth
- Para producción, configurar las URLs de API y WebSocket apropiadas
- Los permisos de ubicación son necesarios para el rastreo en tiempo real

## Licencia

MIT

