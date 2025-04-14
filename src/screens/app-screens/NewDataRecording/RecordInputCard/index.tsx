import React from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';

type PreDefinedItem = {
  name: string;
  maximumValue?: number;
  minimumValue?: number;
};

type RecordedInputCardProps = {
  traitName: string;
  dataType: 'float' | 'fixed' | 'str' | 'int' | 'date';
  value: any;
  onValueChange: (val: any) => void;
  preDefiendList?: PreDefinedItem[];
  plotData: any;
  traitType: string;
  onSave: () => void;
  options?: string[]; // Added the missing 'options' property
};

const RecordedInputCard: React.FC<RecordedInputCardProps> = ({
  traitName,
  dataType,
  value,
  onValueChange,
  preDefiendList = [],
}) => {
  const renderFixedTiles = () => {
    return (
      <FlatList
        data={preDefiendList}
        keyExtractor={(item, index) => item.name + index}
        numColumns={3}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        renderItem={({item}) => {
          const isSelected = value === item.name;
          return (
            <TouchableOpacity
              style={[styles.tile, isSelected && styles.selectedTile]}
              onPress={() => onValueChange(item.name)}>
              <Text
                style={[styles.tileText, isSelected && styles.selectedText]}>
                {item.name || 'N/A'}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  const renderByType = () => {
    switch (dataType) {
      case 'fixed':
        return renderFixedTiles();
      // You can add more types below with appropriate inputs
      case 'float':
      case 'int':
      case 'str':
      case 'date':
        return (
          <Text style={styles.placeholder}>
            [Input for {dataType} will go here]
          </Text>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{traitName}</Text>
      {renderByType()}
    </View>
  );
};

export default RecordedInputCard;

const styles = StyleSheet.create({
  container: {
    margin: 10,
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tile: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  selectedTile: {
    backgroundColor: '#0057FF',
  },
  tileText: {
    color: '#333',
    fontSize: 14,
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  placeholder: {
    fontStyle: 'italic',
    color: '#aaa',
    paddingVertical: 10,
  },
});
