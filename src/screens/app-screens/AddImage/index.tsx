import {Image, Pressable, Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {AddImageScreenProps} from '../../../types/navigation/appTypes';
import {SafeAreaView, StatusBar} from '../../../components';
import {Back, Check, X} from '../../../assets/icons/svgs';
import {LOCALES} from '../../../localization/constants';
import {styles} from './styles';

const AddImage = ({navigation, route}: AddImageScreenProps) => {
  const {t} = useTranslation();
  const {imageUrl} = route?.params;
  const onDone = () => {
    navigation.navigate('NewRecord', {imageUrl});
  };
  return (
    <SafeAreaView edges={['top']}>
      <StatusBar />
      <Pressable
        onPress={navigation.goBack}
        style={[styles.header, styles.row]}>
        <Back />
        <Text style={styles.headerTitle}>
          {t(LOCALES.EXPERIMENT.LBL_ADD_IMAGE)}
        </Text>
      </Pressable>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={{uri: imageUrl}} />
        </View>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={navigation.goBack}>
            <X />
          </Pressable>
          <Pressable style={styles.button} onPress={onDone}>
            <Check />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddImage;
