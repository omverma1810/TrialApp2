import {FlatList, Pressable, Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {styles} from '../styles';
import {LOCALES} from '../../../../localization/constants';
import {CardArrowDown, Search} from '../../../../assets/icons/svgs';
import {useRecord} from '../RecordContext';
import {useRecordApi} from '../RecordApiContext';
import {Loader} from '../../../../components';

const SelectPlot = () => {
  const {t} = useTranslation();
  const {isSelectPlotVisible, selectedPlot, handlePlotSelect, plotList} =
    useRecord();
  const {isPlotListLoading} = useRecordApi();
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
        <Text style={styles.plotName}>{item?.id}</Text>
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
          <View style={[styles.selectExperimentTextContainer, styles.row]}>
            <Text style={styles.selectExperimentText}>
              {t(LOCALES.EXPERIMENT.LBL_SELECT_PLOT)}
            </Text>
            <Search />
          </View>
          {plotList.map(renderPlot)}
        </View>
      ) : (
        <Pressable
          style={[styles.experimentInfoContainer, styles.row]}
          onPress={() => handlePlotSelect(null)}>
          <View style={styles.experimentHeaderTitleContainer}>
            <Text style={styles.experimentHeaderTitle}>
              {t(LOCALES.EXPERIMENT.LBL_PLOT)}
            </Text>
            <Text style={styles.experimentName}>{selectedPlot?.id}</Text>
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
