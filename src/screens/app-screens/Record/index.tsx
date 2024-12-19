import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  Pressable,
} from 'react-native';
import {Loader, SafeAreaView, StatusBar} from '../../../components';
import {Plus} from '../../../assets/icons/svgs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {DropdownArrow, Search, X} from '../../../assets/icons/svgs';
import BottomModal from '../../../components/BottomSheetModal';
import NewRecordOptionsModal from '../Experiment/NewRecordOptionsModal';
import {BottomSheetModalMethods} from '@gorhom/bottom-sheet/lib/typescript/types';
import CheckBox from '../../../components/CheckBox';
import Chip from '../../../components/Chip';
import RecordDropDown from '../../../components/RecordDropdown';
import {URL} from '../../../constants/URLS';
import {useApi} from '../../../hooks/useApi';
import RecordStyles from './RecordStyles';
import TakeNotesStyles from '../TakeNotes/TakeNotesStyle';
import Filter from './Filter';
import {LOCALES} from '../../../localization/constants';
import {useTranslation} from 'react-i18next';
import TraitSection from '../../../components/TraitComponent';
import Cancel from '../../../assets/icons/svgs/Cancel';

interface SelectedFieldData {
  fieldName: string;
  plots: any;
}
interface ProjectData {
  fieldName: string;
}
interface Chip {
  id: number;
  ExperientName?: string;
  CropName: string;
}

