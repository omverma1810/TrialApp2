import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Pressable, Text, View} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

import {
  CardArrowDown,
  CardArrowUp,
  ImagePlus,
  Notes as NotesIcon,
} from '../../../../assets/icons/svgs';
import {Button} from '../../../../components';
import {URL} from '../../../../constants/URLS';
import {useApi} from '../../../../hooks/useApi';
import {LOCALES} from '../../../../localization/constants';
import {PlotsScreenProps} from '../../../../types/navigation/appTypes';
import {formatDateTime} from '../../../../utilities/function';
import {validateLocationForAPI} from '../../../../utilities/locationValidation';
import Toast from '../../../../utilities/toast';
import Notes from '../../NewRecord/Notes';
import NotesModal from '../../NewRecord/NotesModal';
import {TraitsImageTypes} from '../../NewRecord/RecordContext';
import TraitsImage from '../../NewRecord/TraitsImage';
import RecordedTraits from '../RecordedTraits';
import {styles} from '../styles';
import UnrecordedTraits from '../UnrecordedTraits';

const PlotCard = ({
  isFirstIndex,
  isLastIndex,
  plotData,
  details,
  handleRecordedTraits,
}: any) => {
  const {t} = useTranslation();
  const navigation = useNavigation<PlotsScreenProps['navigation']>();
  const {id, type, imageUrl, plotId, data} =
    useRoute<PlotsScreenProps['route']>().params;

  const [notes, setNotes] = useState(plotData?.notes || '');
  const [images, setImages] = useState<TraitsImageTypes[]>(
    plotData?.imageUrls || [],
  );
  const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
  const [isViewMoreDetails, setIsViewMoreDetails] = useState(false);
  const [isMediaSaveVisible, setIsMediaSaveVisible] = useState(false);
  const [shouldCallOnSave, setShouldCallOnSave] = useState(false);
  const [recordableData, setRecordableData] = useState({});
  const [recordedTrait, setRecordedTrait] = useState(
    plotData?.recordedTraitData || [],
  );
  const [unrecordedTrait, setUnrecordedTrait] = useState(
    plotData?.unrecordedTraitData || [],
  );

  const onViewMoreDetailsClick = () => {
    setIsViewMoreDetails(state => !state);
  };

  const closeNotesModal = () => {
    setIsNotesModalVisible(false);
  };

  const onSaveNotes = (notes: string) => {
    setNotes(notes.trim());
    setIsNotesModalVisible(false);
    setIsMediaSaveVisible(true);
  };

  const pickImageFromCamera = (
    plotId: any = {},
    type: string | null = null,
  ) => {
    if (images.length >= details?.maxNoOfImages) {
      Toast.info({
        message: `Maximum number (${details?.maxNoOfImages}) of trait image uploads exceeded.`,
      });
      return;
    }

    ImagePicker.openCamera({cropping: true}).then(image => {
      navigation.navigate('AddImage', {
        imageUrl: image.path,
        screen: 'Plots',
        data: {id, type, plotId: plotData?.id, data: data},
      });
    });
  };

  useEffect(() => {
    if (imageUrl && plotData?.id === plotId) {
      setImages([
        {
          url: imageUrl,
          imagePath: null,
          base64Data: null,
          imageName: null,
          uploadedOn: null,
        },
        ...images,
      ]);
      // Removed media upload trigger
    }
  }, [imageUrl, plotId, plotData?.id]);

  const rowColInfo = [
    {
      id: 2,
      name: t(LOCALES.EXPERIMENT.LBL_ACC_ID),
      key: 'accessionId',
    },
  ];

  const [validateTraitsRecord, validateTraitsResponse] = useApi({
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
    method: 'POST',
  });

  useEffect(() => {
    if (validateTraitsResponse?.phenotypes) {
      const invalid = validateTraitsResponse?.phenotypes?.filter(
        (i: {validationStatus: boolean; observedValue: string}) =>
          !i?.validationStatus,
      );

      if (invalid && invalid.length) {
        invalid?.forEach((item: {observedValue: string}) => {
          Toast.warning({message: `${item.observedValue} is invalid value`});
        });

        setRecordableData({});
        return;
      }

      updateTraitsRecord(recordableData);
    }
  }, [validateTraitsResponse]);

  useEffect(() => {
    if (trraitsRecordData?.status_code !== 200) {
      return;
    }
    const {message} = trraitsRecordData;
    Toast.success({message: message});
    setIsMediaSaveVisible(false);
  }, [trraitsRecordData]);

  const onSave = async () => {
    const headers = {'Content-Type': 'application/json'};
    const locationData = await validateLocationForAPI(true, true);
    if (!locationData) {
      return;
    }

    const {latitude, longitude} = locationData;

    const payload = {
      plotId: plotData?.id,
      date: formatDateTime(new Date()),
      fieldExperimentId: details?.fieldExperimentId,
      experimentType: type,
      phenotypes: Object.values({}), // Empty for now
      applications: null,
      lat: latitude,
      long: longitude,
      imageData: [], // Explicitly empty
      notes,
    };

    setRecordableData({payload, headers});
    validateTraitsRecord({payload, headers});
  };

  const onDeleteImages = (arr: number[]) => {
    const newImages = images.filter((_, index) => !arr.includes(index));
    setImages(newImages);
    setIsMediaSaveVisible(false);
    setShouldCallOnSave(true);
  };

  useEffect(() => {
    if (shouldCallOnSave) {
      onSave();
      setShouldCallOnSave(false);
    }
  }, [shouldCallOnSave, images]);

  const userInteractionOptions = [
    {
      id: 0,
      name: t(LOCALES.EXPERIMENT.LBL_ADD_NOTES),
      icon: <NotesIcon />,
      onPress: () => setIsNotesModalVisible(true),
    },
    {
      id: 1,
      name: t(LOCALES.EXPERIMENT.LBL_ADD_IMAGE),
      icon: <ImagePlus />,
      onPress: () => pickImageFromCamera(plotId, type),
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
          <Text style={styles.plotName}>{plotData?.plotNumber}</Text>
          <View style={styles.plotInfoContainer}>
            {rowColInfo.map(item => (
              <View style={styles.plotKeyValueContainer} key={item.id}>
                <Text style={styles.plotInfoKey}>{item.name}</Text>
                <Text style={styles.plotInfoValue}>{plotData[item.key]}</Text>
              </View>
            ))}
          </View>
        </View>
        {isViewMoreDetails ? <CardArrowUp /> : <CardArrowDown />}
      </Pressable>

      {isViewMoreDetails && (
        <View style={styles.plotDetailsContainer}>
          <View style={styles.userInteractionContainer}>
            {userInteractionOptions.map(item => (
              <Pressable
                style={styles.optionContainer}
                key={item.id}
                onPress={item.onPress}>
                {item.icon}
                <Text style={styles.option}>{item.name}</Text>
              </Pressable>
            ))}
          </View>

          {notes && <Notes notes={notes} />}
          {images && images.length > 0 && (
            <TraitsImage
              images={images}
              metadata={{field: details?.villageName}}
              onDeleteImages={onDeleteImages}
            />
          )}
          {isMediaSaveVisible && (
            <Button
              title={t(LOCALES.EXPERIMENT.LBL_SAVE)}
              containerStyle={styles.saveRecord}
              onPress={onSave}
              loading={isTraitsRecordLoading}
              disabled={isTraitsRecordLoading}
            />
          )}
          <RecordedTraits
            data={recordedTrait}
            plotData={plotData}
            details={details}
            handleRecordedTraits={handleRecordedTraits}
          />
          <UnrecordedTraits
            data={unrecordedTrait}
            plotData={plotData}
            details={details}
            handleRecordedTraits={handleRecordedTraits}
          />
        </View>
      )}

      <NotesModal
        preNotes={notes}
        isModalVisible={isNotesModalVisible}
        closeModal={closeNotesModal}
        onDiscard={closeNotesModal}
        onSave={onSaveNotes}
      />
    </View>
  );
};

export default React.memo(PlotCard);
