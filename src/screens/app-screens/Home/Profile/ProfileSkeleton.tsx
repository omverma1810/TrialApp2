import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';

import SkeletonBlock, {
  resolveSkeletonPalette,
} from '../../../../components/Skeleton';
import {useAppSelector} from '../../../../store';

const ProfileSkeleton: React.FC = () => {
  const {theme} = useAppSelector(state => state.theme);

  const palette = useMemo(
    () =>
      resolveSkeletonPalette(theme?.COLORS?.APP?.BACKGROUND_COLOR ?? '#FFFFFF'),
    [theme?.COLORS?.APP?.BACKGROUND_COLOR],
  );

  return (
    <View style={styles.container}>
      <View style={styles.avatarRow}>
        <SkeletonBlock
          colors={palette}
          height={80}
          width={80}
          borderRadius={40}
        />
      </View>

      <View style={styles.infoGroup}>
        <SkeletonBlock colors={palette} height={18} width={160} />
        <SkeletonBlock colors={palette} height={22} width={260} />
      </View>

      <View style={styles.infoGroup}>
        <SkeletonBlock colors={palette} height={18} width={140} />
        <SkeletonBlock colors={palette} height={22} width={220} />
      </View>

      <View style={styles.infoGroup}>
        <SkeletonBlock colors={palette} height={18} width={150} />
        <SkeletonBlock colors={palette} height={22} width={200} />
      </View>

      <View style={[styles.infoCard, styles.infoRow]}>
        <View style={styles.infoTextGroup}>
          <SkeletonBlock colors={palette} height={18} width={140} />
          <SkeletonBlock colors={palette} height={22} width={'80%'} />
        </View>
        <SkeletonBlock
          colors={palette}
          height={20}
          width={60}
          borderRadius={6}
        />
      </View>

      <View style={[styles.infoCard, styles.infoRow]}>
        <View style={styles.infoTextGroup}>
          <SkeletonBlock colors={palette} height={18} width={140} />
          <SkeletonBlock colors={palette} height={22} width={'80%'} />
        </View>
        <SkeletonBlock
          colors={palette}
          height={20}
          width={60}
          borderRadius={6}
        />
      </View>

      <SkeletonBlock
        colors={palette}
        height={40}
        width={328}
        borderRadius={8}
      />
      <SkeletonBlock
        colors={palette}
        height={40}
        width={328}
        borderRadius={8}
      />

      <View style={styles.footer}>
        <SkeletonBlock
          colors={palette}
          height={16}
          width={200}
          borderRadius={8}
        />
        <SkeletonBlock
          colors={palette}
          height={16}
          width={220}
          borderRadius={8}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 24,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  avatarRow: {
    height: 80,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoGroup: {
    width: 328,
    gap: 8,
  },
  infoCard: {
    width: 328,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoTextGroup: {
    width: '80%',
    gap: 8,
  },
  footer: {
    alignItems: 'center',
    gap: 10,
  },
});

export default ProfileSkeleton;
