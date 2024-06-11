import {View} from 'react-native';
import React from 'react';

import {styles} from '../styles';
import {Text} from '../../../../components';
import {LOCALES} from '../../../../localization/constants';
import {useTranslation} from 'react-i18next';
import {Edit} from '../../../../assets/icons/svgs';

const RecordedTraits = () => {
  const {t} = useTranslation();
  const data = [
    {
      id: 0,
      name: 'Date of Sowing',
      value: '24 Oct 2023',
    },
    {
      id: 1,
      name: 'Flowering Date',
      value: '24 Sept 2023',
    },
  ];
  return (
    <View style={styles.recordedTraitsContainer}>
      <View style={styles.recordedTraitsTextContainer}>
        <Text style={styles.recordedTraitsText}>
          {t(LOCALES.EXPERIMENT.LBL_RECORDED_TRAITS)}
          <Text>{` (2)`}</Text>
        </Text>
      </View>
      {data.map(item => (
        <View style={styles.recordedTraitsInfoContainer} key={item.id}>
          <View style={styles.recordedTraitsInfoKeyTextContainer}>
            <Text style={styles.recordedTraitsInfoKeyText}>{item.name}</Text>
            <Text style={styles.recordedTraitsInfoValueText}>{item.value}</Text>
          </View>
          <View style={styles.editContainer}>
            <Text style={styles.edit}>{t(LOCALES.EXPERIMENT.LBL_EDIT)}</Text>
            <Edit />
          </View>
        </View>
      ))}
    </View>
  );
};

export default RecordedTraits;
