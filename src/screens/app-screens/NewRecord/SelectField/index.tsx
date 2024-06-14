import {FlatList, Pressable, Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {styles} from '../styles';
import {LOCALES} from '../../../../localization/constants';
import {
  CardArrowDown,
  LocationPin,
  Search,
} from '../../../../assets/icons/svgs';

const SelectField = ({selectedField, handleFieldSelect}: any) => {
  const {t} = useTranslation();
  const fieldList = [
    {
      id: 0,
      field_name: 'Field 101',
      location: 'Medchal, Hyderabad',
    },
    {
      id: 1,
      field_name: 'Field 102',
      location: 'Medchal, Hyderabad',
    },
    {
      id: 2,
      field_name: 'Field 103',
      location: 'Medchal, Hyderabad',
    },
  ];
  const renderField = (item: any) => {
    return (
      <Pressable
        key={item.id}
        style={styles.locationContainer}
        onPress={() => handleFieldSelect(item)}>
        <Text style={styles.fieldName}>{item.field_name}</Text>
        <View style={styles.locationNameContainer}>
          <LocationPin />
          <Text style={styles.locationName}>{item.location}</Text>
        </View>
      </Pressable>
    );
  };
  return (
    <>
      {!selectedField ? (
        <View style={styles.selectExperimentContainer}>
          <View style={[styles.selectExperimentTextContainer, styles.row]}>
            <Text style={styles.selectExperimentText}>
              {t(LOCALES.EXPERIMENT.LBL_SELECT_FIELD)}
            </Text>
            <Search />
          </View>
          {fieldList.map(renderField)}
        </View>
      ) : (
        <Pressable
          style={[styles.experimentInfoContainer, styles.row]}
          onPress={() => handleFieldSelect(null)}>
          <View style={styles.experimentHeaderTitleContainer}>
            <Text style={styles.experimentHeaderTitle}>
              {t(LOCALES.EXPERIMENT.LBL_FIELD)}
            </Text>
            <Text style={styles.experimentName}>
              {selectedField?.field_name}
            </Text>
            <View style={styles.locationNameContainer}>
              <LocationPin />
              <Text style={styles.locationName}>{selectedField?.location}</Text>
            </View>
          </View>
          <CardArrowDown />
        </Pressable>
      )}
    </>
  );
};

export default SelectField;
