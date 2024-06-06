import {Pressable, Text, View} from 'react-native';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';

import {styles} from '../styles';
import {CardArrowDown, CardArrowUp} from '../../../../../assets/icons/svgs';
import {LOCALES} from '../../../../../localization/constants';
import {ExperimentScreenProps} from '../../../../../types/navigation/appTypes';

const ExperimentList = (experiment: any) => {
  const {t} = useTranslation();
  const {navigate} = useNavigation<ExperimentScreenProps['navigation']>();
  const [isViewMoreDetails, setIsViewMoreDetails] = useState(false);
  const experimentInfo = [
    {
      id: 0,
      title: t(LOCALES.EXPERIMENT.LBL_EXPERIMENT_ID),
      key: 'id',
    },
    {
      id: 1,
      title: t(LOCALES.EXPERIMENT.LBL_NO_OF_ENTRIES),
      key: 'total_entries',
    },
    {
      id: 2,
      title: t(LOCALES.EXPERIMENT.LBL_FIELD_DESIGN),
      key: 'field_design',
    },
    {
      id: 3,
      title: t(LOCALES.EXPERIMENT.LBL_SEASON),
      key: 'season',
    },
    {
      id: 4,
      title: t(LOCALES.EXPERIMENT.LBL_ENTRIES),
      key: 'entries_count',
    },
    {
      id: 5,
      title: t(LOCALES.EXPERIMENT.LBL_PLOTS),
      key: 'plots_count',
    },
    {
      id: 6,
      title: t(LOCALES.EXPERIMENT.LBL_REPLICATION),
      key: 'replication_count',
    },
    {
      id: 7,
      title: t(LOCALES.EXPERIMENT.LBL_RANDOMISATION),
      key: 'randomization',
    },
    {
      id: 8,
      title: t(LOCALES.EXPERIMENT.LBL_LOCATION),
      key: 'location_count',
    },
    {
      id: 9,
      title: t(LOCALES.EXPERIMENT.LBL_FIELD),
      key: 'field_count',
    },
    {
      id: 10,
      title: t(LOCALES.EXPERIMENT.LBL_NO_OF_TRAITS),
      key: 'total_traits',
    },
  ];

  const onViewMoreDetailsClick = () => {
    setIsViewMoreDetails(state => !state);
  };

  const onViewAllFieldsClick = () => {
    navigate('ExperimentDetails');
  };

  return (
    <View style={styles.experimentContainer} key={experiment?.id}>
      <Pressable
        style={styles.experimentTitleContainer}
        onPress={onViewMoreDetailsClick}>
        <Text style={styles.experimentTitle}>{experiment?.name}</Text>
        {isViewMoreDetails ? <CardArrowUp /> : <CardArrowDown />}
      </Pressable>
      {!isViewMoreDetails && (
        <Pressable
          style={styles.viewFieldsContainer}
          onPress={onViewMoreDetailsClick}>
          <Text style={styles.viewFieldsContainerTitle}>
            {t(LOCALES.EXPERIMENT.LBL_VIEW_FIELDS)}
          </Text>
        </Pressable>
      )}
      {isViewMoreDetails && (
        <View style={styles.experimentDetailsContainer}>
          {experimentInfo.map((item, index) => (
            <View
              style={[
                styles.experimentDetailsCard,
                item.key === 'id' && {width: '100%'},
              ]}
              key={index}>
              <Text style={styles.experimentDetailsKeyText}>{item.title}</Text>
              <Text style={styles.experimentDetailsValueText}>
                {experiment[item.key]}
              </Text>
              {item.key === 'total_traits' && (
                <Pressable style={styles.viewContainer}>
                  <Text style={styles.view}>
                    {t(LOCALES.EXPERIMENT.LBL_VIEW)}
                  </Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      )}
      {isViewMoreDetails && (
        <Pressable
          style={styles.viewAllFieldsContainer}
          onPress={onViewAllFieldsClick}>
          <Text style={styles.viewAllFields}>
            {t(LOCALES.EXPERIMENT.LBL_VIEW_ALL_FIELDS)}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default ExperimentList;
