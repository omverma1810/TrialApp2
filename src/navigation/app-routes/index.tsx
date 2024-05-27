import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {
  AppStackParamList,
  HomeStackParamList,
} from '../../types/navigation/appTypes';
import Home from '../../screens/app-screens/Home';

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppRoutes = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <Stack.Screen component={HomeStackScreens} name="HomeStack" />
    </Stack.Navigator>
  );
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackScreens = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <HomeStack.Screen name="Home" component={Home} />
    </HomeStack.Navigator>
  );
};

export default AppRoutes;
