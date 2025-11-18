import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, ActivityIndicator, Pressable} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import styles from './MyRecentProjectsStyles';
import {useRecentExperiments} from '../../../../hooks/useRecentExperiments';
import {HomeScreenProps} from '../../../../types/navigation/appTypes';
import {LOCALES} from '../../../../localization/constants';
import {formatExperimentTypeForDisplay} from '../../../../utilities/experimentTypeUtils';

// — Exported union for badge types —
export type BadgeType = 'success' | 'warning' | 'error';

// — Exported interface for a project —
export interface Project {
  badges: {label: string; type: BadgeType}[];
  code: string;
  originalExperiment?: any; // Store original experiment data for navigation
}

interface MyRecentProjectsProps {
  // Can accept refresh key to trigger re-render
  refreshKey?: number;
  onLoadingStateChange?: (isInitialLoading: boolean) => void;
}

const MyRecentProjects: React.FC<MyRecentProjectsProps> = ({
  refreshKey,
  onLoadingStateChange,
}) => {
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const {t} = useTranslation();
  const {recentExperiments, loading, error, refreshRecentExperiments} =
    useRecentExperiments(3); // Limit to 3 experiments

  // Track if we have initial data to prevent flickering during refreshes
  const [hasInitialData, setHasInitialData] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Track when we have initial data
  useEffect(() => {
    if (recentExperiments.length > 0 && !hasInitialData) {
      setHasInitialData(true);
    }
  }, [recentExperiments, hasInitialData]);

  useEffect(() => {
    onLoadingStateChange?.(loading && !hasInitialData);
  }, [loading, hasInitialData, onLoadingStateChange]);

  // Debug logging
  useEffect(() => {}, [
    recentExperiments,
    loading,
    error,
    hasInitialData,
    isRefreshing,
  ]);

  // Refresh when refreshKey changes
  useEffect(() => {
    if (refreshKey !== undefined) {
      // Set refreshing state to show a more subtle loading indicator
      if (hasInitialData) {
        setIsRefreshing(true);
      }

      refreshRecentExperiments().finally(() => {
        setIsRefreshing(false);
      });
    }
  }, [refreshKey, refreshRecentExperiments, hasInitialData]);

  const getBadgeType = (label: string): BadgeType => {
    // Crop names -> success (green)
    const crops = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Soybean'];
    if (crops.some(crop => label.toLowerCase().includes(crop.toLowerCase()))) {
      return 'success';
    }

    // Years and seasons -> warning (orange)
    if (
      label.includes('2024') ||
      label.includes('2025') ||
      label.toLowerCase().includes('kharif') ||
      label.toLowerCase().includes('rabi')
    ) {
      return 'warning';
    }

    // Experiment types -> error (red)
    return 'error';
  };

  const createProjectFromExperiment = (experiment: any): Project => {
    const badges = [];

    // Add crop badge
    if (experiment.cropName && experiment.cropName !== 'Unknown') {
      badges.push({
        label: experiment.cropName,
        type: getBadgeType(experiment.cropName) as BadgeType,
      });
    }

    // Add season/year badge
    if (experiment.season && experiment.year) {
      const seasonYear = `${experiment.season} (${experiment.year})`;
      badges.push({
        label: seasonYear,
        type: 'warning' as BadgeType,
      });
    } else if (experiment.year) {
      badges.push({
        label: experiment.year,
        type: 'warning' as BadgeType,
      });
    }

    // Add experiment type badge
    if (experiment.experimentType) {
      badges.push({
        label: formatExperimentTypeForDisplay(experiment.experimentType),
        type: 'error' as BadgeType,
      });
    }

    return {
      badges,
      code:
        experiment.fieldExperimentName ||
        experiment.experimentName ||
        experiment.projectKey ||
        (experiment.experimentId
          ? `Experiment ${experiment.experimentId}`
          : 'Unknown Experiment'),
      originalExperiment: experiment, // Store original experiment data for navigation
    };
  };

  const handleExperimentPress = (
    project: Project & {originalExperiment?: any},
  ) => {
    if (project.originalExperiment) {
      const experiment = project.originalExperiment;

      // Navigate to Experiment tab with prefilled experiment data
      navigation.navigate('TabBar', {
        screen: 'ExperimentStack',
        params: {
          screen: 'Experiment',
          params: {
            prefilledExperiment: {
              experimentId: experiment.experimentId,
              experimentName: experiment.experimentName,
              fieldExperimentName: experiment.fieldExperimentName,
              cropName: experiment.cropName,
              season: experiment.season,
              year: experiment.year,
              experimentType: experiment.experimentType,
              projectKey: experiment.projectKey,
            },
          },
        },
      });
    }
  };

  const renderBadge = (
    badge: {label: string; type: BadgeType},
    idx: number,
  ) => {
    // pick container & text styles based on type
    const containerStyle =
      badge.type === 'success'
        ? styles.badgeSuccess
        : badge.type === 'warning'
        ? styles.badgeWarning
        : styles.badgeError;
    const textStyle =
      badge.type === 'success'
        ? styles.badgeTextSuccess
        : badge.type === 'warning'
        ? styles.badgeTextWarning
        : styles.badgeTextError;

    return (
      <View key={idx} style={[styles.tag, containerStyle]}>
        <Text style={[styles.tagText, textStyle]}>{badge.label}</Text>
      </View>
    );
  };

  const renderItem = ({item}: {item: Project}) => (
    <Pressable onPress={() => handleExperimentPress(item)}>
      <View style={styles.projectCard}>
        <View style={styles.tagContainer}>{item.badges.map(renderBadge)}</View>
        <Text style={styles.projectCode}>{item.code}</Text>
      </View>
    </Pressable>
  );

  const renderNoData = () => (
    <View style={styles.noDataContainer}>
      <Text style={styles.noDataText}>
        {t(LOCALES.HOME.MSG_NO_RECENT_EXPERIMENTS)}
      </Text>
      <Text style={styles.noDataSubText}>
        {t(LOCALES.HOME.MSG_START_RECORDING)}
      </Text>
    </View>
  );

  const renderContent = () => {
    // Show full loading screen only on initial load (no data yet)
    if (loading && !hasInitialData) {
      return null;
    }

    if (error && !hasInitialData) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {t(LOCALES.HOME.MSG_FAILED_LOAD_RECENT)}
          </Text>
        </View>
      );
    }

    if (recentExperiments.length === 0 && !loading) {
      return renderNoData();
    }

    const projects = recentExperiments.map(createProjectFromExperiment);

    return (
      <View>
        {/* Show subtle refresh indicator when refreshing existing data */}
        {isRefreshing && hasInitialData && (
          <View style={styles.refreshIndicator}>
            <ActivityIndicator size="small" color="#1A6DD2" />
            <Text style={styles.refreshText}>
              {t(LOCALES.HOME.MSG_UPDATING)}
            </Text>
          </View>
        )}
        <FlatList
          data={projects}
          keyExtractor={(_, i) => `recent-exp-${i}`}
          renderItem={renderItem}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t(LOCALES.HOME.TITLE_MY_RECENT_EXPERIMENTS)}
      </Text>
      {renderContent()}
    </View>
  );
};

export default MyRecentProjects;
