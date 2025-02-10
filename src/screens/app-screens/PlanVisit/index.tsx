import dayjs, {Dayjs} from 'dayjs';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Back, DropdownArrow, Search} from '../../../assets/icons/svgs';
import {
  Calender,
  Input,
  Loader,
  SafeAreaView,
  StatusBar,
} from '../../../components';
import Chip from '../../../components/Chip';
import {URL} from '../../../constants/URLS';
import {useApi} from '../../../hooks/useApi';
import {LOCALES} from '../../../localization/constants';
import ExperimentCard from './ExperimentCard';
import Filter from './Filter';
import PlanVisitStyles from './PlanVisitStyles';
import Toast from '../../../utilities/toast';

interface Chip {
  id: number;
  ExperientName: string;
  CropName: string;
  fieldName?: string;
  Location?: string;
  Fieldno?: string;
}

const PlanVisit = ({navigation}: any) => {
  const {t} = useTranslation();
  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
  const [selectedChips, setSelectedChips] = useState<Chip[]>([]);
  const [chipTitle, setChipTitle] = useState('Select an Experiment');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [chipVisible, setChipVisible] = useState(true);
  const bottomSheetModalRef = useRef(null);
  const secondBottomSheetRef = useRef(null);
  const {bottom} = useSafeAreaInsets();
  const [experimentData, setExperimentData] = useState<any>(null);
  const [cropList, setCropList] = useState<string[]>([]);
  const [projectList, setProjectList] = useState<string[]>([]);
  const [experimentList, setExperimentList] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedExperiment, setSelectedExperiment] = useState<any>();
  const [fields, setFields] = useState([]);
  const [resetExperiment, setResetExperiment] = useState(false);
  const [resetField, setResetField] = useState(false);
  const handleSelectedExperiment = (experiment: any) => {
    setSelectedExperiment(experiment);
  };

  const handleSelectedField = (field: any) => {
    setSelectedField(field);
  };
  const resetSelection = () => {
    setSelectedExperiment(null);
    setSelectedField(null);
    setSelectedDate(null);
  };

  const handleCropChange = useCallback(
    (option: string) => {
      setSelectedCrop(option);
      const newProjectList = Object.keys(experimentData[option] || {});
      setProjectList(newProjectList);
      setSelectedProject(newProjectList[0] || '');
      setExperimentList(experimentData[option][newProjectList[0]] || []);

      setResetExperiment(true);
      setSelectedExperiment(null);
      setSelectedField(null);
      setSelectedDate(null);
    },
    [experimentData],
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
    }
  }, [experimentData]);

  const handleProjectChange = useCallback(
    (option: string) => {
      setSelectedProject(option);
      setExperimentList(experimentData[selectedCrop][option] || []);
      setSelectedExperiment(null);
      setChipTitle('Select an Experiment');
      setResetExperiment(true);
      setResetField(true);
      setSelectedDate(null);
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
    (bottomSheetModalRef.current as any).dismiss();
  };

  const handleFieldSelect = (item: Chip) => {
    setSelectedField(item);
    setChipTitle('Select Date');
    (secondBottomSheetRef.current as any).dismiss();
  };

  const handleOk = (date: Dayjs | null) => {
    setSelectedDate(dayjs(date));
    setModalVisible(false);
    setPayload(prevPayload => ({
      ...prevPayload,
      date: dayjs(date).format('YYYY-MM-DD'),
    }));
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleChipPress = () => {
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
      <View style={PlanVisitStyles.filter}>
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
      <View style={PlanVisitStyles.emptyContainer}>
        {isExperimentListLoading ? (
          <Loader />
        ) : (
          <Text style={PlanVisitStyles.emptyText}>
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
    date: '',
    experiment_type: '',
  });

  const [planVisit, planVisitResponse] = useApi({
    url: URL.VISITS,
    method: 'POST',
  });

  const onPlanVisit = async () => {
    if (!selectedDate) {
      Toast.error({
        message: 'Please select all fields before planning a visit',
      });
      return;
    }
    const newData = {
      field_id: selectedField?.landVillageId,
      experiment_id: selectedExperiment?.id,
      experiment_type: selectedExperiment?.experimentType,
      date: selectedDate.format('YYYY-MM-DD'),
    };
    await planVisit({payload: newData});
  };

  useEffect(() => {
    console.log({planVisitResponse});
    if (planVisitResponse && planVisitResponse.status_code == 201) {
      Toast.success({
        message: 'Visit planned successfully',
      });
      navigation.navigate('Home', {refresh: true});
    } else {
      if (planVisitResponse) {
        Toast.error({
          message: 'Something Went Wrong',
        });
      }
    }
  }, [planVisitResponse]);

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
        <Text style={PlanVisitStyles.ScreenTitle}>Plan Visit</Text>
      </View>

      <View style={PlanVisitStyles.container}>
        <View style={PlanVisitStyles.container}>
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
            keyExtractor={(_, index) => index.toString()}
            ListEmptyComponent={ListEmptyComponent}
          />
        </View>
        {selectedCrop && selectedProject && (
          <ExperimentCard
            data={experimentList}
            onExperimentSelect={handleSelectedExperiment}
            name={'experiment'}
            onFieldSelect={handleSelectedField}
            isProjectSelected={!!selectedExperiment}
            resetExperiment={resetExperiment}
            onReset={() => setResetExperiment(false)}
          />
        )}
        {selectedCrop && selectedProject && selectedExperiment && (
          <ExperimentCard
            data={fields}
            name={'field'}
            onExperimentSelect={handleSelectedField}
            onFieldSelect={handleSelectedField}
            onReset={() => setResetField(false)} // Function to reset the flag
            resetExperiment={resetSelection}
            selectedField={selectedField} // Pass selectedField as prop
            selectedDate={selectedDate} // Pass selectedDate as prop
          />
        )}
        {selectedExperiment && selectedField && !selectedDate && (
          <Pressable
            style={PlanVisitStyles.chipItem}
            onPress={() => setModalVisible(true)}>
            <View style={PlanVisitStyles.chipTextRow}>
              <Text style={PlanVisitStyles.chipText}>Select Visit Date</Text>
              <DropdownArrow />
            </View>
          </Pressable>
        )}
        {selectedDate && (
          <View style={PlanVisitStyles.dateContainer}>
            <Text style={PlanVisitStyles.dateTitle}>Date</Text>
            <Text style={PlanVisitStyles.dateText}>
              {selectedDate.format('dddd, MMMM D, YYYY')}
            </Text>
          </View>
        )}
        {selectedDate && (
          <Pressable style={PlanVisitStyles.submitButton} onPress={onPlanVisit}>
            <Text style={PlanVisitStyles.submitButtonText}>Plan a Visit</Text>
          </Pressable>
        )}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={PlanVisitStyles.modalOverlay}>
            <Calender
              modalVisible={modalVisible}
              onCancel={handleCancel}
              onOk={handleOk}
            />
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default PlanVisit;
