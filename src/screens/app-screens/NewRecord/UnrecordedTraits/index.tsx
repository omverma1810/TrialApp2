import {Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {styles} from '../styles';
import {LOCALES} from '../../../../localization/constants';
import UnrecordedTraitCard from './UnrecordedTraitCard';
import {UnrecordedTraitsProvider, TraitItem} from './UnrecordedTraitsContext';
import {useRecord} from '../RecordContext';

const UnrecordedTraits = () => {
  const {t} = useTranslation();
  const {unRecordedTraitList, updateRecordData} = useRecord();

  return (
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
  );
};

export default UnrecordedTraits;
