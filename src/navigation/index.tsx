import React, {useEffect, useState} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {PortalProvider} from '@gorhom/portal';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import NetInfo from '@react-native-community/netinfo';

import AuthRoutes from './auth-routes';
import AppRoutes from './app-routes';
import {useAppDispatch, useAppSelector} from '../store';
import {Toast} from '../components';
import {RootStackParamList} from '../types/navigation';
import {
  setIsUserSignedIn,
  setOrganizationURL,
  setUserDetails,
} from '../store/slice/authSlice';
import useCleanUp from '../hooks/useCleanUp';
import SplashScreen from '../screens/auth-screens/Splash';
import {TabBarStackParamList} from '../types/navigation/appTypes';
import {getAllOfflineLocationIds} from '../services/DbQueries';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const navigationRef =
  createNavigationContainerRef<TabBarStackParamList>();

const RootNavigator = () => {
  const USER_DETAILS_STORAGE_KEY = 'USER_DETAILS';
  const ORGANIZATION_URL_STORAGE_KEY = 'ORGANIZATION_URL';
  const dispatch = useAppDispatch();
  const [logoutUser] = useCleanUp();
  const {isUserSignedIn} = useAppSelector(state => state.auth);
  const [isSplashScreenVisible, setIsSplashScreenVisible] = useState(true);

  useEffect(() => {
    const init = async () => {
      const organizationURL = await AsyncStorage.getItem(
        ORGANIZATION_URL_STORAGE_KEY,
      );
      try {
        const [credentials, userDetails] = await Promise.all([
          Keychain.getGenericPassword(),
          AsyncStorage.getItem(USER_DETAILS_STORAGE_KEY),
        ]);

        if (credentials && userDetails && organizationURL) {
          const parsedUserDetails = JSON.parse(userDetails);
          dispatch(setIsUserSignedIn(true));
          dispatch(setUserDetails(parsedUserDetails));
          dispatch(setOrganizationURL(organizationURL));
          setTimeout(() => {
            setIsSplashScreenVisible(false);
          }, 2000);
        } else {
          throw new Error('Missing credentials or user details');
        }
      } catch (error) {
        // Check if we're offline and have cached data
        const networkState = await NetInfo.fetch();
        const isOffline = !(
          networkState.isConnected === true &&
          networkState.isInternetReachable !== false
        );

        if (isOffline) {
          // Check if user has offline data cached
          try {
            const offlineLocations = await getAllOfflineLocationIds();

            if (offlineLocations.length > 0) {
              console.log(
                `✅ Found ${offlineLocations.length} offline locations - bypassing authentication`,
              );

              // Set minimal user details to allow app navigation
              dispatch(setIsUserSignedIn(true));
              if (organizationURL) {
                dispatch(setOrganizationURL(organizationURL));
              }

              // Set guest user details for offline mode
              dispatch(
                setUserDetails({
                  firstName: 'Offline',
                  lastName: 'User',
                  role: [{role_name: 'User'}],
                }),
              );

              setTimeout(() => {
                setIsSplashScreenVisible(false);
              }, 2000);
              return;
            }
          } catch (dbError) {
            console.error('Error checking offline data:', dbError);
          }
        }

        // No offline data or online - show login
        logoutUser();
        if (organizationURL) {
          dispatch(setOrganizationURL(organizationURL));
        }
        setTimeout(() => {
          setIsSplashScreenVisible(false);
        }, 2000);
      }
    };

    init();
  }, [dispatch, logoutUser]);

  return (
    <SafeAreaProvider>
      <PortalProvider>
        <Toast />
        <BottomSheetModalProvider>
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{headerShown: false}}>
              {isSplashScreenVisible ? (
                <Stack.Screen component={SplashScreen} name="Splash" />
              ) : isUserSignedIn ? (
                <Stack.Screen component={AppRoutes} name="AppRoutes" />
              ) : (
                <Stack.Screen component={AuthRoutes} name="AuthRoutes" />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </BottomSheetModalProvider>
      </PortalProvider>
    </SafeAreaProvider>
  );
};

export default RootNavigator;
