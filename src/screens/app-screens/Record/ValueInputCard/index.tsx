import React, {useEffect, useState, useMemo} from 'react';
import {View, Pressable} from 'react-native';
import {OutlinedInput, Text} from '../../../../components';
import RecordStyles from '../RecordStyles';
import eventEmitter from '../../../../utilities/eventEmitter';
import {TOAST_EVENT_TYPES} from '../../../../types/components/Toast';

const MIN_INITIAL_PLANT_STAND = 1;
const MAX_INITIAL_PLANT_STAND = 10;
const MIN_FINAL_PLANT_STAND = 2;
const MAX_FINAL_PLANT_STAND = 10;

const ValueInputCard = ({entry, onSubmit, setShowInputCard}: any) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (entry) {
      setValue(entry.value ?? '');
    } else {
      setValue('');
    }
  }, [entry]);

  const rightIcon = (
    <Text style={RecordStyles.traitsInputIconText}>{entry?.traitUom}</Text>
  );

  const notes =
    entry?.dataType === 'int' || entry?.dataType === 'float'
      ? 'Use values separated by * to get the average.'
      : '';

  const showToast = (options: any) => {
    eventEmitter.emit(TOAST_EVENT_TYPES.SHOW, options);
  };

  const handleSubmit = (text: string) => {
    if (!entry) {
      showToast({
        type: 'ERROR',
        message: 'No valid entry found to save the data.',
      });
      return;
    }

    const numericValue = parseFloat(text);

    if (entry?.traitName === 'Initial Plant Stand') {
      if (
        numericValue < MIN_INITIAL_PLANT_STAND ||
        numericValue > MAX_INITIAL_PLANT_STAND
      ) {
        showToast({
          type: 'ERROR',
          message: `Value must be between ${MIN_INITIAL_PLANT_STAND} and ${MAX_INITIAL_PLANT_STAND}.`,
        });
        return;
      }
    }

    if (entry?.traitName === 'Final Plant Stand') {
      if (
        numericValue < MIN_FINAL_PLANT_STAND ||
        numericValue > MAX_FINAL_PLANT_STAND
      ) {
        showToast({
          type: 'ERROR',
          message: `Value must be between ${MIN_FINAL_PLANT_STAND} and ${MAX_FINAL_PLANT_STAND}.`,
        });
        return;
      }
    }

    onSubmit(text);
    setValue('');
    setShowInputCard(null);
    showToast({
      type: 'SUCCESS',
    });
  };

  const handleInputChange = (text: string) => {
    if (entry?.dataType === 'int' || entry?.dataType === 'float') {
      const cleanedText = text.replace(/[^\d.*]/g, '');
      setValue(cleanedText);
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
              keyboardType={keyboardType}
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
