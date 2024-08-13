import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { DropdownArrow, FieldSybol1 } from '../../assets/icons/svgs';
import Calendar from '../Calender';
import { projectData } from '../../screens/app-screens/Record/Data';
import { useApi } from '../../hooks/useApi';
import { URL } from '../../constants/URLS';
import ValueInputCard from '../../screens/app-screens/Record/ValueInputCard';

type selectedFieldsType = {
  [key: string]: boolean;
};


const RecordDropDown = ({ selectedFields, projectData ,experimentType}: { selectedFields: selectedFieldsType, projectData: any,experimentType:(string|null) }) => {
  console.log('plotDataaaaa', projectData)
  const [dropdownStates, setDropdownStates] = useState(
    Object.fromEntries(
      Object.keys(selectedFields).flatMap(field =>
        projectData.length > 0 && projectData[0]?.plotData
          ? projectData[0].plotData.map((_: any, index: number) => [`${field}_${index}`, false])
          : []
      )
    )
  );


  const toggleDropdown = (field: any, index: number) => {
    setDropdownStates(prevState => ({
      ...prevState,
      [`${field}_${index}`]: !prevState[`${field}_${index}`],
    }));
  };

  return (
    <ScrollView>
      {Object.keys(selectedFields).map(
        field =>
          selectedFields[field] && (
            <ProjectContainer
              key={field}
              title={field}
              data={projectData && projectData[0].plotData}
              projectData={projectData}
              dropdownStates={dropdownStates}
              toggleDropdown={(index: number) => toggleDropdown(field, index)}
              experimentType={experimentType}
            />
          ),
      )}
    </ScrollView>
  );
};

const ProjectContainer = ({ title, data, dropdownStates, toggleDropdown, projectData,experimentType }: { title: String, data: any, dropdownStates: any, toggleDropdown: any, projectData: any, experimentType:(string | null) }) => {

  return (
    <View style={styles.paddingVertical}>
      <View
        style={[styles.projectContainer, styles.projectContainerBackground]}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Field {title}   {data ? data.length : 0} Plots</Text>
          <FieldSybol1 />
        </View>
        <View style={styles.contentContainer}>
          {data &&
            data.map((item: any, index: number) => (
              <ItemComponent
                key={index}
                title={`Plot : ${item.plotNumber}`}
                entries={item.recordedTraitData}
                notes={item.notes}
                dropdownState={dropdownStates[`${title}_${index}`]}
                toggleDropdown={() => toggleDropdown(index)}
                projectData={projectData}
                plotId={item.id}
                experimentType={experimentType}
              />
            ))}
        </View>
      </View>
    </View>
  );
};

const ItemComponent = ({ title, entries, notes, dropdownState, toggleDropdown, projectData, plotId,experimentType }: any) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [showInputCard, setShowInputCard] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [observedValue, setObservedValue] = useState('');
  const bottomSheetModalRef = useRef(null);

  const [dropdownHeight] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(dropdownHeight, {
      toValue: dropdownState ? 375 : 0,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [dropdownState]);

  const formatDate = (date: any) => {
    const pad = (num: number) => String(num).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  };


  const [updateValue, updateValueResponse] = useApi({
    'url': URL.RECORD_TRAITS,
    method: "PUT"
  });

  const handleEditPress = (entry: any) => {
    setShowInputCard(true);
    setCurrentEntry(entry);
  }
  const handleValueSubmit = (value: any) => {
    const payload = {
      date: formatDate(new Date()),
      fieldExperimentId: projectData[0].fieldExperimentId,
      experimentType: experimentType,
      phenotypes: [{
        observationId: currentEntry?.observationId,
        observedValue: value,
        traitId: currentEntry?.traitId,
      }],
      plotId: plotId,
    };
    const headers = {
      "Content-Type":"application/json"
    }
    updateValue({ payload ,headers});
  };

  useEffect(() => {
    if (updateValueResponse && updateValueResponse.status_code === 200) {
      Alert.alert('Success', 'Value Updated Successfully');
    }
  }, [updateValueResponse])

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
        {dropdownState &&
          entries.map((entry: any, index: number) => (
            <View style={styles.entryContainer} key={index}>
              <View style={styles.projectContainer1}>
                <View style={styles.padding}>
                  <Text style={styles.recordedTraitsText}>
                    Recorded Traits (Number)
                  </Text>
                </View>
                <View style={styles.borderRadiusOverflow}>
                  <View style={styles.entryRow}>
                    <View style={styles.entryColumn}>
                      <Text style={styles.entryLabel}>Trait Name</Text>
                      <Text style={styles.entryValue}>{entry.traitName}</Text>
                    </View>
                  </View>
                  <View style={styles.entryRow}>
                    {
                      showInputCard ? (
                        <View style={styles.entryColumn}>
                          <ValueInputCard onSubmit={handleValueSubmit} entry={currentEntry} setShowInputCard={setShowInputCard} />
                        </View>
                      ) :
                        (
                          <>
                            <View style={styles.entryColumn}>
                              <Text style={styles.entryLabel}>Value</Text>
                              <Text style={styles.entryValue}>{entry.value}</Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => handleEditPress(entry)}
                              style={styles.editButton}>
                              <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                          </>
                        )
                    }
                  </View>
                </View>
              </View>
              {notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesTitle}>Notes</Text>
                  <View style={styles.notesContent}>
                    <Text style={styles.notesText}>{notes}</Text>
                    <Text style={styles.notesDate}>24 Sept</Text>
                  </View>
                </View>
              )}
              <View style={styles.unrecordedTraitsRow}>
                <Text style={styles.unrecordedTraitsText}>
                  UnRecorded Traits
                </Text>
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
      { }

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
