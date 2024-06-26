import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import {DropdownArrow, FieldSybol1} from '../../assets/icons/svgs';
import {ScrollView} from 'react-native-gesture-handler';

const TraitComponent = ({titles, selectedFieldsData}) => {
  const [dropdownHeights] = useState(
    Array.from({length: titles.length}, () => new Animated.Value(0)),
  );
  const [isOpen, setIsOpen] = useState(
    Array.from({length: titles.length}, () => false),
  );

  const toggleDropdown = index => {
    const newIsOpen = [...isOpen];
    newIsOpen[index] = !newIsOpen[index];

    Animated.timing(dropdownHeights[index], {
      toValue: newIsOpen[index] ? 375 : 0,
      duration: 800,
      useNativeDriver: false,
    }).start();

    setIsOpen(newIsOpen);
  };

  return (
    <View style={styles.projectContainer}>
      {titles.map((title, index) => (
        <View key={index} style={styles.borderBottom}>
          <Pressable onPress={() => toggleDropdown(index)}>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.title}>{title}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleDropdown(index)}>
              <DropdownArrow />
            </TouchableOpacity>
          </View>
          </Pressable>
          <ScrollView>
            <Animated.View
              style={[styles.dropdown, {height: dropdownHeights[index]}]}>
              {selectedFieldsData.map((fieldData, fieldIndex) => (
                <View key={fieldIndex} style={styles.fieldContainer}>
                  <View style={styles.fieldInnerContainer}>
                    <View style={styles.fieldHeader}>
                      <Text style={styles.fieldName}>
                        {fieldData.fieldName}
                      </Text>
                      <FieldSybol1 />
                    </View>
                    {fieldData.plots.map((plot, plotIndex) => (
                      <View key={plotIndex} style={styles.plotContainer}>
                        <View style={styles.plot}>
                          <Text style={styles.plotText}>{plot.plot}</Text>
                          <Text style={styles.plotUnit}>Cm</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </Animated.View>
          </ScrollView>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  projectContainer: {
    borderRadius: 8,
    marginBottom: 20,
    width: Dimensions.get('window').width - 40,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#F7F7F7',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderColor: '#F7F7F7',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  column: {
    gap: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '400',
    color: '#161616',
  },
  dropdown: {
    overflow: 'hidden',
    gap: 10,
  },
  fieldContainer: {
    borderRadius: 6,
    width: Dimensions.get('window').width - 80,
    alignSelf: 'center',
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#F7F7F7',
  },
  fieldInnerContainer: {
    borderRadius: 6,
  },
  fieldHeader: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    gap: 5,
  },
  fieldName: {
    color: '#161616',
    fontSize: 14,
    fontWeight: '500',
  },
  plotContainer: {
    overflow: 'hidden',
  },
  plot: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plotText: {
    color: '#161616',
    fontWeight: '400',
    fontSize: 14,
  },
  plotUnit: {
    color: '#161616',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TraitComponent;
