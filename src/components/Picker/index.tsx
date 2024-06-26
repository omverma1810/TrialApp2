import React, {useCallback, useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {PickerType} from '../../types/components/Picker';
import {Text} from '..';
import useTheme from '../../theme/hooks/useTheme';
import {DropdownArrow} from '../../assets/icons/svgs';

const Picker = ({
  containerStyle = {},
  parentStyle = {},
  customLabelStyle = {},
  value = null,
  placeholder = '',
  onRightIconClick = () => {},
  onPress = () => {},
}: PickerType) => {
  const [isPickerSelected, setIsPickerSelected] = useState(false);
  const {COLORS, FONTS} = useTheme();

  useEffect(() => {
    if (value) {
      setIsPickerSelected(true);
    }
  }, [value]);

  const getInputStyle = useCallback(() => {
    if (isPickerSelected) {
      return [
        styles.picker,
        {
          backgroundColor: COLORS.COMPONENTS.PICKER.BACKGROUND_COLOR,
          borderColor: COLORS.COMPONENTS.PICKER.ACTIVE_BORDER_COLOR,
        },
        containerStyle,
      ];
    } else {
      return [
        styles.picker,
        {
          backgroundColor: COLORS.COMPONENTS.PICKER.BACKGROUND_COLOR,
          borderColor: COLORS.COMPONENTS.PICKER.INACTIVE_BORDER_COLOR,
        },
        containerStyle,
      ];
    }
  }, [isPickerSelected]);

  return (
    <Pressable style={[styles.container, parentStyle]} onPress={onPress}>
      <View style={getInputStyle()}>
        <Text
          numberOfLines={1}
          style={[
            styles.text,
            {
              fontFamily: FONTS.REGULAR,
              color: value
                ? COLORS.COMPONENTS.PICKER.TEXT_COLOR
                : COLORS.COMPONENTS.PICKER.PLACEHOLDER_COLOR,
            },
            customLabelStyle,
          ]}>
          {value ? value : placeholder}
        </Text>
        <Pressable style={styles.rightIcon} onPress={onRightIconClick}>
          <DropdownArrow />
        </Pressable>
      </View>
    </Pressable>
  );
};

export default Picker;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 8,
  },
  picker: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    fontSize: 14,
    justifyContent: 'center',
  },
  rightIcon: {},
});
