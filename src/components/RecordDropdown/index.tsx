import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, ScrollView, Dimensions, Modal } from 'react-native';
import { DropdownArrow, Edit, FieldSybol1 } from '../../assets/icons/svgs';
import Calendar from '../Calender';
import { useNavigation } from '@react-navigation/native';

const RecordDropDown = ({ selectedFields, projectData }) => {
  const [dropdownStates, setDropdownStates] = useState(
    Object.fromEntries(
      Object.keys(selectedFields).flatMap(field =>
        projectData[field].map((_, index) => [`${field}_${index}`, false])
      )
    )
  );

  const toggleDropdown = (field, index) => {
    setDropdownStates(prevState => ({
      ...prevState,
      [`${field}_${index}`]: !prevState[`${field}_${index}`]
    }));
  };

  return (
    <ScrollView>
      {Object.keys(selectedFields).map(field => (
        selectedFields[field] && (
          <ProjectContainer
            key={field}
            title={field}
            data={projectData[field]}
            dropdownStates={dropdownStates}
            toggleDropdown={(index) => toggleDropdown(field, index)}
          />
        )
      ))}
    </ScrollView>
  );
};

const ProjectContainer = ({ title, data, dropdownStates, toggleDropdown }) => {
  return (
    <View style={styles.paddingVertical}>
      <View style={[styles.projectContainer, styles.projectContainerBackground]}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{title}</Text>
          <FieldSybol1 />
        </View>
        <View style={styles.contentContainer}>
          {data.map((item, index) => (
            <ItemComponent
              key={index}
              title={item.plot}
              entries={item.entries}
              dropdownState={dropdownStates[`${title}_${index}`]}
              toggleDropdown={() => toggleDropdown(index)}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const ItemComponent = ({ title, entries, dropdownState, toggleDropdown }) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const bottomSheetModalRef = useRef(null);

  const [dropdownHeight] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(dropdownHeight, {
      toValue: dropdownState ? 375 : 0,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [dropdownState]);

  const handleEditPress = () => {
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleOk = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.itemContainer}>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <TouchableOpacity onPress={toggleDropdown}>
          <DropdownArrow />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
        {dropdownState && entries.map((entry, index) => (
          <View style={styles.entryContainer} key={index}>
            <View style={styles.projectContainer1}>
              <View style={styles.padding}>
                <Text style={styles.recordedTraitsText}>Recorded Traits (Number)</Text>
              </View>
              <View style={styles.borderRadiusOverflow}>
                <View style={styles.entryRow}>
                  <View style={styles.entryColumn}>
                    <Text style={styles.entryLabel}>Date of Sowing</Text>
                    <Text style={styles.entryValue}>{entry.date}</Text>
                  </View>
                  <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.entryRow}>
                  <View style={styles.entryColumn}>
                    <Text style={styles.entryLabel}>Flowering Date</Text>
                    <Text style={styles.entryValue}>{entry.date}</Text>
                  </View>
                  <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>Notes</Text>
              <View style={styles.notesContent}>
                <Text style={styles.notesText}>{entry.notes}</Text>
                <Text style={styles.notesDate}>24 sept</Text>
              </View>
            </View>
            <View style={styles.unrecordedTraitsRow}>
              <Text style={styles.unrecordedTraitsText}>UnRecorded Traits</Text>
              <TouchableOpacity>
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </Animated.View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <View style={styles.modalContainer}>
          <Calendar
            modalVisible={modalVisible}
            onCancel={handleCancel}
            onOk={handleOk}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  projectContainer: {
    borderRadius: 6,
    width: Dimensions.get('window').width - 40,
  },
  projectContainerBackground: {
    backgroundColor: '#F7F7F7',
  },
  paddingVertical: {
    paddingVertical: 15,
  },
  header: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    gap: 10,
  },
  headerText: {
    color: '#161616',
    fontSize: 14,
    fontWeight: '500',
  },
  contentContainer: {
    borderRadius: 6,
    overflow: 'hidden',
    paddingHorizontal: 1,
    marginBottom: 1,
    gap: 1,
  },
  itemContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
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
    gap: 16,
    paddingVertical: 15,
  },
  projectContainer1: {
    borderRadius: 6,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#F7F7F7',
  },
  padding: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  recordedTraitsText: {
    color: '#161616',
    fontSize: 14,
    fontWeight: '500',
  },
  borderRadiusOverflow: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  entryRow: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryColumn: {
    gap: 5,
  },
  entryLabel: {
    color: '#636363',
    fontWeight: '400',
    fontSize: 12,
  },
  entryValue: {
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
  notesContent: {
    backgroundColor: '#FDF8EE',
    padding: 16,
    borderRadius: 8,
    gap: 5,
  },
  notesText: {
    color: '#161616',
    fontSize: 14,
    fontWeight: '400',
  },
  notesDate: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '400',
  },
  unrecordedTraitsRow: {
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default RecordDropDown;
