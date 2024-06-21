import {Pressable, Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {BottomSheetModal} from '../../../../components';
import {BottomSheetModalTypes} from '../../../../types/components/BottomSheetModal';
import {styles} from '../styles';
import {Search} from '../../../../assets/icons/svgs';
import {LOCALES} from '../../../../localization/constants';

type ModalTypes = {
  bottomSheetModalRef: BottomSheetModalTypes['bottomSheetModalRef'];
  onSelect: (trait: string) => void;
};
const TraitModal = ({bottomSheetModalRef, onSelect = () => {}}: ModalTypes) => {
  const {t} = useTranslation();
  const data = [
    {
      id: 0,
      name: 'Cob height',
    },
    {
      id: 1,
      name: 'Sowing time',
    },
    {
      id: 2,
      name: 'Plant height after 50 days',
    },
    {
      id: 3,
      name: 'Days to first flowering',
    },
  ];
  return (
    <BottomSheetModal bottomSheetModalRef={bottomSheetModalRef}>
      <View style={styles.traitsModal}>
        <View style={[styles.traitsModalHeader, styles.row]}>
          <Text style={styles.traitsModalHeaderTitle}>
            {t(LOCALES.EXPERIMENT.LBL_ASSOCIATE_TRAIT)}
          </Text>
          <Search />
        </View>
        {data.map(item => (
          <Pressable
            style={styles.traitTitleContainer}
            key={item.id}
            onPress={() => onSelect(item.name)}>
            <Text style={styles.traitTitle}>{item.name}</Text>
          </Pressable>
        ))}
      </View>
    </BottomSheetModal>
  );
};

export default TraitModal;
