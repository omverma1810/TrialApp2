import React, {useState, useEffect, useRef, useCallback} from 'react';
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
  AppState,
  AppStateStatus,
} from 'react-native';
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
import RNFS from 'react-native-fs';
import AudioInterruptionModule, {
  AudioInterruptionEmitter,
} from '../../utilities/AudioInterruptionModule';
import {
  Play as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Microphone as MicrophoneIcon,
  Trash as TrashIcon,
  Upload as UploadIcon,
} from '../../assets/icons/svgs';

const MAX_RECORD_DURATION_SECONDS = 180;
const MAX_RECORD_DURATION_LABEL = '3 minutes';

interface InlineVoiceRecorderProps {
  plotNumber: string;
  fieldName: string;
  onUpload: (data: {
    audioBase64: string;
    fileName: string;
    duration: number;
    mimeType: string;
  }) => Promise<void>;
  isUploading?: boolean;
  autoStart?: boolean;
}

const InlineVoiceRecorder: React.FC<InlineVoiceRecorderProps> = ({
  plotNumber,
  fieldName,
  onUpload,
  isUploading = false,
  autoStart = false,
}) => {
  const {theme} = useAppSelector(state => state.theme);
  const audioRecorderPlayerRef = useRef<AudioRecorderPlayer | null>(null);
  const waveScaleValues = useRef<Animated.Value[]>(
    Array.from({length: 5}, () => new Animated.Value(0)),
  ).current;
  const waveAnimationsRef = useRef<Animated.CompositeAnimation[]>([]);
  const playbackProgress = useRef(new Animated.Value(0)).current;
  const hasReachedMaxDurationRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);
  const audioPathRef = useRef<string | null>(null);
  const interruptionModuleWarningRef = useRef(false);

  if (audioRecorderPlayerRef.current === null) {
    audioRecorderPlayerRef.current = new AudioRecorderPlayer();
  }
  const audioRecorderPlayer = audioRecorderPlayerRef.current;

  const isNativeModuleAvailable = Boolean(NativeModules?.RNAudioRecorderPlayer);

  const [isRecording, setIsRecordingState] = useState(false);
  const [isPaused, setIsPausedState] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00:00');
  const [recordSecs, setRecordSecs] = useState(0);
  const [audioPath, setAudioPathState] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState('00:00:00');
  const [duration, setDuration] = useState('00:00:00');
  const [playProgress, setPlayProgress] = useState(0);
  const [hasReachedMaxDuration, setHasReachedMaxDuration] = useState(false);
  const [isMicrophoneAvailable, setIsMicrophoneAvailable] = useState(true);

  // Custom setter that updates both state and ref
  const setIsRecording = useCallback((value: boolean) => {
    setIsRecordingState(value);
    isRecordingRef.current = value;
  }, []);

  // Custom setter for isPaused that updates both state and ref
  const setIsPaused = useCallback((value: boolean) => {
    setIsPausedState(value);
    isPausedRef.current = value;
  }, []);

  const setAudioPath = useCallback((path: string | null) => {
    audioPathRef.current = path;
    setAudioPathState(path);
  }, []);

  // Monitor microphone availability state changes
  useEffect(() => {
    console.log(
      '🎤 isMicrophoneAvailable state changed to:',
      isMicrophoneAvailable,
      '- Button should be:',
      isMicrophoneAvailable ? 'ENABLED ✅' : 'DISABLED ❌',
    );
  }, [isMicrophoneAvailable]);

  const cancelRecording = useCallback(async () => {
    if (!isNativeModuleAvailable || !audioRecorderPlayer) {
      return;
    }

    // Immediately update UI state and refs so callbacks stop reacting
    setIsRecording(false);
    setIsPaused(false);
    setIsPlaying(false);
    hasReachedMaxDurationRef.current = false;
    setHasReachedMaxDuration(false);

    try {
      await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
    } catch (error) {
      if (__DEV__) {
        console.debug(
          'stopRecorder failed or recorder already stopped:',
          error,
        );
      }
    }
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
    } catch (error) {
      if (__DEV__) {
        console.debug('stopPlayer failed or player already stopped:', error);
      }
    }

    const currentPath = audioPathRef.current;
    if (currentPath) {
      try {
        const fsPath = normalizePath(currentPath);
        if (await RNFS.exists(fsPath)) {
          await RNFS.unlink(fsPath);
        }
      } catch (error) {
        console.error('Failed to delete cancelled recording file:', error);
      }
    }

    // Reset all stateful tracking
    setAudioPath(null);
    setRecordTime('00:00:00');
    setRecordSecs(0);
    setPlayTime('00:00:00');
    setDuration('00:00:00');
    setPlayProgress(0);
  }, [audioRecorderPlayer, isNativeModuleAvailable, setAudioPath]);

  useEffect(() => {
    if (!isNativeModuleAvailable) {
      Toast.error({
        message:
          'Voice recording module is unavailable. Please rebuild the app.',
      });
    }
  }, [isNativeModuleAvailable]);

  useEffect(() => {
    return () => {
      if (!audioRecorderPlayer || !isNativeModuleAvailable) {
        return;
      }

      try {
        audioRecorderPlayer.stopRecorder();
      } catch (error) {
        // ignore
      }

      try {
        audioRecorderPlayer.stopPlayer();
      } catch (error) {
        // ignore
      }

      audioRecorderPlayer.removeRecordBackListener();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, [audioRecorderPlayer, isNativeModuleAvailable]);

  // Handle app lifecycle transitions by cancelling active recordings
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const isGoingToBackground =
        appStateRef.current === 'active' &&
        (nextAppState === 'background' || nextAppState === 'inactive');

      if (isGoingToBackground && isRecordingRef.current) {
        Toast.info({
          message: 'Recording cancelled - app moved to background',
        });
        cancelRecording().catch((error: unknown) => {
          console.error('Failed to cancel recording on app background:', error);
        });
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [cancelRecording]);

  // Handle audio interruptions (incoming calls, other audio playing)
  useEffect(() => {
    if (!AudioInterruptionModule || !AudioInterruptionEmitter) {
      if (__DEV__ && !interruptionModuleWarningRef.current) {
        console.log('AudioInterruptionModule not available');
      }
      interruptionModuleWarningRef.current = true;
      return;
    }

    interruptionModuleWarningRef.current = false;

    // Start listening for audio interruptions
    AudioInterruptionModule.startListening();

    // Listen for interruption events
    const subscription = AudioInterruptionEmitter.addListener(
      'onAudioInterruption',
      (reason: string) => {
        console.log(
          'Audio interruption received:',
          reason,
          'isRecording:',
          isRecordingRef.current,
        );

        // Define interruption types that make microphone unavailable
        const microphoneBlockingReasons = [
          'call', // Phone call
          'began', // iOS audio interruption
          'focus_loss', // Permanent focus loss
          'focus_loss_transient', // Temporary focus loss (notifications, calls)
          'focus_loss_can_duck', // Another app needs audio (can continue but muted)
        ];

        const microphoneRecoveryReasons = [
          'call_ended', // Call finished
          'focus_gain', // Audio focus regained
        ];

        // Mark microphone as unavailable for blocking reasons
        if (microphoneBlockingReasons.includes(reason)) {
          console.log('🔴 MICROPHONE BLOCKED - Reason:', reason);
          setIsMicrophoneAvailable(false);
        }
        // Mark microphone as available for recovery reasons
        else if (microphoneRecoveryReasons.includes(reason)) {
          console.log('🟢 MICROPHONE AVAILABLE - Reason:', reason);
          setIsMicrophoneAvailable(true);
        }
        // Log unhandled events
        else {
          console.log('⚠️ UNHANDLED INTERRUPTION EVENT:', reason);
        }

        console.log(
          '📊 Current isMicrophoneAvailable state:',
          reason,
          '-> Will check state in next render',
        );

        // Use ref to get current recording state to avoid stale closure
        if (isRecordingRef.current) {
          let message = 'Recording cancelled due to interruption';

          if (reason === 'call') {
            message = 'Recording cancelled - incoming call';
          } else if (reason === 'began') {
            message = 'Recording cancelled - audio interruption';
          } else if (reason === 'deviceUnavailable') {
            message = 'Recording cancelled - audio device disconnected';
          } else if (reason === 'noisy') {
            message = 'Recording cancelled - audio interruption';
          } else if (reason === 'focus_loss') {
            message = 'Recording cancelled - another app is using audio';
          } else if (reason === 'focus_loss_transient') {
            message = 'Recording cancelled - audio interruption';
          } else if (reason === 'focus_loss_can_duck') {
            message = 'Recording cancelled - another app started playing';
          } else if (reason === 'routeOverride') {
            message = 'Recording cancelled - audio route changed';
          } else if (reason === 'secondaryAudioSilenced') {
            message = 'Recording cancelled - another app started playing';
          } else if (reason === 'mediaServicesReset') {
            message = 'Recording cancelled - audio system reset';
          }

          Toast.info({message});
          cancelRecording().catch((error: unknown) => {
            console.error(
              'Failed to cancel recording after interruption:',
              error,
            );
          });
        }
      },
    );

    return () => {
      subscription.remove();
      AudioInterruptionModule.stopListening();
    };
  }, [cancelRecording]);

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
            duration: 400,
            delay: index * 100,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 400,
            easing: Easing.ease,
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
          'Field Genie needs access to your microphone to record voice notes.',
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
        message: 'Voice recording module failed to initialize.',
      });
      return;
    }

    if (!audioRecorderPlayer) {
      Toast.error({message: 'Recorder instance is not initialized.'});
      return;
    }

    // Check if microphone is available (not during a call)
    if (!isMicrophoneAvailable) {
      console.log('❌ Microphone not available, blocking recording');
      Toast.error({
        message: 'Cannot record while a call is in progress.',
      });
      return;
    }

    console.log('✅ Microphone available, starting recording');

    try {
      if (Platform.OS === 'android') {
        const granted = await requestAndroidPermission();
        if (!granted) {
          return;
        }
      }

      hasReachedMaxDurationRef.current = false;
      setHasReachedMaxDuration(false);

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

      try {
        audioRecorderPlayer.removeRecordBackListener();
      } catch (error) {
        if (__DEV__) {
          console.debug(
            'No existing record listener to remove before start:',
            error,
          );
        }
      }

      const result = await audioRecorderPlayer.startRecorder(
        recorderPath,
        audioSet,
      );

      // Reset timers and UI indicators at the start of each recording
      setRecordSecs(0);
      setRecordTime('00:00:00');
      setDuration('00:00:00');
      setPlayTime('00:00:00');
      setPlayProgress(0);

      audioRecorderPlayer.addRecordBackListener(e => {
        // Only update UI if we're actively recording (not paused)
        // Use refs to avoid stale closure issues
        if (!isRecordingRef.current || isPausedRef.current) {
          return;
        }

        const positionInSeconds = e.currentPosition / 1000;
        const safeSeconds = Math.min(
          positionInSeconds,
          MAX_RECORD_DURATION_SECONDS,
        );
        setRecordSecs(safeSeconds);
        setRecordTime(formatTime(safeSeconds));

        if (
          !hasReachedMaxDurationRef.current &&
          positionInSeconds >= MAX_RECORD_DURATION_SECONDS
        ) {
          hasReachedMaxDurationRef.current = true;
          setHasReachedMaxDuration(true);
          Toast.info({
            message: `Voice notes are limited to ${MAX_RECORD_DURATION_LABEL} per plot.`,
          });

          stopRecording().catch((error: unknown) => {
            console.error(
              'Failed to stop recording after reaching limit:',
              error,
            );
          });
        }
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
    if (recordSecs >= MAX_RECORD_DURATION_SECONDS) {
      Toast.info({
        message: `Voice notes are limited to ${MAX_RECORD_DURATION_LABEL} per plot.`,
      });
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
      if (hasReachedMaxDurationRef.current) {
        setRecordSecs(MAX_RECORD_DURATION_SECONDS);
        setRecordTime(formatTime(MAX_RECORD_DURATION_SECONDS));
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
        message: 'Voice playback module failed to initialize.',
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

  /**
   * Cancels the current recording and discards the audio file
   * Used when recording is interrupted (call, background, app close)
   */

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
      hasReachedMaxDurationRef.current = false;
      setHasReachedMaxDuration(false);
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
    } catch (error) {
      console.error('Failed to upload voice note:', error);
      Toast.error({message: 'Failed to upload voice note. Please try again.'});
    }
  };

  // Auto-start recording if requested
  useEffect(() => {
    if (autoStart && !isRecording && !audioPath) {
      startRecording();
    }
  }, [autoStart]);

  const renderSoundWave = () => (
    <View style={styles.soundWaveContainer}>
      {waveScaleValues.map((value, index) => (
        <Animated.View
          key={`wave-bar-${index}`}
          style={[
            styles.soundWaveBar,
            {
              backgroundColor: theme.COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR,
              transform: [
                {
                  scaleY: value.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1.8],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      padding: 20,
      backgroundColor: theme.COLORS.APP.BACKGROUND_COLOR,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR + '30',
    },
    header: {
      marginBottom: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
    },
    limitText: {
      fontSize: 12,
      color: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
      marginTop: 2,
    },
    recordingContainer: {
      alignItems: 'center',
      marginVertical: 20,
    },
    recordButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
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
      fontSize: 28,
      fontWeight: '600',
      color: theme.COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
      marginBottom: 6,
    },
    statusText: {
      fontSize: 14,
      color: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
    },
    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
      marginVertical: 16,
    },
    controlButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.COLORS.APP.BACKGROUND_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR + '40',
    },
    playbackContainer: {
      padding: 16,
      backgroundColor: theme.COLORS.APP.BACKGROUND_COLOR,
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR + '20',
    },
    playbackHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    playbackTimeText: {
      fontSize: 13,
      color: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
    },
    playbackControls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    playButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressContainer: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.COLORS.APP.BACKGROUND_COLOR,
      borderWidth: 1,
      borderColor: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR + '40',
      overflow: 'hidden',
      marginBottom: 12,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 10,
    },
    actionButton: {
      flex: 1,
    },
    soundWaveContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
      height: 36,
    },
    soundWaveBar: {
      width: 6,
      height: 36,
      borderRadius: 3,
    },
  });

  const getRecordButtonStyle = () => {
    if (isPaused) return [styles.recordButton, styles.recordButtonPaused];
    if (isRecording) return [styles.recordButton, styles.recordButtonRecording];
    return styles.recordButton;
  };

  const getStatusText = () => {
    if (!isMicrophoneAvailable)
      return 'Microphone unavailable - call in progress';
    if (isPaused) return 'Paused';
    if (isRecording) return 'Recording...';
    if (hasReachedMaxDuration) return 'Maximum duration reached';
    if (audioPath) return 'Recording Complete';
    return 'Ready to Record';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Note</Text>
        <Text style={styles.subtitle}>
          {fieldName} - Plot {plotNumber}
        </Text>
        <Text style={styles.limitText}>
          Limit {MAX_RECORD_DURATION_LABEL} per voice note
        </Text>
      </View>

      <View style={styles.recordingContainer}>
        <TouchableOpacity
          style={getRecordButtonStyle()}
          onPress={() => {
            console.log(
              '🎤 Button pressed, isMicrophoneAvailable:',
              isMicrophoneAvailable,
            );

            if (!isRecording && !audioPath) {
              startRecording();
            } else if (isRecording && !isPaused) {
              stopRecording();
            } else if (isPaused) {
              resumeRecording();
            }
          }}
          disabled={
            isUploading ||
            (audioPath !== null && !isRecording) ||
            !isMicrophoneAvailable
          }>
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
                width={30}
                height={30}
                color={theme.COLORS.COMPONENTS.TEXT.PRIMARY_COLOR}
              />
            ) : (
              <PauseIcon
                width={30}
                height={30}
                color={theme.COLORS.COMPONENTS.TEXT.PRIMARY_COLOR}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={stopRecording}>
            <StopIcon
              width={30}
              height={30}
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
                <StopIcon width={28} height={28} color="#FFFFFF" />
              ) : (
                <PlayIcon width={28} height={28} color="#FFFFFF" />
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
              icon={<TrashIcon width={20} height={20} color="#FFFFFF" />}
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
                    width={20}
                    height={20}
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
  );
};

export default InlineVoiceRecorder;
