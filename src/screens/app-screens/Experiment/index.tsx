import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {styles} from './styles';
import Filter from './Filter';
import ExperimentCard from './ExperimentCard';
import {crops, experiments, projects} from './data';
import {Input, SafeAreaView, StatusBar, Text} from '../../../components';
import {LOCALES} from '../../../localization/constants';
import {Plus, Search} from '../../../assets/icons/svgs';
import NewRecordOptionsModal from './NewRecordOptionsModal';
import {ExperimentScreenProps} from '../../../types/navigation/appTypes';

const Experiment = ({navigation}: ExperimentScreenProps) => {
  const {t} = useTranslation();
  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
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
  const onNewRecordClick = () => {
    setIsOptionModalVisible(true);
  };
  const onCloseOptionsModalClick = () => {
    setIsOptionModalVisible(false);
  };
  const onSelectFromList = () => {
    setIsOptionModalVisible(false);
    navigation.navigate('NewRecord');
  };
  return (
    <SafeAreaView
      edges={['top']}
      parentStyle={isOptionModalVisible && styles.modalOpen}>
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
          customLeftIconStyle={{marginRight: 10}}
        />
        <FlatList
          data={experiments}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeaderComponent}
          renderItem={({item}) => <ExperimentCard data={item} />}
        />
      </View>
      {!isOptionModalVisible && (
        <Pressable style={styles.newRecord} onPress={onNewRecordClick}>
          <Plus />
          <Text style={styles.newRecordText}>
            {t(LOCALES.EXPERIMENT.NEW_RECORD)}
          </Text>
        </Pressable>
      )}
      <NewRecordOptionsModal
        isModalVisible={isOptionModalVisible}
        closeModal={onCloseOptionsModalClick}
        onSelectFromList={onSelectFromList}
      />
    </SafeAreaView>
  );
};

export default Experiment;
