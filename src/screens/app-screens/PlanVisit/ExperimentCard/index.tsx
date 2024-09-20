import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import BottomModal from '../../../../components/BottomSheetModal';
import TakeNotesStyles from '../../TakeNotes/TakeNotesStyle';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {styles} from './styles';
import {DropdownArrow} from '../../../../assets/icons/svgs';
import Chip from '../../../../components/Chip';
import SelectExperiment from '../../NewRecord/SelectExperiment';
import SelectField from '../../NewRecord/SelectField';

interface Chip {
  id: number;
  ExperientName: string;
  CropName: string;
  fieldName?: string;
  Location?: string;
  Fieldno?: string;
}

const ExperimentCard = ({
  data,
  isFirstIndex,
  isLastIndex,
  onExperimentSelect,
  name,
  onFieldSelect,
  isProjectSelected,
  resetExperiment,
  onReset
}: any) => {
  const bottomSheetModalRef = useRef(null);
  const {bottom} = useSafeAreaInsets();
  const [selectedExperiment, setSelectedExperiment] = useState<any>(null);
  const [chipTitle, setChipTitle] = useState(`Select ${name}`);
  const [chipVisible, setChipVisible] = useState(true);
  const secondBottomSheetRef = useRef(null);
  const [selectedField, setSelectedField] = useState<any>(null);

  const handleExperimentSelect = (item: any) => {
    if (name === 'field') {
      setSelectedField(item);
      setChipTitle(item.location.villageName);
      onFieldSelect(item);
    } else {
      setSelectedExperiment(item);
      setChipTitle(item.fieldExperimentName);
      onExperimentSelect(item);
    }
    console.log(selectedExperiment);
    (bottomSheetModalRef.current as any).dismiss();
  };

  const handleFirstRightIconClick = () => {
    if (bottomSheetModalRef.current) {
      (bottomSheetModalRef.current as any).present();
    }
  };

  const handleChipPress = () => {
    console.log('Chip pressed');
    handleFirstRightIconClick();
  };

  useEffect(() => {
    console.log(data);
  });
  const getBackgroundColor = (experimentType: any) => {
    switch (experimentType) {
      case 'hybrid':
        return '#fdf8ee';
      case 'line':
        return '#fcebea';
      default:
        return '#eaf4e7';
    }
  };
  useEffect(() => {
    if (resetExperiment) {
      setChipTitle(`Select ${name}`); // Reset chip title
      onReset(); // Reset the flag in the parent component
      setSelectedExperiment(null); // Reset selected experiment
    }
  }, [resetExperiment]);

  return (
    <View
      style={[
        styles.container,
        isFirstIndex && styles.firstIndex,
        isLastIndex && styles.lastIndex,
      ]}>
      {!selectedExperiment && chipVisible && !selectedField && (
        <Chip
          onPress={handleChipPress}
          rightIcon={
            <TouchableOpacity onPress={handleChipPress}>
              <DropdownArrow />
            </TouchableOpacity>
          }
          containerStyle={TakeNotesStyles.chip}
          customLabelStyle={TakeNotesStyles.chipLabel}
          title={chipTitle}
          isSelected={false}
        />
      )}
      {selectedExperiment && (
        <Pressable onPress={handleChipPress}>
          <View style={TakeNotesStyles.chipItem}>
            <Text style={TakeNotesStyles.chipTitle}>Experiment</Text>
            <View style={TakeNotesStyles.chipTextRow}>
              <Text style={TakeNotesStyles.chipText}>
                {name == 'field'
                  ? selectedExperiment.location.villageName
                  : selectedExperiment.fieldExperimentName}
              </Text>
              <DropdownArrow />
            </View>
            <View
              style={[
                TakeNotesStyles.chipCropText,
                {
                  backgroundColor: getBackgroundColor(
                    selectedExperiment.experimentType,
                  ),
                },
              ]}>
              <Text style={TakeNotesStyles.chipCropText1}>
                {selectedExperiment.experimentType}
              </Text>
            </View>
          </View>
        </Pressable>
      )}
      {selectedField && (
        <Pressable onPress={handleChipPress}>
          <View style={TakeNotesStyles.chipItem}>
            <Text style={TakeNotesStyles.chipTitle}>Field</Text>
            <View style={TakeNotesStyles.chipTextRow}>
              <Text style={TakeNotesStyles.chipText}>
                {selectedField.location.villageName}
              </Text>
              <DropdownArrow />
            </View>
            {/* <View style={TakeNotesStyles.chipCropText}>
            <Text style={TakeNotesStyles.chipCropText1}>
              {selectedExperiment.cropName}
            </Text>
          </View> */}
          </View>
        </Pressable>
      )}
      <BottomModal
        bottomSheetModalRef={bottomSheetModalRef}
        type="CONTENT_HEIGHT"
        containerStyle={{paddingBottom: bottom}}>
        <View style={TakeNotesStyles.modalContainer}>
          <Text style={TakeNotesStyles.modalTitle}>
            Select an Experiment (or) Field
          </Text>
          <ScrollView>
            <View style={{gap: 30}}>
              {Array.isArray(data) &&
                data.map((item: any, index: number) => (
                  <TouchableOpacity
                    key={`${item.id}-${index}`}
                    onPress={() => handleExperimentSelect(item)}
                    style={TakeNotesStyles.modalItemContainer}>
                    <Text style={TakeNotesStyles.modalItemText}>
                      {name == 'field' ? `${item.id} - ` : null}{' '}
                      {item.fieldExperimentName || item.location.villageName}
                    </Text>
                    {name == 'experiment' ? (
                      <Text
                        style={[
                          TakeNotesStyles.modalItemCropText,
                          {
                            backgroundColor:
                              item.experimentType === 'hybrid'
                                ? '#fdf8ee'
                                : item.experimentType === 'line'
                                ? '#fcebea'
                                : '#eaf4e7',
                          },
                        ]}>
                        {item.experimentType}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
            </View>
          </ScrollView>
        </View>
      </BottomModal>
    </View>
  );
};

export default ExperimentCard;
