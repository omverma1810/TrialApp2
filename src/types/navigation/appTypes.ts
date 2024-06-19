import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

export type AppStackParamList = {
  TabBar: NavigatorScreenParams<TabBarStackParamList>;
};

export type TabBarStackParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  ExperimentStack: NavigatorScreenParams<ExperimentStackParamList>;
  RecordStack: NavigatorScreenParams<RecordStackParamList>;
  NotificationStack: NavigatorScreenParams<NotificationStackParamList>;
};

export type HomeStackParamList = {
  Home: undefined;
  TakeNotes: undefined;
  PlanVisit: undefined;
  Profile: undefined;
  ExperimentStackScreens: undefined;
};
export type ExperimentStackParamList = {
  Experiment: undefined;
  ExpScreen1:undefined;
};
export type RecordStackParamList = {
  Record: undefined;
};
export type NotificationStackParamList = {
  Notification: undefined;
};

export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Home'>,
  NativeStackScreenProps<AppStackParamList>
>;

export type ExperimentScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ExperimentStackParamList, 'Experiment'>,
  NativeStackScreenProps<AppStackParamList>
>;

export type RecordScreenProps = CompositeScreenProps<
  NativeStackScreenProps<RecordStackParamList, 'Record'>,
  NativeStackScreenProps<AppStackParamList>
>;

export type NotificationScreenProps = CompositeScreenProps<
  NativeStackScreenProps<NotificationStackParamList, 'Notification'>,
  NativeStackScreenProps<AppStackParamList>
>;
