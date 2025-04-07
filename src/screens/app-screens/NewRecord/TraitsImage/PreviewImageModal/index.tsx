import React, {useEffect} from 'react';
import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';

import {format} from 'date-fns';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Share from 'react-native-share';
import {Close} from '../../../../../assets/icons/svgs';
import {Modal} from '../../../../../components';

type ModalTypes = {
  isModalVisible: boolean;
  closeModal: () => void;
  selectedImage: any;
  metadata: any;
};

const PreviewImageModal = ({
  isModalVisible,
  selectedImage,
  metadata,
  closeModal = () => {},
}: ModalTypes) => {
  const {top} = useSafeAreaInsets();

  console.log({selectedImage, metadata});

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

      if (selectedImage?.imagePath.startsWith('file://')) {
        const sourcePath = selectedImage?.imagePath.replace('file://', '');
        await RNFS.copyFile(sourcePath, filePath);
        Alert.alert('Download Complete', `Image saved to ${filePath}`);
      } else {
        const result = await RNFS.downloadFile({
          fromUrl: selectedImage?.url,
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
        url: selectedImage.url,
        title: 'Share Image',
        message: 'Check out this image!',
      });
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };
  useEffect(() => {
    console.log({selectedImage});
  }, [selectedImage]);
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
        <Image source={{uri: selectedImage.url}} style={styles.image} />
        <View style={styles.metadata}>
          {selectedImage?.uploadedOn && (
            <Text style={{color: '#FFF', fontWeight: 'bold'}}>
              Uploaded On:{' '}
              {format(
                new Date(selectedImage?.uploadedOn),
                'dd MMM yyyy, hh:mm a',
              )}{' '}
            </Text>
          )}
          <Text style={{color: '#FFF', fontWeight: 'bold'}}>
            Location: {metadata?.field}
          </Text>
        </View>
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
  metadata: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    marginBottom: 30,
    marginLeft: 10,
    // backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    width: '80%',
    // borderRadius: 10,
    // borderWidth: 2,
    // borderColor: '#aaa',
    gap: 6,
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
