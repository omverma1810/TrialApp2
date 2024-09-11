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
import {useRecord} from '../RecordContext';
import {Loader} from '../../../../components';
import {useRecordApi} from '../RecordApiContext';

const SelectField = () => {
  const {t} = useTranslation();
  const {isSelectFieldVisible, selectedField, handleFieldSelect, fieldList} =
    useRecord();
  const {isFieldListLoading} = useRecordApi();

  const renderField = (item: any, index: number) => {
    return (
      <Pressable
        key={index}
        style={styles.locationContainer}
        onPress={() => handleFieldSelect(item)}>
        {/* <Text style={styles.fieldName}>{item.field_name}</Text> */}
        <View style={styles.locationNameContainer}>
          <LocationPin />
          <Text style={styles.locationName}>
            {item?.id}-{item?.location?.villageName}
          </Text>
        </View>
      </Pressable>
    );
  };

  if (!isSelectFieldVisible) return null;

  if (isFieldListLoading) {
    return (
      <View style={styles.loader}>
        <Loader />
      </View>
    );
  }

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
            {/* <Text style={styles.experimentName}>
              {selectedField?.field_name}
            </Text> */}
            <View style={styles.locationNameContainer}>
              <LocationPin />
              <Text style={styles.locationName}>
                {selectedField?.id}-{selectedField?.location?.villageName}
              </Text>
            </View>
          </View>
          <CardArrowDown />
        </Pressable>
      )}
    </>
  );
};

export default SelectField;
