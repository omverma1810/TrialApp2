import {Pressable, StyleSheet, TextInput, View, Animated} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';

import useTheme from '../../theme/hooks/useTheme';
import {Text} from '..';
import {OutlinedInputTypes} from '../../types/components/OutlinedInput';

const OutlinedInput = ({
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
  placeholder = '',
  note,
  ...props
}: OutlinedInputTypes) => {
  const [isFocused, setIsFocused] = useState(false);
  const {COLORS, FONTS} = useTheme();
  const opacity = useMemo(() => new Animated.Value(0), []);

  const getInputStyle = useMemo(() => {
    if (isFocused) {
      return [
        styles.input,
        {
          backgroundColor: COLORS.COMPONENTS.OUTLINED_INPUT.BACKGROUND_COLOR,
          borderColor: COLORS.COMPONENTS.OUTLINED_INPUT.ACTIVE_BORDER_COLOR,
        },
        containerStyle,
      ];
    } else {
      return [
        styles.input,
        {
          backgroundColor: COLORS.COMPONENTS.OUTLINED_INPUT.BACKGROUND_COLOR,
          borderColor: COLORS.COMPONENTS.OUTLINED_INPUT.INACTIVE_BORDER_COLOR,
        },
        containerStyle,
      ];
    }
  }, [isFocused, containerStyle, COLORS]);

  const getLabelStyle = useMemo(
    () => [
      styles.label,
      {
        color: COLORS.COMPONENTS.OUTLINED_INPUT.LABEL_COLOR,
        fontFamily: FONTS.REGULAR,
        backgroundColor: COLORS.COMPONENTS.OUTLINED_INPUT.BACKGROUND_COLOR,
      },
      labelStyle,
    ],
    [labelStyle, COLORS, FONTS],
  );

  const getLabelContainerStyle = useMemo(
    () => [
      styles.labelContainer,
      {
        opacity: opacity,
      },
      labelContainerStyle,
    ],
    [labelContainerStyle],
  );

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: isFocused ? 1 : 0,
      duration: 0,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  return (
    <View style={[styles.container, parentStyle]}>
      <Animated.View style={getLabelContainerStyle}>
        <Text style={getLabelStyle}>{label}</Text>
      </Animated.View>
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
              fontFamily: FONTS.MEDIUM,
              color: COLORS.COMPONENTS.OUTLINED_INPUT.TEXT_COLOR,
            },
            textInputStyle,
          ]}
          textAlignVertical={multiline ? 'top' : 'auto'}
          multiline={multiline}
          placeholder={isFocused ? '' : label}
          placeholderTextColor={
            COLORS.COMPONENTS.OUTLINED_INPUT.PLACEHOLDER_COLOR
          }
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
      {note ? (
        <Text
          style={[
            styles.note,
            {
              color: COLORS.COMPONENTS.OUTLINED_INPUT.NOTE_COLOR,
              fontFamily: FONTS.REGULAR,
            },
          ]}>
          {note}
        </Text>
      ) : null}
    </View>
  );
};

export default OutlinedInput;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 8,
  },
  input: {
    width: '100%',
    height: 49,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    paddingHorizontal: 4,
  },
  labelContainer: {
    zIndex: 1,
    marginLeft: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'absolute',
    marginTop: -8,
  },
  note: {
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
});
