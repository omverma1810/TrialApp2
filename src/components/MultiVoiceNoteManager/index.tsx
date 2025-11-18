import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Text from '../Text';
import Button from '../Button';
import InlineVoiceRecorder from '../InlineVoiceRecorder';
import {useAppSelector} from '../../store';
import Toast from '../../utilities/toast';
import {useApi} from '../../hooks/useApi';
import {URL} from '../../constants/URLS';
import {
  Play as PlayIcon,
  Trash as TrashIcon,
  Plus as PlusIcon,
  Stop as StopIcon,
  Microphone as MicrophoneIcon,
  Pause as PauseIcon,
  DeleteBin,
} from '../../assets/icons/svgs';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const MAX_VOICE_NOTES = 3;
const MAX_DURATION_PER_NOTE = 180; // 3 minutes in seconds

interface VoiceNote {
  id: string;
  fileName: string;
  duration: number;
  mimeType: string;
  timestamp: number;
  audioBase64?: string;
  isUploaded: boolean;
  url?: string; // Add URL for playback from server
  audioPath?: string; // S3 path
  uploadedOn?: string; // Upload timestamp
  locationName?: string; // Location name
  lat?: number; // Latitude
  long?: number; // Longitude
}

interface MultiVoiceNoteManagerProps {
  plotNumber: string;
  fieldName: string;
  plotId?: string | number;
  experimentType?: string;
  existingVoiceNotes?: VoiceNote[];
  onUpload: (voiceNoteData: {
    audioBase64: string;
    fileName: string;
    duration: number;
    mimeType: string;
    timestamp: number;
  }) => Promise<void>;
  isUploading?: boolean;
  onVoiceNoteDeleted?: () => void;
  onRefreshPlotList?: () => void;
}

