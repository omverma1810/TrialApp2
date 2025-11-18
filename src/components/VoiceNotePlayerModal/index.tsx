import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import {BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {format} from 'date-fns';

import {
  Close,
  ImageArrowLeft,
  ImageArrowRight,
  Play as PlayIcon,
  Pause as PauseIcon,
  Microphone as MicrophoneIcon,
  DeleteBin,
} from '../../assets/icons/svgs';
import {Loader} from '../index';
import useTheme from '../../theme/hooks/useTheme';
import Toast from '../../utilities/toast';
import {useApi} from '../../hooks/useApi';
import {URL} from '../../constants/URLS';

const {width, height} = Dimensions.get('window');

interface VoiceNoteData {
  fileName: string;
  duration: number;
  mimeType: string;
  timestamp: number;
  url?: string;
  audioBase64?: string;
  audioPath?: string;
  uploadedOn?: string;
  locationName?: string;
  lat?: number;
  long?: number;
}

interface VoiceNotePlayerModalProps {
  isVisible: boolean;
  voiceNotes: VoiceNoteData[];
  initialIndex?: number;
  plotNumber?: string;
  fieldName?: string;
  plotId?: string | number;
  experimentType?: string;
  onClose: () => void;
  onVoiceNoteDeleted?: (voiceNoteIndex: number) => void;
  onRefreshPlotList?: () => void;
}

const VoiceNotePlayerModal: React.FC<VoiceNotePlayerModalProps> = ({
  isVisible,
  voiceNotes,
  initialIndex = 0,
  plotNumber,
  fieldName,
  plotId,
  experimentType,
  onClose,
  onVoiceNoteDeleted,
  onRefreshPlotList,
}) => {
  const {COLORS} = useTheme();
  const {top, bottom} = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const audioPlayerRef = useRef<AudioRecorderPlayer | null>(null);
  const playbackProgress = useRef(new Animated.Value(0)).current;

  if (audioPlayerRef.current === null) {
    audioPlayerRef.current = new AudioRecorderPlayer();
  }
  const audioPlayer = audioPlayerRef.current;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState('00:00:00');
  const [duration, setDuration] = useState('00:00:00');
  const [playProgress, setPlayProgress] = useState(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [locationName, setLocationName] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionInitiated, setDeletionInitiated] = useState(false);

  // Voice note deletion API hook
  const [
    deleteVoiceNoteRecord,
    deleteVoiceNoteResponse,
    isDeletingVoiceNote,
    deleteVoiceNoteError,
  ] = useApi({
    url: URL.DELETE_TRAIT_RECORD,
    method: 'POST',
  });

  const snapPoints = React.useMemo(() => ['90%'], []);

  const currentVoiceNote = voiceNotes[currentIndex];

  useEffect(() => {
    if (isVisible) {
      setCurrentIndex(initialIndex);
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
      stopPlaying();
    }
  }, [isVisible, initialIndex]);

  // Set location name from API data
  useEffect(() => {
    const setLocationDisplay = () => {
      const voiceNote = voiceNotes[currentIndex];

      setLocationName('');
      setIsLoadingLocation(true);

      if (voiceNote) {
        if (voiceNote.locationName && voiceNote.locationName.trim() !== '') {
          setLocationName(voiceNote.locationName);
        } else if (fieldName) {
          setLocationName(fieldName);
        }
      }

      setIsLoadingLocation(false);
    };

    if (isVisible && voiceNotes.length > 0) {
      setLocationDisplay();
    }
  }, [currentIndex, voiceNotes, isVisible, fieldName]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (audioPlayer) {
        try {
          audioPlayer.stopPlayer();
          audioPlayer.removePlayBackListener();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [audioPlayer]);

  useEffect(() => {
    Animated.timing(playbackProgress, {
      toValue: playProgress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [playProgress, playbackProgress]);

  // Stop playing when switching between voice notes
  useEffect(() => {
    stopPlaying();
  }, [currentIndex]);

  // Handle voice note deletion response
  useEffect(() => {
    if (!deletionInitiated) return;
    if (!deleteVoiceNoteResponse && !deleteVoiceNoteError) return;

    setIsDeleting(false);
    setDeletionInitiated(false);

    if (deleteVoiceNoteError) {
      const apiErrMsg =
        deleteVoiceNoteError?.response?.data?.message ||
        deleteVoiceNoteError?.data?.message ||
        deleteVoiceNoteError?.message;
      Toast.error({
        message: apiErrMsg || 'Failed to delete voice note',
      });
      return;
    }

    if (deleteVoiceNoteResponse) {
      console.log(
        '✅ Voice note deleted successfully:',
        deleteVoiceNoteResponse,
      );

      const successMsg =
        deleteVoiceNoteResponse?.message ||
        deleteVoiceNoteResponse?.data?.message ||
        'Voice note deleted successfully';
      Toast.success({message: successMsg});

      // Refresh the plot list to get updated data
      if (onRefreshPlotList) {
        onRefreshPlotList();
      }

      // Notify parent component about the deletion
      if (onVoiceNoteDeleted) {
        onVoiceNoteDeleted(currentIndex);
      }

      // If this was the only voice note, close the modal
      if (voiceNotes.length === 1) {
        onClose();
      } else {
        // Navigate to previous voice note if we deleted the last one
        if (currentIndex === voiceNotes.length - 1 && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
      }
    }
  }, [
    deleteVoiceNoteResponse,
    deleteVoiceNoteError,
    deletionInitiated,
    currentIndex,
    voiceNotes.length,
    onVoiceNoteDeleted,
    onRefreshPlotList,
    onClose,
  ]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const startPlaying = async () => {
    if (!currentVoiceNote?.url) {
      Toast.info({
        message: 'Voice note URL not available for playback.',
      });
      return;
    }

    if (!audioPlayer) {
      Toast.error({
        message: 'Audio player failed to initialize.',
      });
      return;
    }

    try {
      setIsLoadingAudio(true);
      await audioPlayer.startPlayer(currentVoiceNote.url);
      audioPlayer.addPlayBackListener(e => {
        const currentSeconds = e.currentPosition / 1000;
        const totalSeconds = e.duration / 1000;
        setPlayTime(formatTime(currentSeconds));
        setDuration(formatTime(totalSeconds));
        setPlayProgress(totalSeconds ? currentSeconds / totalSeconds : 0);

        // Check if audio has finished playing (with a small threshold for precision)
        if (e.currentPosition >= e.duration - 100 && e.duration > 0) {
          stopPlaying();
        }
      });
      setIsPlaying(true);
      setIsLoadingAudio(false);
    } catch (error) {
      console.error('Failed to start playback:', error);
      setIsLoadingAudio(false);
      Toast.error({
        message: 'Failed to play voice note. Please try again.',
      });
    }
  };

  const pausePlaying = async () => {
    if (!audioPlayer) return;

    try {
      await audioPlayer.pausePlayer();
      setIsPlaying(false);
    } catch (error) {
      console.error('Failed to pause playback:', error);
    }
  };

  const resumePlaying = async () => {
    if (!audioPlayer) return;

    try {
      await audioPlayer.resumePlayer();
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to resume playback:', error);
    }
  };

  const stopPlaying = async () => {
    if (!audioPlayer) return;

    try {
      await audioPlayer.stopPlayer();
      audioPlayer.removePlayBackListener();
      setIsPlaying(false);
      setPlayTime('00:00:00');
      setPlayProgress(0);
    } catch (error) {
      console.error('Failed to stop playback:', error);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < voiceNotes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const deleteVoiceNote = () => {
    console.log('🔍 Delete Voice Note Debug (Modal):');
    console.log('  - currentVoiceNote:', currentVoiceNote);
    console.log('  - plotId:', plotId);
    console.log('  - experimentType:', experimentType);
    console.log('  - audioPath:', currentVoiceNote?.audioPath);
    console.log('  - isDeleting:', isDeleting);

    if (!currentVoiceNote) {
      Toast.error({
        message: 'Voice note not found',
      });
      return;
    }

    if (!plotId) {
      Toast.error({
        message: 'Plot ID is missing. Cannot delete voice note.',
      });
      console.error('❌ Missing plotId');
      return;
    }

    if (!experimentType) {
      Toast.error({
        message: 'Experiment type is missing. Cannot delete voice note.',
      });
      console.error('❌ Missing experimentType');
      return;
    }

    if (isDeleting) {
      Toast.info({
        message: 'Deletion already in progress',
      });
      return;
    }

    if (!currentVoiceNote.audioPath) {
      Toast.error({message: 'Audio path not available for deletion'});
      console.error('❌ Missing audioPath for note:', currentVoiceNote);
      return;
    }

    Alert.alert(
      'Delete Voice Note',
      'Are you sure you want to delete this voice note? This action cannot be undone.',
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
            setDeletionInitiated(true);

            const payload = {
              plot_id: plotId,
              delete_type: 'audio',
              experiment_type: experimentType,
              audio_path: currentVoiceNote.audioPath,
            };

            console.log('🗑️ Deleting voice note with payload:', payload);

            deleteVoiceNoteRecord({
              payload,
              headers: {'Content-Type': 'application/json'},
            });
          },
        },
      ],
    );
  };

  const handleClose = () => {
    stopPlaying();
    onClose();
  };

  const renderBackdrop = React.useCallback(
    () => <Pressable style={styles.backdrop} onPress={handleClose} />,
    [handleClose],
  );

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
    audioContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      marginVertical: 16,
    },
    voiceNoteIconLarge: {
      width: width * 0.5,
      height: width * 0.5,
      borderRadius: (width * 0.5) / 2,
      backgroundColor: COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    navButton: {
      position: 'absolute',
      top: '50%',
      marginTop: -20,
      width: 40,
      height: 40,
      borderRadius: 10,
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
    playerControlsContainer: {
      width: '100%',
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    timeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    timeText: {
      fontSize: 14,
      color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
    },
    progressContainer: {
      height: 6,
      borderRadius: 3,
      backgroundColor: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR + '20',
      overflow: 'hidden',
      marginBottom: 20,
    },
    progressFill: {
      height: '100%',
      backgroundColor: COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR,
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
      borderRadius: 25,
      marginHorizontal: 4,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      backgroundColor: COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR + '10',
      justifyContent: 'center',
      alignItems: 'center',
    },
    thumbnailActive: {
      borderColor: COLORS.APP.SECONDARY_COLOR,
      borderWidth: 2,
      backgroundColor: COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR + '20',
    },
    actionContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      paddingTop: 16,
    },
    actionButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      minWidth: 120,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
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
      minWidth: 100,
    },
  });

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={handleClose}
      enablePanDownToClose={!isPlaying}
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
              {plotNumber ? `Plot ${plotNumber}` : 'Voice Notes'}
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                {color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR},
              ]}>
              {currentIndex + 1} of {voiceNotes.length}
            </Text>
          </View>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Close />
          </Pressable>
        </View>

        {/* Audio Player Container */}
        <View style={styles.audioContainer}>
          {currentVoiceNote && (
            <>
              {/* Large Microphone Icon */}
              <View style={styles.voiceNoteIconLarge}>
                <MicrophoneIcon
                  width={width * 0.25}
                  height={width * 0.25}
                  color={COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR}
                  strokeWidth={1.5}
                />
              </View>

              {/* Navigation Arrows */}
              {voiceNotes.length > 1 && (
                <>
                  {currentIndex > 0 && (
                    <Pressable
                      style={[styles.navButton, styles.leftNavButton]}
                      onPress={handlePrevious}>
                      <ImageArrowLeft />
                    </Pressable>
                  )}
                  {currentIndex < voiceNotes.length - 1 && (
                    <Pressable
                      style={[styles.navButton, styles.rightNavButton]}
                      onPress={handleNext}>
                      <ImageArrowRight />
                    </Pressable>
                  )}
                </>
              )}
            </>
          )}
        </View>

        {/* Voice Note Info */}
        {currentVoiceNote?.uploadedOn && (
          <View style={styles.infoContainer}>
            <Text
              style={[
                styles.infoText,
                {color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR},
              ]}>
              Recorded:{' '}
              {format(
                new Date(
                  currentVoiceNote.uploadedOn || currentVoiceNote.timestamp,
                ),
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

        {/* Player Controls */}
        {currentVoiceNote && currentVoiceNote.url && (
          <View style={styles.playerControlsContainer}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{playTime || '00:00:00'}</Text>
              <Text style={styles.timeText}>
                {duration || formatTime(currentVoiceNote.duration || 0)}
              </Text>
            </View>

            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: playbackProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Thumbnail Strip */}
        {voiceNotes.length > 1 && (
          <View style={styles.thumbnailContainer}>
            {voiceNotes.map((note, index) => (
              <Pressable
                key={index}
                style={[
                  styles.thumbnail,
                  index === currentIndex && styles.thumbnailActive,
                ]}
                onPress={() => setCurrentIndex(index)}>
                <MicrophoneIcon
                  width={24}
                  height={24}
                  color={
                    index === currentIndex
                      ? COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR
                      : COLORS.COMPONENTS.TEXT.SECONDARY_COLOR
                  }
                  strokeWidth={2}
                />
              </Pressable>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={[styles.actionContainer, {paddingBottom: bottom + 16}]}>
          {/* Play/Pause Button */}
          <Pressable
            style={[
              styles.actionButton,
              {backgroundColor: COLORS.APP.SECONDARY_COLOR},
              (isLoadingAudio || !currentVoiceNote?.url) &&
                styles.disabledButton,
            ]}
            onPress={() => {
              if (!isPlaying) {
                startPlaying();
              } else {
                pausePlaying();
              }
            }}
            disabled={isLoadingAudio || !currentVoiceNote?.url}>
            {isLoadingAudio ? (
              <Loader size="small" />
            ) : (
              <>
                {isPlaying ? (
                  <PauseIcon width={20} height={20} color="#FFFFFF" />
                ) : (
                  <PlayIcon width={20} height={20} color="#FFFFFF" />
                )}
                <Text style={[styles.actionButtonText, {color: '#FFFFFF'}]}>
                  {isPlaying ? 'Pause' : 'Play'}
                </Text>
              </>
            )}
          </Pressable>

          {/* Delete Button */}
          {plotId && experimentType && (
            <Pressable
              style={[styles.deleteButton, isDeleting && styles.disabledButton]}
              onPress={deleteVoiceNote}
              disabled={isDeleting}>
              {isDeleting ? (
                <Loader size="small" />
              ) : (
                <>
                  <DeleteBin width={20} height={25} color="#EF4444" />
                  <Text style={[styles.actionButtonText, {color: '#EF4444'}]}>
                    Delete
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default VoiceNotePlayerModal;
