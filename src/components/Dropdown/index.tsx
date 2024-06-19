import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { DropdownArrow } from '../../assets/icons/svgs';
import { useNavigation } from '@react-navigation/native';

const projectData = {
  Maize: [
    { id: 1, title: 'GE-Male Line (R) development' },
    { id: 2, title: 'GE-Female Line (R) development' },
    { id: 3, title: 'GE-Male Line (L) development' },
  ],
  Rice: [
    { id: 1, title: 'Rice Project 1' },
    { id: 2, title: 'Rice Project 2' },
    { id: 3, title: 'Rice Project 3' },
  ],
};

const App = () => {
  return (
    <ScrollView style={styles.container}>
      {Object.keys(projectData).map(project => (
        <ProjectContainer key={project} title={project} data={projectData[project]} />
      ))}
    </ScrollView>
  );
};

const ProjectContainer = ({ title, data }) => {
  const getBackgroundColor = (title) => {
    switch (title) {
      case 'Rice':
        return '#FDF8EE';
      case 'Maize':
        return '#EAF4E7';
      default:
        return '#ADD8E6'; 
    }
  };

  return (
    <View style={[styles.projectContainer, { backgroundColor: getBackgroundColor(title) }]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
      </View>
      <View style={styles.contentContainer}>
        {data.map(item => (
          <ItemComponent key={item.id} title={item.title} />
        ))}
      </View>
    </View>
  );
};

const ItemComponent = ({ title }) => {
  const navigation = useNavigation();

  const goToExpScreen1 = () => {
    navigation.navigate('Expscreen1');
  };
  const [dropdownHeight] = useState(new Animated.Value(0));
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    Animated.timing(dropdownHeight, {
      toValue: isOpen ? 0 : 560,
      duration: 800,
      useNativeDriver: false,
    }).start();
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.itemContainer}>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.title}>{title}</Text>
          {!isOpen && (
            <TouchableOpacity onPress={toggleDropdown}>
              <Text style={styles.viewFields}>View Fields</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={toggleDropdown}>
          <DropdownArrow/>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
        <View style={[styles.gap , {marginTop:15}]}>
          <View style={[styles.Experiment]}>
            <Text style={[styles.ExpText]}>Experiments</Text>
            <Text style={[styles.TransText]}>Transcation Id</Text>
          </View>
          <View style={[styles.ExpBox]}>
            <View style={[styles.Box]}>
              <Text style={[styles.ExpText]}>No of Entries</Text>
              <Text style={[styles.TransText]}>118</Text>
            </View>
            <View style={[styles.Box]}>
              <Text style={[styles.ExpText]}>Field Design</Text>
              <Text style={[styles.TransText]}>No of Entries</Text>
            </View>
          </View>
          <View style={[styles.ExpBox]}>
            <View style={[styles.Box]}>
              <Text style={[styles.ExpText]}>Season</Text>
              <Text style={[styles.TransText]}>118</Text>
            </View>
            <View style={[styles.Box]}>
              <Text style={[styles.ExpText]}>Entries</Text>
              <Text style={[styles.TransText]}>32</Text>
            </View>
          </View>
          <View style={[styles.ExpBox]}>
            <View style={[styles.Box]}>
              <Text style={[styles.ExpText]}>Plots</Text>
              <Text style={[styles.TransText]}>118</Text>
            </View>
            <View style={[styles.Box]}>
              <Text style={[styles.ExpText]}>Replication</Text>
              <Text style={[styles.TransText]}>3</Text>
            </View>
          </View>
          <View style={[styles.ExpBox]}>
            <View style={[styles.Box]}>
              <Text style={[styles.ExpText]}>Randomisation</Text>
              <Text style={[styles.TransText]}>Yes</Text>
            </View>
            <View style={[styles.Box]}>
              <Text style={[styles.ExpText]}>Location</Text>
              <Text style={[styles.TransText]}>2</Text>
            </View>
          </View>
          <View style={[styles.ExpBox]}>
            <View style={[styles.Box]}>
              <Text style={[styles.ExpText]}>Field</Text>
              <Text style={[styles.TransText]}>3</Text>
            </View>
            <View style={[styles.Box]}>
              <Text style={[styles.ExpText]}>No of traits</Text>
              <View style={[styles.ExpTB]}>
                <Text style={[styles.TransText]}>80</Text>
                <TouchableOpacity style={[styles.Expbutton]}>
                  <Text style={[styles.btntext]}>View</Text>
                </TouchableOpacity>

              </View>
            </View>
          </View>
          <TouchableOpacity onPress={goToExpScreen1} style={[styles.Expbutton , {marginTop:5}]}>
            <Text style={[styles.btntext]}>View all Fields</Text>
          </TouchableOpacity>

        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  projectContainer: {
    borderRadius: 6,
    marginBottom: 20,
    width: Dimensions.get('window').width - 40,
    alignSelf: 'center',
  },
  header: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  headerText: {
    color: '#161616',
    fontSize: 14,
    fontWeight: '500',
  },
  contentContainer: {
    borderRadius: 6,
    overflow: 'hidden',
    paddingHorizontal:1,
    marginBottom:1,
    gap:1
  },
  itemContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '400',
    color: '#161616',
  },
  viewFields: {
    color: '#1A6DD2',
    fontWeight: '400',
  },
  dropdown: {
    overflow: 'hidden',
  },
  gap:{
    gap:10
  },
  Experiment:{
    width:'100%', 
    borderWidth:1,
    borderColor:'#E8F0FB',
    borderRadius:8,
    padding:16,
    gap:4,

  },
  ExpText:{
    color:'#636363',
    fontSize:12,
    fontWeight:'400',

  },
  TransText:{
    color:'#161616',
    fontSize:15,
    fontWeight:'500',
  }, 
  Box:{
    borderWidth:1,
    borderColor:'#E8F0FB',
    borderRadius:8,
    padding:16,
    minWidth:150,

  },
  ExpBox:{
    width:'100%',
    justifyContent:'space-between',
    flexDirection:'row',
  },
  ExpTB:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',

  },
  Expbutton:{
    paddingHorizontal:10,
    paddingVertical:6,
    borderWidth:1,
    borderRadius:6,
    borderColor:'#1A6DD2',
    alignItems:'center'
  },
  btntext:{
    color:'#1A6DD2'
  }
});

export default App;
