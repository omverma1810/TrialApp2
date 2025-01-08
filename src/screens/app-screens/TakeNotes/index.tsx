import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Back } from '../../../assets/icons/svgs';
import { Loader, SafeAreaView, StatusBar } from '../../../components';
import Chip from '../../../components/Chip';
import { URL } from '../../../constants/URLS';
import { useApi } from '../../../hooks/useApi';
import { LOCALES } from '../../../localization/constants';
import Toast from '../../../utilities/toast';
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
  const [defaultChipTitleField, setDefaultChipTitleField] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [chipVisible, setChipVisible] = useState(true);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const bottomSheetModalRef = useRef(null);
  const secondBottomSheetRef = useRef(null);
  const {bottom} = useSafeAreaInsets();
  const [isEdit, setIsEdit] = useState(false);
  const [noteId, setNoteId] = useState(null);
  const [editNotesData, setEditNotesData] = useState<any>(null);
  const [text, setText] = useState('');
  const [experimentData, setExperimentData] = useState<any>(null);
  const [cropList, setCropList] = useState<string[]>([]);
  const [projectList, setProjectList] = useState<string[]>([]);
  const [experimentList, setExperimentList] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [staticSelectedProject, setStaticSelectedProject] = useState('');
  const [selectedExperiment, setSelectedExperiment] = useState<any>();
  const [selectedExperimentId, setSelectedExperimentId] = useState<any>();
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState();
  const [resetExperiment, setResetExperiment] = useState(false);

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
      setProjectList(newProjectList.reverse());
      setSelectedProject(newProjectList[0] || '');
      setSelectedExperiment(null);
      setSelectedExperimentId(null);
      setFields([]);
      setExperimentList(experimentData[option][newProjectList[0]] || []);
      setResetExperiment(true);
    },
    [experimentData],
  );

  const handleProjectChange = useCallback(
    (option: string) => {
      setSelectedProject(option);
      setExperimentList(experimentData[selectedCrop][option] || []);
      setSelectedExperiment(null);
      setSelectedField(null);
      setChipTitle('Select an Experiment');
      setResetExperiment(true);
    },
    [experimentData, selectedCrop],
  );
  useEffect(() => {
    console.log('~~~~~~~~~~~~~', {selectedProject, projectList});
  }, [selectedProject]);
  useEffect(() => {
    if (experimentData && Object.keys(experimentData).length > 0) {
      const firstCrop = Object.keys(experimentData)[0];
      const newProjectList = Object.keys(experimentData[firstCrop]);
      if (!isEdit) {
        setProjectList(newProjectList.reverse());
        setSelectedProject(newProjectList[0] || '');
        setExperimentList(experimentData[firstCrop][newProjectList[0]] || []);
      }
    } else {
      setProjectList([]);
      setSelectedProject('');
      setExperimentList([]);
    }
  }, [experimentData, isEdit]);

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
    setChipTitle('Note Title');
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
          onPress={!isEdit ? handleCropChange : () => {}}
        />
        <Filter
          title={t(LOCALES.EXPERIMENT.LBL_PROJECT)}
          options={projectList}
          selectedOption={selectedProject}
          onPress={!isEdit ? handleProjectChange : () => {}}
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

  const [getFields, getFieldsResponse] = useApi({
    url: URL.EXPERIMENT_DETAILS,
    method: 'GET',
  });
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
    if (route.params?.data && route.params?.data.id) {
      setIsEdit(true);
      let data_ = route.params?.data;
      console.log({data_});
      setEditNotesData(data_);
      let {experiment_name} = data_;
      for (let crops of cropList) {
        if (crops in data) {
          let project = data[crops];
          for (let p in project) {
            for (let field of project[p]) {
              if (
                field?.fieldExperimentName === experiment_name ||
                (field?.experimentName === experiment_name &&
                  field?.id === data_.experiment_id)
              ) {
                console.log('field', field);
                console.log('data_', data_);
                console.log('project', p);
                setCropList([crops]);
                setSelectedCrop(crops);
                setProjectList([p]);
                setSelectedProject(p);
                setExperimentList(data[crops][p]);
                setSelectedChips([experiment_name]);
                setSelectedExperiment(experiment_name);
                setSelectedFieldId(data_.field_id);

                setSelectedExperimentId(data_?.experiment_id || field.id);
                setNoteId(data_.id);
                setText(data_.content);
              }
            }
          }
        }
      }
    } else {
      console.log('test');
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
    url: isEdit ? `${URL.NOTES}${noteId}/` : URL.NOTES,
    method: isEdit ? 'PUT' : 'POST',
  });

  const onTakeNotes = async () => {
    if (!text) {
      Toast.error({
        message: 'Please select all fields before Taking a Note',
      });
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
    console.log({takeNotesResponse});
    if (
      takeNotesResponse &&
      (takeNotesResponse.status_code == 201 ||
        takeNotesResponse.status_code == 200)
    ) {
      if (isEdit) {
        Toast.success({
          message: 'Notes Updated Sucessfully',
        });
        // route.params?.fetchNotes();
      } else {
        Toast.success({
          message: 'Notes Created Sucessfully',
        });
      }
      navigation.navigate('Home', {refresh: true});
    } else {
      if (takeNotesResponse) {
        Toast.error({
          message: 'Something Went Wrong',
        });
      }
    }
  }, [takeNotesResponse]);

  useEffect(() => {
    const experimentId = selectedExperiment?.id || selectedExperimentId;
    console.log({selectedExperiment});

    let experimentType = 'line';
    console.log(editNotesData?.trial_type);
    if (isEdit && editNotesData?.trial_type) {
      experimentType = editNotesData.trial_type;
    } else if (selectedExperiment?.experimentType) {
      experimentType = selectedExperiment.experimentType;
    }
    if (experimentId && experimentType) {
      const queryParams = `experimentType=${experimentType}`;
      getFields({
        pathParams: experimentId,
        queryParams: queryParams,
      });
    }
  }, [selectedExperiment, selectedExperimentId]);

  useEffect(() => {
    if (getFieldsResponse && getFieldsResponse.status_code == 200) {
      if (isEdit) {
        let {locationList} = getFieldsResponse.data;
        console.log(
          'selectedFieldId',
          selectedFieldId,
          'landVillageId',
          locationList.map((location: any) => location.landVillageId),
        );

        let selectedField =
          locationList &&
          locationList.find((location: any) => {
            if (location.landVillageId === selectedFieldId) {
              return location;
            }
          });
        console.log(
          'selectedFieldId',
          selectedFieldId,
          'landVillageId',
          selectedField,
        );
        const field_name = selectedField?.location.villageName;
        console.log('selectedField', field_name);
        if (selectedField) {
          setDefaultChipTitleField(field_name);
          handleSelectedField(selectedField);
        }
        setProjectList([selectedProject]);
        setProjectList([selectedProject]);
        setSelectedProject(selectedProject);
      } else {
        setFields(getFieldsResponse.data.locationList);
      }
    }
  }, [getFieldsResponse]);

  useEffect(() => {
    console.log('fields', fields, selectedField);
  }, []);

  return (
    <SafeAreaView edges={['top']}>
      <StatusBar />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 20,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Back width={24} height={24} />
        </TouchableOpacity>
        <Text style={TakeNotesStyles.ScreenTitle}>
          {isEdit ? 'Edit Notes' : 'Take Notes'}
        </Text>
      </View>
      <View style={TakeNotesStyles.container}>
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
        {selectedCrop && selectedProject && (
          <ExperimentCard
            data={experimentList}
            name="experiment"
            onExperimentSelect={!isEdit ? handleSelectedExperiment : () => {}}
            selectedItem={selectedExperiment}
            resetExperiment={resetExperiment}
            onReset={() => setResetExperiment(false)}
            isEdit={isEdit}
          />
        )}
        {selectedCrop && selectedProject && selectedExperiment && (
          <ExperimentCard
            data={fields}
            name={'field'}
            onExperimentSelect={!isEdit ? handleSelectedExperiment : () => {}}
            onFieldSelect={handleSelectedField}
            selectedItem={selectedField}
            isEdit={isEdit}
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
              <Text style={TakeNotesStyles.submitButtonText}>
                {isEdit ? 'Update Note' : 'Save Note'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default TakeNotes;
