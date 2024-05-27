import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import AuthRoutes from './auth-routes';
import AppRoutes from './app-routes';
import {useAppSelector} from '../store';
import {Toast} from '../components';
import {RootStackParamList} from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const {isUserSignedIn} = useAppSelector(state => state.auth);
  return (
    <SafeAreaProvider>
      <PortalProvider>
        <Toast />
        <BottomSheetModalProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{headerShown: false}}>
              {isUserSignedIn ? (
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
