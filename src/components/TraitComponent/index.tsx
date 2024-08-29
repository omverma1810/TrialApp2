import React, {useEffect, useState} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {DropdownArrow, FieldSybol1} from '../../assets/icons/svgs';
import {FONTS} from '../../theme/fonts';

const TraitComponent = ({projectData, selectedFields}: any) => { 
  // console.log('i'm batman',projectData)
  const [dropdownHeights, setDropdownHeights] = useState(
    Array.from({length: projectData.length}, () => new Animated.Value(0)),
  );
  const [isOpen, setIsOpen] = useState(
    Array.from({length: projectData.length}, () => false),
  );
  const [height, setHeight] = useState<any>(null);

  useEffect(() => {
    let noOfPlots = 0;
    
    projectData.forEach((trait: any) => {
      if (Array.isArray(trait.locationData)) {
        trait.locationData.forEach((location: any) => {
          if (Array.isArray(location.plotData)) {
            noOfPlots += location.plotData.length;
          }
        });
      }
    });
   
    setHeight(noOfPlots);
  }, [projectData]);
  
  const toggleDropdown = (index: number) => {
    const newIsOpen = [...isOpen];
    newIsOpen[index] = !newIsOpen[index];
    const dropdownHeight = newIsOpen[index] ? height*15 : 0;

    Animated.timing(dropdownHeights[index], {
      toValue: dropdownHeight,
      duration: 800,
      useNativeDriver: false,
    }).start();

    setIsOpen(newIsOpen);
  };

  return (
    <ScrollView contentContainerStyle={styles.projectContainer}>
      {projectData.map((trait: any, traitIndex: number) => (
        <View
          key={traitIndex}
          style={[styles.projectContainer]}>
          {/* Trait Title and Dropdown Toggle */}
          <Pressable onPress={() => toggleDropdown(traitIndex)}>
            <View style={styles.row}>
              <Text style={styles.title}>{trait.traitName}</Text>
              <TouchableOpacity onPress={() => toggleDropdown(traitIndex)}>
                <DropdownArrow />
              </TouchableOpacity>
            </View>
          </Pressable>

          <Animated.View
            style={[
              styles.dropdown,
              styles.borderBottom,
              {height: dropdownHeights[traitIndex]},
            ]}>
            {trait.locationData.map(
              (location: any, locationIndex: number) =>
                selectedFields[location.trialLocationId] && (
                  <View key={locationIndex} style={styles.locationContainer}>
                    <View style={styles.projectContainerBackground}>
                      <View style={styles.header}>
                        <Text style={styles.headerText}>
                          Field {location.trialLocationId}
                        </Text>
                        <FieldSybol1 />
                      </View>
                    </View>
                    <View style={styles.plotWrapper}>
                      {location.plotData.map((plot: any, plotIndex: number) => (
                        <View key={plotIndex} style={styles.plotContainer}>
                          <Text style={styles.plotText}>
                            Plot {plot.plotNumber}
                          </Text>
                          <Text>
                            {plot.value || 'N/A'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ),
            )}
          </Animated.View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  projectContainer: {
    padding: 10,
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
    fontSize: 15,
    fontFamily: FONTS.MEDIUM,
    color: '#161616',
  },
  dropdown: {
    overflow: 'hidden',
  },
  locationContainer: {
    marginVertical: 8,
  },
  borderBottom: {
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },

  locationName: {
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
    marginBottom: 5,
  },
  plotWrapper: {
    paddingLeft: 10,
  },
  plotContainer: {
    display:'flex',
    marginVertical: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    justifyContent:'space-between',
    flexDirection: 'row',
  },
  plot: {
    justifyContent: 'space-between',
  },
  plotText: {
    fontSize: 16,
    color:'#161616'
  },
  plotValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  projectContainerBackground: {
    backgroundColor: '#F7F7F7',
  },
  paddingVertical: {
    paddingVertical: 15,
  },
  header: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    gap: 10,
  },
  headerText: {
    color: '#161616',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TraitComponent;
