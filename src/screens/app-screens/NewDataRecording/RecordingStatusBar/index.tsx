import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface RecordingStatusBarProps {
  recorded: number;
  total: number;
}

const RecordingStatusBar: React.FC<RecordingStatusBarProps> = ({
  recorded,
  total,
}) => {
  const insets = useSafeAreaInsets();
  const progress = total ? recorded / total : 0;

  return (
    <View
      style={[
        styles.container,
        // push above any OS nav‐bar on iOS/Android
        {paddingBottom: insets.bottom || 12},
      ]}>
      <View style={styles.inner}>
        <View style={styles.track}>
          <View style={[styles.fill, {width: `${progress * 100}%`}]} />
        </View>
        <Text style={styles.label}>
          {recorded}/{total} - Plots
        </Text>
      </View>
    </View>
  );
};

export default RecordingStatusBar;

const styles = StyleSheet.create({
  container: {
    // Remove absolute positioning for better layout flow
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  inner: {
    // this wrapper holds the bar + label
    width: '100%',
    maxWidth: 400, // Reduced max width for better mobile experience
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#4CAF50', // Better green color
    borderRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minWidth: 80, // Ensure consistent width for label
    textAlign: 'right',
  },
});
