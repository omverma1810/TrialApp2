import React, {useEffect, useState} from 'react';
import {View, Text, Image, Pressable} from 'react-native';

import {Flask, DbLeaf, File, Logo} from '../../../../assets/icons/svgs';
import DashInfoStyles from './DashInfoStyles';
import {HomeScreenProps} from '../../../../types/navigation/appTypes';
import {useApi} from '../../../../hooks/useApi';
import {URL} from '../../../../constants/URLS';
import {useIsFocused} from '@react-navigation/native';

type DashInfoProps = {
  navigation: HomeScreenProps['navigation'];
};

type DashInfoType = {
  experimentCount: number;
  fieldCount: number;
  totalRecords: number;
  recordedRecords: number;
};

const Dashinfo: React.FC<DashInfoProps> = ({navigation}) => {
  const [dashInfoData, setDashInfoData] = useState<DashInfoType | null>(null);
  const isFocused = useIsFocused();

  const [getinfo, getInfoResponse] = useApi({
    url: URL.DASH,
    method: 'GET',
  });
  useEffect(() => {
    isFocused && getinfo();
  }, [isFocused]);

  useEffect(() => {
    if (getInfoResponse && getInfoResponse.status_code === 200) {
      const newData: DashInfoType = {
        experimentCount: getInfoResponse.data.experimentCount,
        fieldCount: getInfoResponse.data.fieldCount,
        totalRecords: getInfoResponse.data.record.total,
        recordedRecords: getInfoResponse.data.record.recorded,
      };

      setDashInfoData(newData);
    }
  }, [getInfoResponse]);

  // const goToTakeExperiments = () => {
  //   navigation.navigate('ExperimentStackScreens');
  // };
  return (
    <View>
      <View style={DashInfoStyles.sectionContainer}>
        <View style={DashInfoStyles.container}>
          <Pressable style={DashInfoStyles.card}>
            <View style={DashInfoStyles.cardContent}>
              <Text style={DashInfoStyles.cardTitle}>Experiments</Text>
              <Text style={DashInfoStyles.cardValue}>
                {dashInfoData?.experimentCount}
              </Text>
            </View>
            <Flask />
          </Pressable>
          <View style={DashInfoStyles.card}>
            <View style={DashInfoStyles.cardContent}>
              <Text style={DashInfoStyles.cardTitle}>Fields</Text>
              <Text style={DashInfoStyles.cardValue}>
                {dashInfoData?.fieldCount}
              </Text>
            </View>
            <DbLeaf />
          </View>
        </View>
        <View style={DashInfoStyles.recordsContainer}>
          <View style={DashInfoStyles.cardContent}>
            <Text style={DashInfoStyles.recordsTitle}>Records Collected</Text>
            <View style={DashInfoStyles.recordsCountContainer}>
              <Text style={DashInfoStyles.recordsCount}>
                {dashInfoData?.recordedRecords}{' '}
              </Text>
              <Text style={DashInfoStyles.recordsOutOf}>
                out of {dashInfoData?.totalRecords}
              </Text>
            </View>
          </View>
          <File />
        </View>
      </View>
    </View>
  );
};

export default Dashinfo;
