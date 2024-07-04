import React from 'react';
import {FlatList, Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {Input, SafeAreaView, StatusBar, Text} from '../../../components';
import {Back, Search} from '../../../assets/icons/svgs';
import {LOCALES} from '../../../localization/constants';
import PlotCard from './PlotCard';
import {styles} from './styles';
import {PlotsScreenProps} from '../../../types/navigation/appTypes';

const Plots = ({navigation, route}: PlotsScreenProps) => {
  const {t} = useTranslation();
  const {id, type} = route.params;
  return (
    <SafeAreaView edges={['top']}>
      <StatusBar />
      <Pressable style={styles.backIconContainer} onPress={navigation.goBack}>
        <Back />
      </Pressable>
      <View style={styles.container}>
        <View style={styles.plotContainer}>
          <Text style={styles.fieldTitle}>Field 123</Text>
          <View style={styles.row}>
            <Text style={styles.experimentTitle}>
              GE-Male Line (R) development
            </Text>
            <View style={styles.cropTitleContainer}>
              <Text style={styles.cropTitle}>Maize</Text>
            </View>
          </View>
        </View>
        <Input
          placeholder={t(LOCALES.EXPERIMENT.LBL_SEARCH_PLOT)}
          leftIcon={Search}
          containerStyle={styles.search}
          customLeftIconStyle={styles.searchIcon}
        />
        <Text style={styles.plotText}>
          354 <Text>{t(LOCALES.EXPERIMENT.LBL_PLOTS)}</Text>
        </Text>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={[{}, {}, {}]}
          renderItem={({item, index}) => (
            <PlotCard isFirstIndex={index === 0} isLastIndex={index === 2} />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default Plots;
