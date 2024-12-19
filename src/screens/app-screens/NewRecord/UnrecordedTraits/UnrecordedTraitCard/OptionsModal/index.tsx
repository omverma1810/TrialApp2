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
  const data: OptionType[] = JSON.parse(item?.preDefiendList || '[]');

  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  const getKeyboardType = (type: string) => {
    if (type === 'int' || type === 'float' || type === 'fixed') {
      return 'numeric';
    }
    return 'default';
  };

  const handleSubmit = () => {
    if (inputValue) {
      const saveValue = `${inputValue} ${item?.traitUom || ''}`;
      onSubmit(saveValue);
    } else if (selectedOption) {
      const saveValue = `${selectedOption}`;
      onSubmit(saveValue);
    }
    bottomSheetModalRef?.current?.close();
  };

  const hasMinMax = data.some(
    option =>
      option.minimumValue !== undefined && option.maximumValue !== undefined,
  );

  return (
    <BottomSheetModalView
      bottomSheetModalRef={bottomSheetModalRef}
      type="SCREEN_HEIGHT"
      containerStyle={styles.traitsModal}>
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
              }}>
              <Text style={styles.optionsTitle}>{option?.name}</Text>
              <Text style={styles.optionsLabel}>
                {option?.minimumValue ? `Min: ${option?.minimumValue}  ` : ''}
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
          <View style={[styles.traitsModalHeader, styles.row]}>
            <TextInput
              style={[styles.traitsModalHeaderTitle, styles.inputField]}
              keyboardType={getKeyboardType(item?.dataType)}
              value={inputValue}
              onChangeText={text => {
                setInputValue(text);
                setSelectedOption('');
              }}
              placeholder={`Enter ${item?.traitName || 'value'} - ${
                item?.traitUom
              }`}
            />
          </View>
        )}

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
