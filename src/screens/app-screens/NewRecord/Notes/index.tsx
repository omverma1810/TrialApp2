import {Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {styles} from '../styles';
import {Notes as NotesIcon} from '../../../../assets/icons/svgs';
import {LOCALES} from '../../../../localization/constants';

const Notes = ({notes}: {notes: string}) => {
  const {t} = useTranslation();
  return (
    <View style={styles.notesContainer}>
      <View style={styles.notesTitleContainer}>
        <NotesIcon color="#000" />
        <Text style={styles.notesLabel}>{t(LOCALES.EXPERIMENT.LBL_NOTES)}</Text>
      </View>
      <Text style={styles.notesContent}>{notes}</Text>
    </View>
  );
};

export default Notes;
