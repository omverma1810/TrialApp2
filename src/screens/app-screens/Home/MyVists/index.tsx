import React, {useState, useEffect, useCallback} from 'react';
import {View, Text} from 'react-native';
import {useApi} from '../../../../hooks/useApi';
import MyVisitStyles from './MyVistStyles';
import UpcomingVisits from '../../../../components/Upcomingvisit';
import {URL} from '../../../../constants/URLS';
import {useFocusEffect} from '@react-navigation/native';
import Toast from '../../../../utilities/toast';
import {useIsFocused} from '@react-navigation/native';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';


dayjs.extend(isSameOrAfter);

const MyVisits = ({navigation, refresh}: any) => {
  const [visits, setVisits] = useState<{ id: number; date: string }[]>([]);
  const [upcomingVisits, setUpcomingVisits] = useState<{ id: number; date: string }[]>([]);
  const [previousVisits, setPreviousVisits] = useState<{ id: number; date: string }[]>([]);
  const [fetchVisits, fetchVisitsResponse] = useApi({
    url: URL.VISITS,
    method: 'GET',
  });
  const isFocused = useIsFocused();

  const categorizeVisits = (visits: any[]) => {
    const currentDate = dayjs().startOf('day'); // Start of today
    const upcoming = visits.filter(visit => dayjs(visit.date).isSameOrAfter(currentDate));
    const previous = visits.filter(visit => dayjs(visit.date).isBefore(currentDate));

    setUpcomingVisits(upcoming);
    setPreviousVisits(previous);
  };

  useEffect(() => {
    isFocused && fetchVisits();
  }, [isFocused]);

  useEffect(() => {
    if (fetchVisitsResponse && fetchVisitsResponse.status_code === 200) {
      setVisits(fetchVisitsResponse.data);
      categorizeVisits(fetchVisitsResponse.data);
    } else if (fetchVisitsResponse) {
      Toast.error({
        message: 'Failed to fetch visits',
      });
    }
  }, [fetchVisitsResponse]);

  const handleDeletevisit = (id: any) => {
    const updatedVisits = visits.filter(visit => visit.id !== id);
    setVisits(updatedVisits);
    categorizeVisits(updatedVisits); 
  };

  useFocusEffect(
    useCallback(() => {
      if (refresh) {
        fetchVisits();
        navigation.setParams({refresh: false});
      }
    }, [refresh]),
  );

  const handleUpdateVisit = (updatedVisit: any) => {
    const updatedVisits = visits.map(visit =>
      visit.id === updatedVisit.id ? updatedVisit : visit,
    );
    setVisits(updatedVisits);
    categorizeVisits(updatedVisits);
  };

  return (
    <View>
      {upcomingVisits.length > 0 && (
        <View style={MyVisitStyles.upcomingVisitsContainer}>
          <Text style={MyVisitStyles.upcomingVisitsTitle}>My Upcoming Visits</Text>
          {upcomingVisits.map(visit => (
            <UpcomingVisits
              key={visit.id}
              visit={visit}
              onDelete={handleDeletevisit}
              onUpdateVisit={handleUpdateVisit}
              navigation={navigation}
              refreshVisits={fetchVisits}
            />
          ))}
        </View>
      )}

      {previousVisits.length > 0 && (
        <View style={MyVisitStyles.upcomingVisitsContainer}>
          <Text style={MyVisitStyles.upcomingVisitsTitle}>My Previous Visits</Text>
          {previousVisits.map(visit => (
            <UpcomingVisits
              key={visit.id}
              visit={visit}
              onDelete={handleDeletevisit}
              onUpdateVisit={handleUpdateVisit}
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
