import {Pressable, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useRoute} from '@react-navigation/native';

import {LOCALES} from '../../../../localization/constants';
import {styles} from '../styles';
import {
  TraitItem,
  UnrecordedTraitsProvider,
  UpdateRecordDataFunction,
} from '../../NewRecord/UnrecordedTraits/UnrecordedTraitsContext';
import UnrecordedTraitCard from '../../NewRecord/UnrecordedTraits/UnrecordedTraitCard';
import {Button} from '../../../../components';
import {useApi} from '../../../../hooks/useApi';
import {URL} from '../../../../constants/URLS';
import {PlotsScreenProps} from '../../../../types/navigation/appTypes';
import {formatDateTime, getCoordinates} from '../../../../utilities/function';
import Toast from '../../../../utilities/toast';

type RecordData = {
  [key: string]: {
    observationId: number | null;
    traitId: number;
    observedValue: string;
  };
};

const UnrecordedTraits = ({
  data = [],
  plotId,
  details,
  handleRecordedTraits = () => {},
}: {
  data: TraitItem[];
  plotId: number;
  details: any;
  handleRecordedTraits: () => void;
}) => {
  const {t} = useTranslation();
  const {
    params: {type},
  } = useRoute<PlotsScreenProps['route']>();
  const [recordData, setRecordData] = useState<RecordData>({});
  const [isShowDetails, setIsShowDetails] = useState(true);
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
        observedValue: parseInt(observedValue),
      },
    }));
  };
  const onViewMoreClick = () => setIsShowDetails(state => !state);

  const [
    createTraitsRecord,
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
    handleRecordedTraits();
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
    createTraitsRecord({payload, headers});
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
      {isShowDetails && Object.values(recordData).length > 0 && (
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

export default React.memo(UnrecordedTraits);
