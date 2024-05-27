import {BackHandler, Pressable, StyleSheet, View} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  BottomSheetModal,
  BottomSheetView,
  SCREEN_HEIGHT,
  useBottomSheetDynamicSnapPoints,
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
  const screenHeightSnapPoints = useMemo(() => [SCREEN_HEIGHT - top], []);
  const contentHeightSnapPoints = useMemo(() => ['CONTENT_HEIGHT'], []);
  const [isBottomSheetModalOpen, setIsBottomSheetModalOpen] = useState(false);
  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(contentHeightSnapPoints);

  const closeModal = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  const renderBackdrop = useCallback(
    () => (
      <Pressable
        onPress={closeModal}
        style={StyleSheet.absoluteFill}></Pressable>
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

  if (type === 'CONTENT_HEIGHT')
    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        backgroundStyle={{
          backgroundColor: COLORS.COMPONENTS.BOTTOMSHEET_MODAL.BACKGROUND_COLOR,
        }}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        handleComponent={handleComponent}
        backdropComponent={renderBackdrop}
        onChange={(index: number) => setIsBottomSheetModalOpen(!(index < 0))}>
        <BottomSheetView
          onLayout={handleContentLayout}
          style={[styles.container, {paddingBottom: bottom}, containerStyle]}>
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  else
    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        backgroundStyle={{
          backgroundColor: COLORS.COMPONENTS.BOTTOMSHEET_MODAL.BACKGROUND_COLOR,
        }}
        snapPoints={screenHeightSnapPoints}
        handleComponent={handleComponent}
        backdropComponent={renderBackdrop}
        onChange={(index: number) => setIsBottomSheetModalOpen(!(index < 0))}>
        <BottomSheetView
          style={[styles.container, {paddingBottom: bottom}, containerStyle]}>
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
    height: 3,
    width: 60,
    borderRadius: 50,
    alignSelf: 'center',
    marginVertical: 15,
  },
  handleContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});
