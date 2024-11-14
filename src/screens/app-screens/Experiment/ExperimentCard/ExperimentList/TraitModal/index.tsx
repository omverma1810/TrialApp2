import {Pressable, Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {BottomSheetModal} from '../../../../../../components';
import {BottomSheetModalTypes} from '../../../../../../types/components/BottomSheetModal';
import {styles} from '../../../../AddImage/styles';
import {LOCALES} from '../../../../../../localization/constants';

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
  return (
    <BottomSheetModal bottomSheetModalRef={bottomSheetModalRef}>
      <View style={styles.traitsModal}>
        <View style={[styles.traitsModalHeader, styles.row]}>
          <Text style={styles.traitsModalHeaderTitle}>
            {t(LOCALES.EXPERIMENT.LBL_ASSOCIATE_TRAIT)}
          </Text>
        </View>
        {data.map(item => (
          <Pressable
            style={styles.traitTitleContainer}
            key={item?.id}
            onPress={onSelect}>
            <Text style={styles.traitTitle}>{item?.traitName}</Text>
          </Pressable>
        ))}
      </View>
    </BottomSheetModal>
  );
};

export default TraitModal;
