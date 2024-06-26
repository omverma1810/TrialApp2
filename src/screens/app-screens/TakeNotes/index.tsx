import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';

import {SafeAreaView, StatusBar} from '../../../components';
import BottomModal from '../../../components/BottomSheetModal';
import {DropdownArrow} from '../../../assets/icons/svgs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {experiment, field} from '../../../Data';
import Chip from '../../../components/Chip';
import TakeNotesStyles from './TakeNotesStyle';

interface Chip {
  id: number;
  ExperientName: string;
  CropName: string;
  fieldName?: string;
  Location?: string;
  Fieldno?: string;
}

const TakeNotes = () => {
  const [selectedChips, setSelectedChips] = useState<Chip[]>([]);
  const [chipTitle, setChipTitle] = useState('Select an Experiment');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedField, setSelectedField] = useState<Chip | null>(null);
  const [chipVisible, setChipVisible] = useState(true);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const bottomSheetModalRef = useRef(null);
  const secondBottomSheetRef = useRef(null);
  const {bottom} = useSafeAreaInsets();
  const [text, setText] = useState('');

  const handleFirstRightIconClick = () => {
    if (bottomSheetModalRef.current) {
      (bottomSheetModalRef.current as any).present();
    }
  };

  const handleSecondRightIconClick = () => {
    if (secondBottomSheetRef.current) {
      (secondBottomSheetRef.current as any).present();
    }
  };

  const handleThirdRightIconClick = () => {
    setModalVisible(true);
  };

  const handleExperimentSelect = (item: Chip) => {
    setSelectedChips([item]);
    setChipTitle('Select Field');
    (bottomSheetModalRef.current as any).dismiss();
  };

  const handleFieldSelect = (item: Chip) => {
    setSelectedField(item);
    setChipTitle('Select Date');
    setChipVisible(false);
    setInputVisible(true);
    (secondBottomSheetRef.current as any).dismiss();
  };

  const handleChipPress = () => {
    console.log('Chip pressed');
    if (selectedChips.length === 0) {
      handleFirstRightIconClick();
    } else if (!selectedField) {
      handleSecondRightIconClick();
    } else {
      handleThirdRightIconClick();
    }
  };

  return (
    <SafeAreaView>
      <StatusBar />
      <View style={TakeNotesStyles.container}>
        <View style={TakeNotesStyles.chipContainer}>
          {selectedChips.length > 0 && (
            <View style={TakeNotesStyles.chipItem}>
              <Text style={TakeNotesStyles.chipTitle}>Experiment</Text>
              <View style={TakeNotesStyles.chipTextRow}>
                <Text style={TakeNotesStyles.chipText}>
                  {selectedChips[0].ExperientName}
                </Text>
                <DropdownArrow />
              </View>
              <View style={TakeNotesStyles.chipCropText}>
                <Text style={TakeNotesStyles.chipCropText1}>
                  {selectedChips[0].CropName}
                </Text>
              </View>
            </View>
          )}
          {selectedField && (
            <View style={TakeNotesStyles.chipItem}>
              <Text style={TakeNotesStyles.chipTitle}>Field</Text>
              <View style={TakeNotesStyles.chipTextRow}>
                <Text style={TakeNotesStyles.chipText}>
                  {selectedField.fieldName || 'Field name not available'}
                </Text>
                <DropdownArrow />
              </View>
              <Text style={TakeNotesStyles.fieldText}>
                {selectedField.Location}
              </Text>
            </View>
          )}
        </View>
        {chipVisible && (
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
        {inputVisible && (
          <View>
            <View style={TakeNotesStyles.inputContainer}>
              <TextInput
                style={TakeNotesStyles.inputText}
                multiline={true}
                placeholder="Notes"
                value={text}
                onChangeText={setText}
                placeholderTextColor="#636363"
              />
            </View>
            <TouchableOpacity
              style={TakeNotesStyles.submitButton}
              onPress={() => {
                console.log('Submit button pressed');
              }}>
              <Text style={TakeNotesStyles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}

        <BottomModal
          bottomSheetModalRef={bottomSheetModalRef}
          type="CONTENT_HEIGHT"
          containerStyle={{paddingBottom: bottom}}>
          <View style={TakeNotesStyles.modalContainer}>
            <Text style={TakeNotesStyles.modalTitle}>Select an Experiment</Text>
            <ScrollView>
              <View style={{gap: 30}}>
                {experiment.map((item, index) => (
                  <TouchableOpacity
                    key={`${item.id}-${index}`}
                    onPress={() => handleExperimentSelect(item)}
                    style={TakeNotesStyles.modalItemContainer}>
                    <Text style={TakeNotesStyles.modalItemText}>
                      {item.ExperientName}
                    </Text>
                    <Text
                      style={[
                        TakeNotesStyles.modalItemCropText,
                        {
                          backgroundColor:
                            item.CropName === 'Rice' ? '#FCEBEA' : '#E8F0FB',
                        },
                      ]}>
                      {item.CropName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </BottomModal>

        <BottomModal
          bottomSheetModalRef={secondBottomSheetRef}
          type="CONTENT_HEIGHT"
          containerStyle={{paddingBottom: bottom}}>
          <View style={TakeNotesStyles.modalContainer}>
            <Text style={TakeNotesStyles.modalTitle}>Select Field</Text>
            <ScrollView>
              <View style={{gap: 30}}>
                {field.map((item, index) => (
                  <TouchableOpacity
                    key={`${item.id}-${index}`}
                    onPress={() =>
                      handleFieldSelect({
                        id: item.id,
                        ExperientName: '',
                        CropName: '',
                        fieldName: item.Fieldno,
                        Location: item.Location,
                      })
                    }
                    style={TakeNotesStyles.fieldItemContainer}>
                    <Text style={TakeNotesStyles.fieldItemText}>
                      Field: {item.Fieldno}
                    </Text>
                    <Text style={TakeNotesStyles.fieldLocationText}>
                      {item.Location}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </BottomModal>
      </View>
    </SafeAreaView>
  );
};

export default TakeNotes;
