import React, {useState} from 'react';
import {View, Text} from 'react-native';

import MyNoteStyles from './MyNotesStyles';
import Note from '../../../../components/Notes';
import {Notes as initialNotes} from '../../../../Data';

const MyNote = ({}) => {
  const [notes, setNotes] = useState(initialNotes);

  const handleDeleteNote = id => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  return (
    <View style={{}}>
      {notes.length > 0 && (
        <View style={MyNoteStyles.notesContainer}>
          <Text style={MyNoteStyles.notesTitle}>My Notes</Text>
          {notes.map((note, index) => (
            <Note key={index} note={note} onDelete={handleDeleteNote} />
          ))}
        </View>
      )}
    </View>
  );
};

export default MyNote;
