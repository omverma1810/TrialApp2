/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useRef, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Loader, SafeAreaView, StatusBar} from '../../../components';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {DropdownArrow, Search} from '../../../assets/icons/svgs';
import BottomModal from '../../../components/BottomSheetModal';

import {BottomSheetModalMethods} from '@gorhom/bottom-sheet/lib/typescript/types';
import CheckBox from '../../../components/CheckBox';
import Chip from '../../../components/Chip';
import RecordDropDown from '../../../components/RecordDropdown';
import ComingSoon from '../ComingSoon';
import TraitComponent from '../../../components/TraitComponent';
import {URL} from '../../../constants/URLS';
import {useApi} from '../../../hooks/useApi';
// import {projectData} from './Data';
import RecordStyles from './RecordStyles';

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
  const [experiment, setExperiment] = useState();
  const [experimentData, setExperimentData] = useState(null);
  const [cropList, setCropList] = useState<string[]>([]);
  const [projectData, setProjectData] = useState<string[]>([]);
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
  const [selectedExperiment, setSelectedExperiment] = useState<Chip | null>(
    null,
  );
  const [inputVisible, setInputVisible] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModalMethods>(null);
  const secondBottomModalRef = useRef<BottomSheetModalMethods>(null);
  const {bottom} = useSafeAreaInsets();
  const [activeListButton, setActiveListButton] = useState('Plot');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFields, setSelectedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedFieldData, setSelectedFieldData] =
    useState<SelectedFieldData | null>(null);

  const [
    getExperimentDetails,
    experimentDetailsResponse,
    isExperimentDetailsLoading,
    experimentDetailsError,
  ] = useApi({
    url: URL.EXPERIMENT_DETAILS,
    method: 'GET',
  });
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

    const experimentSheet:
      | React.SetStateAction<null>
      | {CropName: string; ExperientName: string}[] = [];
    cropList.map(rows => {
      Object.keys(data[rows])
        .filter(row => data[rows][row].length)
        .map(experiments =>
          experimentSheet.push({
            CropName: rows,
            ExperientName: experiments,
          }),
        );
    });

    setExperimentData(data);
    setCropList(cropList);
    setProjectData(projectList);
    setExperimentList(experimentList);
    setSelectedCrop(selectedCrop);
    setSelectedProject(selectedProject);
    setExperiment(experimentSheet);
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

  const handleExperimentSelect = (item: Chip) => {
    setSelectedExperiment(item);
    setInputVisible(true);
    const project_names = experimentData[item.CropName][item.ExperientName].map(
      i => {
        let {fieldExperimentName, id, experimentType} = i;
        return {fieldExperimentName, id, experimentType};
      },
    );
    console.log({project_names});
    setProjectNames(project_names);
    bottomSheetModalRef.current?.dismiss();
  };

  const handleSecondBottomModalOpen = () => {
    secondBottomModalRef.current?.present();
  };

  const handleFieldSelect = (id: number, type: string) => {
    getExperimentDetails({
      pathParams: `${id}`,
      queryParams: `experimentType=${type || 'line'}`,
    });
  };

  useEffect(() => {
    if (experimentDetailsResponse?.status_code === 200) {
      let {data} = experimentDetailsResponse;
      let field = data?.name;
      if (field) {
        const isSelected = !selectedFields[field];
        setSelectedFields(prevState => ({
          ...prevState,
          [field]: isSelected,
        }));
        console.log({fieldData: data});
        if (isSelected) {
          setSelectedFieldData({
            fieldName: field,
            plots: data.locationList,
          });
          setProjectData(data);
        } else {
          setSelectedFieldData(null);
        }
      }
    }
    secondBottomModalRef.current?.close();
  }, [experimentDetailsResponse]);
  useEffect(() => console.log(selectedFields), [selectedFields]);
  return (
    <SafeAreaView>
       <StatusBar />
      {/*
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={RecordStyles.container}>
          <View style={RecordStyles.searchContainer}>
            <Search />
            <TextInput
              style={RecordStyles.searchInput}
              placeholderTextColor="#949494"
              placeholder="Search Experiments"
            />
          </View>

          {!experimentData ? (
            <Loader />
          ) : (
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
              <View style={RecordStyles.experimentItem}>
                <Text style={RecordStyles.experimentTitle}>Experiment</Text>
                <View style={RecordStyles.experimentRow}>
                  <Text style={RecordStyles.experimentText}>
                    {selectedExperiment.ExperientName ||
                      'Experiment Name Not Available'}
                  </Text>
                  <DropdownArrow />
                </View>
                <View style={RecordStyles.experimentCrop}>
                  <Text style={RecordStyles.experimentCropText}>
                    {selectedExperiment.CropName}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {inputVisible && (
            <View style={RecordStyles.inputContainer}>
              <Pressable onPress={handleSecondBottomModalOpen}>
                <View style={RecordStyles.fieldContainer}>
                  <View style={RecordStyles.fieldRow}>
                    <Text style={RecordStyles.fieldTitle}>All Fields</Text>
                    <Pressable onPress={handleSecondBottomModalOpen}>
                      <DropdownArrow />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
              {selectedFieldData && (
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
                      projectData={projectData}
                    />
                  )}
                  {activeListButton === 'Traits' && (
                    <TraitComponent
                      titles={[
                        'Plant height after 20 days',
                        'Tiller',
                        'Flowering Date',
                        'Days to first Flower',
                        'Title 5',
                        'Title 6',
                        'Title 7',
                      ]}
                      selectedFieldsData={Object.keys(selectedFields).map(
                        field => ({
                          fieldName: field,
                          plots: projectData || [],
                        }),
                      )}
                    />
                  )}
                </View>
              )}
            </View>
          )}

          <BottomModal
            bottomSheetModalRef={bottomSheetModalRef}
            type="CONTENT_HEIGHT"
            containerStyle={{paddingBottom: bottom}}>
            <View style={RecordStyles.modalContainer}>
              <Text style={RecordStyles.modalTitle}>Select an Experiment</Text>
              <ScrollView>
                <View style={{gap: 30}}>
                  {experiment &&
                    experiment.map((item, index) => (
                      <Pressable
                        key={`${item?.id}-${index}`}
                        onPress={() => handleExperimentSelect(item)}
                        style={RecordStyles.modalItem}>
                        <Text style={RecordStyles.modalItemText}>
                          {item.ExperientName}
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
                          {item.CropName}
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
                  {projectNames.map((field, index) => (
                    <View
                      key={index}
                      style={RecordStyles.fieldCheckboxContainer}>
                      <CheckBox
                        value={!!selectedFields[field.fieldExperimentName]}
                        onChange={() =>
                          handleFieldSelect(field.id, field.experimentType)
                        }
                      />
                      <Text style={RecordStyles.fieldCheckboxText}>
                        {field.fieldExperimentName}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </BottomModal>
        </View>
      </ScrollView> */}
      <ComingSoon/>
    </SafeAreaView>
  );
};

export default Record;

const styles = StyleSheet.create({});
