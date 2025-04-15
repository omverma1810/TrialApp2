import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
//import Icon from 'react-native-vector-icons/MaterialIcons'; // make sure to install this if not present
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
  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Select an Option:</Text> */}
      <View style={styles.grid}>
        {options.map((option, index) => {
          const isSelected = selected === option;
          return (
            <Pressable
              key={index}
              style={[
                styles.option,
                {
                  borderColor: isSelected ? '#1976D2' : '#BDBDBD',
                  backgroundColor: '#fff',
                },
              ]}
              onPress={() => onSelect(option)}>
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isSelected ? '#1976D2' : '#000',
                  },
                ]}>
                {option}
              </Text>
              {/* {isSelected && (
                // <Icon
                //   name="check"
                //   size={18}
                //   color="#1976D2"
                //   style={styles.checkIcon}
                // />
              )} */}
            </Pressable>
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
  title: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  option: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
  },
  // checkIcon: {
  //   marginLeft: 8,
  // },
});

export default FixedOptionsGrid;
