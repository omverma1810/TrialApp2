import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text, View} from 'react-native';

import {LOCALES} from '../../../../localization/constants';
import {useRecord} from '../RecordContext';
import {styles} from '../styles';
import UnrecordedTraitCard from './UnrecordedTraitCard';
import {TraitItem, UnrecordedTraitsProvider} from './UnrecordedTraitsContext';

const UnrecordedTraits = () => {
  const {t} = useTranslation();
  const {
    unRecordedTraitList,
    createRecordData,
    updateRecordData,
    selectedPlot,
    selectedExperiment,
    selectedField,
  } = useRecord();

  const {recordedTraitData} = selectedPlot;

  return (
    <>
      <View style={styles.unrecordedTraitsContainer}>
        <View style={[styles.unrecordedTraitsTitleContainer, styles.row]}>
          <Text style={styles.unrecordedTraitsTitle}>
            {t(LOCALES.EXPERIMENT.LBL_RECORDED_TRAITS)}
            {` (${recordedTraitData?.length})`}
          </Text>
        </View>
        {recordedTraitData?.length === 0 ? (
          <Text style={styles.noRecordedTraitText}>
            {t('No Recorded Trait')}
          </Text>
        ) : (
          recordedTraitData.map((item: TraitItem) => (
            <UnrecordedTraitsProvider
              key={item.traitId}
              item={item}
              updateRecordData={updateRecordData}>
              <UnrecordedTraitCard />
            </UnrecordedTraitsProvider>
          ))
        )}
      </View>

      <View style={styles.unrecordedTraitsContainer}>
        <View style={[styles.unrecordedTraitsTitleContainer, styles.row]}>
          <Text style={styles.unrecordedTraitsTitle}>
            {t(LOCALES.EXPERIMENT.LBL_UNRECORDED_TRAITS)}
            {` (${unRecordedTraitList?.length})`}
          </Text>
        </View>
        {unRecordedTraitList?.length === 0 ? (
          <Text style={styles.noUnrecordedTraitText}>
            {t('All Traits have been recorded')}
          </Text>
        ) : (
          unRecordedTraitList.map((item: TraitItem) => (
            <UnrecordedTraitsProvider
              key={item.traitId}
              item={item}
              updateRecordData={updateRecordData}>
              <UnrecordedTraitCard />
            </UnrecordedTraitsProvider>
          ))
        )}
      </View>
    </>
  );
};

export default UnrecordedTraits;
