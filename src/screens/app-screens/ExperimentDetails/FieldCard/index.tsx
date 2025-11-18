import NetInfo from '@react-native-community/netinfo';
import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Pressable, Text, View, Dimensions} from 'react-native';

import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {
  CardArrowDown,
  CardArrowUp,
  Columns,
  Leaf,
  LocationPin,
  Plots,
  Rows,
  ChevronBWRight,
  ChevronRight,
} from '../../../../assets/icons/svgs';
import {URL} from '../../../../constants/URLS';
import {useApi} from '../../../../hooks/useApi';
import {LOCALES} from '../../../../localization/constants';
import {ExperimentDetailsScreenProps} from '../../../../types/navigation/appTypes';
import TraitModal from '../../Experiment/ExperimentCard/ExperimentList/TraitModal';
import {styles} from '../styles';

type FieldData = {
  [key: string]: any;
  name?: string;
  location?: {villageName: string};
  traitList?: any[];
};

type TrialData = {
  [key: string]: any;
};

const FieldCard = ({
  isFirstIndex,
  isLastIndex,
  fieldData,
  expData,
  fromNewRecord,
}: any) => {
  const {t} = useTranslation();
  const {navigate} =
    useNavigation<ExperimentDetailsScreenProps['navigation']>();
  const {
    params: {type, data},
  } = useRoute<ExperimentDetailsScreenProps['route']>();
  const traitModalRef = useRef<BottomSheetModal>(null);
  const handleTraitModalOpen = () => traitModalRef.current?.present();

  const [trialData, setTrialData] = useState<TrialData>({});
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isMoreDetailsExpanded, setIsMoreDetailsExpanded] = useState(false);
  const [getField, getFieldResponse, isFieldLoading, getFieldError] = useApi({
    url: URL.PLOT_LIST,
    method: 'GET',
    isConnected,
  });

  // Get screen dimensions for responsive design
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 400;

  useEffect(() => {
    getField({
      pathParams: fieldData.id,
      queryParams: `experimentType=${expData.type}`,
    });
  }, [isConnected]);

  useEffect(() => {
    const unsub = NetInfo.addEventListener(s => setIsConnected(s.isConnected));
    return () => unsub();
  }, []);

  useEffect(() => {
    setTrialData(getFieldResponse?.data || {});
  }, [getFieldResponse]);

  const toggleMoreDetails = () => {
    setIsMoreDetailsExpanded(!isMoreDetailsExpanded);
  };

  const navigateToPlots = () => {
    const trackingData = {
      ...data,
      cropName: data?.cropName ?? trialData?.cropName ?? expData?.cropName,
      experimentName:
        data?.experimentName ?? trialData?.fieldExperimentName ?? expData?.name,
      fieldExperimentName:
        data?.fieldExperimentName ??
        trialData?.fieldExperimentName ??
        expData?.name,
      projectKey: data?.projectKey ?? expData?.projectKey,
      experimentId: data?.experimentId ?? expData?.id,
      experimentType: data?.experimentType ?? expData?.type,
      year:
        data?.year ??
        (trialData?.year
          ? String(trialData.year)
          : expData?.year
          ? String(expData.year)
          : undefined),
    };

    navigate('Plots', {
      id: String(fieldData?.id),
      type: type,
      data: trackingData,
      experimentID: expData?.id ? String(expData.id) : undefined,
      locationID: fieldData?.landVillageId
        ? String(fieldData.landVillageId)
        : undefined,
      fromNewRecord: fromNewRecord, // ✅ Pass the fromNewRecord flag to Plots screen
    });
  };

  const moreDetailsInfo = [
    {
      id: 0,
      icon: Rows,
      title: t(LOCALES.EXPERIMENT.LBL_ROWS),
      key: 'noOfRows',
      uom: null,
    },
    {
      id: 1,
      icon: Columns,
      title: 'Range',
      key: 'noOfColumn',
      uom: null,
    },
    {
      id: 6,
      icon: null,
      title: 'Block Width',
      key: 'blockWidth',
      uom: 'm',
    },
    {
      id: 7,
      icon: null,
      title: 'Block Gap',
      key: 'gapBlocks',
      uom: 'cm',
    },
    {
      id: 8,
      icon: null,
      title: 'Plot Size',
      key: 'plotSize',
      uom: 'sq. m',
    },
    {
      id: 9,
      icon: null,
      title: 'Plot Width',
      key: 'plotWidth',
      uom: 'm',
    },
  ];

  const renderMoreDetailItem = useCallback(
    ({id, key, title, icon: Icon, uom}: (typeof moreDetailsInfo)[0]) => {
      const value =
        trialData && typeof trialData === 'object' && key in trialData
          ? trialData[key]
          : fieldData[key];

      return (
        <View style={styles.detailCard} key={id}>
          <View style={styles.detailCardContent}>
            {Icon && <Icon width={32} height={32} />}
            <View style={styles.detailCardTextContainer}>
              <Text style={styles.detailCardTitle}>{title}</Text>
              <Text style={styles.detailCardValue}>
                {value ?? '-'} {uom ? uom : ''}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [trialData, fieldData],
  );

  return (
    <View
      style={[
        styles.fieldContainer,
        isFirstIndex && styles.firstIndex,
        isLastIndex && styles.lastIndex,
      ]}>
      {/* Location Header */}
      <View style={styles.locationHeader}>
        <View style={styles.locationNameContainer}>
          <LocationPin width={16} height={16} />
          <Text style={styles.locationName}>
            {fieldData?.location?.fieldLabel}
          </Text>
        </View>
      </View>

      {/* Main Cards Container */}
      <View style={styles.mainCardsContainer}>
        <View style={styles.mainCardsRow}>
          {/* Plots Card - Enhanced for responsiveness */}
          <Pressable style={styles.plotsCard} onPress={navigateToPlots}>
            <View style={styles.cardValueWithIcon}>
              <Plots
                width={isSmallScreen ? 28 : 30}
                height={isSmallScreen ? 28 : 28}
                color="#1A6DD2"
              />
              <View style={styles.plotsTextContainer}>
                <Text
                  style={styles.cardTitle}
                  numberOfLines={1}
                  adjustsFontSizeToFit={isSmallScreen}
                  minimumFontScale={0.8}>
                  {t(LOCALES.EXPERIMENT.LBL_PLOTS)}
                </Text>
                <Text
                  style={styles.cardValue}
                  numberOfLines={1}
                  adjustsFontSizeToFit={isSmallScreen}
                  minimumFontScale={0.8}>
                  {trialData?.plots_count || fieldData?.plots_count || '0'}
                </Text>
              </View>
              <ChevronRight
                width={isSmallScreen ? 16 : 18}
                height={isSmallScreen ? 20 : 20}
                style={styles.chevronIcon}
              />
            </View>
          </Pressable>

          {/* Traits Card */}
          <Pressable style={styles.traitsCard} onPress={handleTraitModalOpen}>
            <View style={styles.cardValueWithIcon}>
              <Leaf width={24} height={24} color="#1A6DD2" />
              <View style={styles.plotsTextContainer}>
                <Text style={styles.cardTitle}>Traits</Text>
                <Text style={styles.cardValue}>
                  {fieldData?.traits?.recorded || '0'}/
                  {fieldData?.traits?.total || '0'}
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      </View>

      {/* More Details Section */}
      <Pressable style={styles.moreDetailsHeader} onPress={toggleMoreDetails}>
        <Text style={styles.moreDetailsTitle}>More Details</Text>
        {isMoreDetailsExpanded ? (
          <CardArrowUp width={28} height={22} />
        ) : (
          <CardArrowDown width={28} height={22} />
        )}
      </Pressable>

      {/* Expanded More Details */}
      {isMoreDetailsExpanded && (
        <View style={styles.moreDetailsContainer}>
          <View style={styles.moreDetailsGrid}>
            {moreDetailsInfo.map(renderMoreDetailItem)}
          </View>
        </View>
      )}

      <TraitModal
        bottomSheetModalRef={traitModalRef}
        data={fieldData?.traitList}
      />
    </View>
  );
};

export default FieldCard;
