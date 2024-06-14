import {FlatList, Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {styles} from '../styles';
import {LOCALES} from '../../../../localization/constants';
import {Search} from '../../../../assets/icons/svgs';

const UnrecordedTraits = () => {
  const {t} = useTranslation();
  const unrecordedTraitList = [
    {
      id: 0,
      name: 'Cob Height',
      value: '',
    },
    {
      id: 1,
      name: 'Seeding Vigor',
      value: '',
    },
    {
      id: 2,
      name: 'Date of Sowing',
      value: '',
    },
  ];
  const renderUnrecordedTrait = (item: any) => {
    return (
      <View style={[styles.traitsContainer, styles.row]} key={item.id}>
        <Text style={styles.traitsTitle}>{item?.name}</Text>
        <View style={styles.recordButton}>
          <Text style={styles.recordButtonTitle}>
            {t(LOCALES.EXPERIMENT.LBL_RECORD)}
          </Text>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.unrecordedTraitsContainer}>
      <View style={[styles.unrecordedTraitsTitleContainer, styles.row]}>
        <Text style={styles.unrecordedTraitsTitle}>
          {t(LOCALES.EXPERIMENT.LBL_UNRECORDED_TRAITS)}
          <Text>{` (80)`}</Text>
        </Text>
        <Search />
      </View>
      {unrecordedTraitList.map(renderUnrecordedTrait)}
    </View>
  );
};

export default UnrecordedTraits;
