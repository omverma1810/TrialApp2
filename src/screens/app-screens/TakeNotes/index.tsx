import React from 'react';
import {StyleSheet} from 'react-native';

import {SafeAreaView, StatusBar} from '../../../components';
import ComingSoon from '../ComingSoon';

const TakeNotes = () => {
  return (
    <SafeAreaView>
      <StatusBar />
      <ComingSoon />
    </SafeAreaView>
  );
};

export default TakeNotes;

const styles = StyleSheet.create({});
