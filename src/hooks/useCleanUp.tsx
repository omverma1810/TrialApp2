import {useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {LoginManager} from 'react-native-fbsdk-next';

import {useAppDispatch} from '../store';
import {setClearAuthData} from '../store/slice/authSlice';

const useCleanUp = () => {
  const ORGANIZATION_URL_STORAGE_KEY = 'ORGANIZATION_URL';
  const BIOMETRIC_ENABLED_KEY = 'BIOMETRIC_ENABLED';
  const BIOMETRIC_CREDENTIALS_KEY = 'BIOMETRIC_CREDENTIALS_STORED';
  const dispatch = useAppDispatch();
  const logoutUser = useCallback(async () => {
    try {
      dispatch(setClearAuthData(false));
      const organizationURL = await AsyncStorage.getItem(
        ORGANIZATION_URL_STORAGE_KEY,
      );
      // Preserve biometric settings BEFORE clearing
      const biometricEnabled = await AsyncStorage.getItem(
        BIOMETRIC_ENABLED_KEY,
      );
      const hasBiometricCredentials = await AsyncStorage.getItem(
        BIOMETRIC_CREDENTIALS_KEY,
      );

      // Clear all AsyncStorage except what we want to preserve
      const asyncStorageKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = asyncStorageKeys.filter(
        key =>
          key !== ORGANIZATION_URL_STORAGE_KEY &&
          key !== BIOMETRIC_ENABLED_KEY &&
          key !== BIOMETRIC_CREDENTIALS_KEY,
      );

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }

      // Clear stored tokens without wiping other keychain data
      await EncryptedStorage.removeItem('API_TOKENS');

      // IMPORTANT: Keep Keychain credentials for biometric login
      // Don't call Keychain.resetGenericPassword() as it will remove saved credentials

      const isSignedInWithGoogle = await GoogleSignin.isSignedIn();
      if (isSignedInWithGoogle) {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }
      LoginManager.logOut();
    } catch (error) {}
  }, [dispatch]);
  return [logoutUser];
};

export default useCleanUp;
