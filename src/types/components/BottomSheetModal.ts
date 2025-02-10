import {ReactNode} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {BottomSheetModalMethods} from '@gorhom/bottom-sheet/lib/typescript/types';

export type BottomSheetModalTypes = {
  bottomSheetModalRef: React.RefObject<BottomSheetModalMethods>;
  children: ReactNode;
  type?: 'SCREEN_HEIGHT' | 'CONTENT_HEIGHT';
  containerStyle?: StyleProp<ViewStyle>;
};