const MultiVoiceNoteManager: React.FC<MultiVoiceNoteManagerProps> = ({
  plotNumber,
  fieldName,
  plotId,
  experimentType,
  existingVoiceNotes = [],
  onUpload,
  isUploading = false,
  onVoiceNoteDeleted,
  onRefreshPlotList,
}) => {
  const {theme} = useAppSelector(state => state.theme);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>(existingVoiceNotes);
  const [isRecordingNew, setIsRecordingNew] = useState(false);
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  const [audioPlayer] = useState(() => new AudioRecorderPlayer());
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
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

  useEffect(() => {
    setVoiceNotes(existingVoiceNotes);
  }, [existingVoiceNotes]);

  useEffect(() => {
    return () => {
      // Cleanup audio player on unmount
      try {
        audioPlayer.stopPlayer();
      } catch (error) {
        // Ignore cleanup errors
      }
    };
  }, [audioPlayer]);

  // Handle voice note deletion response
  useEffect(() => {
    if (!deletionInitiated) return;
    if (!deleteVoiceNoteResponse && !deleteVoiceNoteError) return;

    setDeletingNoteId(null);
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

      // Call the refresh callback to update the plot list
      if (onRefreshPlotList) {
        onRefreshPlotList();
      }

      // Notify parent component about the deletion
      if (onVoiceNoteDeleted) {
        onVoiceNoteDeleted();
      }
    }
  }, [
    deleteVoiceNoteResponse,
    deleteVoiceNoteError,
    deletionInitiated,
    onVoiceNoteDeleted,
    onRefreshPlotList,
  ]);

  const canAddMoreNotes = voiceNotes.length < MAX_VOICE_NOTES;

  const handleStartNewRecording = () => {
    if (!canAddMoreNotes) {
      Toast.info({
        message: `Maximum of ${MAX_VOICE_NOTES} voice notes allowed per plot.`,
      });
      return;
    }
    setIsRecordingNew(true);
  };

  const handleCancelNewRecording = () => {
    setIsRecordingNew(false);
  };

  const handleUploadNewNote = async (voiceNoteData: {
    audioBase64: string;
    fileName: string;
    duration: number;
    mimeType: string;
  }) => {
    try {
      const timestamp = Date.now();
      await onUpload({
        ...voiceNoteData,
        timestamp,
      });

      // Add to local list for UI display
      const newNote: VoiceNote = {
        id: `${timestamp}`,
        fileName: voiceNoteData.fileName,
        duration: voiceNoteData.duration,
        mimeType: voiceNoteData.mimeType,
        timestamp,
        isUploaded: true,
      };

      setVoiceNotes(prev => [...prev, newNote]);
      setIsRecordingNew(false);

      Toast.success({
        message: `Voice note ${
          voiceNotes.length + 1
        } of ${MAX_VOICE_NOTES} uploaded successfully!`,
      });
    } catch (error) {
      console.error('Failed to upload voice note:', error);
      Toast.error({
        message: 'Failed to upload voice note. Please try again.',
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const noteToDelete = voiceNotes.find(note => note.id === noteId);

    console.log('🔍 Delete Voice Note Debug:');
    console.log('  - noteId:', noteId);
    console.log('  - noteToDelete:', noteToDelete);
    console.log('  - plotId:', plotId);
    console.log('  - experimentType:', experimentType);
    console.log('  - audioPath:', noteToDelete?.audioPath);

    if (!noteToDelete) {
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

    if (!noteToDelete.audioPath) {
      Toast.error({message: 'Audio path not available for deletion'});
      console.error('❌ Missing audioPath for note:', noteToDelete);
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
            setDeletingNoteId(noteId);
            setDeletionInitiated(true);

            const payload = {
              plot_id: plotId,
              delete_type: 'audio',
              experiment_type: experimentType,
              audio_path: noteToDelete.audioPath,
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

  const handlePlayNote = async (note: VoiceNote) => {
    // Check if URL is available
    if (!note.url) {
      Toast.info({
        message: 'Voice note playback URL not available.',
      });
      return;
    }

    try {
      // Stop any currently playing audio
      if (playingNoteId) {
        await audioPlayer.stopPlayer();
        setPlayingNoteId(null);
      }

      // Start playing the selected note
      setPlayingNoteId(note.id);
      await audioPlayer.startPlayer(note.url);

      audioPlayer.addPlayBackListener(e => {
        // Check if playback finished
        if (e.currentPosition >= e.duration) {
          audioPlayer.stopPlayer();
          setPlayingNoteId(null);
        }
      });

      Toast.success({
        message: 'Playing voice note...',
      });
    } catch (error) {
      console.error('Failed to play voice note:', error);
      Toast.error({
        message: 'Failed to play voice note. Please try again.',
      });
      setPlayingNoteId(null);
    }
  };

  const handleStopNote = async () => {
    try {
      await audioPlayer.stopPlayer();
      audioPlayer.removePlayBackListener();
      setPlayingNoteId(null);
    } catch (error) {
      console.error('Failed to stop voice note:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    header: {
      marginBottom: 16,
    },
    headerText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
      marginBottom: 4,
    },
    counterText: {
      fontSize: 14,
      color: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
    },
    limitText: {
      fontSize: 12,
      color: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
      marginTop: 2,
    },
    voiceNotesList: {
      marginBottom: 16,
    },
    voiceNoteCard: {
      backgroundColor: theme.COLORS.APP.BACKGROUND_COLOR,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR + '30',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    voiceNoteHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 8,
    },
    voiceIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    voiceNoteHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    voiceNoteTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
    },
    voiceNoteInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    voiceNoteInfoText: {
      fontSize: 13,
      color: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
    },
    voiceNoteActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flex: 1,
    },
    addButton: {
      marginBottom: 16,
    },
    emptyState: {
      backgroundColor: theme.COLORS.APP.BACKGROUND_COLOR,
      borderRadius: 12,
      padding: 24,
      marginBottom: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR + '40',
    },
    emptyStateText: {
      fontSize: 14,
      color: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
      textAlign: 'center',
      marginBottom: 4,
    },
    emptyStateSubtext: {
      fontSize: 12,
      color: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
      textAlign: 'center',
    },
    recorderContainer: {
      marginBottom: 16,
    },
    cancelButton: {
      marginTop: 12,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Voice Notes</Text>
        <Text style={styles.counterText}>
          {voiceNotes.length} of {MAX_VOICE_NOTES} recorded
        </Text>
        <Text style={styles.limitText}>
          Maximum {MAX_VOICE_NOTES} voice notes per plot • 3 minutes each
        </Text>
      </View>

      {voiceNotes.length === 0 && !isRecordingNew && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No voice notes recorded yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Record up to {MAX_VOICE_NOTES} voice notes for this plot
          </Text>
        </View>
      )}

      {voiceNotes.length > 0 && (
        <ScrollView style={styles.voiceNotesList}>
          {voiceNotes.map((note, index) => (
            <View key={note.id} style={styles.voiceNoteCard}>
              <View style={styles.voiceNoteHeaderRow}>
                {/* Microphone Icon */}
                <View style={styles.voiceIconContainer}>
                  <MicrophoneIcon
                    width={24}
                    height={24}
                    color={theme.COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR}
                    strokeWidth={2}
                  />
                </View>

                {/* Title and Status */}
                <View style={{flex: 1}}>
                  <View style={styles.voiceNoteHeader}>
                    <Text style={styles.voiceNoteTitle}>
                      Voice Note {index + 1}
                    </Text>
                    {note.isUploaded && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#4CAF50',
                          fontWeight: '500',
                        }}>
                        ✓ Uploaded
                      </Text>
                    )}
                  </View>

                  <View style={styles.voiceNoteInfo}>
                    {/* <Text style={styles.voiceNoteInfoText}>
                      {formatDuration(note.duration)}
                    </Text>
                    <Text style={styles.voiceNoteInfoText}>•</Text> */}
                    <Text style={styles.voiceNoteInfoText}>
                      {formatDate(note.timestamp)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Show location if available */}
              {note.locationName && (
                <View style={{marginTop: 8, marginBottom: 8}}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
                      lineHeight: 16,
                    }}
                    numberOfLines={2}>
                    📍 {note.locationName}
                  </Text>
                </View>
              )}

              {/* Play/Pause and Delete buttons */}
              {note.url && (
                <View style={styles.voiceNoteActions}>
                  {/* Play/Pause Button */}
                  <View
                    style={[styles.actionButton, {flex: 1, marginRight: 8}]}>
                    <Button
                      title={playingNoteId === note.id ? 'Pause' : 'Play'}
                      onPress={() => {
                        if (playingNoteId === note.id) {
                          handleStopNote();
                        } else {
                          handlePlayNote(note);
                        }
                      }}
                      containerStyle={{
                        backgroundColor:
                          theme.COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR,
                        paddingVertical: 10,
                      }}
                      icon={
                        playingNoteId === note.id ? (
                          <PauseIcon width={18} height={18} color="#FFFFFF" />
                        ) : (
                          <PlayIcon width={18} height={18} color="#FFFFFF" />
                        )
                      }
                    />
                  </View>

                  {/* Delete Button */}
                  <View style={[styles.actionButton, {flex: 1, marginLeft: 8}]}>
                    <Button
                      title="Delete"
                      onPress={() => handleDeleteNote(note.id)}
                      disabled={
                        deletingNoteId === note.id || isDeletingVoiceNote
                      }
                      loading={deletingNoteId === note.id}
                      containerStyle={{
                        backgroundColor: '#FEE2E2',
                        paddingVertical: 10,
                        borderWidth: 1,
                        borderColor: '#FECACA',
                        opacity: deletingNoteId === note.id ? 0.6 : 1,
                      }}
                      customLabelStyle={{
                        color: '#EF4444',
                        fontWeight: '600',
                      }}
                      loaderProps={{
                        color: '#EF4444',
                      }}
                      icon={
                        deletingNoteId !== note.id ? (
                          <DeleteBin width={24} height={24} color="#EF4444" />
                        ) : undefined
                      }
                    />
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {isRecordingNew ? (
        <View style={styles.recorderContainer}>
          <InlineVoiceRecorder
            plotNumber={plotNumber}
            fieldName={fieldName}
            onUpload={handleUploadNewNote}
            isUploading={isUploading}
            autoStart={false}
          />
          <View style={styles.cancelButton}>
            <Button
              title="Cancel Recording"
              onPress={handleCancelNewRecording}
              containerStyle={{
                backgroundColor: theme.COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
              }}
            />
          </View>
        </View>
      ) : (
        canAddMoreNotes && (
          <View style={styles.addButton}>
            <Button
              title={`Add Voice Note ${
                voiceNotes.length > 0
                  ? `(${voiceNotes.length + 1}/${MAX_VOICE_NOTES})`
                  : ''
              }`}
              onPress={handleStartNewRecording}
              disabled={isUploading}
              containerStyle={{
                backgroundColor: theme.COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR,
              }}
              icon={
                isUploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <PlusIcon width={20} height={20} color="#FFFFFF" />
                )
              }
            />
          </View>
        )
      )}

      {!canAddMoreNotes && !isRecordingNew && (
        <View
          style={{
            backgroundColor: '#FFF3CD',
            borderRadius: 8,
            padding: 12,
            marginTop: 8,
          }}>
          <Text
            style={{
              fontSize: 13,
              color: '#856404',
              textAlign: 'center',
            }}>
            Maximum voice notes ({MAX_VOICE_NOTES}) reached for this plot
          </Text>
        </View>
      )}
    </View>
  );
};

export default MultiVoiceNoteManager;
