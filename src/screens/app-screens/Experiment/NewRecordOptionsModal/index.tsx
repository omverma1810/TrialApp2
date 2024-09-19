import {Pressable, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';

import {Modal, Text} from '../../../../components';
import {styles} from '../styles';
import {Close, EditBox, Scan} from '../../../../assets/icons/svgs';
import {LOCALES} from '../../../../localization/constants';
import {ExperimentScreenProps} from '../../../../types/navigation/appTypes';

type ModalTypes = {
  isModalVisible: boolean;
  closeModal: () => void;
  onSelectFromList?: () => void;
};

const NewRecordOptionsModal = ({
  isModalVisible,
  closeModal = () => {},
  onSelectFromList = () => {},
}: ModalTypes) => {
  const {t} = useTranslation();
  const navigation = useNavigation<ExperimentScreenProps['navigation']>();
  const newRecordOptions = [
    {
      id: 0,
      name: t(LOCALES.EXPERIMENT.LBL_SELECT_FROM_LIST),
      icon: EditBox,
      onClick: onSelectFromList,
    },
    {
      id: 1,
      name: t(LOCALES.EXPERIMENT.LBL_SCAN),
      icon: Scan,
      onClick: () => {
        closeModal();
        navigation.navigate('QRScanner');
      },
    },
    {
      id: 2,
      name: '',
      icon: Close,
      onClick: closeModal,
    },
  ];
  return (
    <Modal
      isModalVisible={isModalVisible}
      closeModal={closeModal}
      parentStyle={styles.optionsModal}>
      <View style={styles.optionsContainer}>
        {newRecordOptions.map(option => (
          <Pressable
            style={styles.optionsTextContainer}
            key={option.id}
            onPress={option.onClick}>
            <Text style={styles.optionsText}>{option.name}</Text>
            <Pressable
              onPress={option.onClick}
              style={[styles.optionIcon, !option.name && styles.closeIcon]}>
              <option.icon />
            </Pressable>
          </Pressable>
        ))}
      </View>
    </Modal>
  );
};

export default NewRecordOptionsModal;
