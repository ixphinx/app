// Stub para react-native-maps en web
// Este stub evita que react-native-maps intente usar UIManager en web
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Exportar constantes que react-native-maps espera (evitar errores de tiempo de módulo)
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';
export const googleMapIsInstalled = false; // Siempre false en web
export const appleMapIsInstalled = false; // Siempre false en web

// Componente Marker simple (definido primero para usarlo en MapView)
export const Marker = ({ coordinate, title, pinColor }) => {
  // Marker se renderiza como parte de MapView, no directamente
  return null;
};

// Componente Polyline simple
export const Polyline = ({ coordinates, strokeColor, strokeWidth }) => {
  // En web, las polilíneas no se pueden renderizar fácilmente sin una librería de mapas
  return null;
};

// Componente MapView simple para web
export const MapView = React.forwardRef((props, ref) => {
  const { style, initialRegion, children } = props;
  const [markers, setMarkers] = React.useState([]);

  // Recopilar marcadores de los children
  React.useEffect(() => {
    const markerData: any[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === Marker) {
        markerData.push(child.props);
      }
    });
    setMarkers(markerData);
  }, [children]);

  React.useImperativeHandle(ref, () => ({
    animateToRegion: (region) => {
      console.log('animateToRegion (web stub):', region);
    },
    fitToCoordinates: (coordinates) => {
      console.log('fitToCoordinates (web stub):', coordinates);
    },
  }));

  return (
    <View style={[styles.mapContainer, style]}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>🗺️ Mapa</Text>
        {initialRegion && (
          <Text style={styles.coordsText}>
            Centro: {initialRegion.latitude.toFixed(4)}, {initialRegion.longitude.toFixed(4)}
          </Text>
        )}
        {markers.length > 0 && (
          <View style={styles.markersList}>
            <Text style={styles.markersTitle}>Marcadores:</Text>
            {markers.map((marker, index) => (
              <Text key={index} style={styles.markerItem}>
                • {marker.title || 'Marcador'}: {marker.coordinate?.latitude?.toFixed(4)}, {marker.coordinate?.longitude?.toFixed(4)}
              </Text>
            ))}
          </View>
        )}
        <Text style={styles.noteText}>
          Los mapas interactivos están disponibles en la versión móvil
        </Text>
      </View>
    </View>
  );
});

MapView.displayName = 'MapView';

// Exportar MapView como default
export default MapView;

// También exportar Marker y Polyline como named exports
export { Marker, Polyline };

// Y como propiedades del default export (para compatibilidad)
MapView.Marker = Marker;
MapView.Polyline = Polyline;

// Exportar constantes adicionales que react-native-maps puede necesitar
MapView.PROVIDER_GOOGLE = PROVIDER_GOOGLE;
MapView.PROVIDER_DEFAULT = PROVIDER_DEFAULT;

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    backgroundColor: '#e5e5e5',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 10,
  },
  coordsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    fontWeight: '500',
  },
  markersList: {
    marginTop: 15,
    marginBottom: 15,
    alignItems: 'flex-start',
    maxWidth: '80%',
  },
  markersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  markerItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  marker: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  markerText: {
    fontSize: 12,
  },
});

