import {View} from 'react-native';
import React, {useEffect, useState} from 'react';

import {OutlinedInput, Text} from '../../../../../../components';
import {styles} from '../../../styles';
import {useUnrecordedTraits} from '../../UnrecordedTraitsContext';

const ValueInputCard = () => {
  const {onSubmit, recordedValue, item} = useUnrecordedTraits();
  const [value, setValue] = useState('');
  const rightIcon = <Text style={styles.traitsInputIconText}>CM</Text>;

  const handleSubmit = (text: string) => {
    onSubmit(text);
    setValue('');
  };

  useEffect(() => {
    if (recordedValue) {
      setValue(recordedValue);
    }
  }, [recordedValue]);

  return (
    <View style={[styles.traitsInputContainer, styles.row]}>
      <OutlinedInput
        label={item.name}
        rightIcon={rightIcon}
        onSubmitEditing={e => handleSubmit(e.nativeEvent.text)}
        value={value}
        onChangeText={setValue}
        note="Use values separated by * to get the average."
      />
    </View>
  );
};

export default ValueInputCard;
