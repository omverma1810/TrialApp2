import React, {useEffect, useState} from 'react';
import {View, Pressable} from 'react-native';
import {OutlinedInput, Text} from '../../../../components';
import RecordStyles from '../RecordStyles';
import eventEmitter from '../../../../utilities/eventEmitter';
import {TOAST_EVENT_TYPES} from '../../../../types/components/Toast';

interface ValueInputCardProps {
  entry: {
    value?: string;
    traitName: string;
    traitUom?: string;
    dataType: string;
  };
  onSubmit: (value: string) => void;
  setShowInputCard: (value: null) => void;
}

const ValueInputCard: React.FC<ValueInputCardProps> = ({
  entry,
  onSubmit,
  setShowInputCard,
}) => {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    setValue(entry?.value ?? '');
  }, [entry]);

  const rightIcon = (
    <Text style={RecordStyles.traitsInputIconText}>{entry?.traitUom}</Text>
  );

  const notes =
    entry?.dataType === 'int' || entry?.dataType === 'float'
      ? 'Use values separated by * to get the average.'
      : '';

  const showToast = (options: {type: string; message: string}) => {
    eventEmitter.emit(TOAST_EVENT_TYPES.SHOW, options);
  };

  const calculateAverage = (text: string): number | null => {
    const values = text
      .split('*')
      .map(parseFloat)
      .filter(v => !isNaN(v));
    if (values.length === 0) return null;
    return values.reduce((acc, curr) => acc + curr, 0) / values.length;
  };

  const handleSubmit = (text: string) => {
    if (!entry) {
      showToast({
        type: 'ERROR',
        message: 'No valid entry found to save the data.',
      });
      return;
    }

    const averageValue = calculateAverage(text);
    if (averageValue === null) {
      showToast({type: 'ERROR', message: 'Please enter valid numbers.'});
      return;
    }

    onSubmit(averageValue.toFixed(2));
    setValue('');
    setShowInputCard(null);
    showToast({type: 'SUCCESS', message: 'Record saved successfully.'});
  };

  const handleInputChange = (text: string) => {
    if (entry?.dataType === 'int' || entry?.dataType === 'float') {
      const cleanedText = text.replace(/[^\d.*]/g, '');
      setValue(cleanedText);
    } else {
      setValue(text);
    }
  };

  if (!entry) {
    return (
      <View>
        <Text>No Data Found</Text>
      </View>
    );
  }

  return (
    <>
      <View style={[RecordStyles.row]}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            gap: 10,
          }}>
          <View style={{width: '100%'}}>
            <OutlinedInput
              label={entry?.traitName}
              rightIcon={rightIcon}
              value={value}
              onChangeText={handleInputChange}
              note={notes}
            />
          </View>
        </View>
      </View>
      <Pressable
        style={{
          backgroundColor: '#1A6DD2',
          alignItems: 'center',
          paddingVertical: 13,
          borderRadius: 8,
          marginTop: 15,
        }}
        onPress={() => handleSubmit(value)}>
        <Text style={{color: '#F7F7F7', fontWeight: '500'}}>Save Record</Text>
      </Pressable>
    </>
  );
};

export default ValueInputCard;
