import {KeyboardTypeOptions, View} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';

import {OutlinedInput, Text} from '../../../../../../components';
import {styles} from '../../../styles';
import {useUnrecordedTraits} from '../../UnrecordedTraitsContext';

const ValueInputCard = () => {
  const {onSubmit, recordedValue, item} = useUnrecordedTraits();
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

  const keyboardType: KeyboardTypeOptions = useMemo(() => {
    if (item?.dataType === 'float' || item?.dataType === 'int') {
      return 'number-pad';
    } else {
      return 'default';
    }
  }, [item?.dataType]);

  return (
    <View style={[styles.traitsInputContainer, styles.row]}>
      <OutlinedInput
        label={item.traitName}
        rightIcon={rightIcon}
        onEndEditing={e => handleSubmit(e.nativeEvent.text)}
        onSubmitEditing={e => handleSubmit(e.nativeEvent.text)}
        value={value}
        onChangeText={setValue}
        keyboardType={keyboardType}
      />
    </View>
  );
};

export default ValueInputCard;
