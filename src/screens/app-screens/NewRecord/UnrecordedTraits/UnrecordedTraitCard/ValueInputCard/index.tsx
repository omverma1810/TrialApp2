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
      const parsedLimits = item.preDefiendList || '[]';
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

  const getKeyboardType = (type: string) => {
    return 'default';
  };

  const handleSubmit = (text: string) => {
    if (text.trim() === '') {
      return;
    }

    const values = text
      .split('*')
      .map(parseFloat)
      .filter(v => !isNaN(v));

    const hasValidLimits =
      typeof minimumValue === 'number' &&
      typeof maximumValue === 'number' &&
      minimumValue <= maximumValue;

    if (
      hasValidLimits &&
      values.some(v => v < minimumValue || v > maximumValue)
    ) {
      eventEmitter.emit(TOAST_EVENT_TYPES.SHOW, {
        message: `Each value must be between ${minimumValue} and ${maximumValue}, inclusive.`,
        type: 'ERROR',
      });
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
