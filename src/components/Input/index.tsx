import {Pressable, StyleSheet, TextInput, View} from 'react-native';
import React, {useMemo, useState} from 'react';

import useTheme from '../../theme/hooks/useTheme';
import {Text} from '..';
import {InputTypes} from '../../types/components/Input';

const Input = ({
  parentStyle = {},
  containerStyle = {},
  textInputStyle = {},
  leftIcon,
  rightIcon,
  onLeftIconClick = () => {},
  onRightIconClick = () => {},
  customLeftIconStyle = {},
  customRightIconStyle = {},
  multiline = false,
  label,
  labelStyle = {},
  labelContainerStyle = {},
  ...props
}: InputTypes) => {
  const [isFocused, setIsFocused] = useState(false);
  const {COLORS, FONTS} = useTheme();

  const getInputStyle = useMemo(() => {
    if (isFocused) {
      return [
        styles.input,
        {
          backgroundColor: COLORS.COMPONENTS.INPUT.BACKGROUND_COLOR,
          borderColor: COLORS.COMPONENTS.INPUT.ACTIVE_BORDER_COLOR,
        },
        containerStyle,
      ];
    } else {
      return [
        styles.input,
        {
          backgroundColor: COLORS.COMPONENTS.INPUT.BACKGROUND_COLOR,
          borderColor: COLORS.COMPONENTS.INPUT.INACTIVE_BORDER_COLOR,
        },
        containerStyle,
      ];
    }
  }, [isFocused, containerStyle, COLORS]);

  const getLabelStyle = useMemo(
    () => [
      styles.label,
      {
        color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
        fontFamily: FONTS.REGULAR,
      },
      labelStyle,
    ],
    [labelStyle, COLORS, FONTS],
  );

  return (
    <View style={[styles.container, parentStyle]}>
      {label ? (
        <View style={labelContainerStyle}>
          <Text style={getLabelStyle}>{label}</Text>
        </View>
      ) : null}

      <View style={getInputStyle}>
        {leftIcon ? (
          <Pressable style={customLeftIconStyle} onPress={onLeftIconClick}>
            {leftIcon}
          </Pressable>
        ) : null}

        <TextInput
          style={[
            styles.textInput,
            {
              fontFamily: FONTS.REGULAR,
              color: COLORS.COMPONENTS.INPUT.TEXT_COLOR,
            },
            textInputStyle,
          ]}
          textAlignVertical={multiline ? 'top' : 'auto'}
          multiline={multiline}
          placeholderTextColor={COLORS.COMPONENTS.INPUT.PLACEHOLDER_COLOR}
          underlineColorAndroid="transparent"
          autoComplete={'off'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {rightIcon ? (
          <Pressable style={customRightIconStyle} onPress={onRightIconClick}>
            {rightIcon}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 13,
  },
  input: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 13,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 10,
  },
});
