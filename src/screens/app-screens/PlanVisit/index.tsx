import React from 'react';
import {StyleSheet} from 'react-native';

import {SafeAreaView, StatusBar} from '../../../components';
import ComingSoon from '../ComingSoon';

const PlanVisit = () => {
  return (
    <SafeAreaView>
      <StatusBar />
      <ComingSoon />
    </SafeAreaView>
  );
};

export default PlanVisit;

const styles = StyleSheet.create({});
