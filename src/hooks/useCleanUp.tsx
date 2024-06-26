import {useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import * as Keychain from 'react-native-keychain';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {LoginManager} from 'react-native-fbsdk-next';

import {useAppDispatch} from '../store';
import {setClearAuthData} from '../store/slice/authSlice';

const useCleanUp = () => {
  const dispatch = useAppDispatch();
  const logoutUser = useCallback(async () => {
    try {
      dispatch(setClearAuthData(false));
      const asyncStorageKeys = await AsyncStorage.getAllKeys();
      if (asyncStorageKeys.length > 0) {
        await AsyncStorage.clear();
      }
      await EncryptedStorage.clear();
      await Keychain.resetGenericPassword();
      const isSignedInWithGoogle = await GoogleSignin.isSignedIn();
      if (isSignedInWithGoogle) {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }
      LoginManager.logOut();
    } catch (error) {
      console.log('Error while logging out...', error);
    }
  }, []);
  return [logoutUser];
};

export default useCleanUp;
