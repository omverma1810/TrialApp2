import {Alert, Linking, Platform, AppState, AppStateStatus} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {getCoordinates, LOCATION_DISABLED_ERROR_CODE} from './function';
import Toast from './toast';

interface LocationData {
  latitude: number;
  longitude: number;
}

let lastKnownLocationError: any = null;
let pendingLocationCallback: ((location: LocationData | null) => void) | null =
  null;

/**
 * Validates if location data is present and valid
 * @param latitude - Latitude value
 * @param longitude - Longitude value
 * @returns boolean indicating if location is valid
 */
export const isValidLocation = (
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): boolean => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    // Ensure it's not default/zero coordinates
    !(latitude === 0 && longitude === 0)
  );
};

/**
 * Attempts to get user's location with permission handling
 * @param showAlert - Whether to show alert if location is unavailable
 * @param retryCount - Number of retry attempts (default: 2)
 * @returns Promise with location data or null
 */
export const getLocationWithValidation = async (
  showAlert: boolean = true,
  retryCount: number = 2,
): Promise<LocationData | null> => {
  let lastError: any = null;

  // Try multiple times for devices with slow location services
  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      const coords = await getCoordinates();
      lastKnownLocationError = null;

      if (isValidLocation(coords.latitude, coords.longitude)) {
        return coords;
      } else {
        lastError = new Error('Invalid location data received');
        lastKnownLocationError = lastError;
      }
    } catch (error: any) {
      lastError = error;
      lastKnownLocationError = error;

      if (error?.code === LOCATION_DISABLED_ERROR_CODE) {
        break;
      }

      // Wait before retrying (exponential backoff: 1s, 2s, 4s)
      if (attempt < retryCount) {
        await new Promise(resolve =>
          setTimeout(resolve, 1000 * Math.pow(2, attempt)),
        );
      }
    }
  }

  // All attempts failed, show error
  if (showAlert) {
    const errorMessage = lastError?.message || 'Unable to access location';
    showLocationError(errorMessage, lastError);
  }

  lastKnownLocationError = lastError;

  return null;
};

/**
 * Shows location error with option to open settings
 * @param message - Error message to display
 * @param error - Optional error object for additional context
 */
export const showLocationError = (message: string, error?: any) => {
  const isPermissionDenied =
    error?.code === 1 || // PERMISSION_DENIED
    error?.message?.toLowerCase().includes('permission') ||
    error?.message?.toLowerCase().includes('denied');

  const isServicesDisabled =
    error?.code === LOCATION_DISABLED_ERROR_CODE ||
    error?.message?.toLowerCase().includes('disabled') ||
    error?.message?.toLowerCase().includes('location services');

  const normalizedMessage =
    message || error?.message || 'Unable to access location.';

  const openAppPermissions = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const openLocationSettings = async () => {
    if (Platform.OS === 'ios') {
      try {
        await Linking.openURL('App-Prefs:root=Privacy&path=LOCATION');
        return;
      } catch (iosError) {
        Linking.openURL('app-settings:');
        return;
      }
    }

    // Android - open location settings directly
    try {
      await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
    } catch {
      Linking.openSettings();
    }
  };

  const errorTitle = isPermissionDenied
    ? 'Location Permission Required'
    : isServicesDisabled
    ? 'Enable Location Services'
    : 'Location Unavailable';

  const errorMessage = isPermissionDenied
    ? 'Location permission is currently disabled. Please grant Field Genie access to your location so we can upload your data.'
    : isServicesDisabled
    ? 'Location permission is granted, but your device location is turned off.\n\nPlease:\n1. Tap "Open Location Settings" below\n2. Turn ON the location toggle\n3. Return to the app - we\'ll automatically continue'
    : `${normalizedMessage}\n\nPlease ensure location services are enabled.`;

  Alert.alert(
    errorTitle,
    errorMessage,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: isServicesDisabled ? 'Open Location Settings' : 'Open Settings',
        onPress: () => {
          if (isServicesDisabled) {
            openLocationSettings();
          } else {
            openAppPermissions();
          }
        },
      },
    ],
    {cancelable: false},
  );
};

