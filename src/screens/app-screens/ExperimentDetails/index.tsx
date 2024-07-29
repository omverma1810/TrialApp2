import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {
  Input,
  Loader,
  SafeAreaView,
  StatusBar,
  Text,
} from '../../../components';
import {styles} from './styles';
import {Back, Search} from '../../../assets/icons/svgs';
import {LOCALES} from '../../../localization/constants';
import FieldCard from './FieldCard';
import {ExperimentDetailsScreenProps} from '../../../types/navigation/appTypes';
import {useApi} from '../../../hooks/useApi';
import {URL} from '../../../constants/URLS';

const ExperimentDetails = ({
  navigation,
  route,
}: ExperimentDetailsScreenProps) => {
  const {t} = useTranslation();
  const {id, type} = route?.params;
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
    getExperimentDetails({
      pathParams: id,
      queryParams: `experimentType=${type}`,
    });
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
      location?.location?.villageName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
  }, [experimentDetails, searchQuery]);

  const renderFieldCard = useCallback(
    ({item, index}: any) => (
      <FieldCard
        fieldData={item}
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
          <View style={styles.cropTitleContainer}>
            <Text style={styles.cropTitle}>{cropName}</Text>
          </View>
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
