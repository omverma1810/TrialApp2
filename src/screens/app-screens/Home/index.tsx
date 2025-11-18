import {SafeAreaView, StatusBar} from '../../../components';
import {View, Text, ScrollView, Pressable} from 'react-native';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';
import {HomeScreenProps} from '../../../types/navigation/appTypes';
import {ButtonNavigation, IconNotes} from '../../../assets/icons/svgs';
import NewRecordOptionsModal from '../Experiment/NewRecordOptionsModal';
import {Plus} from '../../../assets/icons/svgs';
import MyNote from './MyNotes';
import MyVisits from './MyVists';
import MyRecentProjects from './MyRecentProjects';
import Header from './Header';
import styles from './HomeStyles';
import HomeSkeleton from './HomeSkeleton';
import {LOCALES} from '../../../localization/constants';

const Home: React.FC<HomeScreenProps> = ({navigation, route}: any) => {
  const {refresh} = route.params || {};
  const {t} = useTranslation();

  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sectionLoading, setSectionLoading] = useState({
    recentProjects: true,
    visits: true,
    notes: true,
  });

  // Refresh recent experiments when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, []),
  );

  const handleSectionLoadingChange = useCallback(
    (section: 'recentProjects' | 'visits' | 'notes') =>
      (isInitialLoading: boolean) => {
        setSectionLoading(prev => {
          if (prev[section] === isInitialLoading) {
            return prev;
          }

          return {
            ...prev,
            [section]: isInitialLoading,
          };
        });
      },
    [],
  );

  const isSkeletonActive =
    sectionLoading.recentProjects ||
    sectionLoading.visits ||
    sectionLoading.notes;

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
    <SafeAreaView
      edges={['top']}
      parentStyle={isOptionModalVisible && styles.modalOpen}>
      <StatusBar />
      <View style={styles.viewStyle}>
        <Header navigation={navigation} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}>
          {isSkeletonActive && <HomeSkeleton />}
          <View
            style={[
              styles.contentLayout,
              isSkeletonActive ? styles.contentHidden : undefined,
            ]}>
            <MyRecentProjects
              refreshKey={refreshKey}
              onLoadingStateChange={handleSectionLoadingChange(
                'recentProjects',
              )}
            />
            <View style={styles.rowStyle}>
              <Pressable onPress={goToTakeNotes} style={styles.takeNotesButton}>
                <IconNotes />
                <Text style={styles.takeNotesText}>
                  {t(LOCALES.HOME.LBL_TAKE_NOTES)}
                </Text>
              </Pressable>
              <Pressable onPress={goToPlanVisit} style={styles.planVisitButton}>
                <ButtonNavigation color="white" width={35} />
                <Text style={styles.planVisitText}>
                  {t(LOCALES.HOME.LBL_PLAN_VISIT)}
                </Text>
              </Pressable>
            </View>
            <View style={styles.sectionStack}>
              <MyVisits
                navigation={navigation}
                refresh={refresh}
                onLoadingStateChange={handleSectionLoadingChange('visits')}
              />
              <MyNote
                navigation={navigation}
                refresh={refresh}
                onLoadingStateChange={handleSectionLoadingChange('notes')}
              />
            </View>
          </View>
        </ScrollView>
      </View>
      {!isOptionModalVisible && !isSkeletonActive && (
        <Pressable style={styles.newRecord} onPress={onNewRecordClick}>
          <Plus />
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
