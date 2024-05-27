import {StyleProp, TextStyle, ViewStyle} from 'react-native';

export type ChipTypes = {
  leftIcon?: any;
  rightIcon?: any;
  customLeftIconStyle?: StyleProp<ViewStyle>;
  customRightIconStyle?: StyleProp<ViewStyle>;
  onLeftIconClick?: () => void;
  onRightIconClick?: () => void;
  parentStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  customLabelStyle?: StyleProp<TextStyle>;
  title: string;
  onPress?: () => void;
  isSelected?: boolean;
};
