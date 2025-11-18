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
  ChangePassword: undefined;
};

export type ExperimentStackParamList = {
  Experiment:
    | undefined
    | {
        prefilledExperiment?: {
          experimentId: string;
          experimentName?: string;
          fieldExperimentName?: string;
          cropName?: string;
          season?: string;
          year?: string;
          experimentType?: string;
          projectKey?: string;
        };
      };
  ExperimentDetails: {
    id: string;
    type: string;
    data: experimentData;
    fromNewRecord?: boolean;
  };
  Plots: {
    id: string;
    type: string;
    data: experimentData;
    imageUrl?: string;
    plotId?: string;
    experimentID?: string;
    locationID?: string;
    fromNewRecord?: boolean; // ✅ Add flag to indicate navigation from NewRecord flow
  };
  NewRecord:
    | undefined
    | {imageUrl: string}
    | {
        QRData: {
          crop: string;
          project: string;
          experiment_id: number;
          field_id: number;
          plot_id: number;
        };
      };
  AddImage: {
    imageUrl: string;
    screen: 'NewRecord' | 'Plots';
    data?: any;
  };
  QRScanner: undefined;
  Profile: undefined;
  ChangePassword: undefined; // Already defined here as well
};

export type RecordStackParamList = {
  Record: undefined;
};

export type NotificationStackParamList = {
  Notification: undefined;
};

type experimentData = {
  projectId: string;
  designType: string;
  season: string;
  year?: string;
  cropName?: string;
  experimentName?: string;
  fieldExperimentName?: string;
  projectKey?: string;
  experimentId?: number | string;
  experimentType?: string;
};

// Define props for each screen
export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Home'>,
  NativeStackScreenProps<AppStackParamList>
>;

export type ExperimentScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ExperimentStackParamList, 'Experiment'>,
  NativeStackScreenProps<AppStackParamList>
>;

export type ExperimentDetailsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ExperimentStackParamList, 'ExperimentDetails'>,
  NativeStackScreenProps<AppStackParamList>
>;

export type PlotsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ExperimentStackParamList, 'Plots'>,
  NativeStackScreenProps<AppStackParamList>
>;

export type NewRecordScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ExperimentStackParamList, 'NewRecord'>,
  NativeStackScreenProps<AppStackParamList>
>;

export type AddImageScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ExperimentStackParamList, 'AddImage'>,
  NativeStackScreenProps<AppStackParamList>
>;

export type QRScannerScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ExperimentStackParamList, 'QRScanner'>,
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

export type ChangePasswordScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'ChangePassword'>,
  NativeStackScreenProps<AppStackParamList>
>;
