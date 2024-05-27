import {ReactNode} from 'react';
import {ModalProps, StyleProp, ViewStyle} from 'react-native/types';

export type ModalTypes = {
  children: ReactNode;
  isModalVisible: boolean;
  closeModal?: () => void;
  parentStyle?: StyleProp<ViewStyle>;
} & ModalProps;
