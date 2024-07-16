import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert,StyleSheet } from 'react-native';
import { SafeAreaView, StatusBar } from '../../../components';
import { useApi } from '../../../hooks/useApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { URL } from '../../../constants/URLS';

const EditNotes = ({ route, navigation }) => {
  const { id, content, experimentId, location,trail_type} = route.params;
  const [noteContent, setNoteContent] = useState(content);
  
  const [updateNote, updateNoteResponse] = useApi({
    url: `${URL.NOTES}${id}/`,
    method: 'PUT',
  });

  const handleUpdate = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      Alert.alert('Error', 'No token found');
      return;
    }

    if (!noteContent) {
      Alert.alert('Error', 'Please enter content before updating');
      return;
    }

    const payload = {
      content: noteContent
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-auth-token': token,
    };

    updateNote({ payload, headers });
  };

  useEffect(() => {
    if (updateNoteResponse) {
      if (updateNoteResponse.status_code === 200) {
        Alert.alert('Success', 'Note updated successfully');
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Failed to update note');
      }
    }
  }, [updateNoteResponse]);

  return (
    <SafeAreaView>
      <StatusBar />
      <View style={EditNotesStyles.container}>
        <View style={EditNotesStyles.textContainer}>
          <Text style={EditNotesStyles.label}>Experiment ID</Text>
          <Text style={EditNotesStyles.text}>{experimentId}</Text>
        </View>
        <View style={EditNotesStyles.textContainer}>
          <Text style={EditNotesStyles.label}>Trail Type</Text>
          <Text style={EditNotesStyles.text}>{trail_type}</Text>
        </View>
        <View style={EditNotesStyles.textContainer}>
          <Text style={EditNotesStyles.label}>Location</Text>
          <Text style={EditNotesStyles.text}>{location}</Text>
        </View>
        <View style={EditNotesStyles.inputContainer}>
          <Text style={EditNotesStyles.label}>Content</Text>
          <TextInput
            style={EditNotesStyles.input}
            multiline={true}
            value={noteContent}
            onChangeText={setNoteContent}
          />
        </View>
        <TouchableOpacity style={EditNotesStyles.submitButton} onPress={handleUpdate}>
          <Text style={EditNotesStyles.submitButtonText}>Update Note</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const EditNotesStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  textContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    color: 'black',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputText: {
    color: 'black',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#1A6DD2',
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 8,
    marginTop: 15,
  },
  submitButtonText: {
    color: '#F7F7F7',
    fontWeight: '500',
  },
});


export default EditNotes;

