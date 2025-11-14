import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';

import { raceApi, Race, RaceResult } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  initSocket,
  disconnectSocket,
  joinRace,
  leaveRace,
  sendLocationUpdate,
  onLocationUpdate,
  offLocationUpdate,
} from '../services/websocket';

interface RouteParams {
  raceId: string;
}

export default function RaceDetailScreen() {
  const route = useRoute();
  const { raceId } = route.params as RouteParams;
  const { user, getIdToken } = useAuth();

  const [race, setRace] = useState<Race | null>(null);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [otherLocations, setOtherLocations] = useState<
    Map<string, { lat: number; lng: number }>
  >(new Map());

  const mapRef = useRef<MapView>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const socketInitialized = useRef(false);

  // ─────────────────────────────────────────────
  // CARGAR DATOS DE LA CARRERA
  // ─────────────────────────────────────────────
  useEffect(() => {
    loadRaceData();

    return () => {
      stopLocationTracking();
      disconnectSocket();
      offLocationUpdate();
    };
  }, [raceId]);

  // ─────────────────────────────────────────────
  // INICIALIZAR WEBSOCKET SOLO CUANDO HAY USER + RACE
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (user && race && !socketInitialized.current) {
      socketInitialized.current = true;
      initWebSocket();
    }

    return () => {
      leaveRace(raceId);
      disconnectSocket();
      offLocationUpdate();
    };
  }, [race, user]);

  const loadRaceData = async () => {
    try {
      const [raceData, resultsData] = await Promise.all([
        raceApi.getById(raceId),
        raceApi.getResults(raceId),
      ]);
      setRace(raceData);
      setResults(resultsData);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la información de la carrera');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // INICIALIZAR WEBSOCKET
  // ─────────────────────────────────────────────
  const initWebSocket = async () => {
    try {
      const token = await getIdToken();
      if (!token) return;

      initSocket(token);
      joinRace(raceId);

      onLocationUpdate((data) => {
        if (data.userId !== user?.uid) {
          setOtherLocations((prev) => {
            const newMap = new Map(prev);
            newMap.set(data.userId, { lat: data.lat, lng: data.lng });
            return newMap;
          });
        }
      });
    } catch (error) {
      console.error('WS error:', error);
    }
  };

  // ─────────────────────────────────────────────
  // PERMISOS DE UBICACIÓN
  // ─────────────────────────────────────────────
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos', 'Debes permitir acceso a ubicación.');
      return false;
    }
    return true;
  };

  // ─────────────────────────────────────────────
  // INICIAR CARRERA
  // ─────────────────────────────────────────────
  const startRace = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    try {
      const location = await Location.getCurrentPositionAsync({});
      await raceApi.start(raceId, location.coords.latitude, location.coords.longitude);

      setTracking(true);
      startLocationTracking();

      Alert.alert('Éxito', 'Carrera iniciada');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Error al iniciar la carrera');
    }
  };

  // ─────────────────────────────────────────────
  // FINALIZAR CARRERA
  // ─────────────────────────────────────────────
  const endRace = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      await raceApi.end(raceId, location.coords.latitude, location.coords.longitude);

      setTracking(false);
      stopLocationTracking();
      loadRaceData();

      Alert.alert('Éxito', 'Carrera finalizada');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Error al finalizar la carrera');
    }
  };

  // ─────────────────────────────────────────────
  // TRACKING GPS EN TIEMPO REAL
  // ─────────────────────────────────────────────
  const startLocationTracking = async () => {
    stopLocationTracking(); // evita duplicados

    locationSubscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      (location) => {
        setUserLocation(location);

        if (race) {
          sendLocationUpdate(raceId, location.coords.latitude, location.coords.longitude);
        }

        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      },
    );
  };

  const stopLocationTracking = () => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
  };

  // ─────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────
  if (loading || !race) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const region = {
    latitude: (race.startPoint.lat + race.endPoint.lat) / 2,
    longitude: (race.startPoint.lng + race.endPoint.lng) / 2,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={region}>
        <Marker coordinate={{ latitude: race.startPoint.lat, longitude: race.startPoint.lng }} title="Inicio" pinColor="green" />
        <Marker coordinate={{ latitude: race.endPoint.lat, longitude: race.endPoint.lng }} title="Fin" pinColor="red" />

        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            title="Tu ubicación"
            pinColor="blue"
          />
        )}

        {Array.from(otherLocations).map(([userId, loc]) => (
          <Marker
            key={userId}
            coordinate={{ latitude: loc.lat, longitude: loc.lng }}
            title={`Participante ${userId.slice(0, 6)}`}
            pinColor="orange"
          />
        ))}

        <Polyline
          coordinates={[
            { latitude: race.startPoint.lat, longitude: race.startPoint.lng },
            { latitude: race.endPoint.lat, longitude: race.endPoint.lng },
          ]}
          strokeWidth={3}
          strokeColor="#007AFF"
        />
      </MapView>

      <View style={styles.overlay}>
        <Text style={styles.raceName}>{race.name}</Text>

        {!race.startTime ? (
          <TouchableOpacity style={styles.button} onPress={startRace}>
            <Text style={styles.buttonText}>Iniciar Carrera</Text>
          </TouchableOpacity>
        ) : tracking ? (
          <TouchableOpacity style={styles.buttonEnd} onPress={endRace}>
            <Text style={styles.buttonText}>Finalizar Carrera</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.status}>Carrera en curso</Text>
        )}

        {results.length > 0 && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>Resultados:</Text>

            {results.slice(0, 5).map((r, i) => (
              <Text key={r.userId} style={styles.resultItem}>
                {i + 1}.{' '}
                {r.duration
                  ? `${(r.duration / 60000).toFixed(2)} min - ${r.avgSpeed?.toFixed(
                      2,
                    )} km/h`
                  : 'En curso'}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  raceName: { fontSize: 20, fontWeight: 'bold' },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonEnd: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  status: { textAlign: 'center', marginTop: 10, color: '#666' },
  results: { marginTop: 20 },
  resultsTitle: { fontWeight: '600', marginBottom: 10 },
  resultItem: { color: '#666', marginBottom: 5 },
});
