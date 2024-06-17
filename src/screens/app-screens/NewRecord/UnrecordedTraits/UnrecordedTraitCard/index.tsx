import {Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {styles} from '../../styles';
import {LOCALES} from '../../../../../localization/constants';

const UnrecordedTraitCard = (item: any) => {
  const {t} = useTranslation();
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

export default UnrecordedTraitCard;
