import React, {useState} from 'react';
import {Pressable, View, ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';

import {
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

const NewRecord = ({navigation}: NewRecordScreenProps) => {
  const {t} = useTranslation();
  const userInteractionOptions = [
    {
      id: 0,
      name: t(LOCALES.EXPERIMENT.LBL_ADD_NOTES),
      icon: Notes,
      onPress: () => {},
    },
    {
      id: 1,
      name: t(LOCALES.EXPERIMENT.LBL_ADD_IMAGE),
      icon: ImagePlus,
      onPress: () => {},
    },
  ];
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);
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
                    <View style={styles.optionContainer} key={item.id}>
                      <item.icon />
                      <Text style={styles.option}>{item.name}</Text>
                    </View>
                  ))}
                </View>
                <UnrecordedTraits />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NewRecord;
