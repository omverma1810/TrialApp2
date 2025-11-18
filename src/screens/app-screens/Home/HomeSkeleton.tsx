import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';

import {useAppSelector} from '../../../store';
import SkeletonBlock, {
  resolveSkeletonPalette,
} from '../../../components/Skeleton';

const HomeSkeleton: React.FC = () => {
  const {theme} = useAppSelector(state => state.theme);

  const palette = useMemo(
    () =>
      resolveSkeletonPalette(theme?.COLORS?.APP?.BACKGROUND_COLOR ?? '#FFFFFF'),
    [theme?.COLORS?.APP?.BACKGROUND_COLOR],
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <SkeletonBlock
          colors={palette}
          height={20}
          width={180}
          style={styles.titleBlock}
        />
        {Array.from({length: 3}).map((_, idx) => (
          <SkeletonBlock
            colors={palette}
            height={104}
            style={styles.cardBlock}
            key={`recent-${idx}`}
          />
        ))}
      </View>

      <View style={[styles.section, styles.ctaRow]}>
        <SkeletonBlock
          colors={palette}
          height={68}
          style={[styles.halfBlock, styles.cardBlock]}
        />
        <SkeletonBlock
          colors={palette}
          height={68}
          style={[styles.halfBlock, styles.cardBlock]}
        />
      </View>

      <View style={styles.section}>
        <SkeletonBlock
          colors={palette}
          height={20}
          width={160}
          style={styles.titleBlock}
        />
        {Array.from({length: 2}).map((_, idx) => (
          <SkeletonBlock
            colors={palette}
            height={116}
            style={styles.cardBlock}
            key={`visit-${idx}`}
          />
        ))}
      </View>

      <View style={styles.section}>
        <SkeletonBlock
          colors={palette}
          height={20}
          width={140}
          style={styles.titleBlock}
        />
        {Array.from({length: 2}).map((_, idx) => (
          <SkeletonBlock
            colors={palette}
            height={104}
            style={styles.cardBlock}
            key={`note-${idx}`}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  titleBlock: {
    borderRadius: 8,
  },
  cardBlock: {
    borderRadius: 14,
  },
  ctaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfBlock: {
    width: '48%',
  },
});

export default HomeSkeleton;
