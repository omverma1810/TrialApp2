import {Pressable, StyleSheet, View} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';

import useTheme from '../../theme/hooks/useTheme';
import {ChipTypes} from '../../types/components/Chip';
import {Text} from '..';

const Chip = ({
  leftIcon,
  rightIcon,
  customLeftIconStyle = {},
  customRightIconStyle = {},
  onLeftIconClick = () => {},
  onRightIconClick = () => {},
  parentStyle = {},
  containerStyle = {},
  customLabelStyle = {},
  title,
  onPress = () => {},
  isSelected = false,
}: ChipTypes) => {
  const [isChipSelected, setIsChipSelected] = useState(isSelected);
  const {COLORS, FONTS} = useTheme();

  useEffect(() => {
    setIsChipSelected(isSelected);
  }, [isSelected]);

  const getInputStyle = useCallback(() => {
    if (isChipSelected) {
      return [
        styles.chip,
        {
          backgroundColor: COLORS.COMPONENTS.CHIP.PRIMARY_COLOR,
          borderColor: COLORS.COMPONENTS.CHIP.ACTIVE_BORDER_COLOR,
        },
        containerStyle,
      ];
    } else {
      return [
        styles.chip,
        {
          backgroundColor: COLORS.COMPONENTS.CHIP.PRIMARY_COLOR,
          borderColor: COLORS.COMPONENTS.CHIP.INACTIVE_BORDER_COLOR,
        },
        containerStyle,
      ];
    }
  }, [isChipSelected, COLORS, containerStyle]);

  return (
    <Pressable style={[styles.container, parentStyle]} onPress={onPress}>
      <View style={getInputStyle()}>
        {leftIcon ? (
          <Pressable style={customLeftIconStyle} onPress={onLeftIconClick}>
            {leftIcon}
          </Pressable>
        ) : null}

        <Text
          style={[
            styles.text,
            {
              fontFamily: FONTS.SEMI_BOLD,
              color: COLORS.COMPONENTS.CHIP.TEXT_COLOR,
            },
            customLabelStyle,
          ]}>
          {title}
        </Text>

        {rightIcon ? (
          <Pressable style={customRightIconStyle} onPress={onRightIconClick}>
            {rightIcon}
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
};

export default Chip;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
  },
  chip: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    fontSize: 14,
    justifyContent: 'center',
  },
});
