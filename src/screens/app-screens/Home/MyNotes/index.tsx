import React, {useState, useEffect,useCallback} from 'react';
import {View, Text, Alert} from 'react-native';
import {useApi} from '../../../../hooks/useApi';
import {URL} from '../../../../constants/URLS';
import MyNoteStyles from './MyNotesStyles';
import Notes from '../../../../components/Notes';
import { useFocusEffect } from '@react-navigation/native';
import {useIsFocused} from '@react-navigation/native';

import {NavigationProp} from '@react-navigation/native';
import Toast from '../../../../utilities/toast';

type NoteType = {
  id: number;
  user_id: number;
  content: string;
  location: number;
  trial_type: string | null;
  experiment_id: number | null;
};
// {navigation: NavigationProp<any>}
const MyNote = ({navigation,refresh}: any ) => {  
  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      if (refresh) {
        fetchNotes();
        console.log('Refreshing Home screen');
        navigation.setParams({ refresh: false });
      }
    }, [refresh])
  );

  const [notes, setNotes] = useState<{id: number}[]>([]);
  const [fetchNotes, fetchNotesResponse] = useApi({
    url: URL.NOTES,
    method: 'GET',
  });

  useEffect(() => {
    isFocused && fetchNotes();
  }, [isFocused]);

  useEffect(() => {
    if (fetchNotesResponse && fetchNotesResponse.status_code === 200) {
      setNotes(fetchNotesResponse.data);
      // console.log(fetchNotesResponse.data)
    } else if (fetchNotesResponse) {
      Toast.error({
        message:'Failed to fetch notes'
      })
    }
  }, [fetchNotesResponse]); 

  const handleDeleteNote = (id: any) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  const handleEditNote = (note: NoteType | unknown) => {
    console.log(note);
    navigation.navigate('TakeNotes', {data: note});
  };

  return (
    <View style={{flex: 1, padding: 20}}>
      {notes.length > 0 && (
        <View style={MyNoteStyles.notesContainer}>
          <Text style={MyNoteStyles.notesTitle}>My Notes</Text>
          {notes.map((note, index) => (
            <Notes
              key={index}
              note={note}
              onDelete={handleDeleteNote}
              navigation={navigation}
              refreshNotes={fetchNotes}
              onEdit={handleEditNote}
            /> 
          ))}
        </View>
      )}
    </View>
  );
}; 

export default MyNote;