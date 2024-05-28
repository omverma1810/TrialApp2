import React from 'react';
import {StyleSheet} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTranslation} from 'react-i18next';

import {
  AppStackParamList,
  ExperimentStackParamList,
  HomeStackParamList,
  NotificationStackParamList,
  RecordStackParamList,
  TabBarStackParamList,
} from '../../types/navigation/appTypes';
import {LOCALES} from '../../localization/constants';
import useTheme from '../../theme/hooks/useTheme';
import Home from '../../screens/app-screens/Home';
import {
  ExperimentIcon,
  HomeIcon,
  NotificationIcon,
  RecordIcon,
} from '../../assets/icons/svgs';
import PlanVisit from '../../screens/app-screens/PlanVisit';
import TakeNotes from '../../screens/app-screens/TakeNotes';
import Experiment from '../../screens/app-screens/Experiment';
import Record from '../../screens/app-screens/Record';
import Notification from '../../screens/app-screens/Notification';

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<TabBarStackParamList>();

const AppRoutes = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <Stack.Screen component={TabBar} name="TabBar" />
    </Stack.Navigator>
  );
};

const TabBar = () => {
  const {t} = useTranslation();
  const {COLORS, FONTS} = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarHideOnKeyboard: true,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: COLORS.COMPONENTS.TAB.BACKGROUND_COLOR,
            borderColor: COLORS.COMPONENTS.TAB.BORDER_COLOR,
          },
        ],
        tabBarIcon: ({focused}) => {
          let icon;
          const iconColor = focused
            ? COLORS.COMPONENTS.TAB.ACTIVE_COLOR
            : COLORS.COMPONENTS.TAB.INACTIVE_COLOR;
          if (route.name === 'HomeStack') {
            icon = <HomeIcon color={iconColor} focused={focused} />;
          } else if (route.name === 'ExperimentStack') {
            icon = <ExperimentIcon color={iconColor} focused={focused} />;
          } else if (route.name === 'RecordStack') {
            icon = <RecordIcon color={iconColor} focused={focused} />;
          } else if (route.name === 'NotificationStack') {
            icon = <NotificationIcon color={iconColor} focused={focused} />;
          }
          return icon;
        },
        headerShown: false,
        tabBarActiveTintColor: COLORS.COMPONENTS.TAB.ACTIVE_TEXT_COLOR,
        tabBarInactiveTintColor: COLORS.COMPONENTS.TAB.INACTIVE_TEXT_COLOR,
        tabBarLabelStyle: {fontFamily: FONTS.SEMI_BOLD, fontSize: 12},
      })}>
      <Tab.Screen
        name="HomeStack"
        component={HomeStackScreens}
        options={{title: t(LOCALES.BOTTOM_TAB.LBL_HOME)}}
      />
      <Tab.Screen
        name="ExperimentStack"
        component={ExperimentStackScreens}
        options={{title: t(LOCALES.BOTTOM_TAB.LBL_EXPERIMENT)}}
      />
      <Tab.Screen
        name="RecordStack"
        component={RecordStackScreens}
        options={{title: t(LOCALES.BOTTOM_TAB.LBL_RECORD)}}
      />
      <Tab.Screen
        name="NotificationStack"
        component={NotificationStackScreens}
        options={{title: t(LOCALES.BOTTOM_TAB.LBL_NOTIFICATION)}}
      />
    </Tab.Navigator>
  );
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackScreens = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <HomeStack.Screen name="Home" component={Home} />
      <HomeStack.Screen name="PlanVisit" component={PlanVisit} />
      <HomeStack.Screen name="TakeNotes" component={TakeNotes} />
    </HomeStack.Navigator>
  );
};
const ExperimentStack = createNativeStackNavigator<ExperimentStackParamList>();

const ExperimentStackScreens = () => {
  return (
    <ExperimentStack.Navigator
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <ExperimentStack.Screen name="Experiment" component={Experiment} />
    </ExperimentStack.Navigator>
  );
};
const RecordStack = createNativeStackNavigator<RecordStackParamList>();

const RecordStackScreens = () => {
  return (
    <RecordStack.Navigator
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <RecordStack.Screen name="Record" component={Record} />
    </RecordStack.Navigator>
  );
};
const NotificationStack =
  createNativeStackNavigator<NotificationStackParamList>();

const NotificationStackScreens = () => {
  return (
    <NotificationStack.Navigator
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <NotificationStack.Screen name="Notification" component={Notification} />
    </NotificationStack.Navigator>
  );
};

export default AppRoutes;

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    paddingTop: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
  },
});
