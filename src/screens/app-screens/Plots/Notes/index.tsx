import {Text, View} from 'react-native';
import React from 'react';
import {styles} from '../styles';

const Notes = () => {
  return (
    <View>
      <View style={styles.notesContainer}>
        <Text style={styles.notes}>Notes</Text>
      </View>
      <View style={styles.noteInfoContainer}>
        <Text style={styles.notesContent}>
          Some random notes taken a particular observation. May exceed to 2
          lines
        </Text>
        <Text style={styles.notesDate}>24 sept</Text>
      </View>
    </View>
  );
};

export default Notes;
