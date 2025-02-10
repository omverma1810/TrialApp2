import {ReactNode} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {SafeAreaViewProps} from 'react-native-safe-area-context';

export type SafeAreaViewTypes = {
  children: ReactNode;
  parentStyle?: StyleProp<ViewStyle>;
} & SafeAreaViewProps;
