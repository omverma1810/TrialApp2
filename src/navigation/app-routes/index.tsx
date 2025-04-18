import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform, StyleSheet} from 'react-native';

import {navigationRef} from '..';
import {
  ExperimentIcon,
  HomeIcon,
  NotificationIcon,
  RecordIcon,
} from '../../assets/icons/svgs';
import {LOCALES} from '../../localization/constants';
import AddImage from '../../screens/app-screens/AddImage';
import ChangePassword from '../../screens/app-screens/ChangePassword';
import Experiment from '../../screens/app-screens/Experiment';
import ExperimentDetails from '../../screens/app-screens/ExperimentDetails';
import Home from '../../screens/app-screens/Home';
import Profile from '../../screens/app-screens/Home/Profile';
import NewRecord from '../../screens/app-screens/NewRecord';
import Notification from '../../screens/app-screens/Notification';
import PlanVisit from '../../screens/app-screens/PlanVisit';
import Plots from '../../screens/app-screens/Plots';
import QRScanner from '../../screens/app-screens/QRScanner';
import Record from '../../screens/app-screens/Record';
import TakeNotes from '../../screens/app-screens/TakeNotes';
import {useAppSelector} from '../../store';
import useTheme from '../../theme/hooks/useTheme';
import {
  AppStackParamList,
  ExperimentStackParamList,
  HomeStackParamList,
  NotificationStackParamList,
  RecordStackParamList,
  TabBarStackParamList,
} from '../../types/navigation/appTypes';
import Toast from '../../utilities/toast';

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
  const {
    userDetails: {has_logged_in_before, role},
  } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (navigationRef.isReady()) {
      if (has_logged_in_before === false) {
        setTimeout(() => {
          if (role[0]?.role_name === 'Fieldman') {
            navigationRef?.navigate('ExperimentStack', {
              screen: 'ChangePassword',
            });
          } else {
            navigationRef?.navigate('HomeStack', {
              screen: 'ChangePassword',
            });
          }

          Toast.info({
            message:
              'Please change your password as this is your first time logging in',
          });
        }, 1000);
      }
    }
  }, [navigationRef.isReady(), has_logged_in_before]);

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
      {role[0]?.role_name && role[0]?.role_name !== 'Fieldman' ? (
        <Tab.Screen
          name="HomeStack"
          component={HomeStackScreens}
          options={{title: t(LOCALES.BOTTOM_TAB.LBL_HOME)}}
        />
      ) : null}
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
      screenOptions={{
        animation: 'slide_from_right',
        headerShadowVisible: false,
      }}>
      <HomeStack.Screen
        name="Home"
        component={Home}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="PlanVisit"
        component={PlanVisit}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="TakeNotes"
        component={TakeNotes}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="Profile"
        component={Profile}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{title: 'Change Password'}}
      />
      <ExperimentStack.Screen
        name="NewRecord"
        component={NewRecord}
        options={{headerShown: false}}
      />
      <ExperimentStack.Screen name="AddImage" component={AddImage} />
      <ExperimentStack.Screen name="QRScanner" component={QRScanner} />
      <ExperimentStack.Screen name="Plots" component={Plots} />
    </HomeStack.Navigator>
  );
};
const ExperimentStack = createNativeStackNavigator<ExperimentStackParamList>();

const ExperimentStackScreens = () => {
  return (
    <ExperimentStack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: false,
      }}>
      <ExperimentStack.Screen name="Experiment" component={Experiment} />
      <ExperimentStack.Screen
        name="ExperimentDetails"
        component={ExperimentDetails}
      />
      <ExperimentStack.Screen name="Plots" component={Plots} />
      <ExperimentStack.Screen name="NewRecord" component={NewRecord} />
      <ExperimentStack.Screen name="AddImage" component={AddImage} />
      <ExperimentStack.Screen name="QRScanner" component={QRScanner} />
      <ExperimentStack.Screen
        name="Profile"
        component={Profile}
        options={{headerShown: false}}
      />
      <ExperimentStack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{title: 'Change Password'}}
      />
    </ExperimentStack.Navigator>
  );
};
const RecordStack = createNativeStackNavigator<RecordStackParamList>();

const RecordStackScreens = () => {
  return (
    <RecordStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}>
      <RecordStack.Screen
        name="Record"
        component={Record}
        options={{headerShown: false}}
      />
      <ExperimentStack.Screen name="Plots" component={Plots} />
      <ExperimentStack.Screen
        name="NewRecord"
        component={NewRecord}
        options={{headerShown: false}}
      />
      <ExperimentStack.Screen name="AddImage" component={AddImage} />
      <ExperimentStack.Screen name="QRScanner" component={QRScanner} />
    </RecordStack.Navigator>
  );
};
const NotificationStack =
  createNativeStackNavigator<NotificationStackParamList>();

const NotificationStackScreens = () => {
  return (
    <NotificationStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}>
      <NotificationStack.Screen
        name="Notification"
        component={Notification}
        options={{headerShown: false}}
      />
    </NotificationStack.Navigator>
  );
};

export default AppRoutes;

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    ...Platform.select({
      ios: {},
      android: {
        height: 80,
        paddingTop: 14,
        paddingBottom: 14,
      },
    }),
  },
});
