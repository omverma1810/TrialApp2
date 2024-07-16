import {Image, Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView} from 'react-native-gesture-handler';

import {styles} from '../styles';
import {ImagePlus} from '../../../../assets/icons/svgs';
import {LOCALES} from '../../../../localization/constants';

const TraitsImage = ({images}: {images: string[]}) => {
  const {t} = useTranslation();
  return (
    <View style={styles.notesContainer}>
      <View style={styles.notesTitleContainer}>
        <ImagePlus color="#000" />
        <Text style={styles.notesLabel}>{t(LOCALES.EXPERIMENT.LBL_IMAGE)}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.imageContainer}>
          {images.map((image, index) => (
            <Image source={{uri: image}} style={styles.image} key={index} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default TraitsImage;
