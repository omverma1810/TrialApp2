import {Pressable, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import ImagePicker from 'react-native-image-crop-picker';
import {useNavigation, useRoute} from '@react-navigation/native';

import {
  CardArrowDown,
  CardArrowUp,
  Notes as NotesIcon,
  ImagePlus,
} from '../../../../assets/icons/svgs';
import {styles} from '../styles';
import {LOCALES} from '../../../../localization/constants';
import RecordedTraits from '../RecordedTraits';
import Notes from '../../NewRecord/Notes';
import UnrecordedTraits from '../UnrecordedTraits';
import TraitsImage from '../../NewRecord/TraitsImage';
import {PlotsScreenProps} from '../../../../types/navigation/appTypes';
import NotesModal from '../../NewRecord/NotesModal';
import {Button} from '../../../../components';
import {useApi} from '../../../../hooks/useApi';
import {URL} from '../../../../constants/URLS';
import Toast from '../../../../utilities/toast';
import {
  formatDateTime,
  getBase64FromUrl,
  getCoordinates,
  getNameFromUrl,
} from '../../../../utilities/function';
import {TraitsImageTypes} from '../../NewRecord/RecordContext';

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
      onPress: () => pickImageFromCamera(),
    },
  ];
  const [notes, setNotes] = useState(plotData?.notes || '');
  const [images, setImages] = useState<TraitsImageTypes[]>(
    plotData?.imageUrls || [],
  );
  const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
  const [isViewMoreDetails, setIsViewMoreDetails] = useState(false);
  const [isMediaSaveVisible, setIsMediaSaveVisible] = useState(false);
  const [shouldCallOnSave, setShouldCallOnSave] = useState(false);
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
  const pickImageFromCamera = () => {
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
        {url: imageUrl, imagePath: null, base64Data: null, imageName: null},
        ...images,
      ]);
      setIsMediaSaveVisible(true);
    }
  }, [imageUrl, plotId, plotData?.id]);
  const rowColInfo = [
    // {
    //   id: 0,
    //   name: t(LOCALES.EXPERIMENT.LBL_ROW),
    //   key: 'row',
    // },
    // {
    //   id: 1,
    //   name: t(LOCALES.EXPERIMENT.LBL_COL),
    //   key: 'column',
    // },
    {
      id: 2,
      name: t(LOCALES.EXPERIMENT.LBL_ACC_ID),
      key: 'accessionId',
    },
  ];

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
    setIsMediaSaveVisible(false);
  }, [trraitsRecordData]);

  const onSave = async () => {
    const headers = {'Content-Type': 'application/json'};
    const imagesNameArr = images.map(item => getNameFromUrl(item.url));
    const base64Promises = images.map(item => getBase64FromUrl(item.url));
    const imagesBase64Arr = await Promise.all(base64Promises);
    const {latitude, longitude} = await getCoordinates();
    const imageData = images.map((image, index) => {
      return {
        url: image.imagePath ? image.url : null,
        imagePath: image.imagePath,
        imageName: imagesNameArr[index],
        base64Data: imagesBase64Arr[index],
      };
    });
    const payload = {
      plotId: plotData?.id,
      date: formatDateTime(new Date()),
      fieldExperimentId: details?.fieldExperimentId,
      experimentType: type,
      phenotypes: Object.values({}),
      applications: null,
      lat: latitude,
      long: longitude,
      imageData: imageData,
      notes,
    };

    updateTraitsRecord({payload, headers});
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
            <TraitsImage images={images} onDeleteImages={onDeleteImages} />
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
