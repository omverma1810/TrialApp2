import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, Image, Pressable, Text, View} from 'react-native';

import axios from 'axios';
import {Buffer} from 'buffer';
import rnfs from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import {Back, Check, X} from '../../../assets/icons/svgs';
import {SafeAreaView, StatusBar} from '../../../components';
import {URL} from '../../../constants/URLS';
import {useApi} from '../../../hooks/useApi';
import {LOCALES} from '../../../localization/constants';
import {AddImageScreenProps} from '../../../types/navigation/appTypes';
import {getCoordinates} from '../../../utilities/function';
import Toast from '../../../utilities/toast';
import {styles} from './styles';

const AddImage = ({navigation, route}: AddImageScreenProps) => {
  const {t} = useTranslation();
  const [loader, setLoader] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const {imageUrl, screen, data} = route?.params;
  const [imageURI, setImageURI] = useState(imageUrl);

  async function convertToJPEG(uri) {
    try {
      const originalSize = await new Promise((resolve, reject) => {
        Image.getSize(
          uri,
          (width, height) => resolve({width, height}),
          error => reject(error),
        );
      });

      const {width, height} = originalSize;
      const newImage = await ImageResizer.createResizedImage(
        uri,
        width,
        height,
        'JPEG',
        100,
        0,
      );
      console.log('JPEG Image URI:', newImage.uri);

      return newImage.uri;
    } catch (err) {
      console.error(err);
      return '';
    }
  }

  const [generatePreSignedUrl, preSignedUrlData, preSignedUrlLoader] = useApi({
    url: URL.GENERATE_PRE_SIGNED,
    method: 'GET',
  });

  const [uploadImage, uploadImageData] = useApi({
    url: URL.GENERATE_PRE_SIGNED,
    method: 'POST',
  });

  const onDone = async () => {
    console.log('----------', {data, imageUrl});
    try {
      let {plotId} = data;
      let JPEGImageUri = await convertToJPEG(imageUrl);
      // JPEGImageUri = imageUrl;

      setImageURI(JPEGImageUri);
      generatePreSignedUrl({
        queryParams: `plot_id=${plotId}&image_name=${JPEGImageUri.split('/')
          .pop()
          .toLowerCase()}`,
      });
      const {latitude, longitude} = await getCoordinates();
      setLocation({lat: latitude, long: longitude});
      setLoader(true);
    } catch (error) {
      console.log('error', error);
      Toast.error({message: 'Failed to upload image', duration: 3000});
    }
  };

  useEffect(() => {
    if (preSignedUrlData) {
      const {s3_path, status_code} = preSignedUrlData;
      setLoader(false);
      if (status_code !== 200) {
        Toast.error({message: 'Failed to upload image', duration: 3000});
      }
      console.log('////', {s3_path, imageURI});

      const fileType = imageURI.split('/').pop()?.split('.').pop();
      rnfs
        .readFile(
          imageURI.startsWith('file://')
            ? imageURI.replace('file://', '')
            : imageURI,
          'base64',
        )
        .then(binary => {
          const binaryData = Buffer.from(binary, 'base64');
          const blob = new Blob([binaryData], {type: `image/${fileType}`});

          console.log({blob: blob.text, data: blob.arrayBuffer});
          axios
            .put(preSignedUrlData.data.presigned_url, binaryData, {
              headers: {
                'Content-Type': 'image/jpeg',
                // 'Content-Encoding': 'binary',
              },
            })
            .then(res => {
              // console.log('s3 response', res);
              uploadImage({
                // console.log({
                payload: {
                  s3_path,
                  plotId: data.plotId,
                  experimentType: data.experiment.experimentType,
                  ...location,
                },
              });
            })
            .catch(err => {
              console.log('s3 error', err);
              Toast.error({
                message: 'Failed to upload image',
                duration: 3000,
              });
            });
        });
    }
  }, [preSignedUrlData]);

  useEffect(() => {
    if (uploadImageData) {
      console.log({uploadImageData});
      if (uploadImageData.status_code !== 200) {
        Toast.error({message: 'Failed to upload image', duration: 3000});
      } else {
        Toast.success({message: 'Image uploaded successfully', duration: 3000});
      }
      if (screen === 'NewRecord') {
        navigation.navigate('NewRecord', {imageUrl});
      } else if (screen === 'Plots') {
        navigation.navigate('Plots', {imageUrl, ...data});
      }
    }
  }, [uploadImageData]);
  return (
    <SafeAreaView edges={['top']}>
      <StatusBar />
      <Pressable
        onPress={navigation.goBack}
        style={[styles.header, styles.row]}>
        <Back />
        <Text style={styles.headerTitle}>
          {t(LOCALES.EXPERIMENT.LBL_ADD_IMAGE)}
        </Text>
      </Pressable>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={{uri: imageUrl}} />
          {loader && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={navigation.goBack}>
            <X />
          </Pressable>
          <Pressable style={styles.button} onPress={onDone}>
            <Check />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddImage;
