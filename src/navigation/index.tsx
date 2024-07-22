import React, {useEffect, useState} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

import AuthRoutes from './auth-routes';
import AppRoutes from './app-routes';
import {useAppDispatch, useAppSelector} from '../store';
import {Toast} from '../components';
import {RootStackParamList} from '../types/navigation';
import {setIsUserSignedIn, setUserDetails} from '../store/slice/authSlice';
import useCleanUp from '../hooks/useCleanUp';
import SplashScreen from '../screens/auth-screens/Splash';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const [logoutUser] = useCleanUp();
  const {isUserSignedIn} = useAppSelector(state => state.auth);

  useEffect(() => {
    const init = async () => {
      try {
        const [credentials, userDetails] = await Promise.all([
          Keychain.getGenericPassword(),
          AsyncStorage.getItem('userDetails'),
        ]);

        if (credentials && userDetails) {
          const parsedUserDetails = JSON.parse(userDetails);
          dispatch(setIsUserSignedIn(true));
          dispatch(setUserDetails(parsedUserDetails));
        } else {
          throw new Error('Missing credentials or user details');
        }
      } catch (error) {
        console.log('Error during initialization:', error);
        logoutUser();
      }
    };

    init();
  }, [dispatch, logoutUser]);
  const [isLoading , setIsLoading] = useState(true);
  useEffect(() => {
    const loadApp = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
    };
    loadApp();
  }, []);

  return (
    <SafeAreaProvider>
      <PortalProvider>
        <Toast />
        <BottomSheetModalProvider>
          <NavigationContainer>
            {isLoading ? (
              <SplashScreen />
            ) : (
              <Stack.Navigator screenOptions={{headerShown: false}}>
              {isUserSignedIn ? (
                <Stack.Screen component={AppRoutes} name="AppRoutes" />
              ) : (
                <Stack.Screen component={AuthRoutes} name="AuthRoutes" />
              )}
            </Stack.Navigator>
            )}
          </NavigationContainer>
        </BottomSheetModalProvider>
      </PortalProvider>
    </SafeAreaProvider>
  );
};

export default RootNavigator;
