import {Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {styles} from '../styles';
import {LOCALES} from '../../../../localization/constants';
import {Search} from '../../../../assets/icons/svgs';
import UnrecordedTraitCard from './UnrecordedTraitCard';
import {TraitItem, UnrecordedTraitsProvider} from './UnrecordedTraitsContext';

const UnrecordedTraits = () => {
  const {t} = useTranslation();
  const unrecordedTraitList: TraitItem[] = [];

  return (
    <View style={styles.unrecordedTraitsContainer}>
      <View style={[styles.unrecordedTraitsTitleContainer, styles.row]}>
        <Text style={styles.unrecordedTraitsTitle}>
          {t(LOCALES.EXPERIMENT.LBL_UNRECORDED_TRAITS)}
          <Text>{` (80)`}</Text>
        </Text>
        <Search />
      </View>
      {unrecordedTraitList.map(item => (
        <UnrecordedTraitsProvider key={item.traitId} item={item}>
          <UnrecordedTraitCard />
        </UnrecordedTraitsProvider>
      ))}
    </View>
  );
};

export default UnrecordedTraits;
