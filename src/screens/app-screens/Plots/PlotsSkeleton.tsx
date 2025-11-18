import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';

import SkeletonBlock, {
  resolveSkeletonPalette,
} from '../../../components/Skeleton';
import {useAppSelector} from '../../../store';

const PlotsSkeleton: React.FC = () => {
  const {theme} = useAppSelector(state => state.theme);

  const palette = useMemo(
    () =>
      resolveSkeletonPalette(theme?.COLORS?.APP?.BACKGROUND_COLOR ?? '#FFFFFF'),
    [theme?.COLORS?.APP?.BACKGROUND_COLOR],
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <SkeletonBlock colors={palette} height={22} width={190} />
        <SkeletonBlock colors={palette} height={18} width={140} />
      </View>

      <View style={[styles.section, styles.row]}>
        {Array.from({length: 3}).map((_, index) => (
          <SkeletonBlock
            key={`chip-${index}`}
            colors={palette}
            height={28}
            width={90}
            borderRadius={16}
          />
        ))}
      </View>

      <View style={[styles.section, styles.row]}>
        {Array.from({length: 3}).map((_, index) => (
          <SkeletonBlock
            key={`tab-${index}`}
            colors={palette}
            height={36}
            width={96}
            borderRadius={18}
          />
        ))}
      </View>

      <View style={styles.section}>
        <SkeletonBlock colors={palette} height={48} borderRadius={12} />
        <SkeletonBlock colors={palette} height={120} borderRadius={12} />
      </View>

      <View style={styles.list}>
        {Array.from({length: 4}).map((_, index) => (
          <View key={`plot-row-${index}`} style={styles.listRow}>
            <View style={styles.listRowHeader}>
              <SkeletonBlock colors={palette} height={18} width={120} />
              <SkeletonBlock colors={palette} height={18} width={60} />
            </View>
            <SkeletonBlock colors={palette} height={60} borderRadius={12} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 20,
  },
  section: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  list: {
    gap: 16,
  },
  listRow: {
    gap: 12,
  },
  listRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default PlotsSkeleton;
