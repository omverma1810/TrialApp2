import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import BottomSheetModalView from '../../../../../../components/BottomSheetModal';
import {LOCALES} from '../../../../../../localization/constants';
import {BottomSheetModalTypes} from '../../../../../../types/components/BottomSheetModal';
import {styles} from '../../../../AddImage/styles';
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
  const data: OptionType[] = item?.preDefiendList || [];

  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [matchedOption, setMatchedOption] = useState('');

  useEffect(() => {
    if (selectedOption) {
      handleSubmit();
    }
  }, [selectedOption]);

  useEffect(() => {
    if (inputValue) {
      const match = mapInputValueToOption(inputValue);
      setMatchedOption(match || '');
    }
  }, [inputValue]);

  const getKeyboardType = (type: string) => {
    return 'default';
  };

  const mapInputValueToOption = (value: string) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return null;

    return data.find(
      option =>
        (option.minimumValue === undefined ||
          numericValue >= option.minimumValue) &&
        (option.maximumValue === undefined ||
          numericValue <= option.maximumValue),
    )?.name;
  };

  const handleSubmit = () => {
    let saveValue = '';

    if (inputValue) {
      saveValue = `${inputValue} ${item?.traitUom || ''}`;
    }
    if (matchedOption) {
      saveValue += ` (Matched Option: ${matchedOption})`;
    } else if (selectedOption) {
      saveValue = `${selectedOption}`;
    }
    if (saveValue) {
      onSubmit(saveValue);
    }
    bottomSheetModalRef?.current?.close();
  };

  const hasMinMax =
    data &&
    data?.some &&
    data?.some(
      option =>
        option.minimumValue !== undefined && option.maximumValue !== undefined,
    );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <BottomSheetModalView
        bottomSheetModalRef={bottomSheetModalRef}
        type="SCREEN_HEIGHT"
        containerStyle={styles.traitsModal}>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <View>
            <View style={[styles.traitsModalHeader, styles.row]}>
              <Text style={styles.traitsModalHeaderTitle}>
                {`${item?.traitName || ''} (${item?.traitUom || ''})`}
              </Text>
            </View>

            {data.length > 0 ? (
              data.map((option, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.optionsContainer,
                    selectedOption === option.name && styles.highlightedOption,
                  ]}
                  onPress={() => {
                    setSelectedOption(option.name);
                    setInputValue('');
                    setMatchedOption('');
                  }}>
                  <Text style={styles.optionsTitle}>{option?.name}</Text>
                  <Text style={styles.optionsLabel}>
                    {option?.minimumValue
                      ? `Min: ${option?.minimumValue}  `
                      : ''}
                    {option?.maximumValue ? `Max: ${option?.maximumValue}` : ''}
                  </Text>
                </Pressable>
              ))
            ) : (
              <View style={styles.noDataView}>
                <Text style={styles.noDataText}>NO OPTIONS DEFINED</Text>
              </View>
            )}

            {hasMinMax && (
              <View>
                <View style={[styles.traitsModalHeader, styles.row]}>
                  <TextInput
                    style={[styles.traitsModalHeaderTitle, styles.inputField]}
                    value={inputValue}
                    onChangeText={text => {
                      setInputValue(text);
                      setSelectedOption('');
                    }}
                    placeholder={`Enter ${item?.traitName || 'value'} - ${
                      item?.traitUom
                    }`}
                    placeholderTextColor={'#888'}
                  />
                </View>
                {matchedOption && (
                  <Text style={styles.matchedOption}>
                    Matched Option: {matchedOption}
                  </Text>
                )}
              </View>
            )}

            <Pressable style={styles.saveButton} onPress={handleSubmit}>
              <Text style={styles.saveButtonText}>
                {t(LOCALES.EXPERIMENT.LBL_SAVE)}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </BottomSheetModalView>
    </KeyboardAvoidingView>
  );
};

export default OptionsModal;
