import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react';

import {FONTS} from '../../../../theme/fonts';

type FilterType = {
  title: string;
  options: string[];
  selectedOption: string;
  onPress: (option: string) => void;
};

const Filter = ({
  title = '',
  options = [],
  selectedOption = '',
  onPress = () => {},
}: FilterType) => {
  if (options.length === 0) return null;
  return (
    <View style={[styles.row, styles.filter]}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}>
        {options.map((option, index) => (
          <Pressable
            onPress={() => onPress(option)}
            style={[
              styles.filterOptions,
              option === selectedOption && styles.selectedOptions,
            ]}
            key={index}>
            <Text
              style={[
                styles.filterOptionsText,
                option === selectedOption && styles.selectedOptionsText,
              ]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default React.memo(Filter);

const styles = StyleSheet.create({
  filter: {},
  filterTitle: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 12,
    color: '#949494',
    paddingHorizontal: 8,
  },
  scrollView: {flexGrow: 0},
  filterOptions: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginHorizontal: 8,
    backgroundColor: '#E8F0FB',
    borderRadius: 6,
  },
  selectedOptions: {
    backgroundColor: '#0E3C74',
  },
  selectedOptionsText: {
    color: '#FFFFFF',
  },
  filterOptionsText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 12,
    color: '#0E3C74',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
