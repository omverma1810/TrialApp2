import {Pressable, StyleSheet} from 'react-native';
import React, {useEffect} from 'react';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {StatusBar, SafeAreaView} from '../../../components';
import {Back} from '../../../assets/icons/svgs';
import {QRScannerScreenProps} from '../../../types/navigation/appTypes';
import Toast from '../../../utilities/toast';
import {URL} from '../../../constants/URLS';
import {useApi} from '../../../hooks/useApi';

const QRScanner = ({navigation}: QRScannerScreenProps) => {
  const device = useCameraDevice('back');
  const {top} = useSafeAreaInsets();
  const {hasPermission, requestPermission} = useCameraPermission();
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, []);
  const [decodeQr, decodeQrResponse] = useApi({
    url: URL.DECODE_QR,
    method: 'POST',
  });

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes[0].value) {
        try {
          const data: any = codes[0].value;
          const payload = {
            plotCode: data,
          };
          const headers = {
            'Content-Type': 'application/json',
          };
          console.log(payload);
          decodeQr({payload: payload, headers});
        } catch (error) {
          Toast.error({message: 'Invalid QR Code!'});
        }
      }
    },
  });
  useEffect(() => {
    if (decodeQrResponse) {
      const data = decodeQrResponse;
      if (data?.fieldExperimentId && data?.landVillageId && data?.plotId) {
        navigation.replace('NewRecord', {
          QRData: {
            crop: data.crop,
            project: data.project,
            experiment_id: data.fieldExperimentId,
            field_id: data.landVillageId,
            plot_id: data.plotId,
          },
        });
      } else {
        throw new Error('Invalid hai bhai!');
      }
    }
  }, [decodeQrResponse]);

  return (
    <SafeAreaView edges={['top']}>
      <StatusBar />
      <Pressable
        style={[styles.backIconContainer, {top}]}
        onPress={navigation.goBack}>
        <Back />
      </Pressable>
      {hasPermission && device && (
        <Camera
          style={styles.camera}
          device={device}
          isActive={true}
          codeScanner={codeScanner}
        />
      )}
    </SafeAreaView>
  );
};

export default QRScanner;

const styles = StyleSheet.create({
  backIconContainer: {
    padding: 12,
    position: 'absolute',
    zIndex: 999,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
});
