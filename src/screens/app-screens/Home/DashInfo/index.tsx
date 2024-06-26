import React from 'react';
import {View, Text, Image, Pressable} from 'react-native';

import {Flask, Leaf, File, Logo} from '../../../../assets/icons/svgs';
import DashInfoStyles from './DashInfoStyles';
import {DashInfoData} from './Data';
import {HomeScreenProps} from '../../../../types/navigation/appTypes';

type DashInfoProps = {
  navigation: HomeScreenProps['navigation'];
};

const Dashinfo: React.FC<DashInfoProps> = ({navigation}) => {
  const {ExperimentCount, FieldCount, RecordCount} = DashInfoData[0];

  const goToTakeExperiments = () => {
    navigation.navigate('ExperimentStackScreens');
  };
  return (
    <View>
      <View style={DashInfoStyles.sectionContainer}>
        <View style={DashInfoStyles.container}>
          <Pressable style={DashInfoStyles.card} onPress={goToTakeExperiments}>
            <View style={DashInfoStyles.cardContent}>
              <Text style={DashInfoStyles.cardTitle}>Experiments</Text>
              <Text style={DashInfoStyles.cardValue}>{ExperimentCount}</Text>
            </View>
            <Flask />
          </Pressable>
          <View style={DashInfoStyles.card}>
            <View style={DashInfoStyles.cardContent}>
              <Text style={DashInfoStyles.cardTitle}>Fields</Text>
              <Text style={DashInfoStyles.cardValue}>{FieldCount}</Text>
            </View>
            <Leaf />
          </View>
        </View>
        <View style={DashInfoStyles.recordsContainer}>
          <View style={DashInfoStyles.cardContent}>
            <Text style={DashInfoStyles.recordsTitle}>Records Collected</Text>
            <View style={DashInfoStyles.recordsCountContainer}>
              <Text style={DashInfoStyles.recordsCount}>{RecordCount} </Text>
              <Text style={DashInfoStyles.recordsOutOf}>out of 100</Text>
            </View>
          </View>
          <File />
        </View>
      </View>
    </View>
  );
};

export default Dashinfo;
