import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  PermissionsAndroid,
  NativeModules,
  Animated,
  Easing,
} from 'react-native';
import {BottomSheetModal, BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import Text from '../Text';
import Button from '../Button';
import Toast from '../../utilities/toast';
import {useAppSelector} from '../../store';
import {VoiceNoteRecorderProps} from '../../types/components/VoiceNoteRecorder';
import RNFS from 'react-native-fs';
import {
  Close as CloseIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Microphone as MicrophoneIcon,
  Trash as TrashIcon,
  Upload as UploadIcon,
} from '../../assets/icons/svgs';

const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  isVisible,
  plotNumber,
  fieldName,
  onClose,
  onUpload,
  isUploading = false,
}) => {
  const {theme} = useAppSelector(state => state.theme);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const audioRecorderPlayerRef = useRef<AudioRecorderPlayer | null>(null);
  const waveScaleValues = useRef<Animated.Value[]>(
    Array.from({length: 4}, () => new Animated.Value(0)),
  ).current;
  const waveAnimationsRef = useRef<Animated.CompositeAnimation[]>([]);
  const playbackProgress = useRef(new Animated.Value(0)).current;

  if (audioRecorderPlayerRef.current === null) {
    audioRecorderPlayerRef.current = new AudioRecorderPlayer();
  }
  const audioRecorderPlayer = audioRecorderPlayerRef.current;

  const isNativeModuleAvailable = useMemo(
    () => Boolean(NativeModules?.RNAudioRecorderPlayer),
    [],
  );

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00:00');
  const [recordSecs, setRecordSecs] = useState(0);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState('00:00:00');
  const [duration, setDuration] = useState('00:00:00');
  const [playProgress, setPlayProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && !isNativeModuleAvailable) {
      Toast.error({
        message:
          'Voice recording module is unavailable. Please rebuild the app (pod install / gradle sync) and reinstall.',
      });
    }
  }, [isVisible, isNativeModuleAvailable]);

  useEffect(() => {
    return () => {
      if (!audioRecorderPlayer || !isNativeModuleAvailable) {
        return;
      }

      try {
        audioRecorderPlayer.stopRecorder();
      } catch (error) {
        // ignore — recorder may already be stopped
      }

      try {
        audioRecorderPlayer.stopPlayer();
      } catch (error) {
        // ignore — player may already be stopped
      }

      audioRecorderPlayer.removeRecordBackListener();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, [audioRecorderPlayer, isNativeModuleAvailable]);

  useEffect(() => {
    Animated.timing(playbackProgress, {
      toValue: playProgress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [playProgress, playbackProgress]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const normalizePath = (path: string): string => {
    if (Platform.OS === 'ios' && path.startsWith('file://')) {
      return path.replace('file://', '');
    }
    return path;
  };

  const startWaveAnimation = useCallback(() => {
    waveAnimationsRef.current.forEach(animation => animation.stop());
    waveAnimationsRef.current = waveScaleValues.map((value, index) => {
      value.setValue(0);
      return Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 350,
            delay: index * 80,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 350,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      );
    });

    waveAnimationsRef.current.forEach(animation => animation.start());
  }, [waveScaleValues]);

  const stopWaveAnimation = useCallback(() => {
    waveAnimationsRef.current.forEach(animation => animation.stop());
    waveAnimationsRef.current = [];
    waveScaleValues.forEach(value => value.setValue(0));
  }, [waveScaleValues]);

  useEffect(() => {
    if (isRecording && !isPaused) {
      startWaveAnimation();
    } else {
      stopWaveAnimation();
    }

    return () => {
      stopWaveAnimation();
    };
  }, [isRecording, isPaused, startWaveAnimation, stopWaveAnimation]);

  const requestAndroidPermission = async () => {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );

    if (hasPermission) {
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Audio Recording Permission',
        message:
          'Field Genie needs access to your microphone to record voice notes for field data collection.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
        buttonNeutral: 'Ask Me Later',
      },
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      Toast.error({
        message: 'Microphone permission is required to record voice notes',
      });
      return false;
    }

    return true;
  };

  const startRecording = async () => {
    if (!isNativeModuleAvailable) {
      Toast.error({
        message:
          'Voice recording module failed to initialise. Please rebuild the app and try again.',
      });
      return;
    }

    if (!audioRecorderPlayer) {
      Toast.error({message: 'Recorder instance is not initialised.'});
      return;
    }

    try {
      if (Platform.OS === 'android') {
        const granted = await requestAndroidPermission();
        if (!granted) {
          return;
        }
      }

      const fileId = Date.now();
      const recorderPath =
        Platform.OS === 'android'
          ? `${RNFS.CachesDirectoryPath}/voice_note_${fileId}.mp3`
          : `voice_note_${fileId}.m4a`;

      const audioSet: AudioSet = {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        AudioEncodingBitRateAndroid: 32000,
        AudioSamplingRateAndroid: 44100,
        AudioChannelsAndroid: 2,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
        AVNumberOfChannelsKeyIOS: 2,
        AVFormatIDKeyIOS: AVEncodingOption.aac,
      };

      const result = await audioRecorderPlayer.startRecorder(
        recorderPath,
        audioSet,
      );

      audioRecorderPlayer.addRecordBackListener(e => {
        const positionInSeconds = e.currentPosition / 1000;
        setRecordSecs(positionInSeconds);
        setRecordTime(formatTime(positionInSeconds));
      });

      setAudioPath(result);
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Toast.error({
        message: 'Failed to start recording. Please try again.',
      });
    }
  };

  const pauseRecording = async () => {
    if (!isNativeModuleAvailable || !audioRecorderPlayer) {
      return;
    }
    try {
      await audioRecorderPlayer.pauseRecorder();
      setIsPaused(true);
    } catch (error) {
      console.error('Failed to pause recording:', error);
    }
  };

  const resumeRecording = async () => {
    if (!isNativeModuleAvailable || !audioRecorderPlayer) {
      return;
    }
    try {
      await audioRecorderPlayer.resumeRecorder();
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to resume recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!isNativeModuleAvailable || !audioRecorderPlayer) {
      return;
    }
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setIsPaused(false);
      if (result) {
        setAudioPath(result);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const startPlaying = async () => {
    if (!audioPath) {
      return;
    }

    if (!isNativeModuleAvailable || !audioRecorderPlayer) {
      Toast.error({
        message:
          'Voice playback module failed to initialise. Please rebuild and try again.',
      });
      return;
    }

    try {
      await audioRecorderPlayer.startPlayer(audioPath);
      audioRecorderPlayer.addPlayBackListener(e => {
        const currentSeconds = e.currentPosition / 1000;
        const totalSeconds = e.duration / 1000;
        setPlayTime(formatTime(currentSeconds));
        setDuration(formatTime(totalSeconds));
        setPlayProgress(totalSeconds ? currentSeconds / totalSeconds : 0);

        if (e.currentPosition >= e.duration) {
          stopPlaying();
        }
      });
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to start playback:', error);
    }
  };

  const stopPlaying = async () => {
    if (!isNativeModuleAvailable || !audioRecorderPlayer) {
      return;
    }
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
      setPlayTime('00:00:00');
      setPlayProgress(0);
    } catch (error) {
      console.error('Failed to stop playback:', error);
    }
  };

  const handleDelete = async () => {
    try {
      if (isRecording) {
        await stopRecording();
      }
      if (isPlaying) {
        await stopPlaying();
      }

      if (audioPath) {
        const fsPath = normalizePath(audioPath);
        if (await RNFS.exists(fsPath)) {
          await RNFS.unlink(fsPath);
        }
      }

      setAudioPath(null);
      setRecordTime('00:00:00');
      setRecordSecs(0);
      setPlayTime('00:00:00');
      setDuration('00:00:00');
      setPlayProgress(0);
    } catch (error) {
      console.error('Failed to delete voice note:', error);
    }
  };

  const handleUpload = async () => {
    if (!audioPath) {
      return;
    }

    try {
      const fsPath = normalizePath(audioPath);
      const audioBase64 = await RNFS.readFile(fsPath, 'base64');

      const fileExtension = Platform.OS === 'ios' ? 'm4a' : 'mp3';
      const mimeType = Platform.OS === 'ios' ? 'audio/m4a' : 'audio/mpeg';

      await onUpload({
        audioBase64,
        fileName: `voice_note_${Date.now()}.${fileExtension}`,
        duration: recordSecs,
        mimeType,
      });

      await handleDelete();
      onClose();
    } catch (error) {
      console.error('Failed to upload voice note:', error);
      Toast.error({message: 'Failed to upload voice note. Please try again.'});
    }
  };

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    if (isPlaying) {
      stopPlaying();
    }
    onClose();
  };

  const renderSoundWave = () => (
    <View style={styles.soundWaveContainer}>
      {waveScaleValues.map((value, index) => (
        <Animated.View
          key={`wave-bar-${index}`}
          style={[
            styles.soundWaveBar,
            {
              transform: [
                {
                  scaleY: value.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1.6],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
    />
  );

  const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: theme.COLORS.APP.BACKGROUND_COLOR,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
    },
    subtitle: {
      fontSize: 14,
      color: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
      marginTop: 4,
    },
    closeButton: {
      padding: 8,
    },
    recordingContainer: {
      alignItems: 'center',
      marginVertical: 30,
    },
    recordButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    recordButtonRecording: {
      backgroundColor: '#FF3B30',
    },
    recordButtonPaused: {
      backgroundColor: '#FF9500',
    },
    timeText: {
      fontSize: 32,
      fontWeight: '600',
      color: theme.COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
      marginBottom: 8,
    },
    statusText: {
      fontSize: 16,
      color: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
    },
    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 20,
      marginBottom: 30,
    },
    controlButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.COLORS.APP.BACKGROUND_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E6E6E6',
    },
    playbackContainer: {
      padding: 16,
      backgroundColor: theme.COLORS.APP.BACKGROUND_COLOR,
      borderRadius: 12,
      marginBottom: 20,
    },
    playbackHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    playbackTimeText: {
      fontSize: 14,
      color: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
    },
    playbackControls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    playButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressContainer: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.COLORS.APP.BACKGROUND_COLOR,
      borderWidth: 1,
      borderColor: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
      overflow: 'hidden',
      marginBottom: 16,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
    },
    soundWaveContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      marginTop: 20,
      height: 40,
    },
    soundWaveBar: {
      width: 8,
      height: 40,
      borderRadius: 4,
      backgroundColor: theme.COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR,
    },
  });

  const getRecordButtonStyle = () => {
    if (isPaused) return [styles.recordButton, styles.recordButtonPaused];
    if (isRecording) return [styles.recordButton, styles.recordButtonRecording];
    return styles.recordButton;
  };

  const getStatusText = () => {
    if (isPaused) return 'Paused';
    if (isRecording) return 'Recording...';
    if (audioPath) return 'Recording Complete';
    return 'Tap to Start Recording';
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['70%']}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={!isRecording && !isUploading}
      backgroundStyle={{
        backgroundColor: theme.COLORS.APP.BACKGROUND_COLOR,
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
      }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Voice Note</Text>
            <Text style={styles.subtitle}>
              {fieldName} - Plot {plotNumber}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            disabled={isUploading}>
            <CloseIcon
              width={28}
              height={28}
              color={theme.COLORS.COMPONENTS.TEXT.PRIMARY_COLOR}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.recordingContainer}>
          <TouchableOpacity
            style={getRecordButtonStyle()}
            onPress={() => {
              if (!isRecording && !audioPath) {
                startRecording();
              } else if (isRecording && !isPaused) {
                stopRecording();
              } else if (isPaused) {
                resumeRecording();
              }
            }}
            disabled={isUploading || (audioPath !== null && !isRecording)}>
            {isRecording && !isPaused ? (
              <StopIcon width={44} height={44} color="#FFFFFF" />
            ) : isPaused ? (
              <PlayIcon width={44} height={44} color="#FFFFFF" />
            ) : (
              <MicrophoneIcon
                width={44}
                height={44}
                color="#FFFFFF"
                strokeWidth={2}
              />
            )}
          </TouchableOpacity>

          <Text style={styles.timeText}>{recordTime}</Text>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          {isRecording && renderSoundWave()}
        </View>

        {isRecording && (
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={isPaused ? resumeRecording : pauseRecording}>
              {isPaused ? (
                <PlayIcon
                  width={32}
                  height={32}
                  color={theme.COLORS.COMPONENTS.TEXT.PRIMARY_COLOR}
                />
              ) : (
                <PauseIcon
                  width={32}
                  height={32}
                  color={theme.COLORS.COMPONENTS.TEXT.PRIMARY_COLOR}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={stopRecording}>
              <StopIcon
                width={32}
                height={32}
                color={theme.COLORS.COMPONENTS.TEXT.PRIMARY_COLOR}
              />
            </TouchableOpacity>
          </View>
        )}

        {audioPath && !isRecording && (
          <View style={styles.playbackContainer}>
            <View style={styles.playbackHeader}>
              <Text style={styles.playbackTimeText}>{playTime}</Text>
              <Text style={styles.playbackTimeText}>{duration}</Text>
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
            <View style={styles.playbackControls}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={isPlaying ? stopPlaying : startPlaying}
                disabled={isUploading}>
                {isPlaying ? (
                  <StopIcon width={32} height={32} color="#FFFFFF" />
                ) : (
                  <PlayIcon width={32} height={32} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {audioPath && !isRecording && (
          <View style={styles.actionButtons}>
            <View style={styles.actionButton}>
              <Button
                title="Delete"
                onPress={handleDelete}
                disabled={isUploading}
                containerStyle={{
                  backgroundColor: '#FF3B30',
                }}
                icon={<TrashIcon width={22} height={22} color="#FFFFFF" />}
              />
            </View>
            <View style={styles.actionButton}>
              <Button
                title={isUploading ? 'Uploading...' : 'Upload'}
                onPress={handleUpload}
                disabled={isUploading}
                icon={
                  isUploading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <UploadIcon
                      width={22}
                      height={22}
                      color="#FFFFFF"
                      strokeWidth={2}
                    />
                  )
                }
              />
            </View>
          </View>
        )}
      </View>
    </BottomSheetModal>
  );
};

export default VoiceNoteRecorder;
