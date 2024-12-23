import React, {useState} from 'react';
import {Text, View, TextInput, Pressable} from 'react-native';
import {useTranslation} from 'react-i18next';

import BottomSheetModalView from '../../../../../../components/BottomSheetModal';
import {BottomSheetModalTypes} from '../../../../../../types/components/BottomSheetModal';
import {styles} from '../../../../AddImage/styles';
import {LOCALES} from '../../../../../../localization/constants';
import {useUnrecordedTraits} from '../../UnrecordedTraitsContext';

type ModalTypes = {
  bottomSheetModalRef: BottomSheetModalTypes['bottomSheetModalRef'];
};

type OptionType = {
  name: string;
  minimumValue?: number;
  maximumValue?: number;
};

const OptionsModal = ({bottomSheetModalRef}: ModalTypes) => {
  const {t} = useTranslation();
  const {item, onSubmit} = useUnrecordedTraits();

  let data: OptionType[] = [];
  try {
    data = item?.preDefiendList ? item.preDefiendList : [];
  } catch (error) {
    console.error('Error parsing predefined list JSON:', error);
    data = [];
  }

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

  const handleSubmit = () => {
    if (inputValue) {
      const match = findMatchingOption(inputValue);

      const saveValue = match
        ? `${inputValue} ${item?.traitUom || ''} (${match})`
        : `${inputValue} ${item?.traitUom || ''}`;
      onSubmit(saveValue);
    } else if (selectedOption) {
      const saveValue = `${selectedOption}`;
      onSubmit(saveValue);
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
            {`${item?.traitName || ''} (${item?.traitUom || ''})`}
          </Text>
        </View>

        {data.length > 0 ? (
          data.map((option: any, index: number) => {
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

        <View style={[styles.traitsModalHeader, styles.row]}>
          <TextInput
            style={[styles.traitsModalHeaderTitle, styles.inputField]}
            keyboardType={getKeyboardType(item?.dataType)}
            value={inputValue}
            placeholder={`Enter value (${item?.traitUom || ''})`}
            onChangeText={text => {
              setInputValue(text);
              setSelectedOption('');
              setMappedOption(findMatchingOption(text));
            }}
          />
        </View>

        <Pressable style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>
            {t(LOCALES.EXPERIMENT.LBL_SAVE)}
          </Text>
        </Pressable>
      </View>
    </BottomSheetModalView>
  );
};

export default OptionsModal;
