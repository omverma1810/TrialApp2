import React from 'react';
import {View, Text, StyleSheet, Dimensions, PixelRatio} from 'react-native';
import {NumPad} from '@umit-turk/react-native-num-pad';

interface RecordedInputCardProps {
  traitName?: string;
  value: string;
  onValueChange: (value: string) => void;
  keyboardType?: string;
  uom?: string;
}

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const pixelDensity = PixelRatio.get(); // e.g., ~3.0 for Galaxy S21

// Responsive scaling utility (similar to scaleFont)
const scaleSize = (size: number) => {
  const baseWidth = 375; // iPhone 11 width baseline
  const scale = screenWidth / baseWidth;
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

const RecordedInputCard = ({value, onValueChange}: RecordedInputCardProps) => {
  const handleKeyPress = (key: string) => {
    onValueChange(value + key);
  };

  const handleDelete = () => {
    onValueChange(value.slice(0, -1));
  };

  // Dynamically determine key and font size based on screen width + density
  const keySize = scaleSize(70); // Dynamically scales with screen size
  const fontSize = scaleSize(20); // Adjusts for readability
  const spacing = scaleSize(4);
  const containerPadding = scaleSize(12);

  const maxNumpadHeight = screenHeight * 0.35;

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: containerPadding,
          paddingVertical: containerPadding / 2,
          maxHeight: maxNumpadHeight,
        },
      ]}>
      <View style={styles.numpadWrapper}>
        <NumPad
          onPress={(key: string) => {
            if (key === 'delete' || key === '<' || key === '⌫') {
              handleDelete();
            } else {
              handleKeyPress(key);
            }
          }}
          buttonTextStyle={{...styles.keyText, fontSize}}
          buttonStyle={{
            ...styles.key,
            width: keySize,
            height: keySize,
            margin: spacing,
            borderRadius: keySize * 0.15,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    top: -12,
  },
  numpadWrapper: {
    width: '100%',
    maxWidth: 360, // limit max width on tablets
    justifyContent: 'center',
    alignItems: 'center',
  },
  key: {
    backgroundColor: '#EDEDED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  keyText: {
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
});

export default RecordedInputCard;
