import {useEffect, useRef, useState} from 'react';
import {BackHandler, Platform} from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import {navigationRef} from '../navigation';
import Toast from '../utilities/toast';

const OFFLINE_EXIT_MESSAGE =
  'Offline mode is active. Keep the app running to make sure your work syncs when you are back online.';

/**
 * Prevents the application from being closed while the device is offline.
 *
 * - Listens for connectivity changes and keeps an `offline` flag.
 * - Blocks hardware back presses on Android when the app is offline and already at the root of the navigation stack.
 * - Provides user guidance via alerts/toasts so they understand why the app cannot be closed.
 */
export const usePreventOfflineAppClose = () => {
  const [isOffline, setIsOffline] = useState(false);
  const offlineRef = useRef(false);
  const lastToastTimestampRef = useRef<number>(0);
  const hasShownOfflineAlertRef = useRef(false);

  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      const offline = !(
        state.isConnected === true && state.isInternetReachable !== false
      );
      offlineRef.current = offline;
      setIsOffline(offline);
    });

    return () => {
      unsubscribeNetInfo();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const handleBackPress = () => {
      if (!offlineRef.current) {
        return false; // allow normal navigation when online
      }

      // If navigation is ready and we can go back in the stack, do not block the navigation pop.
      if (navigationRef.isReady() && navigationRef.canGoBack()) {
        return false;
      }

      const now = Date.now();
      if (now - lastToastTimestampRef.current > 2000) {
        Toast.warning({message: OFFLINE_EXIT_MESSAGE});
        lastToastTimestampRef.current = now;
      }

      return true; // block app exit
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    if (isOffline && !hasShownOfflineAlertRef.current) {
      // Use non-blocking Toast instead of blocking Alert
      Toast.warning({
        message: 'Offline mode active. Your data will sync when online.',
        duration: 4000,
      });
      hasShownOfflineAlertRef.current = true;
    }

    if (!isOffline) {
      hasShownOfflineAlertRef.current = false;
    }
  }, [isOffline]);
};

export default usePreventOfflineAppClose;
