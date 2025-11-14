import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { raceApi, Race } from '../services/api';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  Home: undefined;
  RaceDetail: { raceId: string };
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigation.navigate("Login");
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      loadRaces();
    }
  }, [user]);

  const loadRaces = async () => {
    try {
      const data = await raceApi.getUserRaces();
      setRaces(data);
    } catch (error) {
      console.error('Error loading races:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRaces();
  };

  const renderRace = ({ item }: { item: Race }) => (
    <TouchableOpacity
      style={styles.raceCard}
      onPress={() => navigation.navigate('RaceDetail', { raceId: item.id })}
    >
      <Text style={styles.raceName}>{item.name}</Text>
      <Text style={styles.raceInfo}>
        Participantes: {item.participants.length}
      </Text>
      {item.startTime && (
        <Text style={styles.raceStatus}>
          Estado: {item.endTime ? 'Finalizada' : 'En curso'}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Carreras</Text>
      <FlatList
        data={races}
        renderItem={renderRace}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tienes carreras activas</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  raceCard: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 10,
    borderRadius: 8,
    // Usar boxShadow para web y mantener shadow* para móvil
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  raceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  raceInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  raceStatus: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

