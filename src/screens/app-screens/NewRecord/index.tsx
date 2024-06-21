import React, {useState} from 'react';
import {Pressable, View, ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';
import ImagePicker from 'react-native-image-crop-picker';

import {
  Button,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
  Text,
} from '../../../components';
import {LOCALES} from '../../../localization/constants';
import {styles} from './styles';
import {Back, ImagePlus, Notes} from '../../../assets/icons/svgs';
import SelectExperiment from './SelectExperiment';
import SelectField from './SelectField';
import SelectPlot from './SelectPlot';
import {NewRecordScreenProps} from '../../../types/navigation/appTypes';
import UnrecordedTraits from './UnrecordedTraits';
import NotesModal from './NotesModal';

const NewRecord = ({navigation, route}: NewRecordScreenProps) => {
  const {t} = useTranslation();
  const {traitsInfo} = route.params || {};
  const userInteractionOptions = [
    {
      id: 0,
      name: t(LOCALES.EXPERIMENT.LBL_ADD_NOTES),
      icon: Notes,
      onPress: () => setIsNotesModalVisible(true),
    },
    {
      id: 1,
      name: t(LOCALES.EXPERIMENT.LBL_ADD_IMAGE),
      icon: ImagePlus,
      onPress: () => pickImageFromCamera(),
    },
  ];
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
  const handleExperimentSelect = (item: any) => {
    setSelectedExperiment(item);
    setSelectedField(null);
    setSelectedPlot(null);
  };
  const handleFieldSelect = (item: any) => {
    setSelectedField(item);
    setSelectedPlot(null);
  };
  const handlePlotSelect = (item: any) => {
    setSelectedPlot(item);
  };
  const pickImageFromCamera = () => {
    ImagePicker.openCamera({cropping: true}).then(image => {
      navigation.navigate('AddImage', {
        imageUrl: image.path,
      });
    });
  };
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
            <SelectExperiment
              selectedExperiment={selectedExperiment}
              handleExperimentSelect={handleExperimentSelect}
            />
            {selectedExperiment && (
              <SelectField
                selectedField={selectedField}
                handleFieldSelect={handleFieldSelect}
              />
            )}
            {selectedExperiment && selectedField && (
              <SelectPlot
                selectedPlot={selectedPlot}
                handlePlotSelect={handlePlotSelect}
              />
            )}
            {selectedExperiment && selectedField && selectedPlot && (
              <>
                <View style={styles.userInteractionContainer}>
                  {userInteractionOptions.map(item => (
                    <Pressable
                      style={styles.optionContainer}
                      key={item.id}
                      onPress={item.onPress}>
                      <item.icon />
                      <Text style={styles.option}>{item.name}</Text>
                    </Pressable>
                  ))}
                </View>
                <UnrecordedTraits />
              </>
            )}
          </View>
        </ScrollView>
        <View style={styles.saveRecordBtnContainer}>
          <Button
            title={
              t(LOCALES.EXPERIMENT.LBL_SAVE) +
              ' 2 ' +
              t(LOCALES.EXPERIMENT.LBL_RECORD)
            }
          />
        </View>
      </KeyboardAvoidingView>
      <NotesModal
        isModalVisible={isNotesModalVisible}
        closeModal={() => setIsNotesModalVisible(false)}
        onDiscard={() => setIsNotesModalVisible(false)}
        onSave={() => setIsNotesModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default NewRecord;
