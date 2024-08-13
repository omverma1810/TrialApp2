import {View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useRoute} from '@react-navigation/native';

import {styles} from '../styles';
import {Button, Text} from '../../../../components';
import {LOCALES} from '../../../../localization/constants';
import {
  TraitItem,
  UnrecordedTraitsProvider,
  UpdateRecordDataFunction,
} from '../../NewRecord/UnrecordedTraits/UnrecordedTraitsContext';
import UnrecordedTraitCard from '../../NewRecord/UnrecordedTraits/UnrecordedTraitCard';
import {useApi} from '../../../../hooks/useApi';
import {URL} from '../../../../constants/URLS';
import {formatDateTime, getCoordinates} from '../../../../utilities/function';
import Toast from '../../../../utilities/toast';
import {PlotsScreenProps} from '../../../../types/navigation/appTypes';

type RecordData = {
  [key: string]: {
    observationId: number | null;
    traitId: number;
    observedValue: string;
  };
};

const RecordedTraits = ({
  data = [],
  plotId,
  details,
}: {
  data: TraitItem[];
  plotId: number;
  details: any;
}) => {
  const {t} = useTranslation();
  const {
    params: {type},
  } = useRoute<PlotsScreenProps['route']>();
  const [recordData, setRecordData] = useState<RecordData>({});
  const buttonTitles =
    t(LOCALES.EXPERIMENT.LBL_SAVE) + ' ' + t(LOCALES.EXPERIMENT.LBL_RECORD);

  const updateRecordData: UpdateRecordDataFunction = (
    observationId,
    traitId,
    observedValue,
  ) => {
    setRecordData(prevData => ({
      ...prevData,
      [traitId]: {
        observationId,
        traitId,
        observedValue: observedValue,
      },
    }));
  };

  const [
    updateTraitsRecord,
    trraitsRecordData,
    isTraitsRecordLoading,
    traitsRecordError,
  ] = useApi({
    url: URL.RECORD_TRAITS,
    method: 'POST',
  });

  useEffect(() => {
    if (trraitsRecordData?.status_code !== 200) {
      return;
    }
    const {message} = trraitsRecordData;
    Toast.success({message: message});
    setRecordData({});
  }, [trraitsRecordData]);

  const onSaveRecord = async () => {
    const headers = {'Content-Type': 'application/json'};
    const {latitude, longitude} = await getCoordinates();
    const payload = {
      plotId: plotId,
      date: formatDateTime(new Date()),
      fieldExperimentId: details?.fieldExperimentId,
      experimentType: type,
      phenotypes: Object.values(recordData),
      applications: null,
      lat: latitude,
      long: longitude,
    };

    updateTraitsRecord({payload, headers});
  };

  if (data.length === 0) return null;

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
      {Object.values(recordData).length > 0 && (
        <Button
          title={buttonTitles}
          containerStyle={styles.saveRecord}
          onPress={onSaveRecord}
          loading={isTraitsRecordLoading}
          disabled={isTraitsRecordLoading}
        />
      )}
    </View>
  );
};

export default React.memo(RecordedTraits);
