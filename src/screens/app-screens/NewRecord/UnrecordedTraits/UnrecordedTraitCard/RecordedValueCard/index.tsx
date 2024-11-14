import {Pressable, Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {Edit} from '../../../../../../assets/icons/svgs';
import {styles} from '../../../styles';
import {LOCALES} from '../../../../../../localization/constants';
import {useUnrecordedTraits} from '../../UnrecordedTraitsContext';

const RecordedValueCard = () => {
  const {t} = useTranslation();
  const {getFormattedRecordValue, onEdit, item} = useUnrecordedTraits();
  return (
    <View style={[styles.traitsContainer, styles.row]}>
      <View style={styles.traitsInfoContainer}>
        <Text style={styles.traitsLabelKey}>{item.traitName}</Text>
        <Text style={styles.traitsLabelValue}>{getFormattedRecordValue}</Text>
      </View>
      <Pressable style={styles.editContainer} onPress={onEdit}>
        {/* <Text style={styles.edit}>{t(LOCALES.EXPERIMENT.LBL_EDIT)}</Text> */}
        <Edit />
      </Pressable>
    </View>
  );
};

export default RecordedValueCard;
