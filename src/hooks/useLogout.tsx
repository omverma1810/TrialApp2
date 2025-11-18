import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAppDispatch} from '../store';
import {setClearAuthData, setBiometricEnabled} from '../store/slice/authSlice';
import {keychainService} from '../services/keychainService';

const BIOMETRIC_ENABLED_KEY = 'BIOMETRIC_ENABLED';
const BIOMETRIC_CREDENTIALS_KEY = 'BIOMETRIC_CREDENTIALS_STORED';

export const useLogout = () => {
  const dispatch = useAppDispatch();

  const logout = async (clearBiometricData: boolean = false) => {
    try {
      // Clear auth data from Redux store
      dispatch(setClearAuthData(null));

      // Clear biometric data if requested
      if (clearBiometricData) {
        await keychainService.clearCredentials().catch(() => {});
        await AsyncStorage.setItem(BIOMETRIC_CREDENTIALS_KEY, 'false');
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
        dispatch(setBiometricEnabled(false));
      }

      // Clear other stored data as needed
      // await AsyncStorage.removeItem('USER_DETAILS');
      // You might want to keep organization URL
    } catch (error) {}
  };

  const logoutWithBiometricClear = async () => {
    await logout(true);
  };

  const logoutKeepBiometric = async () => {
    await logout(false);
  };

  return {
    logout,
    logoutWithBiometricClear,
    logoutKeepBiometric,
  };
};
