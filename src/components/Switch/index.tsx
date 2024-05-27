import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {SwitchType} from '../../types/components/Switch';
import useTheme from '../../theme/hooks/useTheme';

const Switch = ({value = true, onChange = () => {}}: SwitchType) => {
  const {COLORS} = useTheme();
  return (
    <Pressable
      onPress={() => {
        onChange(!value);
      }}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: value
              ? COLORS.COMPONENTS.SWITCH.ACTIVE_COLOR
              : COLORS.COMPONENTS.SWITCH.INACTIVE_COLOR,
          },
        ]}>
        <View
          style={[
            styles.dot,
            {
              backgroundColor: COLORS.COMPONENTS.SWITCH.DOT_COLOR,
              alignSelf: value ? 'flex-end' : 'flex-start',
            },
          ]}
        />
      </View>
    </Pressable>
  );
};

export default Switch;

const styles = StyleSheet.create({
  container: {
    height: 26,
    width: 46,
    borderRadius: 100,
    padding: 3,
  },
  dot: {
    height: 20,
    width: 20,
    borderRadius: 10,
  },
});
