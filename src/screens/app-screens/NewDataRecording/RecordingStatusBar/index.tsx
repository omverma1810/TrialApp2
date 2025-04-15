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
  // Calculate the fraction of recorded vs. total
  const progress = total ? recorded / total : 0;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, {width: `${progress * 100}%`}]} />
      </View>

      {/* Recorded vs. Total Text */}
      <Text style={styles.progressText}>
        {recorded}/{total}
      </Text>
    </View>
  );
};

export default RecordingStatusBar;

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
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
