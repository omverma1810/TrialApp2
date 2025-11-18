import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';

import {useAppDispatch, useAppSelector} from '../store';
import {
  setBiometricAvailable,
  setBiometricEnabled,
} from '../store/slice/authSlice';
import {
  biometricAuthService,
  BiometricAvailability,
} from '../utilities/biometricAuth';
import {
  keychainService,
  KeychainErrorCode,
  KeychainStorageError,
} from '../services/keychainService';

const BIOMETRIC_ENABLED_KEY = 'BIOMETRIC_ENABLED';
const BIOMETRIC_CREDENTIALS_KEY = 'BIOMETRIC_CREDENTIALS_STORED';

export enum BiometricAuthErrorCode {
  CANCELLED = 'CANCELLED',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  ENROLLMENT_CHANGED = 'ENROLLMENT_CHANGED',
  CREDENTIALS_MISSING = 'CREDENTIALS_MISSING',
  AUTH_FAILED = 'AUTH_FAILED',
  UNKNOWN = 'UNKNOWN',
}

export interface BiometricAuthError extends Error {
  code: BiometricAuthErrorCode;
  cause?: unknown;
}

const createBiometricError = (
  code: BiometricAuthErrorCode,
  message: string,
  cause?: unknown,
): BiometricAuthError => {
  const error = new Error(message) as BiometricAuthError;
  error.code = code;
  if (cause) {
    (error as any).cause = cause;
  }
  return error;
};

