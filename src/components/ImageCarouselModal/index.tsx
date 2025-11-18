import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  PermissionsAndroid,
  Platform,
  NativeSyntheticEvent,
  ImageLoadEventData,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import * as RNFS from 'react-native-fs';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import Share from 'react-native-share';
import {format} from 'date-fns';

import {
  Close,
  ImageArrowLeft,
  ImageArrowRight,
  DeleteBin,
} from '../../assets/icons/svgs';
import {Loader} from '../index';
import useTheme from '../../theme/hooks/useTheme';
import {useApi} from '../../hooks/useApi';
import {URL} from '../../constants/URLS';
import Toast from '../../utilities/toast';

const {width, height} = Dimensions.get('window');

interface ImageData {
  url: string;
  uploadedOn?: string;
  imagePath?: string;
  id?: string | number;
  location?: string; // Location name from API (e.g., "Sree Ram Nagar Street, Hydershakote, 500091...")
}

interface ImageCarouselModalProps {
  isVisible: boolean;
  images: ImageData[];
  initialIndex?: number;
  plotNumber?: string;
  fieldName?: string;
  plotId?: string | number;
  experimentType?: string;
  onClose: () => void;
  onImageDeleted?: (imageIndex: number) => void;
  onRefreshPlotList?: () => void; // Callback to refresh the plot list data
}

