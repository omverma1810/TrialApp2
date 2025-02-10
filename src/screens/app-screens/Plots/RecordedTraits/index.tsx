import {useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';

import {Button, Text} from '../../../../components';
import {URL} from '../../../../constants/URLS';
import {useApi} from '../../../../hooks/useApi';
import {LOCALES} from '../../../../localization/constants';
import {PlotsScreenProps} from '../../../../types/navigation/appTypes';
import {formatDateTime, getCoordinates} from '../../../../utilities/function';
import Toast from '../../../../utilities/toast';
import UnrecordedTraitCard from '../../NewRecord/UnrecordedTraits/UnrecordedTraitCard';
import {
  TraitItem,
  UnrecordedTraitsProvider,
  UpdateRecordDataFunction,
} from '../../NewRecord/UnrecordedTraits/UnrecordedTraitsContext';
import {styles} from '../styles';

type RecordData = {
  [key: string]: {
    observationId: number | null;
    traitId: number;
    observedValue: string;
  };
};

const RecordedTraits = ({
  data = [],
  plotData,
  details,
  handleRecordedTraits = () => {},
}: {
  data: TraitItem[];
  plotData: any;
  details: any;
  handleRecordedTraits: () => void;
}) => {
  const {t} = useTranslation();
  const {
    params: {type},
  } = useRoute<PlotsScreenProps['route']>();
  const [recordData, setRecordData] = useState<RecordData>({});
  const [recordableData, setRecordableData] = useState({});
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
    validateTraitsRecord,
    validatedTrraitsRecordData,
    isValidatedTraitsRecordLoading,
  ] = useApi({
    url: URL.VALIDATE_TRAITS,
    method: 'POST',
  });

  const [
    updateTraitsRecord,
    trraitsRecordData,
    isTraitsRecordLoading,
    traitsRecordError,
  ] = useApi({
    url: URL.RECORD_TRAITS,
    method: 'PUT',
  });

  useEffect(() => {
    if (validatedTrraitsRecordData?.phenotypes) {
      const invalid = validatedTrraitsRecordData?.phenotypes?.filter(
        (i: {validationStatus: boolean; observedValue: string}) =>
          !i?.validationStatus,
      );
      console.log({invalid});
      if (invalid && invalid.length) {
        Toast.warning({
          message: `${invalid[0]?.observedValue} is invalid value`,
        });
        setRecordableData({});
        return;
      }
      updateTraitsRecord({...recordableData});
      setRecordableData({});
    }
  }, [validatedTrraitsRecordData]);

  useEffect(() => {
    if (trraitsRecordData?.status_code !== 200) {
      return;
    }
    const {message} = trraitsRecordData;
    Toast.success({message: message});
    handleRecordedTraits();
    setRecordData({});
  }, [trraitsRecordData]);

  const onSaveRecord = async () => {
    const headers = {'Content-Type': 'application/json'};
    const {latitude, longitude} = await getCoordinates();
    const payload = {
      plotId: plotData?.id,
      date: formatDateTime(new Date()),
      fieldExperimentId: details?.fieldExperimentId,
      experimentType: type,
      phenotypes: Object.values(recordData),
      applications: null,
      lat: latitude,
      long: longitude,
      notes: plotData?.notes || '',
    };

    setRecordableData({payload, headers});
    validateTraitsRecord({payload, headers});
  };

  if (data.length === 0) {
    return null;
  }

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
