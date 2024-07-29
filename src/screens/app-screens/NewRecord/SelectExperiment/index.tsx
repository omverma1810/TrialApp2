import {Pressable, Text, View} from 'react-native';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';

import {styles} from '../styles';
import {CardArrowDown, Search} from '../../../../assets/icons/svgs';
import {LOCALES} from '../../../../localization/constants';
import Filter from '../../Experiment/Filter';
import {useRecord} from '../RecordContext';
import {useRecordApi} from '../RecordApiContext';
import {Loader} from '../../../../components';

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
      <View style={styles.cropLabelContainer}>
        <Text style={styles.cropLabel}>{item?.experimentType}</Text>
      </View>
    </Pressable>
  );

  const ExperimentOptionsView = () => (
    <View style={styles.selectExperimentContainer}>
      <View style={[styles.selectExperimentTextContainer, styles.row]}>
        <Text style={styles.selectExperimentText}>
          {t(LOCALES.EXPERIMENT.LBL_SELECT_EXPERIMENT)}
        </Text>
        <Search />
      </View>
      {ListHeaderComponent}
      {experimentList.map(renderExperiment)}
    </View>
  );

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
        <View style={styles.cropLabelContainer}>
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
