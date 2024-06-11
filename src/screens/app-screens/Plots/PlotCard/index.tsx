import {Pressable, Text, View} from 'react-native';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {CardArrowDown, CardArrowUp} from '../../../../assets/icons/svgs';
import {styles} from '../styles';
import {LOCALES} from '../../../../localization/constants';
import RecordedTraits from '../RecordedTraits ';
import Notes from '../Notes';
import UnrecordedTraits from '../UnrecordedTraits';

const PlotCard = ({isFirstIndex, isLastIndex}: any) => {
  const {t} = useTranslation();
  const [isViewMoreDetails, setIsViewMoreDetails] = useState(false);
  const onViewMoreDetailsClick = () => {
    setIsViewMoreDetails(state => !state);
  };
  const rowColInfo = [
    {
      id: 0,
      name: t(LOCALES.EXPERIMENT.LBL_ROW),
      value: '1',
    },
    {
      id: 1,
      name: t(LOCALES.EXPERIMENT.LBL_COL),
      value: '1',
    },
    {
      id: 2,
      name: t(LOCALES.EXPERIMENT.LBL_ACC_ID),
      value: 'G-42',
    },
  ];
  return (
    <View
      style={[
        styles.plotCardContainer,
        isFirstIndex && styles.firstIndex,
        isLastIndex && styles.lastIndex,
      ]}>
      <Pressable onPress={onViewMoreDetailsClick} style={styles.row}>
        <View>
          <Text style={styles.plotName}>101</Text>
          <View style={styles.plotInfoContainer}>
            {rowColInfo.map(item => (
              <View style={styles.plotKeyValueContainer} key={item.id}>
                <Text style={styles.plotInfoKey}>{item.name}</Text>
                <Text style={styles.plotInfoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>
        {isViewMoreDetails ? <CardArrowUp /> : <CardArrowDown />}
      </Pressable>
      {isViewMoreDetails && (
        <View style={styles.plotDetailsContainer}>
          <RecordedTraits />
          <Notes />
          <UnrecordedTraits />
        </View>
      )}
    </View>
  );
};

export default PlotCard;
