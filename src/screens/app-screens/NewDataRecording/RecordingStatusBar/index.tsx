import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface RecordingStatusBarProps {
  recorded: number;
  total: number;
}

const RecordingStatusBar: React.FC<RecordingStatusBarProps> = ({
  recorded,
  total,
}) => {
  const progress = total ? recorded / total : 0;

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, {width: `${progress * 100}%`}]} />
      </View>
      <Text style={styles.progressText}>
        {recorded}/{total}
      </Text>
    </View>
  );
};

export default RecordingStatusBar;

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    marginHorizontal: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#008000', // Customize color
  },
  progressText: {
    marginTop: 4,
    fontSize: 14,
    color: '#333',
    alignSelf: 'flex-end',
  },
});
