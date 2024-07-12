import {Image, Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {styles} from '../styles';
import {ImagePlus} from '../../../../assets/icons/svgs';
import {LOCALES} from '../../../../localization/constants';

const TraitsImage = () => {
  const {t} = useTranslation();

  return (
    <View style={styles.notesContainer}>
      <View style={styles.notesTitleContainer}>
        <ImagePlus color="#000" />
        <Text style={styles.notesLabel}>{t(LOCALES.EXPERIMENT.LBL_IMAGE)}</Text>
      </View>
      <View style={styles.imageContainer}>
        <Image source={{uri: ''}} style={styles.image} />
      </View>
    </View>
  );
};

export default TraitsImage;
