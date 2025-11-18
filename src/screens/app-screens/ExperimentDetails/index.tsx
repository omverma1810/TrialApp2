import NetInfo from '@react-native-community/netinfo';
import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FlatList, Pressable, ScrollView, View} from 'react-native';

import {Back, Search} from '../../../assets/icons/svgs';
import {
  Input,
  Loader,
  SafeAreaView,
  StatusBar,
  Text,
} from '../../../components';
import {URL} from '../../../constants/URLS';
import {useApi} from '../../../hooks/useApi';
import {LOCALES} from '../../../localization/constants';
import {ExperimentDetailsScreenProps} from '../../../types/navigation/appTypes';
import FieldCard from './FieldCard';
import {styles} from './styles';
import {isLineExperiment} from '../../../utilities/experimentTypeUtils';

const ExperimentDetails = ({
  navigation,
  route,
}: ExperimentDetailsScreenProps) => {
  const {t} = useTranslation();
  const isFocused = useIsFocused();
  const {id, type, data, fromNewRecord} = route?.params;
  const [experimentDetails, setExperimentDetails] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [
    getExperimentDetails,
    experimentDetailsResponse,
    isExperimentDetailsLoading,
    experimentDetailsError,
  ] = useApi({
    url: URL.EXPERIMENT_DETAILS,
    method: 'GET',
    isConnected,
  });

  useEffect(() => {
    // when screen comes into focus…
    if (isFocused) {
      // Clear previous experiment details to avoid showing stale data when navigating between experiments
      setExperimentDetails(null);
      setSearchQuery('');
      // if (isConnected) {
      getExperimentDetails({
        pathParams: id,
        queryParams: `experimentType=${type}`,
      });
      // }
      // else {
      //   // offline: read from local Experiment_Details
      //   (async () => {
      //     try {
      //       const db = await SQLite.openDatabase({
      //         name: 'PiatrikaOffline.db',
      //         location: 'default',
      //       });
      //       db.transaction(tx => {
      //         tx.executeSql(
      //           'SELECT * FROM Experiment_Details WHERE field_experiment_id = ?;',
      //           [id],
      //           (_, {rows}) => {
      //             if (rows.length > 0) {
      //               setExperimentDetails(rows.item(0));
      //             }
      //           },
      //           (_, err) => {
      //
      //             return true;
      //           },
      //         );
      //       });
      //     } catch (err) {
      //
      //     }
      //   })();
      // }
    }
  }, [isFocused]);

  // track connectivity
  useEffect(() => {
    const unsub = NetInfo.addEventListener(s => setIsConnected(s.isConnected));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (
      experimentDetailsResponse?.status_code !== 200 ||
      !experimentDetailsResponse?.data
    ) {
      return;
    }

    const {data} = experimentDetailsResponse;
    setExperimentDetails(data);
  }, [experimentDetailsResponse]);

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {t(LOCALES.COMMON.LBL_NO_DATA_FOUND)}
        </Text>
      </View>
    ),
    [],
  );

  const filteredLocationList = useMemo(() => {
    const locationList = experimentDetails?.locationList;

    if (!locationList || locationList?.length === 0) {
      return [];
    }
    if (searchQuery === '') {
      return locationList;
    }
    return locationList.filter((location: any) =>
      location?.location?.fieldLabel
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
  }, [experimentDetails, searchQuery]);

  const renderFieldCard = useCallback(
    ({item, index}: any) => (
      <FieldCard
        fieldData={item}
        expData={{
          id,
          type,
          name: experimentDetails?.name,
          cropName: experimentDetails?.cropName,
          projectKey: experimentDetails?.projectId,
          season: experimentDetails?.season,
          year: experimentDetails?.year,
        }}
        isFirstIndex={index === 0}
        isLastIndex={index === filteredLocationList.length - 1}
        fromNewRecord={fromNewRecord} // ✅ Pass the fromNewRecord flag
      />
    ),
    [
      experimentDetails?.cropName,
      experimentDetails?.name,
      experimentDetails?.projectId,
      experimentDetails?.season,
      experimentDetails?.year,
      filteredLocationList.length,
      fromNewRecord,
      id,
      type,
    ],
  );

  const renderContent = () => {
    if (isExperimentDetailsLoading) {
      return (
        <View style={styles.loader}>
          <Loader />
        </View>
      );
    }

    if (!experimentDetails) {
      return ListEmptyComponent;
    }

    const {name, cropName, projectId} = experimentDetails;

    return (
      <View style={styles.container}>
        <View style={styles.experimentContainer}>
          <Text style={styles.experimentTitle}>
            {name} ({type})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.row}>
              <View style={styles.cropTitleContainer}>
                <Text style={styles.cropTitle}>{cropName}</Text>
              </View>
              <View
                style={[
                  styles.cropTitleContainer,
                  {backgroundColor: '#e8f0fb'},
                ]}>
                <Text style={styles.cropTitle}>{projectId || 'N/A'}</Text>
              </View>
              <View
                style={[
                  styles.cropTitleContainer,
                  {backgroundColor: '#fdf8ee'},
                ]}>
                <Text style={styles.cropTitle}>{data.season}</Text>
              </View>
              {data?.designType && !isLineExperiment(type) && (
                <View
                  style={[
                    styles.cropTitleContainer,
                    {backgroundColor: '#fcebea'},
                  ]}>
                  <Text style={styles.cropTitle}>{data?.designType}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
        <Input
          placeholder={t(LOCALES.EXPERIMENT.LBL_SEARCH_FIELD)}
          leftIcon={Search}
          containerStyle={styles.search}
          customLeftIconStyle={styles.searchIcon}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Text style={styles.fieldText}>
          {filteredLocationList.length}{' '}
          <Text>{t(LOCALES.EXPERIMENT.LBL_FIELDS)}</Text>
        </Text>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={filteredLocationList}
          renderItem={renderFieldCard}
          contentContainerStyle={
            filteredLocationList.length === 0 && {flexGrow: 1}
          }
          ListEmptyComponent={ListEmptyComponent}
        />
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']}>
      <StatusBar />
      <Pressable style={styles.backIconContainer} onPress={navigation.goBack}>
        <Back />
      </Pressable>
      {renderContent()}
    </SafeAreaView>
  );
};

export default ExperimentDetails;
