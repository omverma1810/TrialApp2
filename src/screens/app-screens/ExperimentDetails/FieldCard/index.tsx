import {Pressable, Text, View} from 'react-native';
import React, {useCallback, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';

import {styles} from '../styles';
import {
  CardArrowDown,
  CardArrowUp,
  Columns,
  Layout,
  Leaf,
  Location,
  LocationPin,
  Plots,
  Rows,
} from '../../../../assets/icons/svgs';
import {LOCALES} from '../../../../localization/constants';
import {ExperimentDetailsScreenProps} from '../../../../types/navigation/appTypes';
import TraitModal from '../../Experiment/ExperimentCard/ExperimentList/TraitModal';
import {BottomSheetModal} from '@gorhom/bottom-sheet';

const FieldCard = ({isFirstIndex, isLastIndex, fieldData}: any) => {
  const {t} = useTranslation();
  const {navigate} =
    useNavigation<ExperimentDetailsScreenProps['navigation']>();
  const {
    params: {type},
  } = useRoute<ExperimentDetailsScreenProps['route']>();
  const traitModalRef = useRef<BottomSheetModal>(null);
  const handleTraitModalOpen = () => traitModalRef.current?.present();
  const fieldInfo = [
    {
      id: 0,
      icon: Rows,
      title: t(LOCALES.EXPERIMENT.LBL_ROWS),
      navigationAction: null,
      key: 'noOfRows',
    },
    {
      id: 1,
      icon: Columns,
      title: t(LOCALES.EXPERIMENT.LBL_COLUMN),
      navigationAction: null,
      key: 'noOfColumn',
    },
    // {
    //   id: 2,
    //   icon: Layout,
    //   title: t(LOCALES.EXPERIMENT.LBL_ORDER_LAYOUT),
    //   navigationAction: null,
    //   key: 'order_layout',
    // },
    {
      id: 3,
      icon: Plots,
      title: t(LOCALES.EXPERIMENT.LBL_PLOTS),
      navigationAction: {
        title: t(LOCALES.EXPERIMENT.LBL_ALL_PLOTS),
        onClick: () => {
          navigate('Plots', {id: fieldData?.id, type: type});
        },
      },
      key: 'plots_count',
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
    },
    // {
    //   id: 5,
    //   icon: Location,
    //   title: t(LOCALES.EXPERIMENT.LBL_LOCATION),
    //   value: 'Gujrat',
    //   navigationAction: {
    //     title: t(LOCALES.EXPERIMENT.LBL_GO_TO_LOCATION),
    //     onClick: () => {},
    //   },
    //   key: 'location',
    // },
  ];
  const [isViewMoreDetails, setIsViewMoreDetails] = useState(false);
  const onViewMoreDetailsClick = () => setIsViewMoreDetails(!isViewMoreDetails);

  const renderFieldDetail = useCallback(
    ({id, key, title, icon: Icon, navigationAction}: (typeof fieldInfo)[0]) => {
      const value =
        key === 'traits'
          ? `${fieldData[key].recorded} out of ${fieldData[key].total}`
          : fieldData[key];

      return (
        <View
          style={[
            styles.fieldDetailsCard,
            (key === 'noOfRows' || key === 'noOfColumn') &&
              styles.fieldDetailsCardPart,
          ]}
          key={id}>
          <Icon />
          <View style={styles.fieldDetailsTextContainer}>
            <Text style={styles.fieldDetailsKeyText}>{title}</Text>
            <Text style={styles.fieldDetailsValueText}>{value}</Text>
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
    [fieldData],
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
            {fieldData?.location?.villageName}
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
