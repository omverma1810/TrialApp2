import React, {useEffect, useRef, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  LayoutChangeEvent,
} from 'react-native';
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
  // Reference for the horizontal ScrollView.
  const scrollViewRef = useRef<ScrollView>(null);
  // Record the layout (x offset and width) of each option.
  const optionLayouts = useRef<{[key: string]: {x: number; width: number}}>({});
  // Store the width of the ScrollView container.
  const [scrollViewWidth, setScrollViewWidth] = useState(0);

  // Trigger scrolling to the selected option whenever it changes.
  useEffect(() => {
    if (
      !selectedOption ||
      !scrollViewRef.current ||
      !optionLayouts.current[selectedOption]
    )
      return;

    const {x, width} = optionLayouts.current[selectedOption];
    // Calculate target scroll offset; here we try to center the selected item.
    const targetScrollX = Math.max(x - scrollViewWidth / 2 + width / 2, 0);
    scrollViewRef.current.scrollTo({x: targetScrollX, animated: true});
  }, [selectedOption, scrollViewWidth]);

  // Handler to capture layout info for each option.
  const handleOptionLayout = (option: string, event: LayoutChangeEvent) => {
    const {x, width} = event.nativeEvent.layout;
    optionLayouts.current[option] = {x, width};
  };

  // Handler to capture the overall width of the ScrollView.
  const handleScrollViewLayout = (event: LayoutChangeEvent) => {
    setScrollViewWidth(event.nativeEvent.layout.width);
  };

  if (options.length === 0) return null;

  return (
    <View style={[styles.row, styles.filter]}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        onLayout={handleScrollViewLayout}>
        {options.map((option, index) => (
          <Pressable
            onPress={() => onPress(option)}
            style={[
              styles.filterOptions,
              option === selectedOption && styles.selectedOptions,
            ]}
            key={index}
            onLayout={event => handleOptionLayout(option, event)}>
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
