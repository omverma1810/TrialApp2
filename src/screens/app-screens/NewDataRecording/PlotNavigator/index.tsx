import React from 'react';
import {View, Text, Pressable, Dimensions} from 'react-native';
import styles from './styles';
import {PlotArrowLeft, PlotArrowRight} from '../../../../assets/icons/svgs';

interface PlotNavigatorProps {
  row: number;
  col: number;
  plotCode: string;
  onPrev: () => void;
  onNext: () => void;
  onPressNavigator: () => void;
}

const PlotNavigator: React.FC<PlotNavigatorProps> = ({
  row,
  col,
  plotCode,
  onPrev,
  onNext,
  onPressNavigator,
}) => {
  const {width: SCREEN_WIDTH} = Dimensions.get('window');
  const isLargeScreen = SCREEN_WIDTH >= 768;
  const isSmallScreen = SCREEN_WIDTH < 360;

  // This is no longer needed for positioning but kept for icon sizing
  const horizontalMargin = isSmallScreen ? 8 : isLargeScreen ? 24 : 16;
  // UPDATED: Increased the icon sizes for all screen types
  const iconSize = isLargeScreen ? 50 : isSmallScreen ? 30 : 40;

  return (
    // REMOVED: Inline style for `justifyContent: 'center'`
    <View
      style={[
        styles.navigatorContainer,
        isLargeScreen && styles.navigatorContainerLarge,
        isSmallScreen && styles.navigatorContainerSmall,
      ]}>
      {/* REMOVED: Inline style for `position`, `left`, and `zIndex` */}
      <Pressable
        onPress={onPrev}
        style={[styles.arrowButton, isSmallScreen && styles.arrowButtonSmall]}
        hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
        <PlotArrowLeft width={43} height={64} />
      </Pressable>

      <Pressable
        onPress={onPressNavigator}
        style={[styles.details, isLargeScreen && styles.detailsLarge]}
        hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
        <Text
          style={[
            styles.plotCode,
            isLargeScreen && styles.plotCodeLarge,
            isSmallScreen && styles.plotCodeSmall,
          ]}>
          {plotCode}
        </Text>

        <View style={styles.rowColContainer}>
          <Text
            style={[
              styles.rowColText,
              isLargeScreen && styles.rowColTextLarge,
              isSmallScreen && styles.rowColTextSmall,
            ]}>
            Row: {row}
          </Text>

          <Text
            style={[
              styles.rowColText,
              styles.colText,
              isLargeScreen && styles.rowColTextLarge,
              isSmallScreen && styles.rowColTextSmall,
            ]}>
            Range: {col}
          </Text>
        </View>
      </Pressable>

      {/* REMOVED: Inline style for `position`, `right`, and `zIndex` */}
      <Pressable
        onPress={onNext}
        style={[styles.arrowButton, isSmallScreen && styles.arrowButtonSmall]}
        hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
        <PlotArrowRight width={43} height={64} />
      </Pressable>
    </View>
  );
};

export default PlotNavigator;
