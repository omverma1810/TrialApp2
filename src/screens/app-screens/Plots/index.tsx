import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {
  Input,
  Loader,
  SafeAreaView,
  StatusBar,
  Text,
} from '../../../components';
import {Back, Search} from '../../../assets/icons/svgs';
import {LOCALES} from '../../../localization/constants';
import PlotCard from './PlotCard';
import {styles} from './styles';
import {PlotsScreenProps} from '../../../types/navigation/appTypes';
import {useApi} from '../../../hooks/useApi';
import {URL} from '../../../constants/URLS';

const Plots = ({navigation, route}: PlotsScreenProps) => {
  const {t} = useTranslation();
  const {id, type} = route.params;
  const [plotList, setPlotList] = useState<any[]>([]);

  const [getPlotList, plotListData, isPlotListLoading, plotListError] = useApi({
    url: URL.PLOT_LIST,
    method: 'GET',
  });

  useEffect(() => {
    getPlotList({pathParams: id, queryParams: `experimentType=${type}`});
  }, []);

  useEffect(() => {
    if (plotListData?.status_code !== 200 || !plotListData?.data) {
      return;
    }

    const {data} = plotListData;
    setPlotList(data?.plotData);
  }, [plotListData]);

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        {isPlotListLoading ? (
          <Loader />
        ) : (
          <Text style={styles.emptyText}>
            {t(LOCALES.COMMON.LBL_NO_DATA_FOUND)}
          </Text>
        )}
      </View>
    ),
    [isPlotListLoading],
  );

  return (
    <SafeAreaView edges={['top']}>
      <StatusBar />
      <Pressable style={styles.backIconContainer} onPress={navigation.goBack}>
        <Back />
      </Pressable>
      <View style={styles.container}>
        <View style={styles.plotContainer}>
          <Text style={styles.fieldTitle}>
            {t(LOCALES.EXPERIMENT.LBL_FIELD)} {id}
          </Text>
          <View style={styles.row}>
            <Text style={styles.experimentTitle}>
              GE-Male Line (R) development
            </Text>
            <View style={styles.cropTitleContainer}>
              <Text style={styles.cropTitle}>Maize</Text>
            </View>
          </View>
        </View>
        <Input
          placeholder={t(LOCALES.EXPERIMENT.LBL_SEARCH_PLOT)}
          leftIcon={Search}
          containerStyle={styles.search}
          customLeftIconStyle={styles.searchIcon}
        />
        <Text style={styles.plotText}>
          {plotList.length} <Text>{t(LOCALES.EXPERIMENT.LBL_PLOTS)}</Text>
        </Text>
        <FlatList
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={
            plotList?.length === 0 ? {flexGrow: 1} : {paddingBottom: 20}
          }
          showsVerticalScrollIndicator={false}
          data={plotList}
          renderItem={({item, index}) => (
            <PlotCard
              plotData={item}
              isFirstIndex={index === 0}
              isLastIndex={plotList.length - 1 === index}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default Plots;
