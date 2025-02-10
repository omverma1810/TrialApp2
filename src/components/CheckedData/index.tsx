import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { DropdownArrow } from '../../assets/icons/svgs';

const DropdownItem = ({ plot, entries }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownHeight = useRef(new Animated.Value(0)).current;

  const toggleDropdown = () => {
    Animated.timing(dropdownHeight, {
      toValue: isOpen ? 0 : entries.length * 150,
      duration: 800,
      useNativeDriver: false,
    }).start();
    setIsOpen(!isOpen);
  };

  const handleEditPress = () => {
    // Handle edit press
  };

  return (
    <View style={styles.itemContainer}>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.title}>{plot}</Text>
        </View>
        <TouchableOpacity onPress={toggleDropdown}>
          <DropdownArrow />
        </TouchableOpacity>
      </View>
      <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
        {entries.map((entry, index) => (
          <View key={index} style={styles.entryContainer}>
            <View style={styles.entryContent}>
              <View style={styles.projectContainer}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectHeaderText}>Recorded Traits (Number)</Text>
                </View>
                <View style={styles.projectBody}>
                  <View style={styles.entryDetails}>
                    <Text style={styles.entryDetailTitle}>Date of Sowing</Text>
                    <Text style={styles.entryDetailText}>{entry.date}</Text>
                  </View>
                  <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.projectBody}>
                  <View style={styles.entryDetails}>
                    <Text style={styles.entryDetailTitle}>Date of Sowing</Text>
                    <Text style={styles.entryDetailText}>{entry.date}</Text>
                  </View>
                  <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.notesContainer}>
                  <Text style={styles.notesTitle}>Notes</Text>
                  <View style={styles.note}>
                    <Text style={styles.noteText}>{entry.notes}</Text>
                    <Text style={styles.noteDate}>24 Sept</Text>
                  </View>
                </View>
                <View style={styles.unrecordedTraits}>
                  <Text style={styles.unrecordedTraitsText}>UnRecorded Traits</Text>
                  <TouchableOpacity>
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '400',
    color: '#161616',
  },
  dropdown: {
    overflow: 'hidden',
  },
  entryContainer: {
    marginTop: 10,
  },
  entryContent: {
    gap: 16,
    paddingVertical: 15,
  },
  projectContainer: {
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    overflow: 'hidden',
  },
  projectHeader: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  projectHeaderText: {
    color: '#161616',
    fontSize: 14,
    fontWeight: '500',
  },
  projectBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDetails: {
    gap: 5,
  },
  entryDetailTitle: {
    color: '#636363',
    fontWeight: '400',
    fontSize: 12,
  },
  entryDetailText: {
    color: '#161616',
    fontWeight: '500',
    fontSize: 14,
  },
  editButton: {
    flexDirection: 'row',
  },
  editButtonText: {
    color: '#1A6DD2',
    fontSize: 14,
    fontWeight: '500',
  },
  notesContainer: {
    gap: 10,
  },
  notesTitle: {
    color: 'black',
  },
  note: {
    backgroundColor: '#FDF8EE',
    padding: 16,
    borderRadius: 8,
    gap: 5,
  },
  noteText: {
    color: '#161616',
    fontSize: 14,
    fontWeight: '400',
  },
  noteDate: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '400',
  },
  unrecordedTraits: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  unrecordedTraitsText: {
    color: '#161616',
    fontSize: 14,
    fontWeight: '500',
  },
  viewButtonText: {
    color: '#1A6DD2',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DropdownItem;
