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
      const offset = x + width / 2 - scrollViewWidth / 2;
      scrollViewRef.current.scrollTo({x: offset, animated: true});
    }
  }, [selectedOption, itemLayouts, scrollViewWidth]);

  if (options.length === 0) return null;

  return (
    <View style={styles.filter}>
      <View style={styles.row}>
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
                styles.filterChip,
                option === selectedOption && styles.selectedChip,
              ]}
              onLayout={e => {
                const layout = e.nativeEvent.layout;
                setItemLayouts(prev => ({...prev, [option]: layout}));
              }}>
              <Text
                style={[
                  styles.chipText,
                  option === selectedOption && styles.selectedChipText,
                ]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default React.memo(Filter);

const styles = StyleSheet.create({
  filter: {
    marginVertical: -2,
  },
  filterTitle: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
    color: '#949494',
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  scrollView: {
    flexGrow: 0,
  },
  filterChip: {
    paddingVertical: 8, // Reduced height
    paddingHorizontal: 24, // Slimmer width
    marginHorizontal: 6, // Slightly tighter spacing
    backgroundColor: '#E8F0FB',
    borderRadius: 16, // Rounded chip shape
  },
  selectedChip: {
    backgroundColor: '#0E3C74',
  },
  chipText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 14, // Slightly increased font for clarity
    color: '#0E3C74',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
