import React from 'react';
import {FlatList, Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {Input, SafeAreaView, StatusBar, Text} from '../../../components';
import {styles} from './styles';
import {Back, Search} from '../../../assets/icons/svgs';
import {LOCALES} from '../../../localization/constants';
import FieldCard from './FieldCard';
import {ExperimentDetailsScreenProps} from '../../../types/navigation/appTypes';

const ExperimentDetails = ({
  navigation,
  route,
}: ExperimentDetailsScreenProps) => {
  const {t} = useTranslation();
  const {id, type} = route?.params;
  return (
    <SafeAreaView edges={['top']}>
      <StatusBar />
      <Pressable style={styles.backIconContainer} onPress={navigation.goBack}>
        <Back />
      </Pressable>
      <View style={styles.container}>
        <View style={styles.experimentContainer}>
          <Text style={styles.experimentTitle}>
            GE-Male Line (R) development
          </Text>
          <View style={styles.cropTitleContainer}>
            <Text style={styles.cropTitle}>Maize</Text>
          </View>
        </View>
        <Input
          placeholder={t(LOCALES.EXPERIMENT.LBL_SEARCH_FIELD)}
          leftIcon={Search}
          containerStyle={styles.search}
          customLeftIconStyle={styles.searchIcon}
        />
        <Text style={styles.fieldText}>
          5 <Text>{t(LOCALES.EXPERIMENT.LBL_FIELDS)}</Text>
        </Text>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={[{}, {}, {}]}
          renderItem={({item, index}) => (
            <FieldCard isFirstIndex={index === 0} isLastIndex={index === 2} />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default ExperimentDetails;
