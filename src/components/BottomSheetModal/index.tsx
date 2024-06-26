import {
  BackHandler,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  BottomSheetModal,
  BottomSheetView,
  SCREEN_HEIGHT,
} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import useTheme from '../../theme/hooks/useTheme';
import {BottomSheetModalTypes} from '../../types/components/BottomSheetModal';

const BottomSheetModalView = ({
  bottomSheetModalRef,
  children,
  type = 'SCREEN_HEIGHT',
  containerStyle = {},
}: BottomSheetModalTypes) => {
  const {COLORS} = useTheme();
  const {top, bottom} = useSafeAreaInsets();
  const HEADER_HEIGHT = 0;
  const statusBarHeight = StatusBar.currentHeight || 0;
  const screenHeightSnapPoints = useMemo(
    () =>
      type === 'SCREEN_HEIGHT'
        ? [
            SCREEN_HEIGHT / 2,
            SCREEN_HEIGHT - HEADER_HEIGHT - top - statusBarHeight,
          ]
        : [],
    [type],
  );
  const [isBottomSheetModalOpen, setIsBottomSheetModalOpen] = useState(false);

  const closeModal = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  const renderBackdrop = useCallback(
    () => (
      <Pressable
        onPress={closeModal}
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor:
              COLORS.COMPONENTS.BOTTOMSHEET_MODAL.BACK_DROP_COLOR,
          },
        ]}></Pressable>
    ),
    [],
  );

  const handleComponent = useCallback(() => {
    return (
      <View style={styles.handleContainer}>
        <View
          style={[
            styles.handle,
            {backgroundColor: COLORS.COMPONENTS.BOTTOMSHEET_MODAL.HANDLE_COLOR},
          ]}
        />
      </View>
    );
  }, []);

  const backAction = useCallback(() => {
    if (isBottomSheetModalOpen) {
      closeModal();
      return true;
    }
  }, [isBottomSheetModalOpen]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [isBottomSheetModalOpen]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      enableDynamicSizing={type === 'CONTENT_HEIGHT'}
      backgroundStyle={{
        backgroundColor: COLORS.COMPONENTS.BOTTOMSHEET_MODAL.BACKGROUND_COLOR,
        borderRadius: 28,
      }}
      snapPoints={screenHeightSnapPoints}
      handleComponent={handleComponent}
      backdropComponent={renderBackdrop}
      onChange={(index: number) => setIsBottomSheetModalOpen(!(index < 0))}>
      <BottomSheetView
        style={[
          styles.container,
          {paddingBottom: bottom},
          type === 'CONTENT_HEIGHT' && {flex: 0},
          containerStyle,
        ]}>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default BottomSheetModalView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  handle: {
    height: 4,
    width: 32,
    borderRadius: 100,
    alignSelf: 'center',
    marginVertical: 16,
  },
  handleContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
});
