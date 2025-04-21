import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';

interface RecordedInputCardProps {
  traitName: string;
  uom: string;
  value?: string;
  onValueChange?: (value: string) => void;
  keyboardType?: 'default' | 'numeric';
}

const RecordedInputCard = ({
  traitName,
  uom,
  value = '',
  onValueChange,
}: RecordedInputCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.traitName}>{traitName}</Text>
          <Text style={styles.uom}>{uom}</Text>
        </View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onValueChange}
          keyboardType="numeric"
          placeholder="Enter value"
          placeholderTextColor="#A0A0A0"
        />
      </View>
      {/* <Text style={styles.helperText}>
        Use values separated by * to get the average.
      </Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 12,
  },
  traitName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  uom: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#F8F8F8',
  },
  helperText: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
});

export default RecordedInputCard;
