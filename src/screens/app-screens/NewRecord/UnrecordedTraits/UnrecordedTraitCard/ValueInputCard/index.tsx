import {KeyboardTypeOptions, View} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';

import {OutlinedInput, Text} from '../../../../../../components';
import {styles} from '../../../styles';
import {useUnrecordedTraits} from '../../UnrecordedTraitsContext';
import eventEmitter from '../../../../../../utilities/eventEmitter';
import {TOAST_EVENT_TYPES} from '../../../../../../types/components/Toast';

const ValueInputCard = () => {
  const {onSubmit, recordedValue, item} = useUnrecordedTraits();

  const [value, setValue] = useState('');
  const {maximumValue, minimumValue} = useMemo(() => {
    try {
      const parsedLimits = JSON.parse(item.preDefiendList || '[]');
      return parsedLimits[0] || {};
    } catch (error) {
      return {};
    }
  }, [item.preDefiendList]);

  const notes =
    item.dataType === 'int' || item.dataType === 'float'
      ? 'Use values separated by * to get the average.'
      : '';

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

      // Validate against limits
      const values = finalValue.split('*').map(parseFloat).filter(v => !isNaN(v));
      const averageValue =
        values.reduce((sum, num) => sum + num, 0) / values.length || 0;

      if (values.some(v => v < minimumValue || v > maximumValue)) {
        eventEmitter.emit(TOAST_EVENT_TYPES.SHOW, {
          message: `Value must be between ${minimumValue} and ${maximumValue}.`,
          type: 'ERROR',
        });
        return;
      }

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
