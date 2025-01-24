import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Pressable, Text, View} from 'react-native';

import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {
  CardArrowDown,
  CardArrowUp,
  Columns,
  Leaf,
  LocationPin,
  Plots,
  Rows,
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

const FieldCard = ({isFirstIndex, isLastIndex, fieldData, expData}: any) => {
  const {t} = useTranslation();
  const {navigate} =
    useNavigation<ExperimentDetailsScreenProps['navigation']>();
  const {
    params: {type, data},
  } = useRoute<ExperimentDetailsScreenProps['route']>();
  const traitModalRef = useRef<BottomSheetModal>(null);
  const handleTraitModalOpen = () => traitModalRef.current?.present();

  const [trialData, setTrialData] = useState<TrialData>({});
  const [getField, getFieldResponse, isFieldLoading, getFieldError] = useApi({
    url: URL.PLOT_LIST,
    method: 'GET',
  });

  useEffect(() => {
    getField({
      pathParams: fieldData.id,
      queryParams: `experimentType=${expData.type}`,
    });
  }, []);

  useEffect(() => {
    setTrialData(getFieldResponse?.data || {});
    console.log({fieldRes: getFieldResponse?.data});
  }, [getFieldResponse]);

  console.log('~~~~~~~~~', {fieldData: fieldData});
  const fieldInfo = [
    {
      id: 0,
      icon: Rows,
      title: t(LOCALES.EXPERIMENT.LBL_ROWS),
      navigationAction: null,
      key: 'noOfRows',
      uom: null,
    },
    {
      id: 1,
      icon: Columns,
      title: t(LOCALES.EXPERIMENT.LBL_COLUMN),
      navigationAction: null,
      key: 'noOfColumn',
      uom: null,
    },
    {
      id: 3,
      icon: Plots,
      title: t(LOCALES.EXPERIMENT.LBL_PLOTS),
      navigationAction: {
        title: t(LOCALES.EXPERIMENT.LBL_ALL_PLOTS),
        onClick: () => {
          navigate('Plots', {id: fieldData?.id, type: type, data: data});
        },
      },
      key: 'plots_count',
      uom: null,
    },
    {
      id: 4,
      icon: Leaf,
      title: t(LOCALES.EXPERIMENT.LBL_TRAITS_RECORDED),
      navigationAction: {
        title: t(LOCALES.EXPERIMENT.LBL_ALL_TRAITS),
        onClick: handleTraitModalOpen,
      },
      key: 'traits',
      uom: null,
    },
    {
      id: 6,
      icon: null,
      title: 'Block Width',
      navigationAction: null,
      key: 'blockWidth',
      uom: 'm',
    },
    {
      id: 7,
      icon: null,
      title: 'Block Gap',
      navigationAction: null,
      key: 'gapBlocks',
      uom: 'cm',
    },
    {
      id: 8,
      icon: null,
      title: 'Plot Size',
      navigationAction: null,
      key: 'plotSize',
      uom: 'sq. m',
    },
    {
      id: 9,
      icon: null,
      title: 'Plot Width',
      navigationAction: null,
      key: 'plotWidth',
      uom: 'm',
    },
    {
      id: 10,
      icon: null,
      title: 'Row Length',
      navigationAction: null,
      key: 'rowLength',
      uom: 'm',
    },
  ];

  const [isViewMoreDetails, setIsViewMoreDetails] = useState(false);
  const onViewMoreDetailsClick = () => setIsViewMoreDetails(!isViewMoreDetails);

  const renderFieldDetail = useCallback(
    ({
      id,
      key,
      title,
      icon: Icon,
      navigationAction,
      uom,
    }: (typeof fieldInfo)[0]) => {
      const value =
        key === 'traits'
          ? `${fieldData[key]?.recorded} out of ${fieldData[key]?.total}`
          : trialData && typeof trialData === 'object' && key in trialData
          ? trialData[key]
          : fieldData[key];

      console.log('#####', {key});

      return (
        <View
          style={[
            styles.fieldDetailsCard,
            !(key === 'plots_count' || key === 'traits') &&
              styles.fieldDetailsCardPart,
          ]}
          key={id}>
          {Icon && <Icon />}
          <View style={styles.fieldDetailsTextContainer}>
            <Text style={styles.fieldDetailsKeyText}>{title}</Text>
            <Text style={styles.fieldDetailsValueText}>
              {value} {uom}
            </Text>
          </View>
          {navigationAction && (
            <Text
              onPress={navigationAction.onClick}
              style={styles.fieldDetailsNavAction}>
              {navigationAction.title}
            </Text>
          )}
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
      <Pressable
        onPress={onViewMoreDetailsClick}
        style={styles.locationContainer}>
        <View style={styles.locationNameContainer}>
          <LocationPin />
          <Text style={styles.locationName}>
            {fieldData?.name}-{fieldData?.location?.villageName}
          </Text>
        </View>
        {isViewMoreDetails ? <CardArrowUp /> : <CardArrowDown />}
      </Pressable>
      {isViewMoreDetails && (
        <View style={styles.fieldDetailsContainer}>
          {fieldInfo.map(renderFieldDetail)}
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
