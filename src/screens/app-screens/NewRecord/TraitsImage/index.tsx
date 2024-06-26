import {Image, Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useRoute} from '@react-navigation/native';

import {styles} from '../styles';
import {ImagePlus} from '../../../../assets/icons/svgs';
import {LOCALES} from '../../../../localization/constants';
import {NewRecordScreenProps} from '../../../../types/navigation/appTypes';

const TraitsImage = () => {
  const {t} = useTranslation();
  const {traitMediaInfo} =
    useRoute<NewRecordScreenProps['route']>().params || {};
  if (!traitMediaInfo) return null;
  return (
    <View style={styles.notesContainer}>
      <View style={styles.notesTitleContainer}>
        <ImagePlus color="#000" />
        <Text style={styles.notesLabel}>{t(LOCALES.EXPERIMENT.LBL_IMAGE)}</Text>
      </View>
      <View style={styles.imageContainer}>
        <Image source={{uri: traitMediaInfo?.url}} style={styles.image} />
        <Image source={{uri: traitMediaInfo?.url}} style={styles.image} />
      </View>
      <Text style={styles.traitsLabel}>{traitMediaInfo?.name}</Text>
    </View>
  );
};

export default TraitsImage;
