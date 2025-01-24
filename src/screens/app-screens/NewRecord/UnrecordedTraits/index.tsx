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
    updateRecordData,
    selectedPlot,
    selectedExperiment,
    selectedField,
  } = useRecord();

  const {recordedTraitData} = selectedPlot;
  console.log({
    recordedTraitData,
    selectedPlot,
    selectedExperiment,
    selectedField,
  });

  return (
    <>
      <View style={styles.unrecordedTraitsContainer}>
        <View style={[styles.unrecordedTraitsTitleContainer, styles.row]}>
          {recordedTraitData?.length > 0 ? (
            <>
              <Text style={styles.unrecordedTraitsTitle}>
                {t(LOCALES.EXPERIMENT.LBL_RECORDED_TRAITS)}
                {` (${recordedTraitData?.length})`}
              </Text>
            </>
          ) : (
            <Text style={styles.unrecordedTraitsTitle}>
              {t('No Recorded Trait')}
            </Text>
          )}
        </View>
        {recordedTraitData?.length > 0 &&
          recordedTraitData.map((item: TraitItem) => (
            <UnrecordedTraitsProvider
              key={item.traitId}
              item={item}
              updateRecordData={updateRecordData}>
              <UnrecordedTraitCard />
            </UnrecordedTraitsProvider>
          ))}
      </View>

      <View style={styles.unrecordedTraitsContainer}>
        <View style={[styles.unrecordedTraitsTitleContainer, styles.row]}>
          <Text style={styles.unrecordedTraitsTitle}>
            {t(LOCALES.EXPERIMENT.LBL_UNRECORDED_TRAITS)}
            <Text>{` (${unRecordedTraitList?.length})`}</Text>
          </Text>
        </View>
        {unRecordedTraitList.map((item: TraitItem) => (
          <UnrecordedTraitsProvider
            key={item.traitId}
            item={item}
            updateRecordData={updateRecordData}>
            <UnrecordedTraitCard />
          </UnrecordedTraitsProvider>
        ))}
      </View>
    </>
  );
};

export default UnrecordedTraits;
