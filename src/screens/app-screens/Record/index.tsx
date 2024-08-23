import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Loader, SafeAreaView, StatusBar } from '../../../components';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DropdownArrow, Search, X } from '../../../assets/icons/svgs';
import BottomModal from '../../../components/BottomSheetModal';

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import CheckBox from '../../../components/CheckBox';
import Chip from '../../../components/Chip';
import RecordDropDown from '../../../components/RecordDropdown';
import { URL } from '../../../constants/URLS';
import { useApi } from '../../../hooks/useApi';
import RecordStyles from './RecordStyles';
import TakeNotesStyles from '../TakeNotes/TakeNotesStyle';
import Filter from './Filter';
import { LOCALES } from '../../../localization/constants';
import { useTranslation } from 'react-i18next';
import TraitSection from '../../../components/TraitComponent';
import Cancel from '../../../assets/icons/svgs/Cancel';

interface SelectedFieldData {
  fieldName: string;
  plots: any;
}
// interface ProjectData {
//   [key: string]: {
//     plot: string;
//     entries: {date: string; notes: string}[];
//   }[];
// }
interface ProjectData {
  fieldName: string;
}
interface Chip {
  id: number;
  ExperientName?: string;
  CropName: string;
}

const Record = () => {
  const { t } = useTranslation();

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
  const { bottom } = useSafeAreaInsets();
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

  const handleCropChange = useCallback(
    (option: string) => {
      setSelectedCrop(option);
      const newProjectList = Object.keys(experimentData?.[option] || {});
      setProjectList(newProjectList);
      setSelectedProject(newProjectList[0] || '');
      setExperimentList(experimentData?.[option][newProjectList[0]] || []);
    },
    [experimentData],
  );
  const handleProjectChange = useCallback(
    (option: string) => {
      setSelectedProject(option);
      setExperimentList(experimentData?.[selectedCrop][option] || []);
      setSelectedExperiment(null);
      setChipTitle('Select an Experiment');    
    },
    [experimentData, selectedCrop],
  );
  useEffect(() => {
    if (experimentData && experimentData["Rice"]) {
      setSelectedCrop("Rice");

      const newProjectList = Object.keys(experimentData["Rice"]);
      setProjectList(newProjectList);
      setSelectedProject(newProjectList[0] || '');
      setExperimentList(experimentData["Rice"][newProjectList[0]] || []);
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

    const { data } = experimentListData;
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
    console.log('=============>', { item });
    setSelectedExperiment(item);
    setChipTitle(item.fieldExperimentName);
    console.log('selectedExperiment', selectedExperiment);
    setExperimentType(item.experimentType);
    (bottomSheetModalRef.current as any).dismiss();
  };

  const [getFields, getFieldsResponse] = useApi({
    url: `${URL.FIELDS}${selectedExperiment?.id}?$experimentType=line`,
    method: 'GET',
  });
  useEffect(() => {
    if(selectedExperiment){
      setLocationIds([]);
      getFields();
    }
  }, [selectedExperiment]);

  useEffect(() => {
    if (getFieldsResponse && getFieldsResponse.status_code == 200) {
      setFields(getFieldsResponse.data.locationList);
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
    console.log("i'm vengence",id)
    const isSelected = !selectedFields[id];

    setSelectedFields(prevState => {
      const updatedFields = {
        ...prevState,
        [id]: isSelected,
      };
  
      // Derive locationIds based on updatedFields
      const updatedLocationIds = Object.keys(updatedFields).filter(
        fieldId => updatedFields[fieldId]
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

    fetchData();
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
    getLocationTraitData({ payload: payloadForTrait, headers });
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
    locationPlotData({ payload: payloadForPlot, headers });
  };

  useEffect(
    () => console.log('selectedFields', selectedFields, plotData),
    [plotData],
  );

  return (
    <SafeAreaView>
      <StatusBar />
      <View style={RecordStyles.container}>
        <View style={RecordStyles.searchContainer}>
          <Search />
          <TextInput
            style={RecordStyles.searchInput}
            placeholderTextColor="#949494"
            placeholder="Search Experiments"
          />
        </View>
        <View>
          <FlatList
            data={experimentList}
            contentContainerStyle={
              experimentList?.length === 0 ? { flexGrow: 1 } : { paddingBottom: 10 }
            }
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={ListHeaderComponent}
            renderItem={({ item, index }) => null}
            keyExtractor={(_, index: any) => index.toString()}
            ListEmptyComponent={ListEmptyComponent}
          />
        </View>
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
              <View style={TakeNotesStyles.chipItem}>
                <Text style={TakeNotesStyles.chipTitle}>Experiment</Text>
                <View style={TakeNotesStyles.chipTextRow}>
                  <Text style={TakeNotesStyles.chipText}>
                    {selectedExperiment.fieldExperimentName}
                  </Text>
                  <TouchableOpacity onPress={handleRightIconClick}>
                    <DropdownArrow />
                  </TouchableOpacity>
                </View>
                <View style={TakeNotesStyles.chipCropText}>
                  <Text style={TakeNotesStyles.chipCropText1}>
                    {selectedExperiment.cropName}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {selectedExperiment && (
            <View style={RecordStyles.inputContainer}>
              <Pressable onPress={handleSecondBottomModalOpen}>
                <View style={RecordStyles.fieldContainer}>
                  <View style={RecordStyles.fieldRow}>
                    {Object.values(selectedFields).some(isSelected => isSelected) ? (
                      <View style={RecordStyles.selectedFieldsWrapper}>
                        {Object.keys(selectedFields).map((fieldId, index) => {
                          if (selectedFields[fieldId]) {
                            return (
                              <View
                                key={fieldId}
                                style={RecordStyles.selectedFieldContainer}>
                                <Text style={RecordStyles.fieldName}>
                                  Field {fieldId}
                                </Text>
                                <TouchableOpacity
                                  onPress={() =>
                                    handleFieldSelect(fieldId)
                                  }>
                                  <Cancel />
                                </TouchableOpacity>
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
              {
                loading ? <Loader /> : null
              }
              {selectedFields && plotData && traitData && (
                <View style={RecordStyles.inputContainer}>
                  <View style={RecordStyles.listByContainer}>
                    <Text style={RecordStyles.listByText}>List By</Text>
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
                    />
                  )}
                  {activeListButton === 'Traits' && (
                    <TraitSection
                      selectedFields={selectedFields}
                      projectData={traitData}
                    />
                  )}
                </View>
              )}
            </View>
          )}

          <BottomModal
            bottomSheetModalRef={bottomSheetModalRef}
            type="CONTENT_HEIGHT"
            containerStyle={{ paddingBottom: bottom }}>
            <View style={RecordStyles.modalContainer}>
              <Text style={RecordStyles.modalTitle}>Select an Experiment</Text>
              <ScrollView>
                <View style={{ gap: 30 }}>
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
                            RecordStyles.modalItemCropText,
                            {
                              backgroundColor:
                                item.CropName === 'Rice'
                                  ? '#FCEBEA'
                                  : '#E8F0FB',
                            },
                          ]}>
                          {item.cropName}
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
            containerStyle={{ paddingBottom: bottom }}>
            <View style={RecordStyles.modalContainer}>
              <Text style={RecordStyles.modalTitle}>Select a Field</Text>
              <ScrollView>
                <View style={{ gap: 30 }}>
                  {fields.map((field: any) => (
                    <View
                      key={field.id}
                      style={RecordStyles.fieldCheckboxContainer}>
                      <CheckBox
                        value={!!selectedFields[field.id]}
                        onChange={() => handleFieldSelect(field.id)}
                      />
                      <Text style={RecordStyles.fieldCheckboxText}>
                        {field.location.villageName}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </BottomModal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Record;

const styles = StyleSheet.create({});