export const useBiometricAuth = () => {
  const dispatch = useAppDispatch();
  const {biometricAvailable, biometricEnabled} = useAppSelector(
    state => state.auth,
  );
  const [isLoading, setIsLoading] = useState(false);

  // Check biometric availability on mount
  useEffect(() => {
    checkBiometricAvailability();
    loadBiometricPreference();
  }, []);

  const checkBiometricAvailability =
    async (): Promise<BiometricAvailability> => {
      try {
        const availability = await biometricAuthService.isBiometricAvailable();
        dispatch(setBiometricAvailable(availability.available));
        return availability;
      } catch (error) {
        dispatch(setBiometricAvailable(false));
        return {available: false, error: 'Failed to check availability'};
      }
    };

  const loadBiometricPreference = async () => {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      dispatch(setBiometricEnabled(enabled === 'true'));
    } catch (error) {}
  };

  const enableBiometric = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Check if biometric is available
      const availability = await checkBiometricAvailability();
      if (!availability.available) {
        throw createBiometricError(
          BiometricAuthErrorCode.NOT_AVAILABLE,
          'Biometric authentication is not available',
        );
      }

      // CRITICAL: Platform-specific enrollment flow
      if (Platform.OS === 'android') {
        // Android: Two-step process
        // Step 1: Verify biometric FIRST (via react-native-biometrics)
        console.log(
          '🔐 Android: Requesting biometric verification before storing credentials',
        );
        const biometricResult = await biometricAuthService.authenticate(
          'Verify your biometric to enable biometric login',
        );

        if (!biometricResult.success) {
          if (biometricResult.cancelled) {
            throw createBiometricError(
              BiometricAuthErrorCode.CANCELLED,
              'Biometric setup was cancelled',
            );
          }
          throw createBiometricError(
            BiometricAuthErrorCode.AUTH_FAILED,
            biometricResult.error || 'Biometric verification failed',
          );
        }

        // Step 2: ONLY after successful biometric verification, store credentials
        console.log('✅ Android: Biometric verified, storing credentials');
        await keychainService.storeCredentials(username, password);
      } else {
        // iOS: Single-step process (Keychain handles biometric prompt)
        console.log('🍎 iOS: Storing credentials with biometric protection');
        await keychainService.storeCredentials(username, password);

        // Verify setup works by triggering biometric prompt
        await keychainService.retrieveCredentials(
          'Enable biometric login for faster access',
        );
      }

      // Mark that credentials are stored and biometric is enabled
      await AsyncStorage.setItem(BIOMETRIC_CREDENTIALS_KEY, 'true');
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      dispatch(setBiometricEnabled(true));

      console.log('✅ Biometric authentication enabled successfully');
      return true;
    } catch (error: any) {
      console.log('❌ Failed to enable biometric authentication', error);
      await AsyncStorage.setItem(BIOMETRIC_CREDENTIALS_KEY, 'false');
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
      dispatch(setBiometricEnabled(false));

      if (
        (error as BiometricAuthError)?.code === BiometricAuthErrorCode.CANCELLED
      ) {
        throw error;
      }

      if ((error as BiometricAuthError)?.code) {
        throw error as BiometricAuthError;
      }

      throw createBiometricError(
        BiometricAuthErrorCode.UNKNOWN,
        error?.message || 'Failed to enable biometric authentication',
        error,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const disableBiometric = async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Clear stored credentials
      await keychainService.clearCredentials();

      // Clear markers and preferences
      await AsyncStorage.setItem(BIOMETRIC_CREDENTIALS_KEY, 'false');
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
      dispatch(setBiometricEnabled(false));

      return true;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithBiometric = async (): Promise<{
    username: string;
    password: string;
  } | null> => {
    try {
      setIsLoading(true);

      if (!biometricAvailable || !biometricEnabled) {
        throw createBiometricError(
          BiometricAuthErrorCode.NOT_AVAILABLE,
          'Biometric authentication is not available or enabled',
        );
      }

      // CRITICAL: Platform-specific authentication flow
      if (Platform.OS === 'android') {
        // Android: Two-step process
        // Step 1: Verify biometric FIRST (via react-native-biometrics)
        console.log('🔐 Android: Requesting biometric verification');
        const biometricResult = await biometricAuthService.authenticate(
          'Authenticate to login to FieldGenie',
        );

        if (!biometricResult.success) {
          if (biometricResult.cancelled) {
            throw createBiometricError(
              BiometricAuthErrorCode.CANCELLED,
              'Authentication was cancelled',
            );
          }
          throw createBiometricError(
            BiometricAuthErrorCode.AUTH_FAILED,
            biometricResult.error || 'Biometric authentication failed',
          );
        }

        // Step 2: ONLY after successful biometric verification, retrieve credentials
        console.log('✅ Android: Biometric verified, retrieving credentials');
        const credentials = await keychainService.retrieveCredentials();

        if (!credentials?.username || !credentials?.password) {
          throw createBiometricError(
            BiometricAuthErrorCode.CREDENTIALS_MISSING,
            'Stored credentials are unavailable',
          );
        }

        return credentials;
      } else {
        // iOS: Single-step process (Keychain handles biometric prompt automatically)
        console.log('🍎 iOS: Retrieving credentials with biometric prompt');
        const credentials = await keychainService.retrieveCredentials(
          'Authenticate to login to FieldGenie',
        );

        if (!credentials?.username || !credentials?.password) {
          throw createBiometricError(
            BiometricAuthErrorCode.CREDENTIALS_MISSING,
            'Stored credentials are unavailable',
          );
        }

        return credentials;
      }
    } catch (error: any) {
      console.log('❌ Biometric authentication failed', error);

      if ((error as BiometricAuthError)?.code) {
        throw error as BiometricAuthError;
      }

      if (error instanceof KeychainStorageError) {
        switch (error.code) {
          case KeychainErrorCode.CANCELLED:
            throw createBiometricError(
              BiometricAuthErrorCode.CANCELLED,
              'Authentication was cancelled',
              error,
            );
          case KeychainErrorCode.ENROLLMENT_CHANGED:
            await keychainService.clearCredentials().catch(() => {});
            await AsyncStorage.setItem(BIOMETRIC_CREDENTIALS_KEY, 'false');
            await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
            dispatch(setBiometricEnabled(false));
            throw createBiometricError(
              BiometricAuthErrorCode.ENROLLMENT_CHANGED,
              'Biometric enrollment changed',
              error,
            );
          case KeychainErrorCode.NOT_FOUND:
            await AsyncStorage.setItem(BIOMETRIC_CREDENTIALS_KEY, 'false');
            await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
            dispatch(setBiometricEnabled(false));
            throw createBiometricError(
              BiometricAuthErrorCode.CREDENTIALS_MISSING,
              'Stored credentials are unavailable',
              error,
            );
          case KeychainErrorCode.NOT_AVAILABLE:
            dispatch(setBiometricAvailable(false));
            throw createBiometricError(
              BiometricAuthErrorCode.NOT_AVAILABLE,
              'Biometric authentication is not available or enabled',
              error,
            );
          case KeychainErrorCode.AUTH_FAILED:
            throw createBiometricError(
              BiometricAuthErrorCode.AUTH_FAILED,
              'Biometric authentication failed',
              error,
            );
          default:
            throw createBiometricError(
              BiometricAuthErrorCode.UNKNOWN,
              error.message || 'Biometric authentication failed',
              error,
            );
        }
      }

      if ((error as BiometricAuthError)?.code) {
        throw error as BiometricAuthError;
      }

      throw createBiometricError(
        BiometricAuthErrorCode.UNKNOWN,
        error?.message || 'Biometric authentication failed',
        error,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const hasBiometricCredentials = async (): Promise<boolean> => {
    try {
      // Only use AsyncStorage flag to avoid triggering biometric prompt
      const flag = await AsyncStorage.getItem(BIOMETRIC_CREDENTIALS_KEY);
      return flag === 'true';
    } catch (error) {
      return false;
    }
  };

  const getBiometricTypeName = async (): Promise<string> => {
    try {
      const availability = await biometricAuthService.isBiometricAvailable();
      return biometricAuthService.getBiometricTypeName(
        availability.biometryType,
      );
    } catch (error) {
      return 'Biometric Authentication';
    }
  };

  return {
    biometricAvailable,
    biometricEnabled,
    isLoading,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
    hasBiometricCredentials,
    getBiometricTypeName,
    checkBiometricAvailability,
  };
};
