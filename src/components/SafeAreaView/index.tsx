import {StyleSheet} from 'react-native';
import React, {useMemo} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';

import {SafeAreaViewTypes} from '../../types/components/SafeAreaView';
import useTheme from '../../theme/hooks/useTheme';

const SafeAreaViewComponent = ({
  children,
  parentStyle = {},
  ...rest
}: SafeAreaViewTypes) => {
  const {COLORS} = useTheme();

  const getSafeAreaViewStyle = useMemo(
    () => [
      {
        flex: 1,
        backgroundColor: COLORS.APP.BACKGROUND_COLOR,
      },
      parentStyle,
    ],
    [COLORS, parentStyle],
  );

  return (
    <SafeAreaView {...rest} style={getSafeAreaViewStyle}>
      {children}
    </SafeAreaView>
  );
};

export default SafeAreaViewComponent;

const styles = StyleSheet.create({});
