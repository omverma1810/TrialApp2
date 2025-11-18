import React, {useEffect, useRef, useState} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import BottomModal from '../BottomSheetModal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Dots, Trash, DbEdit} from '../../assets/icons/svgs';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useApi} from '../../hooks/useApi';
import {URL} from '../../constants/URLS';
import {FONTS} from '../../theme/fonts';
import Toast from '../../utilities/toast';
import dayjs from 'dayjs';

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

  useEffect(() => {
    if (deleteNoteResponse) {
      if (deleteNoteResponse.status_code === 204) {
        Toast.success({message: 'Note deleted successfully'});
        onDelete(note.id);
        bottomSheetModalRef.current?.close();
      } else {
        Toast.error({message: 'Failed to delete note'});
      }
    }
  }, [deleteNoteResponse]);

  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded(e => !e);

  return (
    <View style={styles.container}>
      <Pressable onPress={toggleExpanded}>
        <View style={styles.noteContainer}>
          {/* —— Left column: badges + text —— */}
          <View style={styles.leftColumn}>
            {/* Badge row */}
            <View style={styles.tagContainer}>
              <View style={[styles.tag, {backgroundColor: '#E6F7E8'}]}>
                <Text style={[styles.tagText, {color: '#097C34'}]}>
                  {note.crop_name}
                </Text>
              </View>
              <View style={[styles.tag, {backgroundColor: '#FFF6E0'}]}>
                <Text style={[styles.tagText, {color: '#B98F00'}]}>
                  {`${note.season} (${note.year})`}
                </Text>
              </View>
              {note.trial_type && (
                <View style={[styles.tag, {backgroundColor: '#FFEAEA'}]}>
                  <Text style={[styles.tagText, {color: '#C53030'}]}>
                    {note.trial_type}
                  </Text>
                </View>
              )}
            </View>

            {/* Note content */}
            <View style={styles.noteContent}>
              <Text style={styles.noteHeading}>
                {note.fieldLabel} - {note.experiment_name}
              </Text>
              <Text
                style={styles.noteText}
                numberOfLines={isExpanded ? undefined : 2}
                ellipsizeMode="tail">
                {note.content}
              </Text>
              <Text style={styles.noteTimestamp}>
                {dayjs(note.created_on).format('DD-MM-YYYY hh:mm A')}
              </Text>
            </View>
          </View>

          {/* —— Right column: dots menu —— */}
          <Pressable onPress={() => bottomSheetModalRef.current?.present()}>
            <Dots />
          </Pressable>
        </View>
      </Pressable>

      {/* —— Bottom sheet: Delete / Edit —— */}
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
            <Text style={styles.modalButtonText}>Delete</Text>
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

  // card UI
  noteContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F7F7F7',
    marginBottom: 10,
  },

  // left side of card: badges + text
  leftColumn: {
    width: '90%',
  },

  // badge row
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // note text
  noteContent: {
    justifyContent: 'space-between',
    gap: 5,
  },
  noteHeading: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.MEDIUM,
    color: '#161616',
  },
  noteTimestamp: {
    fontSize: 13,
    fontWeight: '400',
    color: '#949494',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: FONTS.REGULAR,
    color: '#949494',
  },
  noteInfo: {
    fontSize: 13,
    fontWeight: '400',
    color: '#949494',
  },

  // bottom sheet
  bottomModalContainer: {},
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
    fontSize: 15,
    color: '#161616',
    fontWeight: '400',
  },
  editOptionText: {
    fontSize: 15,
    color: '#161616',
    fontWeight: '400',
    marginLeft: 10,
  },
});

export default Notes;
