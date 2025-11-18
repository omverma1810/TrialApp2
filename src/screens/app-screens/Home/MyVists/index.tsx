import React, {useState, useEffect, useCallback, useRef} from 'react';
import {View, Text} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useApi} from '../../../../hooks/useApi';
import MyVisitStyles from './MyVistStyles';
import UpcomingVisits from '../../../../components/Upcomingvisit';
import {URL} from '../../../../constants/URLS';
import {useFocusEffect} from '@react-navigation/native';
import Toast from '../../../../utilities/toast';
import {useIsFocused} from '@react-navigation/native';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import {LOCALES} from '../../../../localization/constants';

dayjs.extend(isSameOrAfter);

type MyVisitsProps = {
  navigation: any;
  refresh: any;
  onLoadingStateChange?: (isInitialLoading: boolean) => void;
};

const MyVisits = ({
  navigation,
  refresh,
  onLoadingStateChange,
}: MyVisitsProps) => {
  const {t} = useTranslation();
  const [visits, setVisits] = useState<{id: number; date: string}[]>([]);
  const [upcomingVisits, setUpcomingVisits] = useState<
    {id: number; date: string}[]
  >([]);
  const [previousVisits, setPreviousVisits] = useState<
    {id: number; date: string}[]
  >([]);
  const [fetchVisits, fetchVisitsResponse, isLoading] = useApi({
    url: URL.VISITS,
    method: 'GET',
  });
  const isFocused = useIsFocused();
  const initialLoadTriggeredRef = useRef(false);

  // Function to refresh visits data
  const refreshVisitsData = useCallback(() => {
    fetchVisits();
  }, [fetchVisits]);

  const categorizeVisits = (visits: any[]) => {
    const currentDate = dayjs().startOf('day');
    const upcoming = visits.filter(visit =>
      dayjs(visit.date).isSameOrAfter(currentDate),
    );
    const previous = visits.filter(visit =>
      dayjs(visit.date).isBefore(currentDate),
    );

    setUpcomingVisits(upcoming);
    setPreviousVisits(previous);
  };

  // Refresh only when screen comes into focus
  useEffect(() => {
    if (isFocused) {
      initialLoadTriggeredRef.current = true;
      fetchVisits();
    }
  }, [isFocused, fetchVisits]);

  useEffect(() => {
    if (fetchVisitsResponse && fetchVisitsResponse.status_code === 200) {
      setVisits(fetchVisitsResponse.data);
      categorizeVisits(fetchVisitsResponse.data);
    } else if (fetchVisitsResponse) {
      Toast.error({
        message: t(LOCALES.VISITS.MSG_FETCH_FAILED),
      });
    }
  }, [fetchVisitsResponse, t]);

  const handleDeletevisit = (id: any) => {
    const updatedVisits = visits.filter(visit => visit.id !== id);
    setVisits(updatedVisits);
    categorizeVisits(updatedVisits);
    // Refresh data from server after successful delete
    setTimeout(() => {
      refreshVisitsData();
    }, 500);
  };

  useFocusEffect(
    useCallback(() => {
      if (refresh) {
        fetchVisits();
        navigation.setParams({refresh: false});
      }
    }, [refresh]),
  );

  // Listen for navigation params that indicate a visit operation was completed
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const {visitAdded, visitUpdated, visitDeleted} =
        navigation
          .getState()
          ?.routes?.find((route: any) => route.name === 'MyVisits')?.params ||
        {};

      if (visitAdded || visitUpdated || visitDeleted) {
        refreshVisitsData();
        // Clear the params to avoid repeated refreshes
        navigation.setParams({
          visitAdded: false,
          visitUpdated: false,
          visitDeleted: false,
        });
      }
    });

    return unsubscribe;
  }, [navigation, refreshVisitsData]);

  // Listen for global events that indicate a visit was updated
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Always refresh when coming back to this screen to ensure latest data
      refreshVisitsData();
    });

    return unsubscribe;
  }, [navigation, refreshVisitsData]);

  const handleUpdateVisit = (updatedVisit: any) => {
    const updatedVisits = visits.map(visit =>
      visit.id === updatedVisit.id ? updatedVisit : visit,
    );
    setVisits(updatedVisits);
    categorizeVisits(updatedVisits);
    // Immediate refresh after update
    refreshVisitsData();
  };

  // Enhanced refresh function that can be called from child components
  const forceRefresh = useCallback(() => {
    refreshVisitsData();
  }, [refreshVisitsData]);

  useEffect(() => {
    if (!onLoadingStateChange) {
      return;
    }

    if (!initialLoadTriggeredRef.current && !isLoading) {
      return;
    }

    const hasAnyVisits =
      visits.length > 0 ||
      upcomingVisits.length > 0 ||
      previousVisits.length > 0;

    if (isLoading && !hasAnyVisits) {
      onLoadingStateChange(true);
      return;
    }

    onLoadingStateChange(false);
  }, [
    isLoading,
    visits.length,
    upcomingVisits.length,
    previousVisits.length,
    onLoadingStateChange,
  ]);

  return (
    <View>
      {upcomingVisits.length > 0 && (
        <View style={MyVisitStyles.upcomingVisitsContainer}>
          <Text style={MyVisitStyles.upcomingVisitsTitle}>
            {t(LOCALES.VISITS.TITLE_UPCOMING_VISITS)}
          </Text>
          {upcomingVisits.map(visit => (
            <UpcomingVisits
              key={visit.id}
              visit={visit}
              onDelete={handleDeletevisit}
              onUpdateVisit={handleUpdateVisit}
              navigation={navigation}
              refreshVisits={forceRefresh}
            />
          ))}
        </View>
      )}

      {previousVisits.length > 0 && (
        <View style={MyVisitStyles.upcomingVisitsContainer}>
          <Text style={MyVisitStyles.upcomingVisitsTitle}>
            {t(LOCALES.VISITS.TITLE_PREVIOUS_VISITS)}
          </Text>
          {previousVisits.map(visit => (
            <UpcomingVisits
              key={visit.id}
              visit={visit}
              onDelete={handleDeletevisit}
              onUpdateVisit={handleUpdateVisit}
              navigation={navigation}
              refreshVisits={forceRefresh}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default MyVisits;
