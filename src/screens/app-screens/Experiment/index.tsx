import React, {useMemo} from 'react';
import {FlatList, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {styles} from './styles';
import Filter from './Filter';
import ExperimentCard from './ExperimentCard';
import {crops, experiments, projects} from './data';
import {Input, SafeAreaView, StatusBar, Text} from '../../../components';
import {LOCALES} from '../../../localization/constants';
import {Search} from '../../../assets/icons/svgs';

const Experiment = () => {
  const {t} = useTranslation();

  const ListHeaderComponent = useMemo(
    () => (
      <View style={styles.filter}>
        <Filter
          title={t(LOCALES.EXPERIMENT.LBL_CROP)}
          options={crops}
          onPress={option => {}}
        />
        <Filter
          title={t(LOCALES.EXPERIMENT.LBL_PROJECT)}
          options={projects}
          onPress={option => {}}
        />
      </View>
    ),
    [],
  );

  return (
    <SafeAreaView>
      <StatusBar />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t(LOCALES.EXPERIMENT.LBL_EXPERIMENT)}
        </Text>
      </View>
      <View style={styles.container}>
        <Input
          placeholder={t(LOCALES.EXPERIMENT.LBL_SEARCH_EXPERIMENT)}
          leftIcon={Search}
        />
        <FlatList
          data={experiments}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeaderComponent}
          renderItem={({item}) => <ExperimentCard data={item} />}
        />
      </View>
    </SafeAreaView>
  );
};

export default Experiment;
