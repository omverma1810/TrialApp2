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

const QRScanner = ({navigation}: QRScannerScreenProps) => {
  const device = useCameraDevice('back');
  const {top} = useSafeAreaInsets();
  const {hasPermission, requestPermission} = useCameraPermission();
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes[0].value) {
        try {
          const data: any = JSON.parse(codes[0].value.trim());
          if (data?.experiment_id && data?.field_id && data?.plot_id) {
            navigation.replace('NewRecord', {
              QRData: {
                crop: data?.crop,
                project: data?.project,
                experiment_id: data?.experiment_id,
                field_id: data?.field_id,
                plot_id: data?.plot_id,
              },
            });
          } else {
            throw new Error('Invalid QR Code!');
          }
        } catch (error) {
          Toast.error({message: 'Invalid QR Code!'});
        }
      }
    },
  });

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
