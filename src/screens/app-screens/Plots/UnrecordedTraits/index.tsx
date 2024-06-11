import {Pressable, Text, View} from 'react-native';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';

import {LOCALES} from '../../../../localization/constants';
import {styles} from '../styles';

const UnrecordedTraits = () => {
  const {t} = useTranslation();
  const [isShowDetails, setIsShowDetails] = useState(true);
  const data = [
    {
      id: 0,
      name: 'Date of Sowing',
    },
    {
      id: 1,
      name: 'Flowering Date',
    },
    {
      id: 2,
      name: 'Plant height after 50 days',
    },
  ];
  const onViewMoreClick = () => {
    setIsShowDetails(state => !state);
  };
  return (
    <View
      style={[
        styles.unrecordedTraitsContainer,
        isShowDetails && styles.unrecordedTraitsContainerWithDetails,
      ]}>
      <Pressable
        onPress={onViewMoreClick}
        style={[
          styles.unrecordedTraitsTitleContainer,
          isShowDetails && styles.unrecordedTraitsTitleContainerWithDetails,
        ]}>
        <Text style={styles.unrecordedTraitsTitle}>
          {t(LOCALES.EXPERIMENT.LBL_UNRECORDED_TRAITS)}
          <Text>{` (80)`}</Text>
        </Text>
        <View style={styles.viewContainer}>
          <Text style={styles.view}>
            {!isShowDetails
              ? t(LOCALES.EXPERIMENT.LBL_VIEW)
              : t(LOCALES.EXPERIMENT.LBL_HIDE)}
          </Text>
        </View>
      </Pressable>
      {isShowDetails &&
        data.map(item => (
          <View style={styles.recordedTraitsInfoContainer} key={item.id}>
            <View style={styles.recordedTraitsInfoKeyTextContainer}>
              <Text style={styles.unrecordedTraitsInfoValueText}>
                {item.name}
              </Text>
            </View>
          </View>
        ))}
    </View>
  );
};

export default UnrecordedTraits;
