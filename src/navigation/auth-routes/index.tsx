import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {AuthStackParamList} from '../../types/navigation/authTypes';
import SignIn from '../../screens/auth-screens/SignIn';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthRoutes = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <Stack.Screen component={SignIn} name="SignIn" />
    </Stack.Navigator>
  );
};

export default AuthRoutes;
