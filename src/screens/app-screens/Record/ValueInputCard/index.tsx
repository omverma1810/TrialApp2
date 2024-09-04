import { View,TouchableOpacity, Pressable } from 'react-native';
import React, { useEffect, useState,useMemo } from 'react';

import { OutlinedInput, Text } from '../../../../components';
import RecordStyles from '../RecordStyles';

const ValueInputCard = ({ entry, onSubmit ,setShowInputCard}: any) => {
  const [value, setValue] = useState('');
  const recordedValue = entry.value;
  const rightIcon = (
    <Text style={RecordStyles.traitsInputIconText}>{entry?.traitUom}</Text>
  );

  const notes =
  entry.dataType === 'int' || entry.dataType === 'float'
    ? 'Use values separated by * to get the average.'
    : '';

  const handleSubmit = (text: string) => {
    onSubmit(text);
    setValue('');
    setShowInputCard(null);
    entry.value = text
  };

  useEffect(() => {
    if (recordedValue) {
      setValue(recordedValue);
    }
  }, [recordedValue]);

  const handleInputChange = (text: string) => {
    if (entry.dataType === 'int' || entry.dataType === 'float') {
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
  const keyboardType: any = useMemo(() => {
    if (entry?.dataType === 'float' || entry?.dataType === 'int') {
      return 'number-pad';
    } else {
      return 'default';
    }
  }, [entry?.dataType]);
  
  return (
<View style={[RecordStyles.row]}>
  <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%',gap:10 }}>
    <View style={{ width: '75%' }}>
      <OutlinedInput
        label={entry.traitName}
        rightIcon={rightIcon}
        onEndEditing={e => handleSubmit(e.nativeEvent.text)}
        onSubmitEditing={e => handleSubmit(e.nativeEvent.text)}
        value={value}
        onChangeText={setValue}
        keyboardType={keyboardType}
        note={notes}
      />
    </View>

    <Pressable
      onPress={() => handleSubmit(value)}
      style={RecordStyles.editButton}>
      <Text style={RecordStyles.editButtonText}>Save</Text>
    </Pressable>
  </View>
</View>
  );
};

export default ValueInputCard;
