import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import BottomModal from '../BottomSheetModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dots, Trash, Edit } from '../../assets/icons/svgs';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useApi } from '../../hooks/useApi';
import { URL } from '../../constants/URLS';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Notes = ({ note, onDelete ,navigation,refreshNotes}:any) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { bottom } = useSafeAreaInsets();

  const [deleteNote, deleteNoteResponse] = useApi({
    url: `${URL.NOTES}${note.id}`,
    method: 'DELETE',
  });

  const onDeleteNote = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'No token found');
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-auth-token': token,
    };

    deleteNote({ headers });
  };

  React.useEffect(() => {
    if (deleteNoteResponse) {
      if (deleteNoteResponse.status_code === 200) {
        Alert.alert('Success', 'Note deleted successfully');
        onDelete(note.id);
      } else {
        Alert.alert('Error', 'Failed to delete note');
      }
    }
  }, [deleteNoteResponse]);

    // const handleEdit = () => {
    //   bottomSheetModalRef.current?.close()
    //   navigation.navigate('EditNotes',{
    //     title: 'Edit Visit',
    //     id: note.id,
    //     content:note.content,
    //     location : note.location,
    //     experimentId: note.experiment_id, 
    //     trail_type : note.trail_type
    //   });
    //   refreshNotes()
    // };
  return (
    <View style={styles.container}>
      <View style={styles.noteContainer}>
        <View style={styles.noteContent}>
          <Text style={styles.noteText}>{note.content}</Text>
          <Text style={styles.noteInfo}>Exp {note.experiment_id} - Field {note.location}</Text>
        </View>
        <TouchableOpacity onPress={() => bottomSheetModalRef.current?.present()}>
          <Dots />
        </TouchableOpacity>
      </View>

      <BottomModal
        bottomSheetModalRef={bottomSheetModalRef}
        type="CONTENT_HEIGHT"
        containerStyle={[styles.bottomModalContainer, { paddingBottom: bottom, height: 100 }]}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={onDeleteNote} style={styles.modalButton}>
            <Trash />
            <Text style={styles.modalButtonText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton}>
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
