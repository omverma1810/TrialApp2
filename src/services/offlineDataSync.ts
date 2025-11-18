// src/services/offlineDataSync.ts
import NetInfo from '@react-native-community/netinfo';
import {useEffect, useState, useCallback} from 'react';
import {syncPayloads, countSavedPayloads} from './DbQueries';
import Toast from '../utilities/toast';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: Date | null;
}

// Global array to store callbacks that should be triggered after successful sync
let globalSyncCompleteCallbacks: Array<() => void> = [];

// Function to register a callback that will be called after successful sync
export const registerSyncCompleteCallback = (callback: () => void) => {
  globalSyncCompleteCallbacks.push(callback);
};

// Function to unregister a callback
export const unregisterSyncCompleteCallback = (callback: () => void) => {
  globalSyncCompleteCallbacks = globalSyncCompleteCallbacks.filter(
    cb => cb !== callback,
  );
};

// Function to trigger all registered callbacks
const triggerSyncCompleteCallbacks = () => {
  globalSyncCompleteCallbacks.forEach((callback, index) => {
    try {
      callback();
    } catch (error) {
    }
  });
};

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: Date | null;
}

export const useOfflineDataSync = () => {
  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: false,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
  });

  // Update pending count
  const updatePendingCount = useCallback(async () => {
    try {
      const count = (await countSavedPayloads()) as number | null;
      setSyncState(prev => ({
        ...prev,
        pendingCount: count || 0,
      }));
    } catch (error) {
    }
  }, []);

  // Perform automatic sync
  const performSync = useCallback(async () => {
    if (syncState.isSyncing) {
      return;
    }

    setSyncState(prev => ({...prev, isSyncing: true}));

    try {
      const pendingCount = (await countSavedPayloads()) as number | null;
      const pendingCountNum = pendingCount || 0;

      if (pendingCountNum === 0) {
        setSyncState(prev => ({
          ...prev,
          isSyncing: false,
          pendingCount: 0,
        }));
        return;
      }

      // Show user feedback
      Toast.info({
        message: `Syncing ${pendingCountNum} offline items...`,
      });

      // Sync all pending payloads
      let syncedCount = 0;
      let remainingCount = pendingCountNum;

      while (remainingCount > 0) {
        try {
          await syncPayloads();
          syncedCount++;

          // Update remaining count
          const newCount = (await countSavedPayloads()) as number | null;
          remainingCount = newCount || 0;


          // Update state with current progress
          setSyncState(prev => ({
            ...prev,
            pendingCount: remainingCount,
          }));
        } catch (error) {
          // Continue with next item instead of breaking
          remainingCount--; // Assume this item failed and move on
        }
      }

      // Show success message
      Toast.success({
        message: `Successfully synced ${syncedCount} offline items!`,
      });


      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: new Date(),
      }));

      // Trigger all registered callbacks after successful sync
      if (syncedCount > 0) {
        triggerSyncCompleteCallbacks();
      }
    } catch (error) {
      Toast.error({
        message: 'Error syncing offline data. Will retry when possible.',
      });

      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
      }));
    }
  }, [syncState.isSyncing]);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async state => {
      const wasOffline = !syncState.isOnline;
      const isNowOnline =
        state.isConnected === true && state.isInternetReachable !== false;

      setSyncState(prev => ({
        ...prev,
        isOnline: isNowOnline,
      }));

      // Auto-sync when coming back online
      if (wasOffline && isNowOnline) {

        // Small delay to ensure network is stable
        setTimeout(async () => {
          await updatePendingCount();

          const currentPendingCount = (await countSavedPayloads()) as
            | number
            | null;
          const currentPendingCountNum = currentPendingCount || 0;
          if (currentPendingCountNum > 0) {
            await performSync();
          } else {
          }
        }, 1000);
      }

      // Update pending count when online status changes
      if (isNowOnline) {
        await updatePendingCount();
      }
    });

    return () => unsubscribe();
  }, [syncState.isOnline, updatePendingCount, performSync]);

  // Initialize pending count on mount
  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  // Manual sync function
  const manualSync = useCallback(async () => {
    if (!syncState.isOnline) {
      Toast.warning({
        message: 'Cannot sync while offline. Please check your connection.',
      });
      return;
    }

    await performSync();
  }, [syncState.isOnline, performSync]);

  return {
    syncState,
    manualSync,
    updatePendingCount,
  };
};

// Standalone function to trigger sync from anywhere in the app
export const triggerOfflineSync = async (): Promise<boolean> => {
  try {
    const pendingCount = (await countSavedPayloads()) as number | null;
    const pendingCountNum = pendingCount || 0;

    if (pendingCountNum === 0) {
      return true;
    }


    // Check network connectivity first
    const networkState = await NetInfo.fetch();
    const isOnline =
      networkState.isConnected === true &&
      networkState.isInternetReachable !== false;

    if (!isOnline) {
      Toast.warning({
        message: 'Cannot sync while offline. Please check your connection.',
      });
      return false;
    }

    // Perform sync
    let syncedCount = 0;
    let remainingCount = pendingCountNum;

    while (remainingCount > 0) {
      try {
        await syncPayloads();
        syncedCount++;
        const newCount = (await countSavedPayloads()) as number | null;
        remainingCount = newCount || 0;
      } catch (error) {
        remainingCount--;
      }
    }

    if (syncedCount > 0) {
      Toast.success({
        message: `Successfully synced ${syncedCount} offline items!`,
      });

      // Trigger callbacks after successful sync
      triggerSyncCompleteCallbacks();
    }

    return true;
  } catch (error) {
    Toast.error({
      message: 'Error syncing offline data.',
    });
    return false;
  }
};
