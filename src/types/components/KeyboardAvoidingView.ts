import {ReactNode} from 'react';
import {KeyboardAvoidingViewProps, StyleProp, ViewStyle} from 'react-native';

export type KeyboardAvoidingViewTypes = {
  children: ReactNode;
  parentStyle?: StyleProp<ViewStyle>;
} & KeyboardAvoidingViewProps;
