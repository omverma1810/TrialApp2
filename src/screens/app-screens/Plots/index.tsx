import React, {useEffect, useMemo, useState, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {FlatList, Pressable, ScrollView, View} from 'react-native';
import {FONTS} from '../../../theme/fonts';

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
import {PlotsScreenProps} from '../../../types/navigation/appTypes';
import PlotCard from './PlotCard';
import {styles} from './styles';
import TraitDisplay from '../NewDataRecording/TraitDisplay';
import {BottomSheetModal, BottomSheetScrollView} from '@gorhom/bottom-sheet';
import BottomSheetModalView from '../../../components/BottomSheetModal';
import PlotNavigator from '../NewDataRecording/PlotNavigator';
import RecordedInputCard from '../NewDataRecording/RecordInputCard';
import FixedOptionsGrid from '../NewDataRecording/FixedOptionsGrid';
import RecordingStatusBar from '../NewDataRecording/RecordingStatusBar';

const Plots = ({navigation, route}: PlotsScreenProps) => {
  const {t} = useTranslation();
  const {id, type, data} = route.params;
  const [plotList, setPlotList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [details, setDetails] = useState({
    cropName: '',
    fieldExperimentId: '',
    fieldExperimentName: '',
    maxNoOfImages: 0,
    villageName: '',
    trialLocationId: '',
  });

  const [currentTrait, setCurrentTrait] = useState('');
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [currentPlotIndex, setCurrentPlotIndex] = useState(0);
  const [selectedFixedValue, setSelectedFixedValue] = useState('');
  const [traits, setTraits] = useState([]);

  interface TraitData {
    traitName: string;
    dataType?: string;
    preDefinedList?: string[];
    value?: string; // Assuming you have a value field for fixed traits
  }

  interface PlotData {
    recordedTraitData?: TraitData[];
    unrecordedTraitData?: TraitData[];
    plotNumber?: string;
    rowNumber?: number;
    columnNumber?: number;
  }

  const currentTraitData: TraitData | undefined = useMemo(() => {
    console.log('🟢 selectedPlot:', selectedPlot);
    console.log('🟢 currentTrait:', currentTrait);

    const recorded = selectedPlot?.recordedTraitData?.find(
      (t: TraitData) => t.traitName === currentTrait,
    );
    const unrecorded = selectedPlot?.unrecordedTraitData?.find(
      (t: TraitData) => t.traitName === currentTrait,
    );

    console.log('🟢 matched recorded:', recorded);
    console.log('🟢 matched unrecorded:', unrecorded);

    return recorded || unrecorded;
  }, [selectedPlot, currentTrait]);

  useEffect(() => {
    const selectedFixedTrait = selectedPlot?.recordedTraitData?.find(
      (t: TraitData) => t.traitName === currentTrait,
    );
    setSelectedFixedValue(selectedFixedTrait?.value || '');
  }, [selectedPlot, currentTrait]);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const plotModalRef = useRef<BottomSheetModal>(null);

  const openPlotModal = () => {
    plotModalRef.current?.present();
  };

  const selectPlot = (plot: any) => {
    setSelectedPlot(plot);

    const recordedTraits =
      plot.recordedTraitData?.map(
        (trait: {traitName: any}) => trait.traitName,
      ) || [];

    const unrecordedTraits =
      plot.unrecordedTraitData?.map(
        (trait: {traitName: any}) => trait.traitName,
      ) || [];

    const allTraits = [...recordedTraits, ...unrecordedTraits];
    const uniqueTraits = Array.from(new Set(allTraits));
    setTraits(uniqueTraits);

    if (!uniqueTraits.includes(currentTrait)) {
      setCurrentTrait(uniqueTraits[0] || '');
    }

    plotModalRef.current?.dismiss();

    const index = filteredPlotList.findIndex(
      p => p.plotNumber === plot.plotNumber,
    );
    if (index !== -1) setCurrentPlotIndex(index);
  };

  const handlePrevTrait = () => {
    const currentIndex = traits.indexOf(currentTrait);
    if (currentIndex > 0) setCurrentTrait(traits[currentIndex - 1]);
  };

  const handleNextTrait = () => {
    const currentIndex = traits.indexOf(currentTrait);
    if (currentIndex < traits.length - 1)
      setCurrentTrait(traits[currentIndex + 1]);
  };

  const handlePrevPlot = () => {
    setCurrentPlotIndex((prev: number) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextPlot = () => {
    setCurrentPlotIndex((prev: number) =>
      prev < filteredPlotList.length - 1 ? prev + 1 : prev,
    );
  };

  const openTraitModal = () => {
    bottomSheetModalRef.current?.present();
  };

  const selectTrait = (trait: string) => {
    setCurrentTrait(trait);
    bottomSheetModalRef.current?.dismiss();
  };

  const [getPlotList, plotListData, isPlotListLoading, plotListError] = useApi({
    url: URL.PLOT_LIST,
    method: 'GET',
  });

  useEffect(() => {
    getPlotList({pathParams: id, queryParams: `experimentType=${type}`});
  }, []);

  useEffect(() => {
    if (plotListData?.status_code !== 200 || !plotListData?.data) return;

    const {data} = plotListData;
    const plots = data?.plotData || [];

    setPlotList(plots);
    setDetails({
      cropName: data?.cropName,
      fieldExperimentId: data?.fieldExperimentId,
      fieldExperimentName: data?.fieldExperimentName,
      maxNoOfImages: 5,
      villageName: data?.villageName,
      trialLocationId: data?.trialLocationId,
      name: data?.name,
    });

    if (plots.length > 0) {
      setSelectedPlot(plots[0]);
      setCurrentPlotIndex(0);

      const recordedTraits =
        plots[0].recordedTraitData?.map(
          (trait: {traitName: any}) => trait.traitName,
        ) || [];
      const unrecordedTraits =
        plots[0].unrecordedTraitData?.map(
          (trait: {traitName: any}) => trait.traitName,
        ) || [];
      const allTraits = [...recordedTraits, ...unrecordedTraits];
      const uniqueTraits = Array.from(new Set(allTraits));
      setTraits(uniqueTraits);

      // Set the first trait as default
      setCurrentTrait(uniqueTraits[0] || '');
    }
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

  const handleRecordedTraits = () => {
    setPlotList([]);
    getPlotList({pathParams: id, queryParams: `experimentType=${type}`});
  };

  const filteredPlotList = useMemo(() => {
    if (searchQuery === '') {
      return plotList;
    }
    return plotList.filter(plot =>
      plot.plotNumber
        .toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
  }, [plotList, searchQuery]);

  // Compute total plots and recorded plots for the status bar.
  const totalPlots = plotList.length;
  const recordedPlots = useMemo(() => {
    // For example, consider a plot "recorded" if it has non-empty recordedTraitData.
    return plotList.filter(
      plot => plot.recordedTraitData && plot.recordedTraitData.length > 0,
    ).length;
  }, [plotList]);

  useEffect(() => {
    if (filteredPlotList.length > 0) {
      setSelectedPlot(filteredPlotList[currentPlotIndex]);
    }
  }, [currentPlotIndex, filteredPlotList]);

  return (
    <SafeAreaView edges={['top']}>
      <StatusBar />
      {isPlotListLoading && !plotListData ? (
        <View
          style={[
            styles.container,
            {justifyContent: 'center', alignItems: 'center'},
          ]}>
          <Loader />
        </View>
      ) : (
        <>
          <Pressable
            style={styles.backIconContainer}
            onPress={navigation.goBack}>
            <Back />
          </Pressable>
          <View style={styles.container}>
            <View style={styles.plotContainer}>
              {details?.trialLocationId && (
                <Text style={styles.fieldTitle}>
                  {t(LOCALES.EXPERIMENT.LBL_FIELD)} {details?.trialLocationId}-
                  {details?.villageName}
                </Text>
              )}
              {details.fieldExperimentName && details.cropName && (
                <View style={styles.row}>
                  <Text style={styles.experimentTitle}>
                    {details?.fieldExperimentName} ({type})
                  </Text>
                </View>
              )}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.rowContainer}>
                  {details?.cropName && (
                    <View style={styles.cropTitleContainer}>
                      <Text style={styles.cropTitle}>{details?.cropName}</Text>
                    </View>
                  )}
                  {data?.projectId && (
                    <View
                      style={[
                        styles.cropTitleContainer,
                        {backgroundColor: '#e8f0fb'},
                      ]}>
                      <Text style={styles.cropTitle}>{data?.projectId}</Text>
                    </View>
                  )}
                  {data?.season && (
                    <View
                      style={[
                        styles.cropTitleContainer,
                        {backgroundColor: '#fdf8ee'},
                      ]}>
                      <Text style={styles.cropTitle}>{data?.season}</Text>
                    </View>
                  )}
                  {data?.designType && (
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
            {/* Uncomment the search input if needed */}
            {/*
            <Input
              placeholder={t(LOCALES.EXPERIMENT.LBL_SEARCH_PLOT)}
              leftIcon={Search}
              containerStyle={styles.search}
              customLeftIconStyle={styles.searchIcon}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            */}
            {/* <Text style={styles.plotText}>
              {filteredPlotList.length}{' '}
              <Text>{t(LOCALES.EXPERIMENT.LBL_PLOTS)}</Text>
            </Text> */}
            {/* <FlatList
              ListEmptyComponent={ListEmptyComponent}
              contentContainerStyle={
                filteredPlotList?.length === 0 ? {flexGrow: 1} : {paddingBottom: 20}
              }
              showsVerticalScrollIndicator={false}
              data={filteredPlotList}
              renderItem={({item, index}) => (
                <PlotCard
                  plotData={item}
                  details={details}
                  handleRecordedTraits={handleRecordedTraits}
                  isFirstIndex={index === 0}
                  isLastIndex={filteredPlotList.length - 1 === index}
                />
              )}
            /> */}

            <TraitDisplay
              traitName={currentTrait}
              onPrev={handlePrevTrait}
              onNext={handleNextTrait}
              onTraitPress={openTraitModal}
            />

            <View
              style={{
                height: 1,
                backgroundColor: '#ccc',
                marginVertical: 8,
              }}
            />

            <PlotNavigator
              row={selectedPlot?.rowNumber || 0}
              col={selectedPlot?.columnNumber || 0}
              plotCode={selectedPlot?.plotNumber || ''}
              onPrev={handlePrevPlot}
              onNext={handleNextPlot}
              onPressNavigator={openPlotModal}
            />

            {/* Fixed Options Grid for fixed traits */}
            {currentTraitData?.dataType === 'fixed' &&
            Array.isArray(currentTraitData?.preDefiendList) &&
            currentTraitData.preDefiendList.length > 0 ? (
              <FixedOptionsGrid
                options={currentTraitData.preDefiendList.map(item => item.name)}
                selected={selectedFixedValue}
                onSelect={(option: string) => {
                  console.log('🟢 Selected fixed option:', option);
                  setSelectedFixedValue(option);
                  // TODO: Add logic to persist this selection to the backend if needed
                }}
              />
            ) : (
              <View
                style={{
                  margin: 16,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  backgroundColor: '#fffbe6',
                }}>
                <Text style={{fontSize: 14, color: '#444'}}>
                  ⚠️ No fixed options available for trait: {currentTrait}
                </Text>
                <Text style={{fontSize: 12, color: '#666'}}>
                  {JSON.stringify(currentTraitData, null, 2)}
                </Text>
              </View>
            )}

             {/* Recording status bar */}
            <RecordingStatusBar recorded={recordedPlots} total={totalPlots} />

            <BottomSheetModalView
              bottomSheetModalRef={bottomSheetModalRef}
              type="SCREEN_HEIGHT">
              <BottomSheetScrollView contentContainerStyle={{padding: 16}}>
                {traits.map((trait, index) => (
                  <Pressable
                    key={index}
                    onPress={() => selectTrait(trait)}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: '#eee',
                    }}>
                    <Text style={{fontSize: 16, fontFamily: FONTS.MEDIUM}}>
                      {trait}
                    </Text>
                  </Pressable>
                ))}
              </BottomSheetScrollView>
            </BottomSheetModalView>

            <BottomSheetModalView
              bottomSheetModalRef={plotModalRef}
              type="SCREEN_HEIGHT">
              <BottomSheetScrollView
                contentContainerStyle={{padding: 16}}
                keyboardShouldPersistTaps="handled">
                {filteredPlotList.map((plot, index) => (
                  <Pressable
                    key={index}
                    onPress={() => selectPlot(plot)}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: '#eee',
                    }}>
                    <Text style={{fontSize: 16, fontFamily: FONTS.MEDIUM}}>
                      {plot.plotNumber}
                    </Text>
                  </Pressable>
                ))}
              </BottomSheetScrollView>
            </BottomSheetModalView>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default Plots;
