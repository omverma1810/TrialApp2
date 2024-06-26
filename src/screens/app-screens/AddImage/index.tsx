import {Image, Pressable, Text, View} from 'react-native';
import React, {useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {BottomSheetModal} from '@gorhom/bottom-sheet';

import {AddImageScreenProps} from '../../../types/navigation/appTypes';
import {SafeAreaView, StatusBar} from '../../../components';
import {Back, Check, X} from '../../../assets/icons/svgs';
import {LOCALES} from '../../../localization/constants';
import {styles} from './styles';
import TraitModal from './TraitModal';

const AddImage = ({navigation, route}: AddImageScreenProps) => {
  const {t} = useTranslation();
  const {imageUrl} = route?.params;
  const traitModalRef = useRef<BottomSheetModal>(null);
  const handleTraitModalOpen = () => {
    traitModalRef.current?.present();
  };
  const onTraitsSelect = (name: string) => {
    navigation.navigate('NewRecord', {traitMediaInfo: {name, url: imageUrl}});
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
          <Pressable style={styles.button}>
            <X />
          </Pressable>
          <Pressable style={styles.button} onPress={handleTraitModalOpen}>
            <Check />
          </Pressable>
        </View>
      </View>
      <TraitModal
        bottomSheetModalRef={traitModalRef}
        onSelect={onTraitsSelect}
      />
    </SafeAreaView>
  );
};

export default AddImage;