const ImageCarouselModal: React.FC<ImageCarouselModalProps> = ({
  isVisible,
  images,
  initialIndex = 0,
  plotNumber,
  fieldName,
  plotId,
  experimentType,
  onClose,
  onImageDeleted,
  onRefreshPlotList,
}) => {
  const {COLORS} = useTheme();
  const {top, bottom} = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageLoadingStates, setImageLoadingStates] = useState<boolean[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionInitiated, setDeletionInitiated] = useState(false);
  const [locationName, setLocationName] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<
    Record<number, {width: number; height: number}>
  >({});

  // Image deletion API hook
  const [
    deleteImageRecord,
    deleteImageResponse,
    isDeletingImage,
    deleteImageError,
  ] = useApi({
    url: URL.DELETE_TRAIT_RECORD, // Same endpoint as trait deletion
    method: 'POST',
  });

  const snapPoints = useMemo(() => ['90%'], []);

  const availableWidth = width - 32;
  const maxImageHeight = useMemo(() => height * 0.45, [height]);

  const computedImageHeight = useMemo(() => {
    const dimensions = imageDimensions[currentIndex];
    if (!dimensions) {
      return maxImageHeight;
    }

    const aspectRatio = dimensions.height / (dimensions.width || 1);
    const scaledHeight = availableWidth * aspectRatio;
    const clampedHeight = Math.min(maxImageHeight, scaledHeight);

    return Math.max(200, clampedHeight);
  }, [availableWidth, currentIndex, imageDimensions, maxImageHeight]);

  const currentImage = images[currentIndex];

  useEffect(() => {
    if (isVisible) {
      setCurrentIndex(initialIndex);
      setImageLoadingStates(Array(images.length).fill(true));
      setImageDimensions({});
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
      // Reset deletion states when modal is closed
      setIsDeleting(false);
      setDeletionInitiated(false);
    }
  }, [isVisible, initialIndex, images.length]);

  useEffect(() => {
    setCurrentIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
  }, [initialIndex, images.length]);

  // Set location name from API data
  useEffect(() => {
    const setLocationDisplay = () => {
      const image = images[currentIndex];

      // Reset location name when switching images
      setLocationName('');
      setIsLoadingLocation(true);

      if (image) {
        // Priority 1: Use location from API if available
        if (image.location && image.location.trim() !== '') {
          setLocationName(image.location);
        }
        // Priority 2: Fallback to fieldName if provided
        else if (fieldName) {
          setLocationName(fieldName);
        }
      }

      setIsLoadingLocation(false);
    };

    if (isVisible && images.length > 0) {
      setLocationDisplay();
    }
  }, [currentIndex, images, isVisible, fieldName]);

  const handleImageLoadSuccess = (
    index: number,
    event: NativeSyntheticEvent<ImageLoadEventData>,
  ) => {
    const {width: imageWidth, height: imageHeight} = event.nativeEvent.source;
    setImageDimensions(prev => ({
      ...prev,
      [index]: {
        width: imageWidth,
        height: imageHeight,
      },
    }));

    setImageLoadingStates(prev => {
      const updated = [...prev];
      updated[index] = false;
      return updated;
    });
  };

  const handleImageLoadError = (index: number) => {
    setImageLoadingStates(prev => {
      const updated = [...prev];
      updated[index] = false;
      return updated;
    });
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const downloadImage = async () => {
    if (!currentImage || isDownloading) return;

    setIsDownloading(true);
    try {
      let hasPermission = true;

      // Check permissions for Android
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          // For Android 13+ (API level 33+), we need READ_MEDIA_IMAGES
          hasPermission =
            (await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            )) === PermissionsAndroid.RESULTS.GRANTED;
        } else if (Platform.Version >= 29) {
          // For Android 10-12 (API level 29-32), scoped storage handles this
          hasPermission = true;
        } else {
          // For Android < 10, we need WRITE_EXTERNAL_STORAGE
          hasPermission =
            (await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            )) === PermissionsAndroid.RESULTS.GRANTED;
        }

        if (!hasPermission) {
          Alert.alert('Permission Denied', 'Cannot save the image to gallery.');
          return;
        }
      }

      const fileName = `image_${plotNumber || 'plot'}_${
        currentIndex + 1
      }_${Date.now()}.jpg`;

      if (currentImage.imagePath?.startsWith('file://')) {
        // If it's a local file, save it directly to camera roll
        const localPath = currentImage.imagePath;
        await CameraRoll.save(localPath, {type: 'photo'});
        Alert.alert('Success', 'Image saved to gallery successfully!');
      } else {
        // If it's a remote URL, download it first then save to camera roll
        const tempDir = RNFS.TemporaryDirectoryPath;
        const tempFilePath = `${tempDir}/${fileName}`;

        const result = await RNFS.downloadFile({
          fromUrl: currentImage.url,
          toFile: tempFilePath,
        }).promise;

        if (result.statusCode === 200) {
          // Save the downloaded file to camera roll
          await CameraRoll.save(`file://${tempFilePath}`, {type: 'photo'});
          // Clean up temporary file
          await RNFS.unlink(tempFilePath);
          Alert.alert('Success', 'Image saved to gallery successfully!');
        } else {
          Alert.alert('Download Failed', 'Please try again.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to save image to gallery. Try again later.');
    } finally {
      setIsDownloading(false);
    }
  };

  const shareImage = async () => {
    if (!currentImage || isSharing) return;

    setIsSharing(true);
    try {
      await Share.open({
        url: currentImage.url,
        title: 'Share Image',
        message: `Image from ${
          plotNumber ? `Plot ${plotNumber}` : 'field data'
        } - ${fieldName || 'Field Location'}`,
      });
    } catch (error) {
      if ((error as any).message !== 'User did not share') {
        Alert.alert('Error', 'Unable to share image. Try again later.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const deleteImage = async () => {
    if (!currentImage || !plotId || !experimentType || isDeleting) {
      Toast.error({message: 'Missing required information to delete image'});
      return;
    }

    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setIsDeleting(true);
            setDeletionInitiated(true); // Flag to track that deletion was explicitly initiated

            const payload = {
              plot_id: plotId,
              delete_type: 'image',
              experiment_type: experimentType,
              image_path: currentImage.imagePath || currentImage.url,
            };

            deleteImageRecord({
              payload,
              headers: {'Content-Type': 'application/json'},
            });
          },
        },
      ],
    );
  };

  // Handle image deletion response - only when deletion was explicitly initiated
  useEffect(() => {
    // Only process deletion response if deletion was explicitly initiated
    if (!deletionInitiated) return;
    if (!deleteImageResponse && !deleteImageError) return;

    setIsDeleting(false);
    setDeletionInitiated(false); // Reset the flag

    if (deleteImageError) {
      const apiErrMsg =
        deleteImageError?.response?.data?.message ||
        deleteImageError?.data?.message ||
        deleteImageError?.message;
      Toast.error({
        message: apiErrMsg || 'Failed to delete image',
      });
      return;
    }

    if (deleteImageResponse) {
      // Show success message
      const successMsg =
        deleteImageResponse?.message ||
        deleteImageResponse?.data?.message ||
        'Image deleted successfully';
      Toast.success({message: successMsg});

      // Refresh the plot list to get updated data
      if (onRefreshPlotList) {
        onRefreshPlotList();
      }

      // Notify parent component about the deletion
      if (onImageDeleted) {
        onImageDeleted(currentIndex);
      }

      // If this was the only image, close the modal
      if (images.length === 1) {
        onClose();
      } else {
        // Navigate to previous image if we deleted the last one
        if (currentIndex === images.length - 1 && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
      }
    }
  }, [
    deleteImageResponse,
    deleteImageError,
    deletionInitiated,
    currentIndex,
    images.length,
    onImageDeleted,
    onRefreshPlotList,
    onClose,
  ]);

  const renderBackdrop = React.useCallback(
    () => <Pressable style={styles.backdrop} onPress={onClose} />,
    [onClose],
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={onClose}
      enablePanDownToClose={true}
      backgroundStyle={[
        styles.modalBackground,
        {backgroundColor: COLORS.COMPONENTS.BOTTOMSHEET_MODAL.BACKGROUND_COLOR},
      ]}>
      <BottomSheetView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, {paddingTop: top}]}>
          <View style={styles.headerLeft}>
            <Text
              style={[
                styles.headerTitle,
                {color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR},
              ]}>
              {plotNumber ? `Plot ${plotNumber}` : 'Images'}
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                {color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR},
              ]}>
              {currentIndex + 1} of {images.length}
            </Text>
          </View>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Close />
          </Pressable>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Image Container */}
          <View style={styles.imageContainer}>
            {currentImage && currentImage.url && (
              <>
                {imageLoadingStates[currentIndex] && (
                  <View style={styles.loaderContainer}>
                    <Loader />
                  </View>
                )}
                <Image
                  source={{uri: currentImage.url}}
                  style={[
                    styles.image,
                    {
                      height: computedImageHeight,
                      maxHeight: maxImageHeight,
                    },
                  ]}
                  resizeMode="contain"
                  onLoad={event => handleImageLoadSuccess(currentIndex, event)}
                  onError={() => handleImageLoadError(currentIndex)}
                />
              </>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <Pressable
                    style={[styles.navButton, styles.leftNavButton]}
                    onPress={handlePrevious}>
                    <ImageArrowLeft />
                  </Pressable>
                )}
                {currentIndex < images.length - 1 && (
                  <Pressable
                    style={[styles.navButton, styles.rightNavButton]}
                    onPress={handleNext}>
                    <ImageArrowRight />
                  </Pressable>
                )}
              </>
            )}
          </View>

          {/* Image Info */}
          {currentImage?.uploadedOn && (
            <View style={styles.infoContainer}>
              <Text
                style={[
                  styles.infoText,
                  {color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR},
                ]}>
                Uploaded:{' '}
                {format(
                  new Date(currentImage.uploadedOn),
                  'dd MMM yyyy, hh:mm a',
                )}
              </Text>
              {(locationName || isLoadingLocation) && (
                <View style={styles.locationRow}>
                  <Text
                    style={[
                      styles.infoText,
                      {color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR},
                    ]}>
                    Location:{' '}
                  </Text>
                  {isLoadingLocation ? (
                    <View style={styles.locationLoader}>
                      <Loader size="small" />
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.infoText,
                        styles.locationText,
                        {color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR},
                      ]}
                      numberOfLines={3}>
                      {locationName}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <View style={styles.thumbnailContainer}>
              {images.map((img, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.thumbnail,
                    index === currentIndex && {
                      borderColor: COLORS.APP.SECONDARY_COLOR,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setCurrentIndex(index)}>
                  {img.url && (
                    <Image
                      source={{uri: img.url}}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                      onError={() => {}}
                    />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </BottomSheetScrollView>

        {/* Action Buttons */}
        <View style={[styles.actionContainer, {paddingBottom: bottom + 16}]}>
          <Pressable
            style={[
              styles.actionButton,
              {backgroundColor: COLORS.APP.SECONDARY_COLOR},
              isDownloading && styles.disabledButton,
            ]}
            onPress={downloadImage}
            disabled={isDownloading}>
            {isDownloading ? (
              <Loader size="small" />
            ) : (
              <Text style={[styles.actionButtonText, {color: '#FFFFFF'}]}>
                Download
              </Text>
            )}
          </Pressable>
          <Pressable
            style={[
              styles.actionButton,
              {backgroundColor: COLORS.APP.SECONDARY_COLOR},
              isSharing && styles.disabledButton,
            ]}
            onPress={shareImage}
            disabled={isSharing}>
            {isSharing ? (
              <Loader size="small" />
            ) : (
              <Text style={[styles.actionButtonText, {color: '#FFFFFF'}]}>
                Share
              </Text>
            )}
          </Pressable>
          {plotId && experimentType && (
            <Pressable
              style={[
                styles.actionButton,
                styles.deleteButton,
                (isDeleting || isDeletingImage) && styles.disabledButton,
              ]}
              onPress={deleteImage}
              disabled={isDeleting || isDeletingImage}>
              {isDeleting || isDeletingImage ? (
                <Loader size="small" />
              ) : (
                <>
                  <DeleteBin width={20} height={25} color="#EF4444" />
                </>
              )}
            </Pressable>
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalBackground: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  imageContainer: {
    flex: 1,
    flexShrink: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 16,
    alignSelf: 'stretch',
    width: '100%',
  },
  image: {
    width: '100%',
    alignSelf: 'center',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 10,
    // backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  leftNavButton: {
    left: 8,
  },
  rightNavButton: {
    right: 8,
  },
  infoContainer: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    flex: 1,
    fontWeight: '500',
  },
  locationLoader: {
    marginLeft: 8,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginHorizontal: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingTop: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  deleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    gap: 8,
  },
});

export default ImageCarouselModal;
