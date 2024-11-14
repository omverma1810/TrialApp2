import {Pressable, Text, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {styles} from '../styles';
import {LOCALES} from '../../../../localization/constants';
import {CardArrowDown, Close, Search} from '../../../../assets/icons/svgs';
import {useRecord} from '../RecordContext';
import {useRecordApi} from '../RecordApiContext';
import {Input, Loader} from '../../../../components';

const SelectPlot = () => {
  const {t} = useTranslation();
  const {isSelectPlotVisible, selectedPlot, handlePlotSelect, plotList} =
    useRecord();
  const {isPlotListLoading} = useRecordApi();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const onRightIconClick = () => {
    setIsSearchEnabled(false);
    setSearchQuery('');
  };

  const filteredPlotList = useMemo(() => {
    if (searchQuery === '') {
      return plotList;
    }
    return plotList.filter(plot =>
      plot.plotNumber
        .toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
  }, [plotList, searchQuery]);

  const rowColInfo = [
    // {
    //   id: 0,
    //   name: t(LOCALES.EXPERIMENT.LBL_ROW),
    //   key: 'row',
    // },
    // {
    //   id: 1,
    //   name: t(LOCALES.EXPERIMENT.LBL_COL),
    //   key: 'column',
    // },
    {
      id: 2,
      name: t(LOCALES.EXPERIMENT.LBL_ACC_ID),
      key: 'accessionId',
    },
  ];
  const renderPlot = (item: any) => {
    return (
      <Pressable
        key={item.id}
        style={styles.plotCardContainer}
        onPress={() => handlePlotSelect(item)}>
        <Text style={styles.plotName}>{item?.plotNumber}</Text>
        <View style={styles.plotInfoContainer}>
          {rowColInfo.map(data => (
            <View style={styles.plotKeyValueContainer} key={data.id}>
              <Text style={styles.plotInfoKey}>{data.name}</Text>
              <Text style={styles.plotInfoValue}>{item[data.key]}</Text>
            </View>
          ))}
        </View>
      </Pressable>
    );
  };
  if (!isSelectPlotVisible) return null;

  if (isPlotListLoading) {
    return (
      <View style={styles.loader}>
        <Loader />
      </View>
    );
  }

  return (
    <>
      {!selectedPlot ? (
        <View style={styles.selectExperimentContainer}>
          {isSearchEnabled ? (
            <Input
              placeholder={t(LOCALES.EXPERIMENT.LBL_SEARCH_PLOT)}
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
                {t(LOCALES.EXPERIMENT.LBL_SELECT_PLOT)}
              </Text>
              <Pressable onPress={() => setIsSearchEnabled(!isSearchEnabled)}>
                <Search />
              </Pressable>
            </View>
          )}
          {filteredPlotList.map(renderPlot)}
        </View>
      ) : (
        <Pressable
          style={[styles.experimentInfoContainer, styles.row]}
          onPress={() => handlePlotSelect(null)}>
          <View style={styles.experimentHeaderTitleContainer}>
            <Text style={styles.experimentHeaderTitle}>
              {t(LOCALES.EXPERIMENT.LBL_PLOT)}
            </Text>
            <Text style={styles.experimentName}>
              {selectedPlot?.plotNumber}
            </Text>
            <View style={styles.plotInfoContainer}>
              {rowColInfo.map(data => (
                <View style={styles.plotKeyValueContainer} key={data.id}>
                  <Text style={styles.plotInfoKey}>{data.name}</Text>
                  <Text style={styles.plotInfoValue}>
                    {selectedPlot[data.key]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <CardArrowDown />
        </Pressable>
      )}
    </>
  );
};

export default SelectPlot;
