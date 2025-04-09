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
import {getCoordinates} from '../../../utilities/function';
import Toast from '../../../utilities/toast';
import {styles} from './styles';

const AddImage = ({navigation, route}: AddImageScreenProps) => {
  const {t} = useTranslation();
  const [loader, setLoader] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const {imageUrl, screen, data} = route?.params;
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
          (width: number, height: number) => resolve({width, height}),
          (error: any) => reject(error),
        );
      });

      const {width, height} = originalSize;
      const newImage: {uri: string} = await ImageResizer.createResizedImage(
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

  const [generatePreSignedUrl, preSignedUrlData] = useApi({
    url: URL.GENERATE_PRE_SIGNED,
    method: 'GET',
  });

  const [uploadImage, uploadImageData] = useApi({
    url: URL.GENERATE_PRE_SIGNED,
    method: 'POST',
  });

  const onDone = async () => {
    console.log('----------', {data, imageUrl});
    setLoader(true); // Show loader immediately

    try {
      let {plotId} = data;
      let JPEGImageUri = await convertToJPEG(imageUrl);
      setImageURI(JPEGImageUri);

      generatePreSignedUrl({
        queryParams: `plot_id=${plotId}&image_name=${JPEGImageUri.split('/')
          .pop()
          .toLowerCase()}`,
      });

      const {latitude, longitude} = await getCoordinates();
      setLocation({lat: latitude, long: longitude});
    } catch (error) {
      console.log('error', error);
      Toast.error({message: 'Failed to upload image', duration: 3000});
      setLoader(false); // hide loader on error
    }
  };

  useEffect(() => {
    if (preSignedUrlData) {
      console.log({preSignedUrlData});
      const {s3_path, status_code} = preSignedUrlData;

      if (status_code !== 200) {
        Toast.error({message: 'Failed to upload image', duration: 3000});
        setLoader(false);
        return;
      }

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

          axios
            .put(preSignedUrlData.data.presigned_url, binaryData, {
              headers: {
                'Content-Type': 'image/jpeg',
              },
            })
            .then(res => {
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
              console.log('s3 error', err);
              Toast.error({
                message: 'Failed to upload image',
                duration: 3000,
              });
              setLoader(false); // hide loader on error
            });
        });
    }
  }, [preSignedUrlData]);

  useEffect(() => {
    if (uploadImageData) {
      console.log({uploadImageData});
      setLoader(false); // ✅ hide loader only after full upload finishes

      if (uploadImageData.status_code !== 200) {
        Toast.error({message: 'Failed to upload image', duration: 3000});
      } else {
        Toast.success({message: 'Image uploaded successfully', duration: 3000});
      }

      if (screen === 'NewRecord') {
        navigation.navigate('NewRecord', {
          imageUrl,
          uploadedOn: new Date().toISOString(),
        });
      } else if (screen === 'Plots') {
        navigation.navigate('Plots', {
          imageUrl,
          uploadedOn: new Date().toISOString(),
          ...data,
        });
      }
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
