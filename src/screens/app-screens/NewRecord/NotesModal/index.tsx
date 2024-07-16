import {Pressable, TextInput, View} from 'react-native';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';

import {Modal, Text} from '../../../../components';
import {styles} from '../styles';
import {LOCALES} from '../../../../localization/constants';

type ModalTypes = {
  isModalVisible: boolean;
  closeModal: () => void;
  onSave: (notes: string) => void;
  onDiscard: () => void;
};

const NotesModal = ({
  isModalVisible,
  closeModal = () => {},
  onSave = () => {},
  onDiscard = () => {},
}: ModalTypes) => {
  const {t} = useTranslation();
  const [notes, setNotes] = useState('');
  return (
    <Modal isModalVisible={isModalVisible} closeModal={closeModal}>
      <View style={styles.notesModalContainer}>
        <View style={styles.notesModal}>
          <Text style={styles.notesTitle}>
            {t(LOCALES.EXPERIMENT.LBL_NOTES)}
          </Text>
          <TextInput
            style={styles.notesInput}
            multiline
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
          />
          <View style={styles.notesButtonContainer}>
            <Pressable style={styles.discardBtnContainer} onPress={onDiscard}>
              <Text style={styles.discardBtn}>
                {t(LOCALES.EXPERIMENT.LBL_DISCARD)}
              </Text>
            </Pressable>
            <Pressable
              disabled={!notes.trim()}
              style={[styles.saveBtnContainer, !notes.trim() && {opacity: 0.5}]}
              onPress={() => onSave(notes)}>
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
