import React, {useRef, useState, useEffect} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {FONTS} from '../../../../theme/fonts';

type FilterType = {
  title: string;
  options: string[];
  selectedOption: string;
  onPress: (option: string) => void;
  onScroll?: (event: any) => void;
};

const Filter = ({
  title = '',
  options = [],
  selectedOption = '',
  onPress = () => {},
  onScroll,
}: FilterType) => {
  if (options.length === 0) return null;

  const scrollViewRef = useRef<ScrollView>(null);
  const [itemLayouts, setItemLayouts] = useState<{
    [key: string]: {x: number; width: number};
  }>({});
  const [scrollViewWidth, setScrollViewWidth] = useState(0);

  useEffect(() => {
    if (
      selectedOption &&
      scrollViewRef.current &&
      itemLayouts[selectedOption] &&
      scrollViewWidth > 0
    ) {
      const {x, width} = itemLayouts[selectedOption];
      // Calculate offset to roughly center the selected item
      const offset = x + width / 2 - scrollViewWidth / 2;
      scrollViewRef.current.scrollTo({x: offset, animated: true});
    }
  }, [selectedOption, itemLayouts, scrollViewWidth]);

  return (
    <View style={[styles.row, styles.filter]}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onLayout={e => setScrollViewWidth(e.nativeEvent.layout.width)}>
        {options.map((option, index) => (
          <Pressable
            key={index}
            onPress={() => onPress(option)}
            style={[
              styles.filterOptions,
              option === selectedOption && styles.selectedOptions,
            ]}
            onLayout={e => {
              const layout = e.nativeEvent.layout;
              setItemLayouts(prev => ({...prev, [option]: layout}));
            }}>
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
  scrollView: {
    flexGrow: 0,
  },
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
