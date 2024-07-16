import React, {useState,useEffect} from 'react';
import {View, Text, Alert} from 'react-native';
import { useApi } from '../../../../hooks/useApi';
import MyVisitStyles from './MyVistStyles';
import UpcomingVisits from '../../../../components/Upcomingvisit';
import { URL } from '../../../../constants/URLS';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyVisits = ({navigation}) => {
  const [visits, setVisits] = useState<{ id: number }[]>([]);
  const [fetchVisits, fetchVisitsResponse] = useApi({
    url: URL.VISITS,
    method: 'GET',
  });

  useEffect(() => {
    const getVisits = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-auth-token': token,
      };

      fetchVisits({headers});
    };

    getVisits();
  }, []);

  useEffect(() => {
    if (fetchVisitsResponse && fetchVisitsResponse.status_code === 200) {
      setVisits(fetchVisitsResponse.data);
    } else if (fetchVisitsResponse) {
      Alert.alert('Error', 'Failed to fetch visits');
    }
  }, [fetchVisitsResponse]);

  const handleDeletevisit = id => {
    setVisits(prevVisits => prevVisits.filter(visit => visit.id !== id));
  };
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
              refreshVisits={fetchVisits} // Passing fetchVisits as a prop

            />
          ))}
        </View>
      )}
    </View>
  );
};

export default MyVisits;