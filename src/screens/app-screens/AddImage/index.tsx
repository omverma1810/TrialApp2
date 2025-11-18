import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, Image, Pressable, View} from 'react-native';

import axios from 'axios';
import {Buffer} from 'buffer';
import rnfs from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import {Check, X} from '../../../assets/icons/svgs';
import {SafeAreaView, StatusBar} from '../../../components';
import {URL} from '../../../constants/URLS';
import {useApi} from '../../../hooks/useApi';
import {AddImageScreenProps} from '../../../types/navigation/appTypes';
import {validateLocationForAPI} from '../../../utilities/locationValidation';
import Toast from '../../../utilities/toast';
import {styles} from './styles';

const AddImage = ({navigation, route}: AddImageScreenProps) => {
  const {t} = useTranslation();
  const [loader, setLoader] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const {imageUrl, screen, data} = route.params;
  const [imageURI, setImageURI] = useState(imageUrl);

  interface ImageSize {
    width: number;
    height: number;
  }

  async function convertToJPEG(uri: string): Promise<string> {
    try {
      const originalSize: ImageSize = await new Promise((resolve, reject) => {
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

      return newImage.uri;
    } catch (err) {
      return '';
    }
  }

  const [generatePreSignedUrl, preSignedUrlData] = useApi({
    url: URL.GENERATE_PRE_SIGNED,
    method: 'GET',
  });

  const [uploadImage, uploadImageData] = useApi({
    url: URL.GENERATE_PRE_SIGNED,
    method: 'POST',
  });

  const onDone = async () => {
    setLoader(true); // lock buttons immediately

    try {
      const locationData = await validateLocationForAPI(true, true);
      if (!locationData) {
        setLoader(false);
        return;
      }

      const {plotId} = data;

      const JPEGImageUri = await convertToJPEG(imageUrl);
      if (!JPEGImageUri) {
        throw new Error('Failed to process image');
      }

      setImageURI(JPEGImageUri);
      setLocation({lat: locationData.latitude, long: locationData.longitude});

      generatePreSignedUrl({
        queryParams: `plot_id=${plotId}&image_name=${JPEGImageUri.split('/')
          .pop()
          ?.toLowerCase()}`,
      });
    } catch (error) {
      Toast.error({message: 'Failed to upload image', duration: 3000});
      setLoader(false);
    }
  };

  useEffect(() => {
    if (preSignedUrlData) {
      const {s3_path, status_code} = preSignedUrlData;

      if (status_code !== 200) {
        Toast.error({message: 'Failed to upload image', duration: 3000});
        setLoader(false);
        return;
      }

      rnfs
        .readFile(
          imageURI.startsWith('file://')
            ? imageURI.replace('file://', '')
            : imageURI,
          'base64',
        )
        .then(binary => {
          const binaryData = Buffer.from(binary, 'base64');
          axios
            .put(preSignedUrlData.data.presigned_url, binaryData, {
              headers: {'Content-Type': 'image/jpeg'},
            })
            .then(() => {
              uploadImage({
                payload: {
                  s3_path,
                  plotId: data.plotId,
                  experimentType:
                    (data?.experiment && data.experiment.experimentType) ||
                    data?.type,
                  ...location,
                },
              });
            })
            .catch(err => {
              Toast.error({
                message: 'Failed to upload image',
                duration: 3000,
              });
              setLoader(false);
            });
        });
    }
  }, [preSignedUrlData]);

  useEffect(() => {
    if (uploadImageData) {
      setLoader(false);

      if (uploadImageData.status_code !== 200) {
        Toast.error({message: 'Failed to upload image', duration: 3000});
      } else {
        Toast.success({
          message: 'Image uploaded successfully',
          duration: 3000,
        });
      }

      const navParams =
        screen === 'NewRecord'
          ? {imageUrl, uploadedOn: new Date().toISOString()}
          : {imageUrl, uploadedOn: new Date().toISOString(), ...data};

      navigation.navigate(
        screen === 'NewRecord' ? 'NewRecord' : 'Plots',
        navParams,
      );
    }
  }, [uploadImageData]);

  return (
    <SafeAreaView edges={['top']}>
      <StatusBar />
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
          <Pressable
            disabled={loader}
            onPress={navigation.goBack}
            style={({pressed}) => [
              styles.button,
              loader && {opacity: 0.5},
              pressed && !loader && {opacity: 0.7},
            ]}>
            <X />
          </Pressable>
          <Pressable
            disabled={loader}
            onPress={onDone}
            style={({pressed}) => [
              styles.button,
              loader && {opacity: 0.5},
              pressed && !loader && {opacity: 0.7},
            ]}>
            <Check />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddImage;
