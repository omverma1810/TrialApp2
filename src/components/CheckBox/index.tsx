import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

import {CheckboxBlank, CheckboxFill} from '../../assets/icons/svgs';
import {CheckBoxType} from '../../types/components/CheckBox';

const CheckBox = ({value = true, onChange = () => {}}: CheckBoxType) => {
  return (
    <Pressable
      onPress={() => {
        onChange(!value);
      }}>
      {value ? <CheckboxFill /> : <CheckboxBlank />}
    </Pressable>
  );
};

export default CheckBox;

const styles = StyleSheet.create({});
