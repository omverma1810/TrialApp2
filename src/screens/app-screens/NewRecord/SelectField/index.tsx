import {Pressable, Text, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {styles} from '../styles';
import {LOCALES} from '../../../../localization/constants';
import {
  CardArrowDown,
  Close,
  LocationPin,
  Search,
} from '../../../../assets/icons/svgs';
import {useRecord} from '../RecordContext';
import {Input, Loader} from '../../../../components';
import {useRecordApi} from '../RecordApiContext';

const SelectField = () => {
  const {t} = useTranslation();
  const {isSelectFieldVisible, selectedField, handleFieldSelect, fieldList} =
    useRecord();
  const {isFieldListLoading} = useRecordApi();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const onRightIconClick = () => {
    setIsSearchEnabled(false);
    setSearchQuery('');
  };

  const filteredLocationList = useMemo(() => {
    if (searchQuery === '') {
      return fieldList;
    }
    return fieldList.filter((location: any) =>
      location?.location?.villageName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
  }, [fieldList, searchQuery]);

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
          {isSearchEnabled ? (
            <Input
              placeholder={t(LOCALES.EXPERIMENT.LBL_SEARCH_FIELD)}
              leftIcon={Search}
              customLeftIconStyle={{marginRight: 10}}
              rightIcon={<Close color={'#161616'} />}
              customRightIconStyle={{marginLeft: 10}}
              onRightIconClick={onRightIconClick}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          ) : (
            <View style={[styles.selectExperimentTextContainer, styles.row]}>
              <Text style={styles.selectExperimentText}>
                {t(LOCALES.EXPERIMENT.LBL_SELECT_FIELD)}
              </Text>
              <Pressable onPress={() => setIsSearchEnabled(!isSearchEnabled)}>
                <Search />
              </Pressable>
            </View>
          )}
          {filteredLocationList.map(renderField)}
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
