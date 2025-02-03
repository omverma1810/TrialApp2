import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  Text,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import {PermissionsAndroid} from 'react-native';
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

  const downloadImage = async () => {
    try {
      let hasPermission = true;

      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          hasPermission =
            (await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            )) === PermissionsAndroid.RESULTS.GRANTED;
        } else if (Platform.Version >= 29) {
          hasPermission = true;
        } else {
          hasPermission =
            (await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            )) === PermissionsAndroid.RESULTS.GRANTED;
        }

        if (!hasPermission) {
          Alert.alert('Permission Denied', 'Cannot save the image.');
          return;
        }
      }

      const downloadDir =
        Platform.OS === 'android' && Platform.Version >= 29
          ? RNFS.DownloadDirectoryPath
          : RNFS.PicturesDirectoryPath;

      const fileName = `image_${Date.now()}.jpg`;
      const filePath = `${downloadDir}/${fileName}`;

      if (selectedImageUrl.startsWith('file://')) {
        const sourcePath = selectedImageUrl.replace('file://', '');
        await RNFS.copyFile(sourcePath, filePath);
        Alert.alert('Download Complete', `Image saved to ${filePath}`);
      } else {
        const result = await RNFS.downloadFile({
          fromUrl: selectedImageUrl,
          toFile: filePath,
        }).promise;

        if (result.statusCode === 200) {
          Alert.alert('Download Complete', `Image saved to ${filePath}`);
        } else {
          Alert.alert('Download Failed', 'Please try again.');
        }
      }
    } catch (error) {
      console.error('Download Error:', error);
      Alert.alert('Error', 'Unable to download image. Try again later.');
    }
  };

  const shareImage = async () => {
    try {
      await Share.open({
        url: selectedImageUrl,
        title: 'Share Image',
        message: 'Check out this image!',
      });
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };

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
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={downloadImage}>
            <Text style={styles.buttonText}>Download</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={shareImage}>
            <Text style={styles.buttonText}>Share</Text>
          </Pressable>
        </View>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#007BFF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
