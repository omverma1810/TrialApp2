import {View} from 'react-native';
import React, {useState} from 'react';

import {styles} from '../styles';
import {Button, Text} from '../../../../components';
import {LOCALES} from '../../../../localization/constants';
import {useTranslation} from 'react-i18next';
import {
  TraitItem,
  UnrecordedTraitsProvider,
} from '../../NewRecord/UnrecordedTraits/UnrecordedTraitsContext';
import UnrecordedTraitCard from '../../NewRecord/UnrecordedTraits/UnrecordedTraitCard';

interface RecordData {
  [key: string]: string;
}

const RecordedTraits = ({data = []}: {data: TraitItem[]}) => {
  const {t} = useTranslation();
  const [recordData, setRecordData] = useState<RecordData>({});
  const buttonTitles =
    t(LOCALES.EXPERIMENT.LBL_SAVE) + ' ' + t(LOCALES.EXPERIMENT.LBL_RECORD);

  const updateRecordData = (key: string, value: string) => {
    setRecordData((prevData: RecordData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  return (
    <View style={styles.recordedTraitsContainer}>
      <View style={styles.recordedTraitsTextContainer}>
        <Text style={styles.recordedTraitsText}>
          {t(LOCALES.EXPERIMENT.LBL_RECORDED_TRAITS)}
          <Text>{` (${data.length})`}</Text>
        </Text>
      </View>
      {data.map(item => (
        <UnrecordedTraitsProvider
          key={item.traitId}
          item={item}
          updateRecordData={updateRecordData}>
          <UnrecordedTraitCard />
        </UnrecordedTraitsProvider>
      ))}
      {Object.keys(recordData).length > 0 && (
        <Button title={buttonTitles} containerStyle={styles.saveRecord} />
      )}
    </View>
  );
};

export default RecordedTraits;
