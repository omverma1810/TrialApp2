import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, Alert} from 'react-native';
import {useApi} from '../../../../hooks/useApi';
import MyVisitStyles from './MyVistStyles';
import UpcomingVisits from '../../../../components/Upcomingvisit';
import {URL} from '../../../../constants/URLS';
import {useFocusEffect} from '@react-navigation/native';
import Toast from '../../../../utilities/toast';
import {useIsFocused} from '@react-navigation/native';

const MyVisits = ({navigation, refresh}: any) => {
  const [visits, setVisits] = useState<{id: number}[]>([]);
  const [fetchVisits, fetchVisitsResponse] = useApi({
    url: URL.VISITS,
    method: 'GET',
  });
  const isFocused = useIsFocused();

  useEffect(() => {
    isFocused && fetchVisits();
  }, [isFocused]);

  useEffect(() => {
    if (fetchVisitsResponse && fetchVisitsResponse.status_code === 200) {
      setVisits(fetchVisitsResponse.data);
    } else if (fetchVisitsResponse) {
      Toast.error({
        message: 'Failed to fetch visits',
      });
    }
  }, [fetchVisitsResponse]);

  const handleDeletevisit = (id: any) => {
    setVisits(prevVisits => prevVisits.filter(visit => visit.id !== id));
  };

  useFocusEffect(
    useCallback(() => {
      if (refresh) {
        fetchVisits();
        navigation.setParams({refresh: false});
      }
    }, [refresh]),
  );

  return (
    <View style={{}}>
      {visits.length > 0 && (
        <View style={MyVisitStyles.upcomingVisitsContainer}>
          <Text style={MyVisitStyles.upcomingVisitsTitle}>
            My Upcoming Visits
          </Text>
          {visits.map(visit => (
            <UpcomingVisits
              key={visit.id}
              visit={visit}
              onDelete={handleDeletevisit}
              navigation={navigation}
              refreshVisits={fetchVisits}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default MyVisits;
