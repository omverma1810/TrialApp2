import React, {useRef} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Dots, Edit, Trash} from '../../assets/icons/svgs';
import BottomModal from '../BottomSheetModal';

const Notes = ({note, onDelete, onEdit}) => {
  const bottomSheetModalRef = useRef(null);
  const {bottom} = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.noteContainer}>
        <View style={styles.noteContent}>
          <Text style={styles.noteText}>{note.content}</Text>
          <Text style={styles.noteInfo}>
            Exp{note?.experiment_id || ''} - Field{note?.location || ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => bottomSheetModalRef.current?.present()}>
          <Dots />
        </TouchableOpacity>
      </View>

      <BottomModal
        bottomSheetModalRef={bottomSheetModalRef}
        type="CONTENT_HEIGHT"
        containerStyle={[
          styles.bottomModalContainer,
          {paddingBottom: bottom, height: 100},
        ]}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            onPress={() => {
              onDelete(note.id);
              bottomSheetModalRef.current?.close();
            }}
            style={styles.modalButton}>
            <Trash />
            <Text style={styles.modalButtonText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              onEdit(note);
              bottomSheetModalRef.current?.close();
            }}
            style={styles.modalButton}>
            <Edit />
            <Text style={styles.modalButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </BottomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  noteContainer: {
    backgroundColor: 'white',
    padding: 15,
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
  bottomModalContainer: {},
});

export default Notes;
