import React, {useEffect, useRef, useState} from 'react';
import {View, Text, Pressable, StyleSheet, Alert} from 'react-native';
import BottomModal from '../BottomSheetModal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Dots, Trash, DbEdit} from '../../assets/icons/svgs';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useApi} from '../../hooks/useApi';
import {URL} from '../../constants/URLS';
import {FONTS} from '../../theme/fonts';
import Toast from '../../utilities/toast';

const Notes = ({note, onDelete, navigation, refreshNotes, onEdit}: any) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const {bottom} = useSafeAreaInsets();

  const [deleteNote, deleteNoteResponse] = useApi({
    url: URL.NOTES.replace(/\/$/, ''),
    method: 'DELETE',
  });
  const onDeleteNote = async () => {
    deleteNote({pathParams: note.id});
  };

  React.useEffect(() => {
    if (deleteNoteResponse) {
      if (deleteNoteResponse.status_code === 204) {
        Toast.success({
          message: 'Note deleted successfully',
        });
        onDelete(note.id);
        bottomSheetModalRef.current?.close();
      } else {
        Toast.error({
          message: 'Failed to delete note',
        });
      }
    }
  }, [deleteNoteResponse]);

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={toggleExpanded}>
        <View style={styles.noteContainer}>
          <View style={styles.noteContent}>
            <Text
              style={styles.noteText}
              numberOfLines={isExpanded ? undefined : 2}
              ellipsizeMode="tail">
              {note.content}
            </Text>
            <Text style={styles.noteInfo}>
              {note.experiment_name} - [{note.villageName}]
            </Text>
          </View>
          <Pressable onPress={() => bottomSheetModalRef.current?.present()}>
            <Dots />
          </Pressable>
        </View>
      </Pressable>

      <BottomModal
        bottomSheetModalRef={bottomSheetModalRef}
        type="CONTENT_HEIGHT"
        containerStyle={[
          styles.bottomModalContainer,
          {paddingBottom: bottom, height: 100},
        ]}>
        <View style={styles.modalContent}>
          <Pressable onPress={onDeleteNote} style={styles.modalButton}>
            <Trash />
            <Text style={styles.modalButtonText}> Delete</Text>
          </Pressable>
          <Pressable
            style={styles.modalButton}
            onPress={() => {
              onEdit(note);
              bottomSheetModalRef.current?.close();
            }}>
            <DbEdit />
            <Text style={styles.editOptionText}>Edit</Text>
          </Pressable>
        </View>
      </BottomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  noteContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F7F7F7',
  },
  noteContent: {
    justifyContent: 'space-between',
    width: '90%',
    gap: 5,
  },
  noteText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: FONTS.MEDIUM,
    color: '#161616',
  },
  noteInfo: {
    fontSize: 13,
    fontWeight: '400',
    color: '#949494',
  },
  modalContent: {
    paddingHorizontal: 20,
    gap: 20,
    paddingVertical: 10,
  },
  modalButton: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#161616',
    fontSize: 15,
    fontWeight: '400',
  },
  editOptionText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#161616',
    fontWeight: '400',
    marginHorizontal: 20,
  },
  bottomModalContainer: {},
});

export default Notes;
