import React from 'react';
import {View, Text, Pressable} from 'react-native';
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
  return (
    <View
      style={[
        styles.navigatorContainer,
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      ]}>
      <Pressable
        onPress={onPrev}
        style={{
          padding: 12,
          marginLeft: 5,
          borderRadius: 24,
        }}
        hitSlop={10}>
        <PlotArrowLeft width={32} height={32} />
      </Pressable>

      <Pressable onPress={onPressNavigator} style={styles.details}>
        <Text style={styles.rowColText}>row: {row}</Text>
        <Text style={styles.rowColText}>col: {col}</Text>
        <Text style={styles.plotCode}>{plotCode}</Text>
      </Pressable>

      <Pressable
        onPress={onNext}
        style={{
          padding: 12,
          marginRight: -25,
          borderRadius: 24,
        }}
        hitSlop={10}>
        <PlotArrowRight width={32} height={32} />
      </Pressable>
    </View>
  );
};

export default PlotNavigator;
