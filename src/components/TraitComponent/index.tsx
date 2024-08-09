import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {FieldSybol1} from '../../assets/icons/svgs';

type selectedFieldsType = {
  [key: string]: boolean;
};



const TraitSection = ({selectedFields, projectData}: {selectedFields: selectedFieldsType, projectData: any}) => {
  console.log('plotDataaaaa',projectData)
  const [units,setUnits] = useState<string>("")
  useEffect(()=>{
    setUnits(projectData[0].traitUom)
  },[])
  return (
    <ScrollView>
      {Object.keys(selectedFields).map(
        field =>
          selectedFields[field] && (
            <ProjectContainer
              key={field}
              title={field}
              data={projectData && projectData[0].locationData[0].plotData}       
              units={units}
            />
          ),
      )}
    </ScrollView>
  );
};

const ProjectContainer = ({title, data,units} : {title : String, data: any,units:string }) => {
  console.log("data" ,data)
  return (
    <View style={styles.paddingVertical}>
      <View
        style={[styles.projectContainer, styles.projectContainerBackground]}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Field {title}   {data ? data.length : 0} Plots</Text>
          <FieldSybol1 />
        </View>
        <View style={styles.contentContainer}>
          {data &&
            data.map((item : any, index : number) => (
              <ItemComponent
                key={index}
                value={`${item.value} ${units}`}
                title={`Plot : ${item.plotNumber}`}
              />
            ))}
        </View>
      </View>
    </View>
  );
};

const ItemComponent = ({title,value}: any) => {
  return (
    <View style={styles.itemContainer}>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text>
          {value}
        </Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  projectContainer: {
    borderRadius: 6,
    width: Dimensions.get('window').width - 40,
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
  contentContainer: {
    borderRadius: 6,
    overflow: 'hidden',
    paddingHorizontal: 1,
    marginBottom: 1,
    gap: 1,
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
  dropdown: {
    overflow: 'hidden',
  },
  entryContainer: {
    gap: 16,
    paddingVertical: 15,
  },
  projectContainer1: {
    borderRadius: 6,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#F7F7F7',
  },
  padding: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  recordedTraitsText: {
    color: '#161616',
    fontSize: 14,
    fontWeight: '500',
  },
  borderRadiusOverflow: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  entryRow: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryColumn: {
    gap: 5,
  },
  entryLabel: {
    color: '#636363',
    fontWeight: '400',
    fontSize: 12,
  },
  entryValue: {
    color: '#161616',
    fontWeight: '500',
    fontSize: 14,
  },
  editButton: {
    flexDirection: 'row',
  },
  editButtonText: {
    color: '#1A6DD2',
    fontSize: 14,
    fontWeight: '500',
  },
  notesContainer: {
    gap: 10,
  },
  notesTitle: {
    color: 'black',
  },
  notesContent: {
    backgroundColor: '#FDF8EE',
    padding: 16,
    borderRadius: 8,
    gap: 5,
  },
  notesText: {
    color: '#161616',
    fontSize: 14,
    fontWeight: '400',
  },
  notesDate: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '400',
  },
  unrecordedTraitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  unrecordedTraitsText: {
    color: '#161616',
    fontSize: 14,
    fontWeight: '500',
  },
  viewButtonText: {
    color: '#1A6DD2',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default TraitSection;
