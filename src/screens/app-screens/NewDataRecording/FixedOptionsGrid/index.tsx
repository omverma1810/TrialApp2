import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {FONTS} from '../../../../theme/fonts';

interface FixedOption {
  name: string;
  score?: string | number;
  minimumValue?: string | number;
  maximumValue?: string | number;
}

interface FixedOptionsGridProps {
  options: (FixedOption | string)[];
  selected: string;
  onSelect: (option: string) => void;
}

const FixedOptionsGrid: React.FC<FixedOptionsGridProps> = ({
  options,
  selected,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {options.map((option, index) => {
          // Handle both string and object options
          const optionName = typeof option === 'string' ? option : option.name;
          const optionScore =
            typeof option === 'string' ? undefined : option.score;
          const optionMinValue =
            typeof option === 'string' ? undefined : option.minimumValue;
          const optionMaxValue =
            typeof option === 'string' ? undefined : option.maximumValue;

          const isSelected = selected === optionName;

          return (
            <View key={index} style={styles.option}>
              <Pressable
                key={index}
                onPress={() => onSelect(optionName)}
                style={[
                  {
                    backgroundColor: isSelected ? '#1A6DD2' : '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    paddingVertical: 10,
                  },
                ]}>
                {optionScore && (
                  <Text
                    style={{
                      color: isSelected ? '#FFFFFF' : '#000000',
                      fontWeight: isSelected ? '600' : '400',
                      fontSize: 16,
                    }}>
                    {optionScore}
                  </Text>
                )}
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: isSelected ? '#FFFFFF' : '#000000',
                    },
                  ]}>
                  {optionName}
                </Text>
              </Pressable>
              {((optionMinValue !== undefined &&
                optionMinValue !== '' &&
                optionMinValue !== null) ||
                (optionMaxValue !== undefined &&
                  optionMaxValue !== '' &&
                  optionMaxValue !== null)) && (
                <View>
                  <Text style={{color: '#000000'}}>
                    {optionMinValue !== undefined &&
                      optionMinValue !== '' &&
                      optionMinValue !== null &&
                      `Min: ${optionMinValue}`}
                    {optionMinValue !== undefined &&
                      optionMinValue !== '' &&
                      optionMinValue !== null &&
                      optionMaxValue !== undefined &&
                      optionMaxValue !== '' &&
                      optionMaxValue !== null &&
                      ' - '}
                    {optionMaxValue !== undefined &&
                      optionMaxValue !== '' &&
                      optionMaxValue !== null &&
                      `Max: ${optionMaxValue}`}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 35,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    rowGap: 12,
  },
  option: {
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: '33.3%', // three items per row
  },
  optionText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default FixedOptionsGrid;
