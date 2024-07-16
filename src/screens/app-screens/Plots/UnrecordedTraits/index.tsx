import {Pressable, Text, View} from 'react-native';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';

import {LOCALES} from '../../../../localization/constants';
import {styles} from '../styles';
import {
  TraitItem,
  UnrecordedTraitsProvider,
} from '../../NewRecord/UnrecordedTraits/UnrecordedTraitsContext';
import UnrecordedTraitCard from '../../NewRecord/UnrecordedTraits/UnrecordedTraitCard';
import {Button} from '../../../../components';

interface RecordData {
  [key: string]: string;
}

const UnrecordedTraits = ({data = []}: {data: TraitItem[]}) => {
  const {t} = useTranslation();
  const [recordData, setRecordData] = useState({});
  const [isShowDetails, setIsShowDetails] = useState(true);
  const buttonTitles =
    t(LOCALES.EXPERIMENT.LBL_SAVE) + ' ' + t(LOCALES.EXPERIMENT.LBL_RECORD);
  const updateRecordData = (key: string, value: string) => {
    setRecordData((prevData: RecordData) => ({
      ...prevData,
      [key]: value,
    }));
  };
  const onViewMoreClick = () => setIsShowDetails(state => !state);

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
          <Text>{` (${data.length})`}</Text>
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
          <UnrecordedTraitsProvider
            key={item.traitId}
            item={item}
            updateRecordData={updateRecordData}>
            <UnrecordedTraitCard />
          </UnrecordedTraitsProvider>
        ))}
      {isShowDetails && Object.keys(recordData).length > 0 && (
        <Button title={buttonTitles} containerStyle={styles.saveRecord} />
      )}
    </View>
  );
};

export default UnrecordedTraits;
