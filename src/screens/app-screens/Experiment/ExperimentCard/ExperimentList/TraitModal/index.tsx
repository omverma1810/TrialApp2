import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {Dimensions, Pressable, Text, View} from 'react-native';

import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {BottomSheetModal} from '../../../../../../components';
import {LOCALES} from '../../../../../../localization/constants';
import {BottomSheetModalTypes} from '../../../../../../types/components/BottomSheetModal';
import {styles} from '../../../../AddImage/styles';

type ModalTypes = {
  bottomSheetModalRef: BottomSheetModalTypes['bottomSheetModalRef'];
  onSelect?: () => void;
  data: any[];
};
const TraitModal = ({
  bottomSheetModalRef,
  onSelect = () => {},
  data = [],
}: ModalTypes) => {
  const {t} = useTranslation();
  const maxHeight = useCallback(
    () => ({
      maxHeight: Dimensions.get('window').height * 0.9,
    }),
    [],
  );
  return (
    <BottomSheetModal bottomSheetModalRef={bottomSheetModalRef}>
      <View style={styles.traitsModal}>
        <View style={[styles.traitsModalHeader, styles.row]}>
          <Text style={styles.traitsModalHeaderTitle}>
            {t(LOCALES.EXPERIMENT.LBL_ASSOCIATE_TRAIT)}
          </Text>
        </View>
        <BottomSheetScrollView style={maxHeight()}>
          {data.map(item => (
            <Pressable
              style={styles.traitTitleContainer}
              key={item?.id}
              onPress={onSelect}>
              <Text style={styles.traitTitle}>
                {item?.traitName} - {item?.userDefinedTerminology}
              </Text>
            </Pressable>
          ))}
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
};

export default TraitModal;
