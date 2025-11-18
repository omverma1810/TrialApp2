import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import {useAppSelector} from '../../store';
import {countSavedPayloads, syncPayloads} from '../../services/DbQueries';
import NetInfo from '@react-native-community/netinfo';
import {
  triggerOfflineSync,
  registerSyncCompleteCallback,
  unregisterSyncCompleteCallback,
} from '../../services/offlineDataSync';

interface OfflineSyncTestProps {
  style?: any;
}

const OfflineSyncTest: React.FC<OfflineSyncTestProps> = ({style}) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(false);
  const [syncEvents, setSyncEvents] = useState<string[]>([]);
  const {theme} = useAppSelector(state => state.theme);

  useEffect(() => {
    // Monitor network status
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected || false);
    });

    // Initial network check
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected || false);
    });

    return unsubscribe;
  }, []);

  // Register for sync completion events
  useEffect(() => {
    const syncCompleteCallback = () => {
      const timestamp = new Date().toLocaleTimeString();
      setSyncEvents(prev => [
        `✅ Sync completed at ${timestamp}`,
        ...prev.slice(0, 4),
      ]);
    };

    registerSyncCompleteCallback(syncCompleteCallback);

    return () => {
      unregisterSyncCompleteCallback(syncCompleteCallback);
    };
  }, []);

  useEffect(() => {
    // Monitor network status
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected || false);
    });

    // Initial network check
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected || false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Update pending count periodically
    const interval = setInterval(async () => {
      try {
        const count = await countSavedPayloads();
        setPendingCount(typeof count === 'number' ? count : 0);
      } catch (error) {
        setPendingCount(0);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    try {
      Alert.alert('Sync Started', 'Manual sync initiated...');
      await triggerOfflineSync();
      Alert.alert('Sync Complete', 'Manual sync completed successfully!');
    } catch (error) {
      Alert.alert('Sync Error', 'Failed to complete manual sync');
    }
  };

  const handleDirectSync = async () => {
    try {
      Alert.alert('Direct Sync Started', 'Direct syncPayloads initiated...');
      await syncPayloads();
      Alert.alert(
        'Direct Sync Complete',
        'Direct sync completed successfully!',
      );
    } catch (error) {
      Alert.alert('Direct Sync Error', 'Failed to complete direct sync');
    }
  };

  return (
    <View
      style={[
        {
          padding: 16,
          backgroundColor: theme.COLORS.APP.BACKGROUND_COLOR,
          borderWidth: 1,
          borderColor: theme.COLORS.COMPONENTS.TAB.BORDER_COLOR,
          borderRadius: 8,
          margin: 16,
        },
        style,
      ]}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
          marginBottom: 12,
        }}>
        Offline Sync Status
      </Text>

      <View style={{marginBottom: 8}}>
        <Text style={{color: theme.COLORS.COMPONENTS.TEXT.PRIMARY_COLOR}}>
          Network Status:{' '}
          <Text
            style={{
              color: isOnline ? '#4CAF50' : '#F44336',
              fontWeight: 'bold',
            }}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </Text>
      </View>

      <View style={{marginBottom: 16}}>
        <Text style={{color: theme.COLORS.COMPONENTS.TEXT.PRIMARY_COLOR}}>
          Pending Sync Items:{' '}
          <Text
            style={{
              color: pendingCount > 0 ? '#FF9800' : '#4CAF50',
              fontWeight: 'bold',
            }}>
            {pendingCount}
          </Text>
        </Text>
      </View>

      {pendingCount > 0 && (
        <>
          <TouchableOpacity
            style={{
              backgroundColor: theme.COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR,
              padding: 12,
              borderRadius: 6,
              marginBottom: 8,
            }}
            onPress={handleManualSync}>
            <Text
              style={{
                color: theme.COLORS.COMPONENTS.BUTTON.TEXT_COLOR,
                textAlign: 'center',
                fontWeight: 'bold',
              }}>
              Trigger Manual Sync
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: theme.COLORS.COMPONENTS.BUTTON.SECONDARY_COLOR,
              borderWidth: 1,
              borderColor: theme.COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR,
              padding: 12,
              borderRadius: 6,
            }}
            onPress={handleDirectSync}>
            <Text
              style={{
                color: theme.COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR,
                textAlign: 'center',
                fontWeight: 'bold',
              }}>
              Direct Sync (Advanced)
            </Text>
          </TouchableOpacity>
        </>
      )}

      {syncEvents.length > 0 && (
        <View style={{marginBottom: 16}}>
          <Text
            style={{
              color: theme.COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
              fontWeight: 'bold',
              marginBottom: 8,
            }}>
            Recent Sync Events:
          </Text>
          {syncEvents.map((event, index) => (
            <Text
              key={index}
              style={{
                color: '#4CAF50',
                fontSize: 12,
                marginBottom: 4,
              }}>
              {event}
            </Text>
          ))}
        </View>
      )}

      {pendingCount === 0 && (
        <Text
          style={{
            color: '#4CAF50',
            textAlign: 'center',
            fontStyle: 'italic',
          }}>
          ✅ All data is synced
        </Text>
      )}
    </View>
  );
};

export default OfflineSyncTest;
