import React, {useEffect, useRef, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {DropdownArrow} from '../../../../assets/icons/svgs';
import BottomModal from '../../../../components/BottomSheetModal';
import Chip from '../../../../components/Chip';
import TakeNotesStyles from '../../TakeNotes/TakeNotesStyle';
import {styles} from './styles';

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
}: any) => {
  const bottomSheetModalRef = useRef(null);
  const {bottom} = useSafeAreaInsets();
  const [selectedExperiment, setSelectedExperiment] = useState<any>(null);
  const [chipTitle, setChipTitle] = useState(`Select ${name}`);
  const [chipVisible, setChipVisible] = useState(true);
  const secondBottomSheetRef = useRef(null);
  const [selectedField,setSelectedField] = useState<any>(null);

  const handleExperimentSelect = (item: any) => {
    console.log('=============>', {item});
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

  return (
    <View
      style={[
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
        <View style={TakeNotesStyles.chipItem}>
          <Text style={TakeNotesStyles.chipTitle}>Experiment</Text>
          <View style={TakeNotesStyles.chipTextRow}>
            <Text style={TakeNotesStyles.chipText}>
              {name == 'field'
                ? selectedExperiment.location.villageName
                : selectedExperiment.fieldExperimentName}
            </Text>
            <TouchableOpacity onPress={handleChipPress}>
              <DropdownArrow />
            </TouchableOpacity>
          </View>
          <View style={TakeNotesStyles.chipCropText}>
            <Text style={TakeNotesStyles.chipCropText1}>
              {selectedExperiment.cropName}
            </Text>
          </View>
        </View>
      )}
      {selectedField && (
        <View style={TakeNotesStyles.chipItem}>
          <Text style={TakeNotesStyles.chipTitle}>Field</Text>
          <View style={TakeNotesStyles.chipTextRow}>
            <Text style={TakeNotesStyles.chipText}>
              {selectedField.location.villageName}
            </Text>
            <TouchableOpacity onPress={handleChipPress}>
              <DropdownArrow />
            </TouchableOpacity>
          </View>
          {/* <View style={TakeNotesStyles.chipCropText}>
            <Text style={TakeNotesStyles.chipCropText1}>
              {selectedExperiment.cropName}
            </Text>
          </View> */}
        </View>
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
                      {name == 'field'
                        ? item.location.villageName
                        : item.fieldExperimentName}
                    </Text>
                    <Text
                      style={[
                        TakeNotesStyles.modalItemCropText,
                        {
                          backgroundColor:
                            item.cropName === 'Rice' ? '#FCEBEA' : '#E8F0FB',
                        },
                      ]}>
                      {item.cropName}
                    </Text>
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
