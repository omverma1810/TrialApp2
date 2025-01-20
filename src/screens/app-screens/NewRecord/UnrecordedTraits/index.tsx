import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Search } from '../../../../assets/icons/svgs';
import { LOCALES } from '../../../../localization/constants';
import { useRecord } from '../RecordContext';
import { styles } from '../styles';
import UnrecordedTraitCard from './UnrecordedTraitCard';
import { TraitItem, UnrecordedTraitsProvider } from './UnrecordedTraitsContext';

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
          <Text style={styles.unrecordedTraitsTitle}>
            {t(LOCALES.EXPERIMENT.LBL_RECORDED_TRAITS)}
            {` (${recordedTraitData?.length})`}
          </Text>
          <Search />
        </View>
        {recordedTraitData.map((item: TraitItem) => (
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
          <Search />
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
