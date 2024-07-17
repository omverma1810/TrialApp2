import {Pressable, Text, View} from 'react-native';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';

import {styles} from '../styles';
import {CardArrowDown, Search} from '../../../../assets/icons/svgs';
import {LOCALES} from '../../../../localization/constants';
import Filter from '../../Experiment/Filter';
import {crops, projects} from '../../Experiment/data';
import {useRecord} from '../RecordContext';

const SelectExperiment = () => {
  const {t} = useTranslation();
  const {
    isSelectExperimentVisible,
    selectedExperiment,
    handleExperimentSelect,
  } = useRecord();
  const experimentList = [
    {
      id: 0,
      experiment_name: 'GE-Male Line (R) development',
      crop_name: 'Maize',
    },
    {
      id: 1,
      experiment_name: 'GE-Female Line (R) development',
      crop_name: 'Rice',
    },
  ];
  const ListHeaderComponent = useMemo(
    () => (
      <View style={styles.filter}>
        <Filter
          title={t(LOCALES.EXPERIMENT.LBL_CROP)}
          options={[]}
          selectedOption=""
          onPress={option => {}}
        />
        <Filter
          title={t(LOCALES.EXPERIMENT.LBL_PROJECT)}
          options={[]}
          selectedOption=""
          onPress={option => {}}
        />
      </View>
    ),
    [],
  );
  const renderExperiment = (item: any) => {
    return (
      <Pressable
        key={item.id}
        style={styles.experimentLabelContainer}
        onPress={() => handleExperimentSelect(item)}>
        <Text style={styles.experimentLabel}>{item.experiment_name}</Text>
        <View style={styles.cropLabelContainer}>
          <Text style={styles.cropLabel}>{item.crop_name}</Text>
        </View>
      </Pressable>
    );
  };
  if (!isSelectExperimentVisible) return null;
  return (
    <>
      {!selectedExperiment ? (
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
      ) : (
        <Pressable
          style={[styles.experimentInfoContainer, styles.row]}
          onPress={() => handleExperimentSelect(null)}>
          <View style={styles.experimentHeaderTitleContainer}>
            <Text style={styles.experimentHeaderTitle}>
              {t(LOCALES.EXPERIMENT.LBL_EXPERIMENT)}
            </Text>
            <Text style={styles.experimentName}>
              {selectedExperiment?.experiment_name}
            </Text>
            <View style={styles.cropLabelContainer}>
              <Text style={styles.cropLabel}>
                {selectedExperiment?.crop_name}
              </Text>
            </View>
          </View>
          <CardArrowDown />
        </Pressable>
      )}
    </>
  );
};

export default SelectExperiment;
