import {useState, useEffect, useCallback} from 'react';
import {
  RecentExperimentsService,
  RecentExperiment,
  ExperimentMetadata,
} from '../services/recentExperimentsService';
import {useAppSelector} from '../store';

interface UseRecentExperimentsReturn {
  recentExperiments: RecentExperiment[];
  loading: boolean;
  error: string | null;
  recordActivity: (
    metadata: ExperimentMetadata,
    activityType: 'data_recorded' | 'visited' | 'viewed',
  ) => Promise<void>;
  refreshRecentExperiments: () => Promise<void>;
}

export const useRecentExperiments = (
  limit: number = 5,
): UseRecentExperimentsReturn => {
  const [recentExperiments, setRecentExperiments] = useState<
    RecentExperiment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {organizationURL} = useAppSelector(state => state.auth);

  const fetchRecentExperiments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const experiments = await RecentExperimentsService.getRecentExperiments(
        limit,
        organizationURL,
      );
      const normalizedExperiments = experiments
        .map(experiment => ({
          ...experiment,
          experimentName:
            experiment.experimentName ||
            experiment.fieldExperimentName ||
            experiment.projectKey,
          fieldExperimentName:
            experiment.fieldExperimentName ||
            experiment.experimentName ||
            experiment.projectKey,
          cropName: experiment.cropName || 'Unknown',
          season: experiment.season || 'Unknown',
          year: experiment.year || new Date().getFullYear().toString(),
          experimentType: experiment.experimentType || 'Trial',
        }))
        .filter(
          experiment =>
            experiment.experimentId !== null &&
            experiment.experimentId !== undefined &&
            Boolean(
              experiment.experimentName ||
                experiment.fieldExperimentName ||
                experiment.projectKey,
            ),
        );

      setRecentExperiments(normalizedExperiments);
    } catch (err) {
      setError('Failed to load recent experiments');
    } finally {
      setLoading(false);
    }
  }, [limit, organizationURL]);

  const recordActivity = useCallback(
    async (
      metadata: ExperimentMetadata,
      activityType: 'data_recorded' | 'visited' | 'viewed',
    ) => {
      try {
        await RecentExperimentsService.recordActivity(
          metadata,
          activityType,
          organizationURL,
        );
        // Refresh the list after recording new activity
        await fetchRecentExperiments();
      } catch (err) {
        throw err;
      }
    },
    [fetchRecentExperiments, organizationURL],
  );

  const refreshRecentExperiments = useCallback(async () => {
    await fetchRecentExperiments();
  }, [fetchRecentExperiments]);

  useEffect(() => {
    fetchRecentExperiments();
  }, [fetchRecentExperiments]);

  return {
    recentExperiments,
    loading,
    error,
    recordActivity,
    refreshRecentExperiments,
  };
};

// Helper function to extract metadata from experiment object
export const extractExperimentMetadata = (
  experiment: any,
  cropName?: string,
): ExperimentMetadata => {
  const resolveNumericId = (value: any): number | null => {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  };

  const experimentId =
    resolveNumericId(experiment?.experimentId) ??
    resolveNumericId(experiment?.id) ??
    resolveNumericId(experiment?.fieldExperimentId) ??
    resolveNumericId(experiment);

  if (experimentId === null) {
    throw new Error('Invalid experiment metadata: missing experimentId');
  }

  const rawFieldName =
    experiment?.fieldExperimentName ||
    experiment?.experimentName ||
    experiment?.name ||
    experiment?.fieldLabel ||
    experiment?.fieldName;

  const fallbackName = rawFieldName || `Experiment ${experimentId}`;

  const resolvedCropName =
    cropName ||
    experiment?.cropName ||
    experiment?.crop?.name ||
    experiment?.crop ||
    'Unknown';

  const resolvedSeason =
    experiment?.season ||
    experiment?.seasonName ||
    experiment?.seasonLabel ||
    'Unknown';

  const resolvedYearSource =
    experiment?.year ?? experiment?.seasonYear ?? experiment?.yearLabel;

  const resolvedYear = resolvedYearSource
    ? String(resolvedYearSource)
    : new Date().getFullYear().toString();

  const resolvedExperimentType =
    experiment?.experimentType || experiment?.type || 'Trial';

  const resolvedProjectKey =
    experiment?.projectKey ||
    experiment?.projectId ||
    experiment?.projectCode ||
    experiment?.project ||
    '';

  return {
    experimentId,
    experimentName: experiment?.experimentName || fallbackName,
    fieldExperimentName: fallbackName,
    projectKey: resolvedProjectKey,
    cropName: resolvedCropName,
    season: resolvedSeason,
    year: resolvedYear,
    experimentType: resolvedExperimentType,
  };
};
