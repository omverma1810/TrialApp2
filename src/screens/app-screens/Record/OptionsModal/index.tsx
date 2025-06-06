import {Pressable, Text, View, TextInput} from 'react-native';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';

import {BottomSheetModal} from '../../../../components';
import styles from '../RecordStyles';
import {LOCALES} from '../../../../localization/constants';

type OptionType = {
  name: string;
  minimumValue?: number;
  maximumValue?: number;
};

const OptionsModal = ({item, onSubmit, bottomSheetModalRef}: any) => {
  const {t} = useTranslation();
  const data: OptionType[] = item?.preDefiendList || [];
  const [inputValue, setInputValue] = useState('');
  const [mappedOption, setMappedOption] = useState('');

  const getKeyboardType = (type: string) => {
    return 'default';
  };

  const findMatchingOption = (value: string) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return '';

    const match = data.find(option => {
      const min = option?.minimumValue ?? -Infinity;
      const max = option?.maximumValue ?? Infinity;
      return numericValue >= min && numericValue <= max;
    });

    return match ? match.name : '';
  };

  const handleSave = () => {
    if (inputValue) {
      const saveValue = mappedOption
        ? `${inputValue} ${item?.traitUom || ''} (${mappedOption})`
        : `${inputValue} ${item?.traitUom || ''}`;
      onSubmit(saveValue);
    }
    bottomSheetModalRef?.current?.close();
  };

  return (
    <BottomSheetModal bottomSheetModalRef={bottomSheetModalRef}>
      <View style={styles.traitsModal}>
        {/* Header */}
        <View style={[styles.traitsModalHeader, styles.row]}>
          <Text style={styles.traitsModalHeaderTitle}>{item?.traitName}</Text>
        </View>

        {/* Options */}
        {data.map((option: OptionType, index: number) => (
          <Pressable
            style={styles.optionsContainer}
            key={index}
            onPress={() => {
              onSubmit(option.name);
              bottomSheetModalRef?.current?.close();
            }}>
            <Text style={styles.optionsTitle}>{option?.name}</Text>
            <Text style={styles.optionsLabel}>
              Min: {option?.minimumValue ?? 'N/A'}
              {'  '}Max: {option?.maximumValue ?? 'N/A'}
            </Text>
          </Pressable>
        ))}

        {/* No Data Placeholder */}
        {data.length === 0 && (
          <View style={styles.noDataView}>
            <Text style={styles.noDataText}>
              {t(LOCALES.COMMON.LBL_NO_DATA_FOUND)}
            </Text>
          </View>
        )}

        {/* Input Field */}
        <View style={[styles.traitsModalHeader, styles.row]}>
          <TextInput
            style={[styles.traitsModalHeaderTitle, styles.inputField]}
            value={inputValue}
            placeholder={`Enter value (${item?.traitUom || ''})`}
            onChangeText={text => {
              setInputValue(text);
              setMappedOption(findMatchingOption(text));
            }}
          />
        </View>

        {/* Mapped Option */}
        {mappedOption && (
          <View>
            <Text style={styles.mappedOptionText}>
              Mapped Option: {mappedOption}
            </Text>
          </View>
        )}

        {/* Save Button */}
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {t(LOCALES.EXPERIMENT.LBL_SAVE)}
          </Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
};

export default OptionsModal;
