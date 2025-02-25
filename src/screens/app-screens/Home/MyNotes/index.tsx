import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, Alert, TouchableOpacity} from 'react-native';
import {useApi} from '../../../../hooks/useApi';
import {URL} from '../../../../constants/URLS';
import MyNoteStyles from './MyNotesStyles';
import Notes from '../../../../components/Notes';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import Toast from '../../../../utilities/toast';
import Svg, {Path} from 'react-native-svg';

type NoteType = {
  id: number;
  user_id: number;
  content: string;
  location: number;
  trial_type: string | null;
  experiment_id: number | null;
  created_on: string;
};

const MyNote = ({navigation, refresh}: any) => {
  const isFocused = useIsFocused();

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  useFocusEffect(
    useCallback(() => {
      if (refresh) {
        fetchNotes();
        console.log('Refreshing Home screen');
        navigation.setParams({refresh: false});
      }
    }, [refresh]),
  );

  const [notes, setNotes] = useState<NoteType[]>([]);
  const [fetchNotes, fetchNotesResponse] = useApi({
    url: URL.NOTES,
    method: 'GET',
  });

  useEffect(() => {
    if (isFocused) {
      fetchNotes();
    }
  }, [isFocused]);

  useEffect(() => {
    if (fetchNotesResponse && fetchNotesResponse.status_code === 200) {
      setNotes(fetchNotesResponse.data);
    } else if (fetchNotesResponse) {
      Toast.error({
        message: 'Failed to fetch notes',
      });
    }
  }, [fetchNotesResponse]);

  const handleDeleteNote = (id: number) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  const handleEditNote = (note: NoteType | unknown) => {
    console.log(note);
    navigation.navigate('TakeNotes', {data: note});
  };

  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = new Date(a.created_on);
    const dateB = new Date(b.created_on);
    return sortOrder === 'asc'
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  });

  return (
    <View style={{flex: 1, padding: 5}}>
      {notes.length > 0 && (
        <View style={MyNoteStyles.notesContainer}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={MyNoteStyles.notesTitle}>My Notes</Text>
            <TouchableOpacity
              onPress={toggleSortOrder}
              style={{flexDirection: 'row', alignItems: 'center'}}>
              {sortOrder === 'asc' ? (
                <Svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1A6DD2"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <Path d="M6 15l6-6 6 6" />
                </Svg>
              ) : (
                <Svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1A6DD2"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <Path d="M6 9l6 6 6-6" />
                </Svg>
              )}
              <Text style={{color: '#1A6DD2', marginLeft: 4}}>
                {sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
              </Text>
            </TouchableOpacity>
          </View>

          {sortedNotes.map((note, index) => (
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
