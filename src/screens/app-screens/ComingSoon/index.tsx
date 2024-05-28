import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

import useTheme from '../../../theme/hooks/useTheme';

const ComingSoon = () => {
  const {COLORS, FONTS} = useTheme();
  return (
    <View style={styles.container}>
      <Text
        style={{
          color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
          fontFamily: FONTS.BOLD,
        }}>
        COMING SOON!
      </Text>
    </View>
  );
};

export default ComingSoon;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
