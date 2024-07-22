import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';

import Note from '../../../../components/Notes';
import {URL} from '../../../../constants/URLS';
import {useApi} from '../../../../hooks/useApi';
import MyNoteStyles from './MyNotesStyles';

type NoteType = {
  id: number;
  user_id: number;
  content: string;
  location: number;
  trial_type: string | null;
  experiment_id: number | null;
};
const MyNote = ({navigation}) => {
  const [getNotes, getNotesResponse] = useApi({
    url: URL.NOTES,
    method: 'GET',
  });
  const [deleteNotes, deleteNotesResponse] = useApi({
    url: URL.NOTES,
    method: 'DELETE',
  });
  const [notes, setNotes] = useState<NoteType[]>([]);
  useEffect(() => {
    getNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (getNotesResponse && getNotesResponse.status_code === 200) {
      let notes_ = getNotesResponse.data.filter(i => i.experiment_name);
      setNotes(notes_);
    }
  }, [getNotesResponse]);

  const handleDeleteNote = (id: number) => {
    deleteNotes({pathParams: String(id)});
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  const handleEditNote = (note: NoteType | unknown) => {
    console.log(note);
    navigation.navigate('TakeNotes', {data: note});
  };

  return (
    <View style={{}}>
      {notes.length > 0 && (
        <View style={MyNoteStyles.notesContainer}>
          <Text style={MyNoteStyles.notesTitle}>My Notes</Text>
          {notes.map((note, index) => (
            <Note
              key={index}
              note={note}
              onDelete={handleDeleteNote}
              onEdit={handleEditNote}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default MyNote;
