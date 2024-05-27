import {StyleSheet, View, Modal, TouchableWithoutFeedback} from 'react-native';
import React, {useMemo} from 'react';

import useTheme from '../../theme/hooks/useTheme';
import {ModalTypes} from '../../types/components/Modal';

const ModalView = ({
  children,
  isModalVisible = false,
  closeModal = () => {},
  parentStyle = {},
  ...props
}: ModalTypes) => {
  const {COLORS} = useTheme();

  const getModalStyle = useMemo(
    () => [
      styles.parent,
      {backgroundColor: COLORS.COMPONENTS.MODAL.BACKGROUND_COLOR},
      parentStyle,
    ],
    [COLORS, parentStyle],
  );

  return (
    <Modal
      transparent={true}
      visible={isModalVisible}
      statusBarTranslucent={true}
      onDismiss={closeModal}
      animationType="none"
      onRequestClose={closeModal}
      {...props}>
      <TouchableWithoutFeedback onPress={closeModal}>
        <View style={getModalStyle}>{children}</View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ModalView;

const styles = StyleSheet.create({
  parent: {
    flex: 1,
  },
});
