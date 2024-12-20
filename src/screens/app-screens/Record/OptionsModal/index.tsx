import {Pressable, Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {BottomSheetModal} from '../../../../components';
import styles from '../RecordStyles';
import {LOCALES} from '../../../../localization/constants';

const OptionsModal = ({item, onSubmit, bottomSheetModalRef}: any) => {
  const {t} = useTranslation();
  const data = JSON.parse(item?.preDefiendList) || [];
  return (
    <BottomSheetModal bottomSheetModalRef={bottomSheetModalRef}>
      <View style={styles.traitsModal}>
        <View style={[styles.traitsModalHeader, styles.row]}>
          <Text style={styles.traitsModalHeaderTitle}>{item?.traitName}</Text>
        </View>
        {data.map((item: any, index: number) => (
          <Pressable
            style={styles.optionsContainer}
            key={index}
            onPress={() => {
              onSubmit(item?.name);
              bottomSheetModalRef?.current?.close();
            }}>
            <Text style={styles.optionsTitle}>{item?.name}</Text>
            <Text style={styles.optionsLabel}>
              Min: {item?.minimumValue}
              {'  '}Max: {item?.maximumValue}
            </Text>
          </Pressable>
        ))}
        {data.length === 0 && (
          <View style={styles.noDataView}>
            <Text style={styles.noDataText}>
              {t(LOCALES.COMMON.LBL_NO_DATA_FOUND)}
            </Text>
          </View>
        )}
      </View>
    </BottomSheetModal>
  );
};

export default OptionsModal;
