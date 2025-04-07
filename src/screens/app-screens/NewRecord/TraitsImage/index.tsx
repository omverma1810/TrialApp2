import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

import {ImagePlus, SelectIcon} from '../../../../assets/icons/svgs';
import {Button} from '../../../../components';
import ImageWithLoader from '../../../../components/ImageLoader';
import {LOCALES} from '../../../../localization/constants';
import {TraitsImageTypes} from '../RecordContext';
import {styles} from '../styles';
import PreviewImageModal from './PreviewImageModal';

const TraitsImage = ({
  images,
  metadata,
  onDeleteImages = () => {},
}: {
  images: TraitsImageTypes[];
  metadata: any;
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
        console.log({selectedImage_: image});
        setIsImagePreviewVisible(true);
        setSelectedImageUrl(image);
      }
    };

    const handleLongPressImage = (index: number) => {
      if (!isMultiImageSelectEnabled) {
        setSelectedImageList([{id: index}]);
      }
      setIsMultiImageSelectEnabled(true);
    };

    const handleDeleteImages = () => {
      onDeleteImages(selectedImageList.map(item => item.id));
      setSelectedImageList([]);
      setIsMultiImageSelectEnabled(false);
    };

    return (
      <View style={styles.imageViewContainer}>
        {images.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{flexGrow: 1}}>
            <View style={styles.imageContainer}>
              {images.map((image, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleImagePress(index, image)}
                  onLongPress={() => handleLongPressImage(index)}>
                  <ImageWithLoader uri={image.url} style={styles.image} />
                  {selectedImageList?.find(i => i?.id === index) && (
                    <View style={styles.selectedImage}>
                      <SelectIcon />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
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
          selectedImage={selectedImageUrl}
          metadata={metadata}
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
