import {Image, Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {styles} from '../styles';
import {ImagePlus, Notes as NotesIcon} from '../../../../assets/icons/svgs';
import {LOCALES} from '../../../../localization/constants';
import {useRoute} from '@react-navigation/native';
import {NewRecordScreenProps} from '../../../../types/navigation/appTypes';

const TraitsImage = () => {
  const {t} = useTranslation();
  const {traitsInfo} = useRoute<NewRecordScreenProps['route']>().params || {};
  return (
    <View style={styles.notesContainer}>
      <View style={styles.notesTitleContainer}>
        <ImagePlus color="#000" />
        <Text style={styles.notesLabel}>{t(LOCALES.EXPERIMENT.LBL_IMAGE)}</Text>
      </View>
      <View style={styles.imageContainer}>
        <Image source={{uri: traitsInfo?.imageUrl}} style={styles.image} />
        <Image source={{uri: traitsInfo?.imageUrl}} style={styles.image} />
      </View>
      <Text style={styles.traitsLabel}>{traitsInfo?.selectedTrait}</Text>
    </View>
  );
};

export default TraitsImage;
