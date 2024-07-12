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
import {RecordApiProvider, useRecordApi} from './RecordApiContext';

const NewRecord = ({navigation}: NewRecordScreenProps) => {
  const {t} = useTranslation();
  const buttonTitle =
    t(LOCALES.EXPERIMENT.LBL_SAVE) + ' ' + t(LOCALES.EXPERIMENT.LBL_RECORD);
  const {
    userInteractionOptions,
    isNotesModalVisible,
    isUnrecordedTraitsVisible,
    isSaveRecordBtnVisible,
    closeNotesModal,
    onSaveRecord,
  } = useRecord();
  const {isTraitsRecordLoading} = useRecordApi();

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

        <ScrollView
          contentContainerStyle={{flexGrow: 1, paddingBottom: 60}}
          showsVerticalScrollIndicator={false}>
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
                {/* <Notes /> */}
                {/* <TraitsImage /> */}
                <UnrecordedTraits />
              </Fragment>
            )}
          </View>
        </ScrollView>
        {isSaveRecordBtnVisible && (
          <View style={styles.saveRecordBtnContainer}>
            <Button
              title={buttonTitle}
              onPress={onSaveRecord}
              loading={isTraitsRecordLoading}
              disabled={isTraitsRecordLoading}
            />
          </View>
        )}
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
  <RecordApiProvider>
    <RecordProvider>
      <NewRecord {...props} />
    </RecordProvider>
  </RecordApiProvider>
);
