import {Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {styles} from '../styles';
import {LOCALES} from '../../../../localization/constants';
import {Search} from '../../../../assets/icons/svgs';
import UnrecordedTraitCard from './UnrecordedTraitCard';
import {RecordProvider} from './RecordContext';

const UnrecordedTraits = () => {
  const {t} = useTranslation();
  const unrecordedTraitList = [
    {
      id: 0,
      name: 'Cob Height',
      type: 'input',
    },
    {
      id: 1,
      name: 'Seeding Vigor',
      type: 'option',
    },
    {
      id: 2,
      name: 'Date of Sowing',
      type: 'date',
    },
  ];

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
        <RecordProvider key={item.id} item={item}>
          <UnrecordedTraitCard />
        </RecordProvider>
      ))}
    </View>
  );
};

export default UnrecordedTraits;
