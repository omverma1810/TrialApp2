import React, {useState, useRef, useCallback, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Pressable,
  Alert
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {SafeAreaView, StatusBar, Loader, Input} from '../../../components';
import BottomModal from '../../../components/BottomSheetModal';
import {DropdownArrow} from '../../../assets/icons/svgs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {experiment, field} from '../../../Data';
import Chip from '../../../components/Chip';
import TakeNotesStyles from './TakeNotesStyle';
import {Search} from '../../../assets/icons/svgs';
import ExperimentCard from './ExperimentCard';
import Filter from './Filter';
import {useApi} from '../../../hooks/useApi';
import {URL} from '../../../constants/URLS';
import {LOCALES} from '../../../localization/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
interface Chip {
  id: number;
  ExperientName: string;
  CropName: string;
  fieldName?: string;
  Location?: string;
  Fieldno?: string;
}

const TakeNotes = ({navigation} : any) => {
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
  const [fields,setFields] = useState([])

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
    setProjectList(projectList);
    setExperimentList(experimentList);
    setSelectedCrop(selectedCrop);
    setSelectedProject(selectedProject);
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
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-auth-token': token,
    };


    if (!text) {
    Alert.alert('Error', 'Please select all fields before planning a visit');
    return;
  }
  const newData = {
    field_id: selectedField?.landVillageId,
    experiment_id: selectedExperiment?.id,
    experiment_type: selectedExperiment?.experimentType,
    content : text
  }
    setPayload(newData);
    takeNotes({ payload,headers });
    console.log("payload",payload)
  };

  useEffect(() => {
    if (takeNotesResponse && takeNotesResponse.status_code == 201) {
      Alert.alert('Success', 'Visit planned successfully')
      navigation.navigate('Home')
    }
  }, [takeNotesResponse]);

  const [getFields, getFieldsResponse] = useApi({
    url : `${URL.FIELDS}${selectedExperiment?.id}?$experimentType=line`,
    method : 'GET'
  })
  useEffect(()=>{
    getFields()
  },[selectedExperiment])
  
  useEffect(()=>{
    if(getFieldsResponse && getFieldsResponse.status_code == 200){ 
      setFields(getFieldsResponse.data.locationList)
    }
  },[getFieldsResponse])
  useEffect(()=>{
    console.log('fields',fields,selectedField)
  },[])

  return (
    <SafeAreaView>
      <StatusBar />
      <View style={TakeNotesStyles.container}>
        <Input
          placeholder={t(LOCALES.EXPERIMENT.LBL_SEARCH_EXPERIMENT)}
          leftIcon={Search}
          customLeftIconStyle={{marginRight: 10}}
        />
        <FlatList
          data={experimentList}
          contentContainerStyle={
            experimentList?.length === 0 ? {flexGrow: 1} : {paddingBottom: 80}
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
            name='experiment'
            onExperimentSelect={handleSelectedExperiment}
          />
        )}
        {
          selectedCrop && selectedProject && selectedExperiment && (
            <ExperimentCard
              data={fields}
              name={'field'}
              onExperimentSelect={handleSelectedExperiment}
              onFieldSelect={handleSelectedField}
            />
          )
        }

        {selectedExperiment && (
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
