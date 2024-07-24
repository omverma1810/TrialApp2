import React from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import {SafeAreaView, StatusBar} from '../../../components';

import {ButtonNavigation, IconNotes} from '../../../assets/icons/svgs';
import {HomeScreenProps} from '../../../types/navigation/appTypes';

import DashInfo from './DashInfo';
import Header from './Header';
import styles from './HomeStyles';
import MyNote from './MyNotes';
import MyVisits from './MyVists';

const Home: React.FC<HomeScreenProps> = ({navigation}) => {
  const goToTakeNotes = () => {
    navigation.navigate('TakeNotes');
  };
  const goToPlanVisit = () => {
    navigation.navigate('PlanVisit');
  };

  return (
    <SafeAreaView>
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
            <MyVisits />
            <MyNote navigation={navigation} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Home;
