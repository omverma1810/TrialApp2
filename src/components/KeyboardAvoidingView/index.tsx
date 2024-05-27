import {KeyboardAvoidingView, Platform, StyleSheet, View} from 'react-native';
import React from 'react';

import {KeyboardAvoidingViewTypes} from '../../types/components/KeyboardAvoidingView';

const index = ({
  children,
  parentStyle = {},
  ...props
}: KeyboardAvoidingViewTypes) => {
  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView
        style={[styles.container, parentStyle]}
        behavior="padding"
        {...props}>
        {children}
      </KeyboardAvoidingView>
    );
  } else {
    return <View style={[styles.container, parentStyle]}>{children}</View>;
  }
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
