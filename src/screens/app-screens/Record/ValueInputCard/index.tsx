import { View,TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';

import { OutlinedInput, Text } from '../../../../components';
import RecordStyles from '../RecordStyles';

const ValueInputCard = ({ entry, onSubmit ,setShowInputCard}: any) => {
  const [value, setValue] = useState('');
  const recordedValue = entry.value;
  const rightIcon = (
    <Text style={RecordStyles.traitsInputIconText}>{entry?.traitUom}</Text>
  );

  const handleSubmit = (text: string) => {
    onSubmit(text);
    setValue('');
    setShowInputCard(false);
    entry.value = text
  };

  useEffect(() => {
    if (recordedValue) {
      setValue(recordedValue);
    }
  }, [recordedValue]);

  return (
    <View style={[RecordStyles.row]}>
      <View style={{width:'80%'}}>
        <OutlinedInput
          label={entry.traitName}
          rightIcon={rightIcon}
          onSubmitEditing={e => handleSubmit(e.nativeEvent.text)}
          value={value}
          onChangeText={setValue}
        />
      </View>
      <TouchableOpacity
        onPress={() => handleSubmit(value)}
        style={RecordStyles.editButton}>
        <Text style={RecordStyles.editButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ValueInputCard;
