import {Pressable, StyleSheet, View} from 'react-native';
import React, {useCallback} from 'react';

import useTheme from '../../theme/hooks/useTheme';
import {ButtonTypes} from '../../types/components/Button';
import {Text, Loader} from '..';

const Button = ({
  onPress = () => {},
  title,
  customLabelStyle = {},
  disabled = false,
  loading = false,
  icon,
  containerStyle = {},
  loaderProps = {},
}: ButtonTypes) => {
  const {FONTS, COLORS} = useTheme();

  const getView = useCallback(() => {
    let ele = null;
    if (loading) {
      ele = (
        <Loader
          color={COLORS.COMPONENTS.BUTTON.LOADER_COLOR}
          {...loaderProps}
        />
      );
    } else if (icon) {
      ele = (
        <View style={styles.row}>
          <View>{icon}</View>
          <Text
            style={[
              styles.buttonText,
              {
                marginLeft: 10,
                fontFamily: FONTS.SEMI_BOLD,
                color: COLORS.COMPONENTS.BUTTON.TEXT_COLOR,
              },
              customLabelStyle,
            ]}>
            {title}
          </Text>
        </View>
      );
    } else {
      ele = (
        <Text
          style={[
            styles.buttonText,
            {
              fontFamily: FONTS.SEMI_BOLD,
              color: COLORS.COMPONENTS.BUTTON.TEXT_COLOR,
            },
            customLabelStyle,
          ]}>
          {title}
        </Text>
      );
    }
    return ele;
  }, [COLORS, FONTS, loading, icon, title, {...loaderProps}]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.parent,
        {backgroundColor: COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR},
        containerStyle,
        disabled ? styles.buttonDisbaled : {},
      ]}>
      {getView()}
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  parent: {
    width: '100%',
    borderRadius: 6,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 14,
  },

  buttonDisbaled: {
    opacity: 0.5,
  },
});
