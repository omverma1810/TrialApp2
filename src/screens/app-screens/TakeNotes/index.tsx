import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Search} from '../../../assets/icons/svgs';
import {Input, Loader, SafeAreaView, StatusBar} from '../../../components';
import Chip from '../../../components/Chip';
import {URL} from '../../../constants/URLS';
import {useApi} from '../../../hooks/useApi';
import {LOCALES} from '../../../localization/constants';
// import {NotesScreenProps} from '../../../types/navigation/appTypes';
import ExperimentCard from './ExperimentCard';
import Filter from './Filter';
import TakeNotesStyles from './TakeNotesStyle';
interface Chip {
  id: number;
  ExperientName: string;
  CropName: string;
  fieldName?: string;
  Location?: string;
  Fieldno?: string;
}

const TakeNotes = ({navigation, route}: any) => {
  const {t} = useTranslation();
  const [selectedChips, setSelectedChips] = useState<Chip[]>([]);
  const [chipTitle, setChipTitle] = useState('Select an Experiment');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [chipVisible, setChipVisible] = useState(true);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const bottomSheetModalRef = useRef(null);
  const secondBottomSheetRef = useRef(null);
  const {bottom} = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [experimentData, setExperimentData] = useState<any>(null);
  const [cropList, setCropList] = useState<string[]>([]);
  const [projectList, setProjectList] = useState<string[]>([]);
  const [experimentList, setExperimentList] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedExperiment, setSelectedExperiment] = useState<any>();
  const [selectedExperimentId, setSelectedExperimentId] = useState<any>();
  const [fields, setFields] = useState([]);

  const handleSelectedExperiment = (experiment: any) => {
    setSelectedExperiment(experiment);
  };
  const handleSelectedField = (field: any) => {
    setSelectedField(field);
  };

  const handleCropChange = useCallback(
    (option: string) => {
      setSelectedCrop(option);
      const newProjectList = Object.keys(experimentData[option] || {});
      setProjectList(newProjectList);
      setSelectedProject(newProjectList[0] || '');
      setExperimentList(experimentData[option][newProjectList[0]] || []);
    },
    [experimentData],
  );

  const handleProjectChange = useCallback(
    (option: string) => {
      setSelectedProject(option);
      setExperimentList(experimentData[selectedCrop][option] || []);
    },
    [experimentData, selectedCrop],
  );

  const handleFirstRightIconClick = () => {
    if (bottomSheetModalRef.current) {
      (bottomSheetModalRef.current as any).present();
    }
  };

  const handleSecondRightIconClick = () => {
    if (secondBottomSheetRef.current) {
      (secondBottomSheetRef.current as any).present();
    }
  };

  const handleThirdRightIconClick = () => {
    setModalVisible(true);
  };

  const handleExperimentSelect = (item: Chip) => {
    setSelectedChips([item]);
    setChipTitle('Select Field');
    (bottomSheetModalRef.current as any).dismiss();
  };

  const handleFieldSelect = (item: Chip) => {
    setSelectedField(item);
    setChipTitle('Select Date');
    setChipVisible(false);
    setInputVisible(true);
    (secondBottomSheetRef.current as any).dismiss();
  };

  const handleChipPress = () => {
    // console.log('Chip pressed');
    if (selectedChips.length === 0) {
      handleFirstRightIconClick();
    } else if (!selectedField) {
      handleSecondRightIconClick();
    } else {
      handleThirdRightIconClick();
    }
  };
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
    console.log('params,', route.params);
    if (route.params?.data && route.params?.data.experiment_name) {
      let data_ = route.params?.data;
      let {experiment_name} = data_;
      for (let crops of cropList) {
        console.log(crops);
        if (crops in data) {
          let project = data[crops];
          for (let p in project) {
            for (let field of project[p]) {
              if (
                field?.fieldExperimentName === experiment_name ||
                field?.experimentName === experiment_name
              ) {
                setSelectedCrop(crops);
                setSelectedProject(p);
                setProjectList(Object.keys(project));
                setExperimentList(data[crops][p]);
                // setSelectedExperiment(experiment_name);
                handleSelectedExperiment(field);
                // setSelectedField(field);
                setSelectedExperimentId(field.id);
                setText(data.content);
              }
            }
          }
        }
      }
    } else {
      setExperimentList(experimentList);
      setSelectedCrop(selectedCrop);
      setSelectedProject(selectedProject);
    }
  }, [experimentListData]);
  const ListEmptyComponent = useMemo(
    () => (
      <View style={TakeNotesStyles.emptyContainer}>
        {isExperimentListLoading ? (
          <Loader />
        ) : (
          <Text style={TakeNotesStyles.emptyText}>
            {t(LOCALES.COMMON.LBL_NO_DATA_FOUND)}
          </Text>
        )}
      </View>
    ),
    [isExperimentListLoading],
  );
  const [payload, setPayload] = useState({
    field_id: '',
    experiment_id: '',
    content: '',
    experiment_type: '',
  });
  const [takeNotes, takeNotesResponse] = useApi({
    url: URL.NOTES,
    method: 'POST',
  });
  const onTakeNotes = async () => {
    if (!text) {
      Alert.alert('Error', 'Please select all fields before Taking a Note');
      return;
    }
    const newData = {
      field_id: selectedField?.landVillageId,
      experiment_id: selectedExperiment?.id,
      experiment_type: selectedExperiment?.experimentType,
      content: text,
    };
    await takeNotes({payload: newData});
    console.log('payload', payload);
  };

  useEffect(() => {
    if (takeNotesResponse && takeNotesResponse.status_code == 201) {
      Alert.alert('Success', 'Notes Created Sucessfully');
      navigation.navigate('Home');
    }
  }, [takeNotesResponse]);

  const [getFields, getFieldsResponse] = useApi({
    url: `${URL.FIELDS}${
      selectedExperiment?.id || selectedExperimentId
    }?experiment-type=${selectedExperiment?.experimentType || 'line'}`,
    method: 'GET',
  });
  useEffect(() => {
    getFields();
  }, [selectedExperiment, selectedExperimentId]);

  useEffect(() => {
    if (getFieldsResponse && getFieldsResponse.status_code == 200) {
      setFields(getFieldsResponse.data.locationList);
    }
  }, [getFieldsResponse]);
  useEffect(() => {
    console.log('fields', fields, selectedField);
  }, []);

  return (
    <SafeAreaView>
      <StatusBar />
      <View style={TakeNotesStyles.container}>
        <FlatList
          data={experimentList}
          contentContainerStyle={
            experimentList?.length === 0 ? {flexGrow: 1} : {paddingBottom: 10}
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeaderComponent}
          renderItem={({item, index}) => null}
          keyExtractor={(_, index: any) => index.toString()}
          ListEmptyComponent={ListEmptyComponent}
        />
        {selectedCrop && selectedProject && (
          <ExperimentCard
            data={experimentList}
            name="experiment"
            onExperimentSelect={handleSelectedExperiment}
          />
        )}
        {selectedCrop && selectedProject && selectedExperiment && (
          <ExperimentCard
            data={fields}
            name={'field'}
            onExperimentSelect={handleSelectedExperiment}
            onFieldSelect={handleSelectedField}
          />
        )}

        {selectedExperiment && selectedField && (
          <View>
            <View style={TakeNotesStyles.inputContainer}>
              <TextInput
                style={TakeNotesStyles.inputText}
                multiline={true}
                placeholder="Notes"
                value={text}
                onChangeText={setText}
                placeholderTextColor="#636363"
              />
            </View>
            <TouchableOpacity
              style={TakeNotesStyles.submitButton}
              onPress={onTakeNotes}>
              <Text style={TakeNotesStyles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default TakeNotes;
