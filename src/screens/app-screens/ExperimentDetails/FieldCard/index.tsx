import {Pressable, Text, View} from 'react-native';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';

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

const FieldCard = ({isFirstIndex, isLastIndex}: any) => {
  const {t} = useTranslation();
  const [isViewMoreDetails, setIsViewMoreDetails] = useState(false);
  const fieldInfo = [
    {
      id: 0,
      icon: Rows,
      title: t(LOCALES.EXPERIMENT.LBL_ROWS),
      value: '6',
      navigationAction: null,
      key: 'rows_count',
    },
    {
      id: 1,
      icon: Columns,
      title: t(LOCALES.EXPERIMENT.LBL_COLUMN),
      value: '59',
      navigationAction: null,
      key: 'column_count',
    },
    {
      id: 2,
      icon: Layout,
      title: t(LOCALES.EXPERIMENT.LBL_ORDER_LAYOUT),
      value: 'Serpentine',
      navigationAction: null,
      key: 'order_layout',
    },
    {
      id: 3,
      icon: Plots,
      title: t(LOCALES.EXPERIMENT.LBL_PLOTS),
      value: '354',
      navigationAction: {
        title: t(LOCALES.EXPERIMENT.LBL_ALL_PLOTS),
        onClick: () => {},
      },
      key: 'plots_count',
    },
    {
      id: 4,
      icon: Leaf,
      title: t(LOCALES.EXPERIMENT.LBL_TRAITS_RECORDED),
      value: '20 out of 100',
      navigationAction: {
        title: t(LOCALES.EXPERIMENT.LBL_ALL_TRAITS),
        onClick: () => {},
      },
      key: 'traits',
    },
    {
      id: 5,
      icon: Location,
      title: t(LOCALES.EXPERIMENT.LBL_LOCATION),
      value: 'Gujrat',
      navigationAction: {
        title: t(LOCALES.EXPERIMENT.LBL_GO_TO_LOCATION),
        onClick: () => {},
      },
      key: 'location',
    },
  ];
  const onViewMoreDetailsClick = () => {
    setIsViewMoreDetails(state => !state);
  };
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
        <View>
          <Text style={styles.fieldName}>
            Some random loner name of the field
          </Text>
          <View style={styles.locationNameContainer}>
            <LocationPin />
            <Text style={styles.locationName}>Medchal, Hyderabad</Text>
          </View>
        </View>
        {isViewMoreDetails ? <CardArrowUp /> : <CardArrowDown />}
      </Pressable>
      {isViewMoreDetails && (
        <View style={styles.fieldDetailsContainer}>
          {fieldInfo.map((item, index) => (
            <View
              style={[
                styles.fieldDetailsCard,
                (item.key === 'rows_count' || item.key === 'column_count') &&
                  styles.fieldDetailsCardPart,
              ]}
              key={index}>
              <item.icon />
              <View style={styles.fieldDetailsTextContainer}>
                <Text style={styles.fieldDetailsKeyText}>{item.title}</Text>
                <Text style={styles.fieldDetailsValueText}>{item.value}</Text>
              </View>
              {item.navigationAction && (
                <Text
                  onPress={item.navigationAction?.onClick}
                  style={styles.fieldDetailsNavAction}>
                  {item.navigationAction?.title}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default FieldCard;
