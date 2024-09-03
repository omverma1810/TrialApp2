import {
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import React from 'react';

import {Modal} from '../../../../../components';
import {Close} from '../../../../../assets/icons/svgs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type ModalTypes = {
  isModalVisible: boolean;
  closeModal: () => void;
  selectedImageUrl: string;
};

const PreviewImageModal = ({
  isModalVisible,
  selectedImageUrl,
  closeModal = () => {},
}: ModalTypes) => {
  const {top} = useSafeAreaInsets();
  return (
    <Modal isModalVisible={isModalVisible}>
      <View style={styles.container}>
        <Pressable
          style={[
            styles.close,
            {top: Platform.OS === 'android' ? StatusBar.currentHeight : top},
          ]}
          onPress={closeModal}>
          <Close />
        </Pressable>
        <Image source={{uri: selectedImageUrl}} style={styles.image} />
      </View>
    </Modal>
  );
};

export default PreviewImageModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    flex: 1,
    resizeMode: 'contain',
  },
  close: {
    position: 'absolute',
    right: 10,
    zIndex: 1,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
