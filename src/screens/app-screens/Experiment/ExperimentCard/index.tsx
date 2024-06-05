import {Text, View} from 'react-native';
import React from 'react';

import {styles} from './styles';
import ExperimentList from './ExperimentList';

const ExperimentCard = ({data}: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.cropContainer}>
        <Text style={styles.cropTitle}>{data?.crop_name}</Text>
      </View>
      {data?.experiments?.map(ExperimentList)}
    </View>
  );
};

export default ExperimentCard;
