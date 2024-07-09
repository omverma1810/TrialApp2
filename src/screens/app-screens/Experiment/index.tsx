import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {styles} from './styles';
import Filter from './Filter';
import ExperimentCard from './ExperimentCard';
import {
  Input,
  Loader,
  SafeAreaView,
  StatusBar,
  Text,
} from '../../../components';
import {LOCALES} from '../../../localization/constants';
import {Plus, Search} from '../../../assets/icons/svgs';
import NewRecordOptionsModal from './NewRecordOptionsModal';
import {ExperimentScreenProps} from '../../../types/navigation/appTypes';
import {URL} from '../../../constants/URLS';
import {useApi} from '../../../hooks/useApi';

const Experiment = ({navigation}: ExperimentScreenProps) => {
  const {t} = useTranslation();
  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
  const [experimentData, setExperimentData] = useState<any>(null);
  const [cropList, setCropList] = useState<string[]>([]);
  const [projectList, setProjectList] = useState<string[]>([]);
  const [experimentList, setExperimentList] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

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

  const ListHeaderComponent = useMemo(
    () => (
      <View style={styles.filter}>
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
      <View style={styles.emptyContainer}>
        {isExperimentListLoading ? (
          <Loader />
        ) : (
          <Text style={styles.emptyText}>
            {t(LOCALES.COMMON.LBL_NO_DATA_FOUND)}
          </Text>
        )}
      </View>
    ),
    [isExperimentListLoading],
  );

  return (
    <SafeAreaView
      edges={['top']}
      parentStyle={isOptionModalVisible && styles.modalOpen}>
      <StatusBar />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t(LOCALES.EXPERIMENT.LBL_EXPERIMENT)}
        </Text>
      </View>
      <View style={styles.container}>
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
          renderItem={({item, index}) => (
            <ExperimentCard
              data={item}
              isFirstIndex={index === 0}
              isLastIndex={index === experimentList.length - 1}
            />
          )}
          keyExtractor={(_, index) => index.toString()}
          ListEmptyComponent={ListEmptyComponent}
        />
      </View>
      {!isOptionModalVisible && (
        <Pressable style={styles.newRecord} onPress={onNewRecordClick}>
          <Plus />
          <Text style={styles.newRecordText}>
            {t(LOCALES.EXPERIMENT.NEW_RECORD)}
          </Text>
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

export default Experiment;
