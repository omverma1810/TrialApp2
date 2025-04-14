import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {FONTS} from '../../../../theme/fonts';

interface FixedOptionsGridProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

const FixedOptionsGrid: React.FC<FixedOptionsGridProps> = ({
  options,
  selected,
  onSelect,
}) => {
  console.log('📥 FixedOptionsGrid Props:', {options, selected});
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select an Option:</Text>
      <View style={styles.grid}>
        {options.map((option, index) => (
          <Pressable
            key={index}
            style={[
              styles.option,
              selected === option && styles.selectedOption,
            ]}
            onPress={() => onSelect(option)}>
            <Text
              style={[
                styles.optionText,
                selected === option && styles.selectedText,
              ]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: '#1976D2',
  },
  optionText: {
    fontFamily: FONTS.REGULAR,
    fontSize: 14,
    color: '#000',
  },
  selectedText: {
    color: '#fff',
    fontFamily: FONTS.MEDIUM,
  },
});

export default FixedOptionsGrid;
