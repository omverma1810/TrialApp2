import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { useApi } from '../../../../hooks/useApi';
import { URL } from '../../../../constants/URLS';
import MyNoteStyles from './MyNotesStyles';
import Notes from '../../../../components/Notes';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NavigationProp } from '@react-navigation/native';

const MyNote = ({navigation}: {navigation: NavigationProp<any>}) => {
  const [notes, setNotes] = useState<{ id: number }[]>([]);
  const [fetchNotes, fetchNotesResponse] = useApi({ 
    url: URL.NOTES,
    method: 'GET',
  });

  useEffect(() => {
    const getNotes = async () => {
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

      fetchNotes({ headers });
    };

    getNotes();
  }, []);

  useEffect(() => {
    if (fetchNotesResponse && fetchNotesResponse.status_code === 200) {
      setNotes(fetchNotesResponse.data);
    } else if (fetchNotesResponse) {
      Alert.alert('Error', 'Failed to fetch notes');
    }
  }, [fetchNotesResponse]);

  const handleDeleteNote = (id: any) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };


  return (
    <View style={{ flex: 1, padding: 20 }}>
      {notes.length > 0 && (
        <View style={MyNoteStyles.notesContainer}>
          <Text style={MyNoteStyles.notesTitle}>My Notes</Text>
          {notes.map((note, index) => (
            <Notes key={index} note={note} onDelete={handleDeleteNote} navigation={navigation} refreshNotes={fetchNotes}/>
          ))}
        </View>
      )}
    </View>
  );
};

export default MyNote;
