import {ReactElement, ReactNode} from 'react';
import {
  ActivityIndicatorProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';

export type ButtonTypes = {
  title: string;
  onPress?: () => void;
  customLabelStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode | ReactElement;
  containerStyle?: StyleProp<ViewStyle>;
  loaderProps?: ActivityIndicatorProps;
};
