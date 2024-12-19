import React, {useState} from 'react';
import {Text, View, TextInput, Pressable} from 'react-native';
import {useTranslation} from 'react-i18next';

import BottomSheetModalView from '../../../../components/BottomSheetModal';
import styles from '../RecordStyles';
import {LOCALES} from '../../../../localization/constants';
import {useUnrecordedTraits} from '../../NewRecord/UnrecordedTraits/UnrecordedTraitsContext';

// Define the type for the option
interface Option {
  name: string;
  minimumValue?: number;
  maximumValue?: number;
}

const OptionsModal = ({item, onSubmit, bottomSheetModalRef}: any) => {
  const {t} = useTranslation();
  const {item: contextItem, onSubmit: contextSubmit} = useUnrecordedTraits();

  // Ensure compatibility between direct props and context-provided properties
  const traitItem = item || contextItem;
  const handleSubmit = onSubmit || contextSubmit;

  // Define data with explicit typing
  const data: Option[] = JSON.parse(traitItem?.preDefiendList || '[]');
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [mappedOption, setMappedOption] = useState('');

  const getKeyboardType = (type: string) => {
    if (type === 'int' || type === 'float' || type === 'fixed') {
      return 'numeric';
    }
    return 'default';
  };

  const findMatchingOption = (value: string) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return '';

    const match = data.find(option =>
      option.minimumValue !== undefined && option.maximumValue !== undefined
        ? numericValue >= option.minimumValue &&
          numericValue <= option.maximumValue
        : false,
    );

    return match ? match.name : '';
  };

  const saveTraitValue = () => {
    if (inputValue) {
      const match = findMatchingOption(inputValue);

      const saveValue = match
        ? `${inputValue} ${traitItem?.traitUom || ''} (${match})`
        : `${inputValue} ${traitItem?.traitUom || ''}`;
      handleSubmit(saveValue);
    } else if (selectedOption) {
      const saveValue = `${selectedOption}`;
      handleSubmit(saveValue);
    }
    bottomSheetModalRef?.current?.close();
  };

  return (
    <BottomSheetModalView
      bottomSheetModalRef={bottomSheetModalRef}
      type="CONTENT_HEIGHT"
      containerStyle={styles.traitsModal}>
      <View>
        <View style={[styles.traitsModalHeader, styles.row]}>
          <Text style={styles.traitsModalHeaderTitle}>
            {`${traitItem?.traitName || ''} (${traitItem?.traitUom || ''})`}
          </Text>
        </View>

        <View style={[styles.traitsModalHeader, styles.row]}>
          <TextInput
            style={[styles.traitsModalHeaderTitle, styles.inputField]}
            keyboardType={getKeyboardType(traitItem?.dataType)}
            value={inputValue}
            onChangeText={text => {
              setInputValue(text);
              setSelectedOption('');
              setMappedOption(findMatchingOption(text));
            }}
          />
        </View>

        {data.length > 0 ? (
          data.map((option, index) => {
            const isSelected = selectedOption === option.name;
            return (
              <Pressable
                key={index}
                style={[
                  styles.optionsContainer,
                  isSelected && styles.highlightedOption,
                ]}
                onPress={() => {
                  setSelectedOption(option.name);
                  setInputValue('');
                  setMappedOption('');
                }}>
                <Text style={styles.optionsTitle}>{option?.name}</Text>
                <Text style={styles.optionsLabel}>
                  {option?.minimumValue ? `Min: ${option?.minimumValue}  ` : ''}
                  {option?.maximumValue ? `Max: ${option?.maximumValue}` : ''}
                </Text>
              </Pressable>
            );
          })
        ) : (
          <View style={styles.noDataView}>
            <Text style={styles.noDataText}>
              {t(LOCALES.COMMON.LBL_NO_DATA_FOUND)}
            </Text>
          </View>
        )}

        <Pressable style={styles.saveButton} onPress={saveTraitValue}>
          <Text style={styles.saveButtonText}>
            {t(LOCALES.EXPERIMENT.LBL_SAVE)}
          </Text>
        </Pressable>
      </View>
    </BottomSheetModalView>
  );
};

export default OptionsModal;
