import {StyleProp, TextStyle, ViewStyle} from 'react-native';

export type PickerType = {
  containerStyle?: StyleProp<ViewStyle>;
  parentStyle?: StyleProp<ViewStyle>;
  customLabelStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  onRightIconClick?: () => void;
  value?: string | null;
  placeholder?: string;
};
