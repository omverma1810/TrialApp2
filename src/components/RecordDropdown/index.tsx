import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';
import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CardArrowDown,
  CardArrowUp,
  Edit,
  FieldSybol1,
} from '../../assets/icons/svgs';
import {URL} from '../../constants/URLS';
import {useApi} from '../../hooks/useApi';
import OptionsModal from '../../screens/app-screens/Record/OptionsModal';
import ValueInputCard from '../../screens/app-screens/Record/ValueInputCard';
import {FONTS} from '../../theme/fonts';
import Toast from '../../utilities/toast';
import Calendar from '../Calender';

type selectedFieldsType = {
  [key: string]: boolean;
};

const RecordDropDown = ({
  selectedFields,
  projectData,
  experimentType,
  fields,
}: {
  selectedFields: selectedFieldsType;
  projectData: any;
  fields: any;
  experimentType: string | null;
}) => {
  const [dropdownStates, setDropdownStates] = useState(
    Object.fromEntries(
      Object.keys(selectedFields).flatMap(field =>
        projectData.length > 0 && projectData[0]?.plotData
          ? projectData[0].plotData.map((_: any, index: number) => [
              `${field}_${index}`,
              false,
            ])
          : [],
      ),
    ),
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
        (field, idx) =>
          selectedFields[field] && (
            <ProjectContainer
              key={field}
              title={field}
              heading={`${
                fields.find((f: any) => String(f.id) === String(field))?.name ||
                'Unknown Field'
              } - ${
                fields.find((f: any) => String(f.id) === String(field))
                  ?.location?.villageName || 'Unknown'
              }`}
              data={projectData && projectData[idx]?.plotData}
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

const ProjectContainer = ({
  title,
  data,
  dropdownStates,
  toggleDropdown,
  projectData,
  experimentType,
  heading,
}: {
  title: any;
  data: any;
  dropdownStates: any;
  toggleDropdown: any;
  projectData: any;
  experimentType: string | null;
  heading: any;
}) => {
  return (
    <View style={styles.paddingVertical}>
      <View
        style={[styles.projectContainer, styles.projectContainerBackground]}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {heading} {data ? data.length : 0} Plots
          </Text>
          <FieldSybol1 />
        </View>
        <View style={styles.contentContainer}>
          {data &&
            data.map((item: any, index: number) => (
              <ItemComponent
                key={index}
                title={`${item.plotNumber}`}
                notes={item.notes}
                dropdownState={dropdownStates[`${title}_${index}`]}
                toggleDropdown={() => toggleDropdown(index)}
                projectData={projectData}
                plotId={item.id}
                experimentType={experimentType}
                plotData={item}
                imageUrls={item.imageUrls}
              />
            ))}
        </View>
      </View>
    </View>
  );
};

const ItemComponent = ({
  title,
  notes,
  dropdownState,
  toggleDropdown,
  projectData,
  plotId,
  experimentType,
  plotData,
  imageUrls,
}: any) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [showInputCard, setShowInputCard] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [updatabaleCurrentEntry, setUpdatableCurrentEntry] =
    useState<any>(null);
  const [observedValue, setObservedValue] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const optionsModalRef = useRef<any>(null);
  const recordedTraitData = plotData.recordedTraitData;
  const [recordableData, setRecordableData] = useState({});
  const unrecordedTraitData = plotData.unrecordedTraitData;
  const [dropdownHeight] = useState(new Animated.Value(0));
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingEntryType, setEditingEntryType] = useState<string | null>(null);
  const [changedValue, setChangedValue] = useState<any>(null);
  useEffect(() => {
    const height = recordedTraitData.length + unrecordedTraitData.length;
    Animated.timing(dropdownHeight, {
      toValue: dropdownState ? height * 375 : 0,
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

  const [validateTraitsRecord, validateTraitsResponse] = useApi({
    url: URL.VALIDATE_TRAITS,
    method: 'POST',
  });

  const [updateValue, updateValueResponse] = useApi({
    url: URL.RECORD_TRAITS,
    method: 'PUT',
  });

  const handleEditPress = (entry: any) => {
    console.log('~~~~~~~~~~~~', {entry});
    setCurrentEntry(entry);
    setEditingEntryType(entry?.dataType);

    if (entry.dataType === 'date') {
      setCalendarVisible(true);
    } else if (entry.dataType === 'fixed') {
      console.log({modalVisible});
      if (modalVisible) {
        setModalVisible(false);
        setTimeout(() => setModalVisible(true), 1);
      } else {
        setModalVisible(true);
      }
    } else {
      setEditingEntryId(entry.observationId);
    }
  };

  useEffect(() => {
    if (modalVisible && optionsModalRef.current) {
      optionsModalRef.current.present();
    }
  }, [modalVisible, optionsModalRef, currentEntry]);

  const handleValueSubmit = (value: any) => {
    const payload = {
      date: formatDate(new Date()),
      fieldExperimentId: projectData[0].fieldExperimentId,
      experimentType: experimentType,
      phenotypes: [
        {
          observationId: currentEntry?.observationId,
          observedValue: value,
          traitId: currentEntry?.traitId,
        },
      ],
      plotId: plotId,
    };
    setChangedValue(value);
    const headers = {
      'Content-Type': 'application/json',
    };
    setRecordableData({payload, headers});
    validateTraitsRecord({payload, headers});
  };

  const handleDateSubmit = (date: Date) => {
    const formattedDate = dayjs(date).format('DD-MM-YYYY');
    handleValueSubmit(formattedDate);
    setCalendarVisible(false);
  };

  useEffect(() => {
    if (validateTraitsResponse?.phenotypes) {
      const invalid = validateTraitsResponse?.phenotypes?.filter(
        (i: {validationStatus: boolean}) => !i.validationStatus,
      );

      console.log({invalid});
      if (invalid && invalid.length) {
        invalid?.forEach((item: {observedValue: string}) => {
          Toast.warning({message: `${item.observedValue} is invalid value`});
        });
        setRecordableData({});
        return;
      }

      updateValue(recordableData);
    }
  }, [validateTraitsResponse]);
  useEffect(() => {
    if (updateValueResponse && updateValueResponse.status_code === 200) {
      Toast.success({
        message: 'Value Updated Successfully',
      });
      currentEntry.value = changedValue;
    } else {
      if (updateValueResponse) {
        Toast.error({
          message: 'Something Went Wrong',
        });
      }
    }
    setEditingEntryId(null);
    setModalVisible(false);
    setCurrentEntry(null);
    setUpdatableCurrentEntry(null);
    optionsModalRef.current?.close();
  }, [updateValueResponse]);
  return (
    <ScrollView style={styles.itemContainer}>
      <Pressable onPress={toggleDropdown}>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <Pressable onPress={toggleDropdown}>
            {dropdownState ? <CardArrowUp /> : <CardArrowDown />}
          </Pressable>
        </View>
      </Pressable>

      <Animated.View style={[styles.dropdown]}>
        {dropdownState && (
          <>
            <ScrollView>
              {dropdownState && recordedTraitData && (
                <>
                  {recordedTraitData.length > 0 && (
                    <View
                      style={[styles.projectContainer1, {marginVertical: 10}]}>
                      <View style={styles.padding}>
                        <Text style={styles.recordedTraitsText}>
                          Recorded Traits ({recordedTraitData.length})
                        </Text>
                      </View>
                    </View>
                  )}
                  {recordedTraitData.map((entry: any, index: number) => (
                    <View style={styles.entryContainer} key={index}>
                      <View style={styles.borderRadiusOverflow}>
                        <View style={styles.entryRow}>
                          <View style={styles.entryColumn}>
                            <Text style={styles.entryLabel}>
                              {entry.traitName}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.entryRow}>
                          {editingEntryId === entry.observationId ? (
                            <View style={styles.entryColumn}>
                              <ValueInputCard
                                onSubmit={handleValueSubmit}
                                entry={currentEntry}
                                setShowInputCard={setEditingEntryId}
                              />
                            </View>
                          ) : (
                            <>
                              <Pressable
                                onPress={() => {
                                  setModalVisible(false);
                                  handleEditPress(entry);
                                }}>
                                <View style={styles.entryColumn}>
                                  <Text style={styles.entryLabel}>Value</Text>
                                  <Text style={styles.entryValue}>
                                    {entry.value}
                                  </Text>
                                </View>
                              </Pressable>
                              <Pressable
                                onPress={() => {
                                  setModalVisible(false);
                                  handleEditPress(entry);
                                }}
                                style={styles.editButton}>
                                <Edit />
                              </Pressable>
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
                </>
              )}
              {dropdownState && unrecordedTraitData && (
                <>
                  {unrecordedTraitData.length > 0 && (
                    <View
                      style={[styles.projectContainer1, {marginVertical: 10}]}>
                      <View style={styles.padding}>
                        <Text style={styles.recordedTraitsText}>
                          Unrecorded Traits ({unrecordedTraitData?.length})
                        </Text>
                      </View>
                    </View>
                  )}

                  {unrecordedTraitData.map((entry: any, index: number) => (
                    <View style={styles.entryContainer} key={index}>
                      <View style={styles.projectContainer1}>
                        <View style={styles.borderRadiusOverflow}>
                          <View style={styles.entryRow}>
                            <View style={styles.entryColumn}>
                              {/* <Text style={styles.entryLabel}>Trait Name</Text> */}

                              <Text style={styles.entryLabel}>
                                {entry.traitName}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.entryRow}>
                            <View style={styles.entryColumn}>
                              <Text style={styles.entryValue}>
                                {entry.value !== null &&
                                entry.value !== undefined
                                  ? entry.value
                                  : 'No Data Found'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </>
              )}

              {dropdownState && notes && notes != '' && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesTitle}>Notes</Text>

                  <View style={styles.notesContent}>
                    <Text style={styles.notesText}>{notes}</Text>
                  </View>
                </View>
              )}

              {imageUrls && imageUrls.length > 0 && (
                <View style={styles.imageContainer}>
                  {imageUrls.map((image: any) => (
                    <Image
                      key={image.imageName}
                      source={{uri: image.url}}
                      style={styles.image}
                      resizeMode="contain"
                      onError={e =>
                        console.log('Image Load Error: ', e.nativeEvent.error)
                      }
                    />
                  ))}
                </View>
              )}
            </ScrollView>
          </>
        )}
      </Animated.View>

      {modalVisible && (
        <OptionsModal
          item={currentEntry}
          onSubmit={handleValueSubmit}
          bottomSheetModalRef={optionsModalRef}
        />
      )}

      {calendarVisible && (
        <Modal
          visible={calendarVisible}
          transparent
          onRequestClose={() => setCalendarVisible(false)}>
          <View style={styles.modalContainer}>
            <Calendar
              onOk={(date: string) => handleDateSubmit(new Date(date))}
              onCancel={() => setCalendarVisible(false)}
              selectedDate={
                currentEntry?.value &&
                dayjs(currentEntry.value, 'YYYY-MM-DD').isValid()
                  ? dayjs(currentEntry.value, 'YYYY-MM-DD').format('YYYY-MM-DD') // Previous Date
                  : dayjs().format('YYYY-MM-DD') // Fallback Default (Today)
              }
            />
          </View>
        </Modal>
      )}
    </ScrollView>
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
    fontFamily: FONTS.MEDIUM,
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
    // borderWidth: 1,
    // borderColor: '#F7F7F7',
  },
  padding: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  recordedTraitsText: {
    color: '#161616',
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
  },
  borderRadiusOverflow: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  entryRow: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryColumn: {
    gap: 5,
  },
  entryLabel: {
    color: '#161616',
    fontFamily: FONTS.REGULAR,
    fontSize: 14,
  },
  entryValue: {
    color: '#161616',
    fontWeight: '500',
    fontSize: 15,
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
  imageContainer: {
    marginTop: 20,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
});

export default RecordDropDown;
