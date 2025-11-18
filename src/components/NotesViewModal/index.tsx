import React, {useEffect, useRef, useState, useCallback} from 'react';
import {View, Text, Pressable, StyleSheet, Platform} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {format} from 'date-fns';

import {Close, MatrixNote} from '../../assets/icons/svgs';
import {Loader} from '../index';
import useTheme from '../../theme/hooks/useTheme';
import {FONTS} from '../../theme/fonts';

// const {width} = Dimensions.get('window'); // unused

interface NotesViewModalProps {
  isVisible: boolean;
  notes: string;
  plotNumber?: string;
  fieldName?: string;
  lastUpdated?: string;
  plotId?: string | number;
  onClose: () => void;
  onEdit?: () => void; // Optional edit callback (if you want to use external edit modal)
  onSave?: (notes: string) => void | Promise<any>; // Callback for saving notes (sync or async)
  isSaving?: boolean; // Loading state for save operation
}

const NotesViewModal: React.FC<NotesViewModalProps> = ({
  isVisible,
  notes,
  plotNumber,
  fieldName,
  lastUpdated,
  plotId: _plotId,
  onClose,
  onEdit,
  onSave,
  isSaving = false,
}) => {
  const {COLORS} = useTheme();
  const {top, bottom} = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const textInputRef = useRef<any>(null);
  const editedNotesRef = useRef<string>('');
  const suppressOpenUntil = useRef<number>(0);

  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const snapPoints = React.useMemo(() => ['70%', '100%'], []);

  useEffect(() => {
    if (isVisible) {
      // avoid reopening immediately if we've recently dismissed or a save is in progress
      if (isSaving) {
        return;
      }
      if (Date.now() < (suppressOpenUntil.current || 0)) {
        return;
      }
      bottomSheetRef.current?.present();
      // Initialize notes only if not currently editing to avoid overwriting user's typing
      if (!isEditing) {
        setEditedNotes(notes);
        editedNotesRef.current = notes || '';
        setHasChanges(false);
      }
    } else {
      // avoid dismissing while a save is in progress or within suppression window
      if (isSaving || Date.now() < (suppressOpenUntil.current || 0)) {
        return;
      }
      bottomSheetRef.current?.dismiss();
      // set a short suppression window to avoid flicker if parent toggles isVisible quickly
      suppressOpenUntil.current = Date.now() + 700;
    }
  }, [isVisible, notes, isEditing, isSaving]);

  useEffect(() => {
    setHasChanges(editedNotes.trim() !== notes.trim());
  }, [editedNotes, notes]);

  // No manual keyboard listeners: rely on BottomSheetModal keyboardBehavior to avoid layout loops

  // When user starts editing, expand the sheet to full snap and focus the input.
  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        try {
          // prefer snapToIndex to reach the full height snap point (index 1)
          (bottomSheetRef.current as any)?.snapToIndex?.(1);
        } catch (e) {
          try {
            (bottomSheetRef.current as any)?.expand?.();
          } catch (err) {
            // ignore if expand not available
          }
        }
        // focus after sheet moved
        setTimeout(() => textInputRef.current?.focus?.(), 120);
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (onEdit) {
      // Use external edit modal - do not close the sheet here to keep it open
      onEdit();
    } else {
      // Use internal editing - focus will be handled by useEffect
      editedNotesRef.current = editedNotes || notes || '';
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!onSave) {
      return;
    }

    const toSave = (editedNotesRef.current ?? editedNotes ?? '').trim();
    if (toSave === (notes || '').trim()) {
      // nothing changed
      setHasChanges(false);
      setIsEditing(false);
      return;
    }

    // Set a suppression window to avoid parent toggles closing/reopening the sheet
    suppressOpenUntil.current = Date.now() + 2000; // 2s suppression during save

    // If onSave returns a promise, await it so we can keep the sheet open during network call
    try {
      const result: any = onSave(toSave);
      if (result && typeof result.then === 'function') {
        // show saving state by leaving isEditing true, and rely on isSaving prop for loader
        await result;
      }
      // update local view state immediately after successful save
      setEditedNotes(toSave);
      setHasChanges(false);
      setIsEditing(false);
    } catch (err) {
      // onSave failed; remove suppression but keep editing state so user can retry
      suppressOpenUntil.current = Date.now() + 300;
      // Rethrow or optionally surface error handling via parent
      // We keep the sheet open to let the user retry
    }
  };

  const handleCancel = useCallback(() => {
    editedNotesRef.current = notes || '';
    setEditedNotes(notes);
    setIsEditing(false);
    setHasChanges(false);
  }, [notes]);

  const handleClose = useCallback(() => {
    if (isEditing && hasChanges) {
      // Show confirmation dialog or just reset
      handleCancel();
    }
    onClose();
  }, [isEditing, hasChanges, onClose, handleCancel]);

  const renderBackdrop = React.useCallback(
    () => <Pressable style={styles.backdrop} onPress={handleClose} />,
    [handleClose],
  );

  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) {
      return '';
    }
    try {
      return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
    } catch {
      return dateString;
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={handleClose}
      enablePanDownToClose={!isEditing} // Disable swipe to close when editing
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={[
        styles.modalBackground,
        {backgroundColor: COLORS.COMPONENTS.BOTTOMSHEET_MODAL.BACKGROUND_COLOR},
      ]}>
      <BottomSheetView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, {paddingTop: top}]}>
          <View style={styles.headerLeft}>
            <View style={styles.headerTitleContainer}>
              <MatrixNote width={24} height={24} />
              <Text
                style={[
                  styles.headerTitle,
                  {color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR},
                ]}>
                {plotNumber ? `Plot ${plotNumber} - Notes` : 'Notes'}
                {isEditing && ' (Editing)'}
              </Text>
            </View>
            {fieldName && (
              <Text
                style={[
                  styles.headerSubtitle,
                  {color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR},
                ]}>
                {fieldName}
              </Text>
            )}
          </View>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Close />
          </Pressable>
        </View>

        {/* Notes Content */}
        <BottomSheetScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{
            paddingBottom: Platform.OS === 'ios' && isEditing ? 20 : 0,
          }}>
          {(notes && notes.trim()) || isEditing ? (
            <>
              <View style={styles.notesContainer}>
                {isEditing ? (
                  <BottomSheetTextInput
                    ref={textInputRef}
                    style={[
                      styles.notesInput,
                      {
                        color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
                        borderColor: COLORS.APP.SECONDARY_COLOR,
                      },
                    ]}
                    defaultValue={editedNotes}
                    onChangeText={(text: string) => {
                      // keep live text in ref only to avoid re-renders per keystroke
                      editedNotesRef.current = text;
                      // update a lightweight boolean so the Save button enables immediately
                      // without making the TextInput controlled (we avoid setting the full text state per keystroke)
                      const currentTrim = (text ?? '').trim();
                      setHasChanges(currentTrim !== (notes || '').trim());
                    }}
                    onBlur={() => {
                      const current = (editedNotesRef.current ?? '').trim();
                      setEditedNotes(current);
                      setHasChanges(current !== (notes || '').trim());
                    }}
                    multiline
                    textAlignVertical="top"
                    placeholder="Enter your notes here..."
                    placeholderTextColor={
                      COLORS.COMPONENTS.TEXT.SECONDARY_COLOR
                    }
                    autoFocus={false}
                    scrollEnabled={true}
                    blurOnSubmit={false}
                    returnKeyType="default"
                    keyboardType="default"
                    autoCorrect={true}
                    autoCapitalize="sentences"
                    enablesReturnKeyAutomatically={false}
                    clearButtonMode="never"
                    spellCheck={true}
                    contextMenuHidden={false}
                  />
                ) : (
                  <Text
                    style={[
                      styles.notesText,
                      {color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR},
                    ]}>
                    {notes.trim()}
                  </Text>
                )}
              </View>

              {/* Metadata */}
              {!isEditing && lastUpdated && (
                <View style={styles.metadataContainer}>
                  <Text
                    style={[
                      styles.metadataText,
                      {color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR},
                    ]}>
                    Last updated: {formatLastUpdated(lastUpdated)}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <MatrixNote width={48} height={48} color="#E0E0E0" />
              <Text
                style={[
                  styles.emptyText,
                  {color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR},
                ]}>
                No notes available for this plot
              </Text>
              <Pressable
                style={[
                  styles.addNotesButton,
                  {backgroundColor: COLORS.APP.SECONDARY_COLOR},
                ]}
                onPress={() => setIsEditing(true)}>
                <Text style={[styles.addNotesButtonText, {color: '#FFFFFF'}]}>
                  Add Notes
                </Text>
              </Pressable>
            </View>
          )}
        </BottomSheetScrollView>

        {/* Action Buttons */}
        <View style={[styles.actionContainer, {paddingBottom: bottom + 16}]}>
          {isEditing ? (
            <View style={styles.editingActions}>
              <Pressable
                style={[
                  styles.actionButton,
                  styles.cancelButton,
                  {borderColor: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR},
                ]}
                onPress={handleCancel}>
                <Text
                  style={[
                    styles.actionButtonText,
                    {color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR},
                  ]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: hasChanges
                      ? COLORS.APP.SECONDARY_COLOR
                      : COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
                  },
                  (!hasChanges || isSaving) && styles.disabledButton,
                ]}
                onPress={handleSave}
                disabled={!hasChanges || isSaving}>
                {isSaving ? (
                  <Loader size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.actionButtonText, {color: '#FFFFFF'}]}>
                    Save Changes
                  </Text>
                )}
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={[
                styles.actionButton,
                styles.singleActionButton,
                {backgroundColor: COLORS.APP.SECONDARY_COLOR},
              ]}
              onPress={handleEdit}>
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: '#FFFFFF',
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: '600',
                  },
                ]}>
                Edit Notes
              </Text>
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.SEMI_BOLD,
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
    opacity: 0.7,
    marginLeft: 32, // Align with title text (24px icon + 8px margin)
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 16,
  },
  notesContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  notesText: {
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
    lineHeight: 24,
  },
  notesInput: {
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
    lineHeight: Platform.OS === 'ios' ? 22 : 24,
    height: 140,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    includeFontPadding: false,
  },
  metadataContainer: {
    paddingHorizontal: 4,
  },
  metadataText: {
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  addNotesButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNotesButtonText: {
    fontSize: 16,
    fontFamily: FONTS.SEMI_BOLD,
  },
  actionContainer: {
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
  },
  editingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 44,
  },
  singleActionButton: {
    flex: 0, // Override flex for single button
    width: '100%',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: FONTS.SEMI_BOLD,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotesViewModal;
