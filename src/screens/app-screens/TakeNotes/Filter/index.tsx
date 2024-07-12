import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';

import {FONTS} from '../../../../theme/fonts';

type optionType = {id: number; title: string; isSelected: boolean};

type FilterType = {
  options: optionType[];
  title: string;
  onPress: (option: optionType) => void;
};

const Filter = ({options = [], title = '', onPress = () => {}}: FilterType) => {
  return (
    <View style={[styles.row, styles.filter]}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}>
        {options.map(option => (
          <Pressable
            onPress={() => onPress(option)}
            style={[
              styles.filterOptions,
              option.isSelected && styles.selectedOptions,
            ]}
            key={option.id}>
            <Text
              style={[
                styles.filterOptionsText,
                option.isSelected && styles.selectedOptionsText,
              ]}>
              {option.title}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default Filter;

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
