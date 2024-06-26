import {Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {styles} from '../styles';
import {Notes as NotesIcon} from '../../../../assets/icons/svgs';
import {LOCALES} from '../../../../localization/constants';

const Notes = () => {
  const {t} = useTranslation();
  return (
    <View style={styles.notesContainer}>
      <View style={styles.notesTitleContainer}>
        <NotesIcon color="#000" />
        <Text style={styles.notesLabel}>{t(LOCALES.EXPERIMENT.LBL_NOTES)}</Text>
      </View>
      <Text style={styles.notesContent}>
        Some random notes taken during a visit. May exceed to 2 lines
      </Text>
    </View>
  );
};

export default Notes;
