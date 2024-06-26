import React, {Fragment} from 'react';
import {Pressable, View, ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';

import {
  Button,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
  Text,
} from '../../../components';
import {LOCALES} from '../../../localization/constants';
import {styles} from './styles';
import {Back} from '../../../assets/icons/svgs';
import SelectExperiment from './SelectExperiment';
import SelectField from './SelectField';
import SelectPlot from './SelectPlot';
import {NewRecordScreenProps} from '../../../types/navigation/appTypes';
import UnrecordedTraits from './UnrecordedTraits';
import NotesModal from './NotesModal';
import Notes from './Notes';
import TraitsImage from './TraitsImage';
import {useRecord, RecordProvider} from './RecordContext';

const NewRecord = ({navigation}: NewRecordScreenProps) => {
  const {t} = useTranslation();
  const {
    userInteractionOptions,
    isNotesModalVisible,
    isUnrecordedTraitsVisible,
    closeNotesModal,
  } = useRecord();

  return (
    <SafeAreaView edges={['top']}>
      <KeyboardAvoidingView>
        <StatusBar />
        <Pressable
          onPress={navigation.goBack}
          style={[styles.header, styles.row]}>
          <Back />
          <Text style={styles.headerTitle}>
            {t(LOCALES.EXPERIMENT.NEW_RECORD)}
          </Text>
        </Pressable>

        <ScrollView>
          <View style={styles.container}>
            <SelectExperiment />
            <SelectField />
            <SelectPlot />
            {isUnrecordedTraitsVisible && (
              <Fragment>
                <View style={styles.userInteractionContainer}>
                  {userInteractionOptions.map(item => (
                    <Pressable
                      style={styles.optionContainer}
                      key={item.id}
                      onPress={item.onPress}>
                      {item.icon}
                      <Text style={styles.option}>{item.name}</Text>
                    </Pressable>
                  ))}
                </View>
                <Notes />
                <TraitsImage />
                <UnrecordedTraits />
              </Fragment>
            )}
          </View>
        </ScrollView>
        <View style={styles.saveRecordBtnContainer}>
          <Button
            title={`${t(LOCALES.EXPERIMENT.LBL_SAVE)} ${t(
              LOCALES.EXPERIMENT.LBL_RECORD,
            )}`}
          />
        </View>
      </KeyboardAvoidingView>
      <NotesModal
        isModalVisible={isNotesModalVisible}
        closeModal={closeNotesModal}
        onDiscard={closeNotesModal}
        onSave={closeNotesModal}
      />
    </SafeAreaView>
  );
};

export default (props: NewRecordScreenProps) => (
  <RecordProvider>
    <NewRecord {...props} />
  </RecordProvider>
);
