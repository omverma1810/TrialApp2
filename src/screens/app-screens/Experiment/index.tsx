import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useIsFocused} from '@react-navigation/native';

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
  const isFocused = useIsFocused();
  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
  const [experimentData, setExperimentData] = useState<any>(null);
  const [cropList, setCropList] = useState<string[]>([]);
  const [projectList, setProjectList] = useState<string[]>([]);
  const [experimentList, setExperimentList] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCropChange = useCallback(
    (option: string) => {
      setSelectedCrop(option);
      const newProjectList = Object.keys(experimentData[option] || {});
      const experimentList = experimentData[option][newProjectList[0]] || [];
      const formattedExperimentList = groupByExperimentName(experimentList);
      setProjectList(newProjectList);
      setSelectedProject(newProjectList[0] || '');
      setExperimentList(formattedExperimentList);
    },
    [experimentData],
  );

  const handleProjectChange = useCallback(
    (option: string) => {
      setSelectedProject(option);
      const experimentList = experimentData[selectedCrop][option] || [];
      const formattedExperimentList = groupByExperimentName(experimentList);
      setExperimentList(formattedExperimentList);
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
    if (isFocused) {
      getExperimentList();
      setSelectedCrop('');
      setSelectedProject('');
      setCropList([]);
      setProjectList([]);
      setExperimentList([]);
    }
  }, [isFocused]);

  const groupByExperimentName = (array: any[]) => {
    const groupedMap = array.reduce((acc, curr) => {
      const key = curr.experimentName || 'N/A';
      if (!acc.has(key)) {
        acc.set(key, {name: key, data: []});
      }
      acc.get(key).data.push(curr);
      return acc;
    }, new Map());

    return Array.from(groupedMap.values());
  };

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
    const formattedExperimentList = groupByExperimentName(experimentList);

    setExperimentData(data);
    setCropList(cropList);
    setProjectList(projectList);
    setExperimentList(formattedExperimentList);
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

  const normalizeString = (str: string) => {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const filteredExperimentList = useMemo(() => {
    if (searchQuery === '') {
      return experimentList;
    }
    return experimentList.filter(experiment =>
      normalizeString(experiment.name).includes(normalizeString(searchQuery)),
    );
  }, [experimentList, searchQuery]);

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
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={filteredExperimentList}
          contentContainerStyle={
            filteredExperimentList?.length === 0
              ? {flexGrow: 1}
              : {paddingBottom: 80}
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeaderComponent}
          renderItem={({item, index}) => (
            <ExperimentCard item={item} selectedProject={selectedProject} />
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
