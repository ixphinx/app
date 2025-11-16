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
  const { user, loading: authLoading, signOut } = useAuth();

  const [races, setRaces] = useState<Race[]>([]);
  const [isLoadingRaces, setIsLoadingRaces] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigation.navigate("Login" as never);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!authLoading && user) {
      loadRaces();
    }
  }, [user, authLoading]);

  const loadRaces = async () => {
    try {
      const data = await raceApi.getUserRaces();
      setRaces(data);
    } catch (error) {
      console.error("❌ Error loading races:", error);
    } finally {
      setIsLoadingRaces(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRaces();
  };

  if (authLoading || isLoadingRaces) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER con botón logout */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Mis Carreras</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={races}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("RaceDetail", { raceId: item.id })}
            style={styles.raceCard}
          >
            <Text style={styles.raceName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
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

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingHorizontal: 20,
    paddingVertical: 15,

    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ff3b30',
    borderRadius: 6,
  },

  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  raceCard: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 10,
    borderRadius: 8,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
      : {
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
