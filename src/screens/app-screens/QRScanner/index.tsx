import {Pressable, StyleSheet} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
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
  const processingRef = useRef(false);
  const [currentQrCode, setCurrentQrCode] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ask for camera permission on mount
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // hook up your decode-QR API call
  const [decodeQr, decodeQrResponse, loading] = useApi({
    url: URL.DECODE_QR,
    method: 'POST',
  });

  // configure VisionCamera code scanner
  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      const raw = codes[0]?.value;
      if (!raw) return;

      // Skip if we're already loading or processing a QR code
      if (loading || processingRef.current) return;

      // Skip if it's the same QR code as previously scanned
      if (currentQrCode === raw) return;

      processingRef.current = true;
      setCurrentQrCode(raw);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a timeout to reset processing state if API doesn't respond
      timeoutRef.current = setTimeout(() => {
        processingRef.current = false;
        setCurrentQrCode(null);
      }, 10000); // 10 seconds timeout

      try {
        decodeQr({
          payload: {plotCode: raw},
          headers: {'Content-Type': 'application/json'},
        });
      } catch {
        Toast.error({message: 'Invalid QR Code!'});
        processingRef.current = false;
        setCurrentQrCode(null);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    },
  });

  // when API returns, deep-link into the Plots screen using trialLocationId
  useEffect(() => {
    if (!decodeQrResponse || !currentQrCode) return;

    // Clear timeout since we got a response
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // include trialLocationId in the type
    const data = decodeQrResponse as {
      trialLocationId?: number;
      plotId?: number;
      experimentType?: string;
      project?: string;
      crop?: string;
    };

    if (data.trialLocationId && data.plotId) {
      navigation.replace('Plots', {
        // use trialLocationId instead of fieldExperimentId
        id: String(data.trialLocationId),
        type: data.experimentType ?? '',
        data: {
          projectId: data.project ?? '',
          designType: '',
          season: '',
        },
        plotId: String(data.plotId),
        fromNewRecord: true, // ✅ Add flag to indicate this is from NewRecord flow
      });
      // Reset processing flag and current QR code after navigation
      processingRef.current = false;
      setCurrentQrCode(null);
    } else {
      Toast.error({message: 'Failed to decode QR payload.'});
      processingRef.current = false;
      setCurrentQrCode(null);
    }
  }, [decodeQrResponse, navigation, currentQrCode]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <SafeAreaView edges={['top']}>
      <StatusBar />
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
