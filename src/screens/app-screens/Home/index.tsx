import { SafeAreaView, StatusBar } from '../../../components';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import {useTranslation} from 'react-i18next';
import { HomeScreenProps } from '../../../types/navigation/appTypes';
import { ButtonNavigation, IconNotes } from '../../../assets/icons/svgs';
import NewRecordOptionsModal from '../Experiment/NewRecordOptionsModal';
import {LOCALES} from '../../../localization/constants';
import {Plus} from '../../../assets/icons/svgs';
import DashInfo from './DashInfo';
import MyNote from './MyNotes';
import MyVisits from './MyVists';
import Header from './Header';
import styles from './HomeStyles';

const Home: React.FC<HomeScreenProps> = ({ navigation, route }: any) => {
  const { refresh } = route.params || {};
  const {t} = useTranslation();

  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);

  console.log("Refresh", refresh)
  const goToTakeNotes = () => {
    navigation.navigate('TakeNotes');
  };
  const goToPlanVisit = () => {
    navigation.navigate('PlanVisit');
  };
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
    <SafeAreaView edges={['top']} parentStyle={isOptionModalVisible && styles.modalOpen}>

      <StatusBar />
      <View style={styles.viewStyle}>
        <Header navigation={navigation} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <DashInfo navigation={navigation} />
          <View style={styles.rowStyle}>
            <Pressable onPress={goToTakeNotes} style={styles.takeNotesButton}>
              <IconNotes />
              <Text style={styles.takeNotesText}>Take Notes</Text>
            </Pressable>
            <Pressable onPress={goToPlanVisit} style={styles.planVisitButton}>
              <ButtonNavigation color="white" width={35} />
              <Text style={styles.planVisitText}>Plan a Visit</Text>
            </Pressable>
          </View>
          <View style={styles.container}>
            <MyVisits navigation={navigation} refresh={refresh} />
            <MyNote navigation={navigation} refresh={refresh} />
          </View>
        </ScrollView>
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

export default Home;
