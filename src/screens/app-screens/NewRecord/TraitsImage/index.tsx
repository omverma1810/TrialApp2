import {Image, Pressable, Text, View} from 'react-native';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView} from 'react-native-gesture-handler';

import {styles} from '../styles';
import {ImagePlus, SelectIcon} from '../../../../assets/icons/svgs';
import {LOCALES} from '../../../../localization/constants';
import {Button} from '../../../../components';
import PreviewImageModal from './PreviewImageModal';
import {TraitsImageTypes} from '../RecordContext';

const TraitsImage = ({
  images,
  onDeleteImages = () => {},
}: {
  images: TraitsImageTypes[];
  onDeleteImages: (arr: number[]) => void;
}) => {
  const {t} = useTranslation();

  const RenderImageList = useCallback(() => {
    const [isImagePreviewVisible, setIsImagePreviewVisible] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');
    const [selectedImageList, setSelectedImageList] = useState<{id: number}[]>(
      [],
    );
    const [isMultiImageSelectEnabled, setIsMultiImageSelectEnabled] =
      useState(false);

    const handleImagePress = (index: number, image: string) => {
      if (isMultiImageSelectEnabled) {
        setSelectedImageList(prevState => {
          const itemIndex = prevState.findIndex(
            selectedItem => selectedItem.id === index,
          );
          if (itemIndex !== -1) {
            const updatedList = [...prevState];
            updatedList.splice(itemIndex, 1);
            if (updatedList.length === 0) {
              setIsMultiImageSelectEnabled(false);
            }
            return updatedList;
          } else {
            return [{id: index}, ...prevState];
          }
        });
      } else {
        setIsImagePreviewVisible(true);
        setSelectedImageUrl(image);
      }
    };

    const handleLongPressImage = (index: number) => {
      if (!isMultiImageSelectEnabled) setSelectedImageList([{id: index}]);
      setIsMultiImageSelectEnabled(true);
    };

    const handleDeleteImages = () => {
      onDeleteImages(selectedImageList.map(item => item.id));
      setSelectedImageList([]);
      setIsMultiImageSelectEnabled(false);
    };

    return (
      <View style={styles.imageViewContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}>
          <View style={styles.imageContainer}>
            {images.map((image, index) => (
              <Pressable
                key={index}
                onPress={() => handleImagePress(index, image.url)}
                onLongPress={() => handleLongPressImage(index)}>
                <Image source={{uri: image.url}} style={styles.image} />
                {selectedImageList?.find(i => i?.id === index) && (
                  <View style={styles.selectedImage}>
                    <SelectIcon />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </ScrollView>
        {selectedImageList.length > 0 && (
          <Button
            onPress={handleDeleteImages}
            title="Delete"
            containerStyle={styles.deleteBtn}
            customLabelStyle={styles.deleteBtnLabel}
          />
        )}
        <PreviewImageModal
          isModalVisible={isImagePreviewVisible}
          selectedImageUrl={selectedImageUrl}
          closeModal={() => setIsImagePreviewVisible(false)}
        />
      </View>
    );
  }, [images]);

  return (
    <View style={styles.notesContainer}>
      <View style={styles.notesTitleContainer}>
        <ImagePlus color="#000" />
        <Text style={styles.notesLabel}>{t(LOCALES.EXPERIMENT.LBL_IMAGE)}</Text>
      </View>
      {RenderImageList()}
    </View>
  );
};

export default TraitsImage;
