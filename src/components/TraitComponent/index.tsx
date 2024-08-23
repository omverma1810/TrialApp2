import React, { useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { DropdownArrow } from '../../assets/icons/svgs';

const TraitComponent = ({ projectData, selectedFields } : any) => {
  const [dropdownHeights] = useState(
    Array.from({ length: projectData.length }, () => new Animated.Value(0))
  );
  const [isOpen, setIsOpen] = useState(
    Array.from({ length: projectData.length }, () => false)
  );

  const toggleDropdown = (index : number) => {
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
    <ScrollView>
    {Object.keys(selectedFields).map(
      field =>
        selectedFields[field] && (
          <View style={styles.projectContainer}>
          {projectData.map((trait:any, index:number) => {    
            return (
              <View key={index} style={styles.borderBottom}>
                <Pressable onPress={() => toggleDropdown(index)}>
                  <View style={styles.row}>
                    <View style={styles.column}>
                      <Text style={styles.title}>{trait.traitName}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleDropdown(index)}>
                      <DropdownArrow />
                    </TouchableOpacity>
                  </View>
                </Pressable>
                <ScrollView>
                  <Animated.View
                    style={[styles.dropdown, { height: dropdownHeights[index] }]}>
                    {trait.locationData.map((location:any, locationIndex:number) => (
                      <View key={locationIndex} style={styles.plotContainer}>
                        <View style={styles.plotContainer}>
                          {Array.isArray(location.plotData) &&
                            location.plotData.map((plot : any, plotIndex : number) => (
                              <View key={plotIndex} style={styles.plotContainer}>
                                <View style={styles.plot}>
                                  <Text style={styles.plotText}>
                                    Plot {plot.plotNumber}: {plot.value}
                                  </Text>
                                  {/* <Text>
                                    {trait.traitUom}
                                  </Text> */}
                                </View>
                              </View>
                            ))}
                        </View>
                      </View>
                    ))}
                  </Animated.View>
                </ScrollView>
              </View>
            );
          })}
        </View>
        ),
    )}
  </ScrollView>
  );
};


const styles = StyleSheet.create({
  projectContainer: {
    padding: 10,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  column: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdown: {
    overflow: 'hidden',
  },
  locationContainer: {
    marginVertical: 5,
  },
  plotContainer: {
    marginVertical: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
  },
  plot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  plotText: {
    fontSize: 16,
  },
  plotValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TraitComponent;
