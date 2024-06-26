import {StyleSheet, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {Loader, Modal, Text} from '..';
import useTheme from '../../theme/hooks/useTheme';
import {LOCALES} from '../../localization/constants';
import {OverlayLoaderTypes} from '../../types/components/OverlayLoader';

const OverlayLoader = ({isModalVisible = false}: OverlayLoaderTypes) => {
  const {FONTS, COLORS} = useTheme();
  const {t} = useTranslation();
  return (
    <Modal isModalVisible={isModalVisible}>
      <View style={styles.container}>
        <View
          style={[
            styles.loaderContainer,
            {
              backgroundColor:
                COLORS.COMPONENTS.OVERLAY_LOADER.BACKGROUND_COLOR,
            },
          ]}>
          <Loader
            size={'large'}
            color={COLORS.COMPONENTS.OVERLAY_LOADER.LOADER_COLOR}
          />
          <Text
            style={[
              styles.text,
              {
                fontFamily: FONTS.MEDIUM,
                color: COLORS.COMPONENTS.OVERLAY_LOADER.TEXT_COLOR,
              },
            ]}>
            {t(LOCALES.COMMON.LBL_LOADING)} ...
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default OverlayLoader;

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loaderContainer: {
    height: 120,
    width: 120,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 10,
    fontSize: 14,
  },
});
