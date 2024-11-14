import {
  StyleProp,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native/types';

export type OutlinedInputTypes = {
  parentStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  textInputStyle?: StyleProp<TextStyle>;
  leftIcon?: any;
  rightIcon?: any;
  onLeftIconClick?: () => void;
  onRightIconClick?: () => void;
  customLeftIconStyle?: StyleProp<ViewStyle>;
  customRightIconStyle?: StyleProp<ViewStyle>;
  multiline?: boolean;
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  labelContainerStyle?: StyleProp<ViewStyle>;
  placeholder?: string;
  note?: string;
} & TextInputProps;
