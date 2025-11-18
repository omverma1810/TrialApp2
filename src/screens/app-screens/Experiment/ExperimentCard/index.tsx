import React, {Fragment} from 'react';
import {View, Text} from 'react-native';
import {styles} from './styles';
import ExperimentList from './ExperimentList';
import {AvailableOffline} from '../../../../assets/icons/svgs';
import {formatExperimentTypeForDisplay} from '../../../../utilities/experimentTypeUtils';

interface ExperimentCardProps {
  item: {
    name: string;
    data: Array<{
      id: number;
      cropId: number;
      experimentType: string;
      [key: string]: any;
    }>;
  };
  selectedProject: string;
  offlineEnabledExperiments: number[];
  toggleOffline: (exp: {
    id: number;
    cropId: number;
    experimentType: string;
    locationId?: number;
  }) => Promise<void>;
  isAnyCaching: boolean;
  isGlobalCaching: boolean;
  // Location-specific props
  offlineLocationStates?: {
    [experimentId: number]: {[locationId: number]: boolean};
  };
  isLocationOffline?: (experimentId: number, locationId: number) => boolean;
  getExperimentOfflineLocations?: (experimentId: number) => number[];
  // Network connectivity state for conditional rendering
  networkIsConnected: boolean;
}

const ExperimentCard: React.FC<ExperimentCardProps> = ({
  item,
  selectedProject,
  offlineEnabledExperiments,
  toggleOffline,
  isAnyCaching,
  isGlobalCaching,
  offlineLocationStates,
  isLocationOffline,
  getExperimentOfflineLocations,
  networkIsConnected,
}) => {
  // Check if any experiments in this group are available offline
  const hasOfflineExperiments = item.data.some(exp =>
    offlineEnabledExperiments.includes(exp.id),
  );

  return (
    <View style={styles.container}>
      {/* Group header with badges */}
      <View style={styles.cropContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.cropBadge}>
            <Text style={styles.cropBadgeText}>{item.data[0].cropName}</Text>
          </View>
          <View style={styles.nameBadge}>
            <Text style={styles.nameBadgeText}>
              {item.data[0].fieldExperimentName ?? item.data[0].experimentName}
            </Text>
          </View>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {formatExperimentTypeForDisplay(item.data[0].experimentType)}
            </Text>
          </View>
          {/* Show "Available Offline" indicator if any experiments in this group are offline */}
          {/* {hasOfflineExperiments && (
            <View style={styles.groupOfflineIndicator}>
              <AvailableOffline width={16} height={16} />
              <Text style={styles.groupOfflineText}>Available Offline</Text>
            </View>
          )} */}
        </View>
      </View>
      {/* Each experiment row */}
      {item.data.map(exp => (
        <Fragment key={exp.id}>
          <ExperimentList
            experiment={exp}
            selectedProject={selectedProject}
            isOfflineEnabled={offlineEnabledExperiments.includes(exp.id)}
            toggleOffline={toggleOffline}
            isAnyCaching={isAnyCaching}
            isGlobalCaching={isGlobalCaching}
            // Location-specific props
            offlineLocationStates={offlineLocationStates}
            isLocationOffline={isLocationOffline}
            getExperimentOfflineLocations={getExperimentOfflineLocations}
            // Network connectivity state
            networkIsConnected={networkIsConnected}
          />
        </Fragment>
      ))}
    </View>
  );
};

export default ExperimentCard;
