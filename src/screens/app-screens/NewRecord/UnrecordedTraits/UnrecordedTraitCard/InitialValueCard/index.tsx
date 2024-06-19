import {Pressable, Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {styles} from '../../../styles';
import {LOCALES} from '../../../../../../localization/constants';
import {useRecord} from '../../RecordContext';

const InitialValueCard = () => {
  const {t} = useTranslation();
  const {onRecord, item} = useRecord();
  return (
    <View style={[styles.traitsContainer, styles.row]}>
      <Text style={styles.traitsTitle}>{item.name}</Text>
      <Pressable style={styles.recordButton} onPress={onRecord}>
        <Text style={styles.recordButtonTitle}>
          {t(LOCALES.EXPERIMENT.LBL_RECORD)}
        </Text>
      </Pressable>
    </View>
  );
};

export default InitialValueCard;