/**
 * Validates location before making API call
 * Used as a guard before RECORD_TRAITS or image upload APIs
 * @param requireLocation - Whether location is mandatory
 * @param showToast - Whether to show toast notification
 * @param autoRetry - Whether to automatically retry when app returns from settings
 * @returns Promise<LocationData | null>
 */
export const validateLocationForAPI = async (
  requireLocation: boolean = true,
  showToast: boolean = true,
  autoRetry: boolean = true,
): Promise<LocationData | null> => {
  const location = await getLocationWithValidation(!showToast);

  if (!location && requireLocation) {
    const failureError = lastKnownLocationError;
    const isPermissionDenied =
      failureError?.code === 1 ||
      failureError?.message?.toLowerCase().includes('permission') ||
      failureError?.message?.toLowerCase().includes('denied');
    const isServicesDisabled =
      failureError?.code === LOCATION_DISABLED_ERROR_CODE ||
      failureError?.message?.toLowerCase().includes('disabled');
    const toastMessage = isServicesDisabled
      ? 'Please enable device location and return to the app.'
      : isPermissionDenied
      ? 'Please grant location permission to Field Genie to continue.'
      : 'Location access is required to record data';

    if (showToast) {
      Toast.error({message: toastMessage, duration: 3000});
    }

    // Show alert with option to enable location
    showLocationError(
      isServicesDisabled
        ? 'Location services are disabled.'
        : isPermissionDenied
        ? 'Location permission is disabled.'
        : 'Location data is required to save trait records. This ensures accurate data collection.',
      failureError,
    );

    // If autoRetry is enabled and it's a services disabled issue, set up listener
    if (autoRetry && isServicesDisabled) {
      return new Promise<LocationData | null>(resolve => {
        pendingLocationCallback = resolve;
        setupAppStateListener();
      });
    }

    return null;
  }

  if (!location && !requireLocation) {
    return null;
  }

  return location;
};

/**
 * Sets up app state listener to auto-retry location when user returns from settings
 */
let appStateSubscription: any = null;

const setupAppStateListener = () => {
  // Clean up existing listener
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }

  let previousState: AppStateStatus = AppState.currentState;

  appStateSubscription = AppState.addEventListener(
    'change',
    async (nextAppState: AppStateStatus) => {
      // User returned to app from background
      if (
        previousState.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('🔄 App resumed - checking location status...');

        // Check if location services are now enabled
        const isEnabled = await checkLocationServicesEnabled();

        if (isEnabled && pendingLocationCallback) {
          console.log(
            '✅ Location services enabled - retrying location fetch...',
          );
          Toast.success({
            message: 'Location enabled! Continuing with upload...',
            duration: 2000,
          });

          // Retry getting location
          const location = await getLocationWithValidation(false, 1);

          // Resolve the pending promise
          const callback = pendingLocationCallback;
          pendingLocationCallback = null;

          // Clean up listener
          if (appStateSubscription) {
            appStateSubscription.remove();
            appStateSubscription = null;
          }

          callback(location);
        } else if (!isEnabled) {
          console.log('⚠️ Location services still disabled');
        }
      }

      previousState = nextAppState;
    },
  );

  // Set timeout to clean up listener after 5 minutes
  setTimeout(() => {
    if (appStateSubscription) {
      console.log('⏱️ Location listener timeout - cleaning up');
      appStateSubscription.remove();
      appStateSubscription = null;

      if (pendingLocationCallback) {
        pendingLocationCallback(null);
        pendingLocationCallback = null;
      }
    }
  }, 300000); // 5 minutes
};

/**
 * Check if location services are enabled on the device
 * Note: This requires additional native module setup
 */
export const checkLocationServicesEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await DeviceInfo.isLocationEnabled();
    if (typeof enabled === 'boolean') {
      return enabled;
    }
  } catch (_) {
    // Fall back to geolocation attempt
  }

  try {
    const location = await getLocationWithValidation(false, 0);
    return location !== null;
  } catch (error: any) {
    if (error?.code === LOCATION_DISABLED_ERROR_CODE) {
      return false;
    }

    return false;
  }
};

/**
 * Pre-flight check before data recording
 * Validates location and shows appropriate UI feedback
 */
export const performPreflightLocationCheck = async (): Promise<boolean> => {
  const location = await validateLocationForAPI(true, true);

  if (!location) {
    return false;
  }

  return true;
};
