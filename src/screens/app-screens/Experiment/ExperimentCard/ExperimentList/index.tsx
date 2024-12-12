import {Pressable, Text, View} from 'react-native';
import React, {useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {BottomSheetModal} from '@gorhom/bottom-sheet';

import {styles} from '../styles';
import {CardArrowDown, CardArrowUp} from '../../../../../assets/icons/svgs';
import {LOCALES} from '../../../../../localization/constants';
import {ExperimentScreenProps} from '../../../../../types/navigation/appTypes';
import TraitModal from './TraitModal';

const ExperimentList = ({experiment, selectedProject}: any) => {
  const {t} = useTranslation();
  const {navigate} = useNavigation<ExperimentScreenProps['navigation']>();
  const [isViewMoreDetails, setIsViewMoreDetails] = useState(false);
  const traitModalRef = useRef<BottomSheetModal>(null);
  const handleTraitModalOpen = () => traitModalRef.current?.present();

  const experimentInfo = [
    {
      id: 2,
      title: t(LOCALES.EXPERIMENT.LBL_FIELD_DESIGN),
      key: 'designType',
    },
    {
      id: 3,
      title: t(LOCALES.EXPERIMENT.LBL_SEASON),
      key: 'season',
    },
    {
      id: 4,
      title: t(LOCALES.EXPERIMENT.LBL_ENTRIES),
      key: 'noOfTreatment',
    },
    {
      id: 5,
      title: t(LOCALES.EXPERIMENT.LBL_PLOTS),
      key: 'noOfPlots',
    },
    {
      id: 6,
      title: t(LOCALES.EXPERIMENT.LBL_REPLICATION),
      key: 'noOfReplication',
    },
    {
      id: 8,
      title: t(LOCALES.EXPERIMENT.LBL_LOCATION_DEPLOYED),
      key: 'noOfLocationsDeployed',
    },
    {
      id: 9,
      title: t(LOCALES.EXPERIMENT.LBL_LOCATION_REQUIRED),
      key: 'locationReq',
    },
    {
      id: 10,
      title: t(LOCALES.EXPERIMENT.LBL_NO_OF_TRAITS),
      key: 'noOfTraits',
    },
  ];

  const onViewMoreDetailsClick = () => {
    setIsViewMoreDetails(state => !state);
  };

  const onViewAllFieldsClick = () => {
    navigate('ExperimentDetails', {
      id: experiment?.id,
      type: experiment?.experimentType,
      data: {
        projectId: selectedProject,
        designType: experiment?.designType,
        season: experiment?.season,
      },
    });
  };

  const experimentTypeColor: any = useMemo(() => {
    let type = experiment?.experimentType;
    if (type === 'hybrid') {
      return '#fdf8ee';
    } else if (type === 'line') {
      return '#fcebea';
    } else {
      return '#eaf4e7';
    }
  }, [experiment?.experimentType]);

  return (
    <View style={styles.experimentContainer}>
      <Pressable
        style={styles.experimentTitleContainer}
        onPress={onViewMoreDetailsClick}>
        <View style={styles.row}>
          <Text style={styles.experimentTitle}>
            {experiment?.fieldExperimentName}
          </Text>
          <View
            style={[
              styles.experimentTypeContainer,
              {backgroundColor: experimentTypeColor},
            ]}>
            <Text style={styles.experimentType}>
              {experiment?.experimentType}
            </Text>
          </View>
        </View>
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
          {experimentInfo
            .filter(item => item.key !== 'locationReq' || experiment[item.key]) // Exclude if locationReq is null, undefined, or empty
            .map((item, index) => (
              <View
                style={[
                  styles.experimentDetailsCard,
                  item.key === 'experimentType' && {width: '100%'},
                ]}
                key={index}>
                <Text style={styles.experimentDetailsKeyText}>
                  {item.title}
                </Text>
                <Text style={styles.experimentDetailsValueText}>
                  {experiment[item.key]}
                </Text>
                {item.key === 'noOfTraits' && (
                  <Pressable
                    style={styles.viewContainer}
                    onPress={handleTraitModalOpen}>
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
      <TraitModal
        bottomSheetModalRef={traitModalRef}
        data={experiment?.traitList}
      />
    </View>
  );
};

export default ExperimentList;
