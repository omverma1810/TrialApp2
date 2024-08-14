import {KeyboardTypeOptions, View} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';

import {OutlinedInput, Text} from '../../../../../../components';
import {styles} from '../../../styles';
import {useUnrecordedTraits} from '../../UnrecordedTraitsContext';

const ValueInputCard = () => {
  const {onSubmit, recordedValue, item} = useUnrecordedTraits();
  const notes =
    item.dataType === 'int' || item.dataType === 'float'
      ? 'Use values separated by * to get the average.'
      : '';
  const [value, setValue] = useState('');
  const rightIcon = (
    <Text style={styles.traitsInputIconText}>{item?.traitUom || ''}</Text>
  );

  const handleSubmit = (text: string) => {
    if (text.trim() === '') {
      return;
    }
    onSubmit(text);
    setValue('');
  };

  useEffect(() => {
    if (recordedValue) {
      setValue(recordedValue);
    }
  }, [recordedValue]);

  const handleInputChange = (text: string) => {
    if (item.dataType === 'int' || item.dataType === 'float') {
      const cleanedText = text.replace(/[^\d.*]/g, '');
      const segments = cleanedText.split('*');
      const validSegments = segments
        .filter(segment => segment !== '')
        .slice(0, 5);
      const formattedValue = validSegments.join('*');
      const finalValue =
        text.endsWith('*') && validSegments.length < 5
          ? formattedValue + '*'
          : formattedValue;

      setValue(finalValue);
    } else {
      setValue(text);
    }
  };

  return (
    <View style={[styles.traitsInputContainer, styles.row]}>
      <OutlinedInput
        label={item.traitName}
        rightIcon={rightIcon}
        onEndEditing={e => handleSubmit(e.nativeEvent.text)}
        onSubmitEditing={e => handleSubmit(e.nativeEvent.text)}
        value={value}
        onChangeText={handleInputChange}
        note={notes}
      />
    </View>
  );
};

export default ValueInputCard;
