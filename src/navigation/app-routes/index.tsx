import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';

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
import {triggerOfflineSync} from '../../services/offlineDataSync';
import {countSavedPayloads} from '../../services/DbQueries';
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
  const insets = useSafeAreaInsets();
  const authState = useAppSelector(state => state.auth);
  const userDetails = authState.userDetails || {};
  const has_logged_in_before = userDetails.has_logged_in_before;
  const role = userDetails.role;

  // Network connectivity state
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Network connectivity listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async state => {
      const wasOffline = isConnected === false;
      const isNowOnline = state.isConnected === true;
      setIsConnected(state.isConnected);

      // Show notification when coming back online
      if (wasOffline && isNowOnline) {
        // Check if there's pending offline data to sync
        try {
          const pendingCount = (await countSavedPayloads()) as number | null;
          const pendingCountNum = pendingCount || 0;

          if (pendingCountNum > 0) {
            Toast.success({
              message: `Back online! Syncing ${pendingCountNum} offline items...`,
            });

            // Trigger automatic sync with a small delay to ensure stable connection
            setTimeout(async () => {
              const syncSuccess = await triggerOfflineSync();
              if (syncSuccess) {
              }
            }, 1500);
          } else {
            Toast.success({
              message: 'You are back online! All features are now available.',
            });
          }
        } catch (error) {
          Toast.success({
            message: 'You are back online! All features are now available.',
          });
        }
      }
    });
    return () => unsubscribe();
  }, [isConnected]);

  // Handle navigation when going offline
  useEffect(() => {
    if (isConnected === false && navigationRef.isReady()) {
      // Get current route
      const currentRoute = navigationRef.getCurrentRoute();

      // If user is currently on HomeStack or RecordStack, redirect to ExperimentStack
      if (
        currentRoute?.name === 'HomeStack' ||
        currentRoute?.name === 'RecordStack'
      ) {
        navigationRef?.navigate('ExperimentStack', {
          screen: 'Experiment',
        });

        // Show offline notification
        Toast.info({
          message:
            'You are now offline. Only Experiment features are available.',
        });
      }
    }
  }, [isConnected]);

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
          // Respect Android software navigation bar (gesture/3-button)
          Platform.OS === 'android'
            ? {
                paddingBottom:
                  styles.androidTabBar.paddingBottom + insets.bottom,
                height: styles.androidTabBar.height + insets.bottom,
              }
            : null,
          // Add visual indicator when offline
          isConnected === false && styles.offlineTabBar,
        ],
        tabBarIcon: ({focused}) => {
          let icon;
          const iconColor = focused
            ? COLORS.COMPONENTS.TAB.ACTIVE_COLOR
            : COLORS.COMPONENTS.TAB.INACTIVE_COLOR;

          // Dim icon color when offline for restricted tabs
          const isTabDisabledOffline =
            isConnected === false &&
            (route.name === 'HomeStack' || route.name === 'RecordStack');
          const finalIconColor = isTabDisabledOffline
            ? COLORS.COMPONENTS.TAB.INACTIVE_COLOR + '50'
            : iconColor; // Add opacity

          if (route.name === 'HomeStack') {
            icon = <HomeIcon color={finalIconColor} focused={focused} />;
          } else if (route.name === 'ExperimentStack') {
            icon = <ExperimentIcon color={iconColor} focused={focused} />;
          } else if (route.name === 'RecordStack') {
            icon = <RecordIcon color={finalIconColor} focused={focused} />;
          } else if (route.name === 'NotificationStack') {
            icon = <NotificationIcon color={iconColor} focused={focused} />;
          }
          return icon;
        },
        headerShown: false,
        tabBarActiveTintColor: COLORS.COMPONENTS.TAB.ACTIVE_TEXT_COLOR,
        tabBarInactiveTintColor: COLORS.COMPONENTS.TAB.INACTIVE_TEXT_COLOR,
        tabBarLabelStyle: {fontFamily: FONTS.SEMI_BOLD, fontSize: 16},
      })}>
      {/* HomeStack - Only show when online and user is not Fieldman */}
      {isConnected !== false &&
      role[0]?.role_name &&
      role[0]?.role_name !== 'Fieldman' ? (
        <Tab.Screen
          name="HomeStack"
          component={HomeStackScreens}
          options={{title: t(LOCALES.BOTTOM_TAB.LBL_HOME)}}
        />
      ) : null}

      {/* ExperimentStack - Always available (works offline) */}
      <Tab.Screen
        name="ExperimentStack"
        component={ExperimentStackScreens}
        options={{title: t(LOCALES.BOTTOM_TAB.LBL_EXPERIMENT)}}
      />

      {/* RecordStack - Only show when online */}
      {isConnected !== false ? (
        <Tab.Screen
          name="RecordStack"
          component={RecordStackScreens}
          options={{title: t(LOCALES.BOTTOM_TAB.LBL_RECORD)}}
        />
      ) : null}

      {/* NotificationStack - Only show when online (currently commented out) */}
      {/* {isConnected !== false ? (
        <Tab.Screen
          name="NotificationStack"
          component={NotificationStackScreens}
          options={{title: t(LOCALES.BOTTOM_TAB.LBL_NOTIFICATION)}}
        />
      ) : null} */}
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
      <ExperimentStack.Screen
        name="Plots"
        component={Plots}
        options={{headerShown: false}}
      />
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

// const RecordStackScreens = () => (
//   <RecordStack.Navigator
//     initialRouteName="NewRecord" // ← set this to NewRecord
//     screenOptions={{
//       animation: 'slide_from_right',
//       headerShadowVisible: false,
//     }}>
//     {/* Declare NewRecord first (or use initialRouteName) */}
//     <RecordStack.Screen
//       name="NewRecord"
//       component={NewRecord}
//       options={{headerShown: false}}
//     />

//     {/* Your other Record-stack screens */}
//     <RecordStack.Screen
//       name="Record"
//       component={Record}
//       options={{headerShown: false}}
//     />
//     <RecordStack.Screen name="Plots" component={Plots} />
//     <RecordStack.Screen name="AddImage" component={AddImage} />
//     <RecordStack.Screen name="QRScanner" component={QRScanner} />
//   </RecordStack.Navigator>
// );

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
  // Base Android values to be augmented with safe area inset at runtime
  androidTabBar: {
    height: 80,
    paddingBottom: 14,
  },
  offlineTabBar: {
    opacity: 0.7,
    borderTopColor: '#FF6B35', // Orange color to indicate offline
    borderTopWidth: 2,
  },
});
