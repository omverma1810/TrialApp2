import {
  useRecentExperiments,
  extractExperimentMetadata,
} from '../hooks/useRecentExperiments';
import {useAppSelector} from '../store';

/**
 * Utility hook to easily track experiment activities
 */
export const useExperimentTracker = () => {
  const {recordActivity} = useRecentExperiments();
  const {organizationURL} = useAppSelector(state => state.auth);

  const trackExperimentVisit = (experiment: any, cropName?: string) => {
    try {
      const metadata = extractExperimentMetadata(experiment, cropName);
      recordActivity(metadata, 'visited');
    } catch (error) {
    }
  };

  const trackDataRecording = (experiment: any, cropName?: string) => {
    try {
      const metadata = extractExperimentMetadata(experiment, cropName);
      recordActivity(metadata, 'data_recorded');
    } catch (error) {
    }
  };

  const trackExperimentView = (experiment: any, cropName?: string) => {
    try {
      const metadata = extractExperimentMetadata(experiment, cropName);
      recordActivity(metadata, 'viewed');
    } catch (error) {
    }
  };

  return {
    trackExperimentVisit,
    trackDataRecording,
    trackExperimentView,
  };
};
