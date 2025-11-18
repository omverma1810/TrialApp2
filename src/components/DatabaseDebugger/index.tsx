// src/components/DatabaseDebugger/index.tsx
// 🔍 TEMPORARY DEBUG COMPONENT - Remove after testing

import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet, Alert} from 'react-native';
import {
  debugDatabaseContents,
  debugOfflineLocations,
  debugPlotData,
  debugExperimentDetails,
  getAllOfflineLocationIds,
} from '../../services/DbQueries';

const DatabaseDebugger: React.FC = () => {
  const handleDebugDatabase = async () => {
    try {
      await debugDatabaseContents();
      Alert.alert('Debug Complete', 'Check console for database contents');
    } catch (error) {
      Alert.alert('Debug Failed', 'Check console for errors');
    }
  };

  const handleDebugOfflineLocations = async () => {
    try {
      await debugOfflineLocations();
      Alert.alert('Debug Complete', 'Check console for offline locations');
    } catch (error) {
      Alert.alert('Debug Failed', 'Check console for errors');
    }
  };

  const handleDebugAllOfflineData = async () => {
    try {

      // First get all offline locations
      const offlineLocations = await getAllOfflineLocationIds();

      // Debug each location's data
      for (const location of offlineLocations) {
        await debugExperimentDetails(location.experimentId);
        await debugPlotData(location.locationId);
      }

      Alert.alert(
        'Debug Complete',
        `Debugged ${offlineLocations.length} offline locations. Check console for details.`,
      );
    } catch (error) {
      Alert.alert('Debug Failed', 'Check console for errors');
    }
  };

  const handleDebugSpecificLocation = () => {
    Alert.prompt(
      'Debug Specific Location',
      'Enter Location ID to debug:',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Debug',
          onPress: async locationId => {
            if (locationId) {
              try {
                const id = parseInt(locationId);
                await debugPlotData(id);
                Alert.alert(
                  'Debug Complete',
                  `Check console for location ${id} data`,
                );
              } catch (error) {
                Alert.alert('Error', 'Invalid location ID or debug failed');
              }
            }
          },
        },
      ],
      'plain-text',
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Database Debugger</Text>
      <Text style={styles.subtitle}>Temporary debugging tools</Text>

      <TouchableOpacity style={styles.button} onPress={handleDebugDatabase}>
        <Text style={styles.buttonText}>Debug All Tables</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleDebugOfflineLocations}>
        <Text style={styles.buttonText}>Debug Offline Locations</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleDebugAllOfflineData}>
        <Text style={styles.buttonText}>Debug All Offline Data</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleDebugSpecificLocation}>
        <Text style={styles.buttonText}>Debug Specific Location</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        📱 Check Xcode console or Metro logs for debug output
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ff6b6b',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default DatabaseDebugger;