const Record = ({navigation}: any) => {
  const {t} = useTranslation();

  const [experiment, setExperiment] = useState();
  const [experimentData, setExperimentData] = useState(null);
  const [cropList, setCropList] = useState<string[]>([]);
  const [projectData, setProjectData] = useState<any>([]);
  const [projectNames, setProjectNames] = useState<
    {
      experimentType: string;
      fieldExperimentName: string;
      id: number;
    }[]
  >([]);
  const [experimentList, setExperimentList] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedExperiment, setSelectedExperiment] = useState<any | null>(
    null,
  );
  const [chipTitle, setChipTitle] = useState(`Select an Experiment`);
  const [inputVisible, setInputVisible] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModalMethods>(null);
  const secondBottomModalRef = useRef<BottomSheetModalMethods>(null);
  const {bottom} = useSafeAreaInsets();
  const [activeListButton, setActiveListButton] = useState('Plot');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFields, setSelectedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [projectList, setProjectList] = useState<string[]>([]);
  const [selectedFieldData, setSelectedFieldData] =
    useState<SelectedFieldData | null>(null);
  const [fields, setFields] = useState([]);
  const [experimentType, setExperimentType] = useState<string | null>(null);
  const [locationIds, setLocationIds] = useState<any>([]);
  const [traitData, setTraitData] = useState<any>(null);
  const [plotData, setPlotData] = useState<any>(null);
  const [selectedFieldNames, setSelectedFieldNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);

  const handleCropChange = useCallback(
    (option: string) => {
      setSelectedCrop(option);
      const newProjectList = Object.keys(experimentData?.[option] || {});
      setProjectList(newProjectList);
      setSelectedProject(newProjectList[0] || '');
      setSelectedExperiment(null);
      setSelectedFields({});
      setTraitData(null);
      setPlotData(null);
      setExperimentList(experimentData?.[option][newProjectList[0]] || []);
    },
    [experimentData],
  );
  const handleProjectChange = useCallback(
    (option: string) => {
      setSelectedProject(option);
      setExperimentList(experimentData?.[selectedCrop][option] || []);
      setSelectedExperiment(null);
      setSelectedFields({});
      setTraitData(null);
      setPlotData(null);
      setChipTitle('Select an Experiment');
    },
    [experimentData, selectedCrop],
  );
  useEffect(() => {
    if (experimentData && Object.keys(experimentData).length > 0) {
      const firstCrop = Object.keys(experimentData)[0];
      const newProjectList = Object.keys(experimentData[firstCrop]);

      setProjectList(newProjectList);
      setSelectedProject(newProjectList[0] || '');
      setExperimentList(experimentData[firstCrop][newProjectList[0]] || []);
    } else {
      setProjectList([]);
      setSelectedProject('');
      setExperimentList([]);
      setLocationIds([]);
    }
  }, [experimentData]);

  const [
    getExperimentList,
    experimentListData,
    isExperimentListLoading,
    experimentListError,
  ] = useApi({
    url: URL.EXPERIMENT_LIST,
    method: 'GET',
  });

  useEffect(() => {
    getExperimentList();
  }, []);

  useEffect(() => {
    if (experimentListData?.status_code !== 200 || !experimentListData?.data) {
      return;
    }

    const {data} = experimentListData;
    const cropList = Object.keys(data);
    const selectedCrop = cropList[0];
    const projectList = Object.keys(data[selectedCrop] || {});
    const selectedProject = projectList[0];
    const experimentList = data[selectedCrop][selectedProject] || [];

    setExperimentData(data);
    setCropList(cropList);
    setProjectList(projectList);
    setExperimentList(experimentList);
    setSelectedCrop(selectedCrop);
    setSelectedProject(selectedProject);
  }, [experimentListData]);

  const handleEdit = () => {
    setModalVisible(true);
  };

  const handleListPress = (button: string) => {
    setActiveListButton(button);
  };

  const handleRightIconClick = () => {
    bottomSheetModalRef.current?.present();
  };
  const handleExperimentSelect = (item: any) => {
    setSelectedExperiment(item);
    setChipTitle(item.fieldExperimentName);
    setTraitData(null);
    setPlotData(null);
    setExperimentType(item.experimentType);
    (bottomSheetModalRef.current as any).dismiss();
  };

  const [getFields, getFieldsResponse] = useApi({
    url: URL.EXPERIMENT_DETAILS,
    method: 'GET',
  });

  useEffect(() => {
    if (selectedExperiment) {
      const queryParams = `experimentType=${selectedExperiment?.experimentType}`;
      getFields({
        pathParams: selectedExperiment?.id,
        queryParams,
      });
    }
  }, [selectedExperiment]);

  useEffect(() => {
    if (getFieldsResponse && getFieldsResponse.status_code == 200) {
      setFields(getFieldsResponse.data.locationList);
      console.log(fields);
    }
  }, [getFieldsResponse]);

  const handleSecondBottomModalOpen = () => {
    secondBottomModalRef.current?.present();
  };

  useEffect(() => console.log(selectedFields), [selectedFields]);
  const ListEmptyComponent = useMemo(
    () => (
      <View style={TakeNotesStyles.emptyContainer}>
        {isExperimentListLoading ? (
          <View style={RecordStyles.loaderContainer}>
            <Loader />
          </View>
        ) : (
          <Text style={TakeNotesStyles.emptyText}>
            {t(LOCALES.COMMON.LBL_NO_DATA_FOUND)}
          </Text>
        )}
      </View>
    ),
    [isExperimentListLoading],
  );
  const ListHeaderComponent = useMemo(
    () => (
      <View style={TakeNotesStyles.filter}>
        <Filter
          title={t(LOCALES.EXPERIMENT.LBL_CROP)}
          options={cropList}
          selectedOption={selectedCrop}
          onPress={handleCropChange}
        />
        <Filter
          title={t(LOCALES.EXPERIMENT.LBL_PROJECT)}
          options={projectList}
          selectedOption={selectedProject}
          onPress={handleProjectChange}
        />
      </View>
    ),
    [cropList, projectList, selectedCrop, selectedProject],
  );
  useEffect(() => {
    setSelectedFields({});
  }, [selectedExperiment]);

  const handleFieldSelect = (id: string) => {
    const isSelected = !selectedFields[id];

    setSelectedFields(prevState => {
      const updatedFields = {
        ...prevState,
        [id]: isSelected,
      };
      setTraitData(null);
      setPlotData(null);
      const updatedLocationIds = Object.keys(updatedFields).filter(
        fieldId => updatedFields[fieldId],
      );

      setLocationIds(updatedLocationIds);

      return updatedFields;
    });
  };
  useEffect(() => {
    const fetchData = async () => {
      await fetchTraitData();
      await fetchPlotData();
    };

    if (locationIds && locationIds.length > 0) {
      fetchData();
    }
  }, [locationIds]);

  const [getLocationTraitData, locationTraitDataResponse] = useApi({
    url: URL.MULTI_TRIAL_LOCATION,
    method: 'POST',
  });
  useEffect(() => {
    if (locationTraitDataResponse?.status_code === 200) {
      const data = locationTraitDataResponse.data;
      setTraitData(data);
    }
    setLoading(false);
    // console.log('traitData', traitData);
    secondBottomModalRef.current?.close();
  }, [locationTraitDataResponse]);

  const fetchTraitData = () => {
    setLoading(true);
    const payloadForTrait = {
      experimentId: selectedExperiment?.id,
      experimentType: experimentType ? experimentType : 'line',
      locationIds: locationIds,
      apiCallType: 'trait',
    };
    const headers = {
      'Content-Type': 'application/json',
    };
    getLocationTraitData({payload: payloadForTrait, headers});
  };

  const [locationPlotData, locationPlotDataResponse] = useApi({
    url: URL.MULTI_TRIAL_LOCATION,
    method: 'POST',
  });

  useEffect(() => {
    if (locationPlotDataResponse?.status_code === 200) {
      let data = locationPlotDataResponse.data;
      setPlotData(data);
    }
    setLoading(false);
    // console.log('pd', plotData);
    secondBottomModalRef.current?.close();
  }, [locationPlotDataResponse]);

  const fetchPlotData = () => {
    setLoading(true);
    const payloadForPlot = {
      experimentId: selectedExperiment?.id,
      experimentType: experimentType ? experimentType : 'line',
      locationIds: locationIds,
      apiCallType: 'plot',
    };
    const headers = {
      'Content-Type': 'application/json',
    };
    locationPlotData({payload: payloadForPlot, headers});
  };

  useEffect(
    () => console.log('selectedFields', selectedFields, plotData),
    [plotData],
  );

  const onNewRecordClick = () => {
    setIsOptionModalVisible(true);
  };
  const onCloseOptionsModalClick = () => {
    setIsOptionModalVisible(false);
  };
  const onSelectFromList = () => {
    setIsOptionModalVisible(false);
    navigation.navigate('NewRecord');
  };

  return (
    <SafeAreaView
      edges={['top']}
      parentStyle={isOptionModalVisible && RecordStyles.modalOpen}>
      <StatusBar />
      <View>
        <Text style={RecordStyles.ScreenTitle}>Record</Text>
      </View>
      <View style={RecordStyles.container}>
        <FlatList
          data={experimentList}
          contentContainerStyle={
            // experimentList?.length === 0 ? {flexGrow: 1} : {paddingBottom: 10}
            experimentList?.length === 0
              ? {
                  flexGrow: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  width: '100%',
                  paddingHorizontal: 20,
                }
              : {paddingBottom: 10, height: 105}
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeaderComponent}
          renderItem={({item, index}) => null}
          keyExtractor={(_, index: any) => index.toString()}
          ListEmptyComponent={ListEmptyComponent}
        />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={RecordStyles.container}>
          {selectedCrop && selectedProject && !selectedExperiment && (
            <Chip
              onPress={handleRightIconClick}
              rightIcon={<DropdownArrow />}
              onRightIconClick={handleRightIconClick}
              containerStyle={RecordStyles.chip}
              customLabelStyle={RecordStyles.chipLabel}
              title="Select an Experiment"
              isSelected={false}
            />
          )}

          <View style={RecordStyles.experimentContainer}>
            {selectedExperiment && (
              <Pressable onPress={handleRightIconClick}>
                <View style={TakeNotesStyles.chipItem}>
                  <Text style={TakeNotesStyles.chipTitle}>Experiment</Text>
                  <View style={TakeNotesStyles.chipTextRow}>
                    <Text style={TakeNotesStyles.chipText}>
                      {selectedExperiment.fieldExperimentName}
                    </Text>
                    <DropdownArrow />
                  </View>
                  <View
                    style={[
                      TakeNotesStyles.chipCropText,
                      {
                        backgroundColor:
                          selectedExperiment.experimentType === 'hybrid'
                            ? '#fdf8ee'
                            : selectedExperiment.experimentType === 'line'
                            ? '#fcebea'
                            : '#eaf4e7',
                      },
                    ]}>
                    <Text style={TakeNotesStyles.chipCropText1}>
                      {selectedExperiment?.experimentType}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          </View>

          {selectedExperiment && (
            <View style={RecordStyles.inputContainer}>
              <Pressable onPress={handleSecondBottomModalOpen}>
                <View style={RecordStyles.fieldContainer}>
                  <View style={RecordStyles.fieldRow}>
                    {Object.values(selectedFields).some(
                      isSelected => isSelected,
                    ) ? (
                      <View style={RecordStyles.selectedFieldsWrapper}>
                        {Object.keys(selectedFields).map((fieldId, index) => {
                          if (selectedFields[fieldId]) {
                            const matchedField = fields.find(
                              field => String(field.id) === String(fieldId),
                            );

                            if (!matchedField) {
                              console.warn(
                                `Field ID ${fieldId} not found in fields array`,
                                fields,
                              );
                              return (
                                <View
                                  key={fieldId}
                                  style={RecordStyles.selectedFieldContainer}>
                                  <Text style={RecordStyles.fieldName}>
                                    {fieldId} - Unknown
                                  </Text>
                                  <Pressable
                                    onPress={() => handleFieldSelect(fieldId)}>
                                    <Cancel />
                                  </Pressable>
                                </View>
                              );
                            }

                            return (
                              <View
                                key={fieldId}
                                style={RecordStyles.selectedFieldContainer}>
                                <Text style={RecordStyles.fieldName}>
                                  {fieldId} -{' '}
                                  {matchedField.location?.villageName ||
                                    'Unknown'}
                                </Text>
                                <Pressable
                                  onPress={() => handleFieldSelect(fieldId)}>
                                  <Cancel />
                                </Pressable>
                              </View>
                            );
                          }
                          return null;
                        })}
                      </View>
                    ) : (
                      <Text style={RecordStyles.fieldTitle}>All Fields</Text>
                    )}
                    <Pressable onPress={handleSecondBottomModalOpen}>
                      <DropdownArrow />
                    </Pressable>
                  </View>
                </View>
              </Pressable>

              {selectedFields && plotData && traitData && (
                <View style={RecordStyles.inputContainer}>
                  <View style={RecordStyles.listByContainer}>
                    <Text style={RecordStyles.listByText}> List By</Text>
                    <View style={RecordStyles.listByButtonsContainer}>
                      <Pressable
                        onPress={() => handleListPress('Plot')}
                        style={[
                          RecordStyles.listByButton,
                          activeListButton === 'Plot'
                            ? RecordStyles.activeListByButton
                            : RecordStyles.inactiveListByButton,
                        ]}>
                        <Text
                          style={{
                            fontSize: 15,
                            color:
                              activeListButton === 'Plot' ? 'white' : '#0E3C74',
                          }}>
                          Plots
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleListPress('Traits')}
                        style={[
                          RecordStyles.listByButton,
                          {
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            width: '20%',
                          },
                          activeListButton === 'Traits'
                            ? RecordStyles.activeListByButton
                            : RecordStyles.inactiveListByButton,
                        ]}>
                        <Text
                          style={{
                            fontSize: 15,
                            color:
                              activeListButton === 'Traits'
                                ? 'white'
                                : '#0E3C74',
                          }}>
                          Traits
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                  {activeListButton === 'Plot' && (
                    <RecordDropDown
                      selectedFields={selectedFields}
                      projectData={plotData}
                      experimentType={experimentType}
                      fields={fields}
                    />
                  )}
                  {activeListButton === 'Traits' && (
                    <TraitSection
                      selectedFields={selectedFields}
                      projectData={traitData}
                      fields={fields}
                    />
                  )}
                </View>
              )}
            </View>
          )}
          {loading ? (
            <View
              style={{
                marginTop: '30%',
              }}>
              <Loader />
            </View>
          ) : null}

          <BottomModal
            bottomSheetModalRef={bottomSheetModalRef}
            type="CONTENT_HEIGHT"
            containerStyle={{paddingBottom: bottom}}>
            <View style={RecordStyles.modalContainer}>
              <Text style={RecordStyles.modalTitle}>Select an Experiment</Text>
              <ScrollView>
                <View style={{gap: 30}}>
                  {experimentList &&
                    experimentList.map((item, index) => (
                      <Pressable
                        key={`${item?.id}-${index}`}
                        onPress={() => handleExperimentSelect(item)}
                        style={RecordStyles.modalItem}>
                        <Text style={RecordStyles.modalItemText}>
                          {item.fieldExperimentName}
                        </Text>
                        <Text
                          style={[
                            TakeNotesStyles.modalItemCropText,
                            {
                              backgroundColor:
                                item.experimentType === 'hybrid'
                                  ? '#fdf8ee'
                                  : item.experimentType === 'line'
                                  ? '#fcebea'
                                  : '#eaf4e7',
                            },
                          ]}>
                          {item.experimentType}
                        </Text>
                      </Pressable>
                    ))}
                </View>
              </ScrollView>
            </View>
          </BottomModal>

          <BottomModal
            bottomSheetModalRef={secondBottomModalRef}
            type="CONTENT_HEIGHT"
            containerStyle={{paddingBottom: bottom}}>
            <View style={RecordStyles.modalContainer}>
              <Text style={RecordStyles.modalTitle}>Select a Field</Text>
              <ScrollView>
                <View style={{gap: 30}}>
                  {fields.map((field: any) => (
                    <View
                      key={field.id}
                      style={RecordStyles.fieldCheckboxContainer}>
                      <CheckBox
                        value={!!selectedFields[field.id]}
                        onChange={() => handleFieldSelect(field.id)}
                      />
                      <Pressable onPress={() => handleFieldSelect(field.id)}>
                        <Text style={RecordStyles.fieldCheckboxText}>
                          {field.id} - {field.location.villageName}
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </BottomModal>
        </View>
      </ScrollView>
      {!isOptionModalVisible && (
        <Pressable style={RecordStyles.newRecord} onPress={onNewRecordClick}>
          <Plus />
        </Pressable>
      )}

      <NewRecordOptionsModal
        isModalVisible={isOptionModalVisible}
        closeModal={onCloseOptionsModalClick}
        onSelectFromList={onSelectFromList}
      />
    </SafeAreaView>
  );
};

export default Record;

const styles = StyleSheet.create({});
