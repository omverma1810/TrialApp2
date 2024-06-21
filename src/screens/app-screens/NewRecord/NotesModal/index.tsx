import {Pressable, TextInput, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {Modal, Text} from '../../../../components';
import {styles} from '../styles';
import {LOCALES} from '../../../../localization/constants';

type ModalTypes = {
  isModalVisible: boolean;
  closeModal: () => void;
  onSave: () => void;
  onDiscard: () => void;
};

const NotesModal = ({
  isModalVisible,
  closeModal = () => {},
  onSave = () => {},
  onDiscard = () => {},
}: ModalTypes) => {
  const {t} = useTranslation();
  return (
    <Modal isModalVisible={isModalVisible} closeModal={closeModal}>
      <View style={styles.notesModalContainer}>
        <View style={styles.notesModal}>
          <Text style={styles.notesTitle}>
            {t(LOCALES.EXPERIMENT.LBL_NOTES)}
          </Text>
          <TextInput style={styles.notesInput} multiline />
          <View style={styles.notesButtonContainer}>
            <Pressable style={styles.discardBtnContainer} onPress={onDiscard}>
              <Text style={styles.discardBtn}>
                {t(LOCALES.EXPERIMENT.LBL_DISCARD)}
              </Text>
            </Pressable>
            <Pressable style={styles.saveBtnContainer} onPress={onSave}>
              <Text style={styles.saveBtn}>
                {t(LOCALES.EXPERIMENT.LBL_SAVE)}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NotesModal;
