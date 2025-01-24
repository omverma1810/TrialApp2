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

const ExperimentDetails = ({
  navigation,
  route,
}: ExperimentDetailsScreenProps) => {
  const {t} = useTranslation();
  const isFocused = useIsFocused();
  const {id, type, data} = route?.params;
  const [experimentDetails, setExperimentDetails] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [
    getExperimentDetails,
    experimentDetailsResponse,
    isExperimentDetailsLoading,
    experimentDetailsError,
  ] = useApi({
    url: URL.EXPERIMENT_DETAILS,
    method: 'GET',
  });

  useEffect(() => {
    isFocused &&
      getExperimentDetails({
        pathParams: id,
        queryParams: `experimentType=${type}`,
      });
  }, [isFocused]);

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
      location?.location?.villageName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
  }, [experimentDetails, searchQuery]);

  const renderFieldCard = useCallback(
    ({item, index}: any) => (
      <FieldCard
        fieldData={item}
        expData={{id, type, filteredLocationList}}
        isFirstIndex={index === 0}
        isLastIndex={index === filteredLocationList.length - 1}
      />
    ),
    [filteredLocationList.length],
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

    const {name, cropName} = experimentDetails;

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
                <Text style={styles.cropTitle}>{data.projectId}</Text>
              </View>
              <View
                style={[
                  styles.cropTitleContainer,
                  {backgroundColor: '#fdf8ee'},
                ]}>
                <Text style={styles.cropTitle}>{data.season}</Text>
              </View>
              <View
                style={[
                  styles.cropTitleContainer,
                  {backgroundColor: '#fcebea'},
                ]}>
                <Text style={styles.cropTitle}>{data.designType}</Text>
              </View>
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
