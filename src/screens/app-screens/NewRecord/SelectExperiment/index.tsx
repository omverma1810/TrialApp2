import {Pressable, Text, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {styles} from '../styles';
import {CardArrowDown, Close, Search} from '../../../../assets/icons/svgs';
import {LOCALES} from '../../../../localization/constants';
import Filter from '../Filter';
import {useRecord} from '../RecordContext';
import {useRecordApi} from '../RecordApiContext';
import {Input, Loader} from '../../../../components';

const SelectExperiment = () => {
  const {t} = useTranslation();
  const {isExperimentListLoading} = useRecordApi();
  const {
    cropList,
    projectList,
    selectedCrop,
    selectedProject,
    experimentList,
    isSelectExperimentVisible,
    selectedExperiment,
    handleExperimentSelect,
    handleCropChange,
    handleProjectChange,
    getExperimentTypeColor,
  } = useRecord();

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
    [cropList, selectedCrop, projectList, selectedProject],
  );

  const renderExperiment = (item: any, index: number) => (
    <Pressable
      key={index}
      style={styles.experimentLabelContainer}
      onPress={() => handleExperimentSelect(item)}>
      <Text style={styles.experimentLabel}>{item?.fieldExperimentName}</Text>
      <View
        style={[
          styles.cropLabelContainer,
          {backgroundColor: getExperimentTypeColor(item?.experimentType)},
        ]}>
        <Text style={styles.cropLabel}>{item?.experimentType}</Text>
      </View>
    </Pressable>
  );

  const normalizeString = (str: string) => {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const ExperimentOptionsView = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchEnabled, setIsSearchEnabled] = useState(false);
    const onRightIconClick = () => {
      setIsSearchEnabled(false);
      setSearchQuery('');
    };
    const filteredExperimentList = useMemo(() => {
      if (searchQuery === '') {
        return experimentList;
      }
      return experimentList.filter(experiment =>
        normalizeString(experiment?.fieldExperimentName).includes(
          normalizeString(searchQuery),
        ),
      );
    }, [experimentList, searchQuery]);
    return (
      <View style={styles.selectExperimentContainer}>
        {isSearchEnabled ? (
          <Input
            placeholder={t(LOCALES.EXPERIMENT.LBL_SEARCH_EXPERIMENT)}
            leftIcon={Search}
            customLeftIconStyle={{marginRight: 10}}
            rightIcon={<Close color={'#161616'} />}
            customRightIconStyle={{marginLeft: 10}}
            onRightIconClick={onRightIconClick}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        ) : (
          <View style={[styles.selectExperimentTextContainer, styles.row]}>
            <Text style={styles.selectExperimentText}>
              {t(LOCALES.EXPERIMENT.LBL_SELECT_EXPERIMENT)}
            </Text>
            <Pressable onPress={() => setIsSearchEnabled(!isSearchEnabled)}>
              <Search />
            </Pressable>
          </View>
        )}
        {ListHeaderComponent}
        {filteredExperimentList.map(renderExperiment)}
      </View>
    );
  };

  const SelectedExperimentView = () => (
    <Pressable
      style={[styles.experimentInfoContainer, styles.row]}
      onPress={() => handleExperimentSelect(null)}>
      <View style={styles.experimentHeaderTitleContainer}>
        <Text style={styles.experimentHeaderTitle}>
          {t(LOCALES.EXPERIMENT.LBL_EXPERIMENT)}
        </Text>
        <Text style={styles.experimentName}>
          {selectedExperiment?.fieldExperimentName}
        </Text>
        <View
          style={[
            styles.cropLabelContainer,
            {
              backgroundColor: getExperimentTypeColor(
                selectedExperiment?.experimentType,
              ),
            },
          ]}>
          <Text style={styles.cropLabel}>
            {selectedExperiment?.experimentType}
          </Text>
        </View>
      </View>
      <CardArrowDown />
    </Pressable>
  );

  if (!isSelectExperimentVisible) {
    return null;
  }

  if (isExperimentListLoading) {
    return (
      <View style={styles.loader}>
        <Loader />
      </View>
    );
  }

  return selectedExperiment ? (
    <SelectedExperimentView />
  ) : (
    <ExperimentOptionsView />
  );
};

export default SelectExperiment;
