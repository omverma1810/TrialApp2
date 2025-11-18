import React, {useState} from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {UploadCam} from '../../../../assets/icons/svgs';
import {Loader} from '../../../../components';

const {width} = Dimensions.get('window');
const NUM_COLUMNS = 3;
const SPACING = 16;
const THUMB_SIZE =
  (width - SPACING * 2 - (NUM_COLUMNS - 1) * SPACING) / NUM_COLUMNS;

type ImageDisplayNewProps = {
  images: {url: string}[];
  maxNoOfImages?: number;
  onUploadPress: () => void;
  onThumbnailPress: (index: number) => void;
};

const ImageDisplayNew: React.FC<ImageDisplayNewProps> = ({
  images,
  maxNoOfImages = 5,
  onUploadPress,
  onThumbnailPress,
}) => {
  const [loadingStates, setLoadingStates] = useState(
    Array(images.length).fill(true),
  );

  const handleLoad = (index: number) => {
    setLoadingStates(prev => {
      const updated = [...prev];
      updated[index] = false;
      return updated;
    });
  };

  const safeMax = maxNoOfImages ?? 5;
  const canUpload = images.length < safeMax;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Upload Image ({images.length}/{safeMax})
      </Text>
      <View style={styles.grid}>
        {images.map((img, idx) => (
          <Pressable
            key={idx}
            onPress={() => onThumbnailPress(idx)}
            style={styles.thumbWrapper}>
            {loadingStates[idx] && (
              <View style={styles.loaderOverlay}>
                <Loader />
              </View>
            )}
            <Image
              source={{uri: img.url}}
              style={styles.thumbnail}
              onLoadEnd={() => handleLoad(idx)}
            />
          </Pressable>
        ))}

        {canUpload && (
          <Pressable style={styles.uploadCard} onPress={onUploadPress}>
            <UploadCam />
            <Text style={styles.uploadText}>Upload</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING,
    marginVertical: SPACING,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING / 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  thumbWrapper: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    marginRight: SPACING,
    marginBottom: SPACING,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  uploadCard: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    marginRight: SPACING,
    marginBottom: SPACING,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    marginTop: 6,
    fontSize: 14,
    color: '#666',
  },
});

export default ImageDisplayNew;
