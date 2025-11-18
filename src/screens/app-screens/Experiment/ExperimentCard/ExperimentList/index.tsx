import React, {useRef, useState, useEffect} from 'react';
import {Pressable, Text, View, Animated, Easing} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {
  ToggleOff,
  ToggleOn,
  ToggleOval,
  CardArrowDown,
  CardArrowUp,
  AvailableOffline,
  Plots,
  ChevronRight,
  Leaf,
  NoInternet,
  YesInternet,
} from '../../../../../assets/icons/svgs';
import {URL} from '../../../../../constants/URLS';
import {useApi} from '../../../../../hooks/useApi';
import {styles} from '../styles';
import {LOCALES} from '../../../../../localization/constants';
import {ExperimentScreenProps} from '../../../../../types/navigation/appTypes';
import TraitModal from './TraitModal';
import Loader from '../../../../../components/Loader';
import {experiment} from '../../../../../Data';
import {useExperimentTracker} from '../../../../../utilities/experimentTracker';

interface ExperimentListProps {
  experiment: any;
  selectedProject: string;
  isOfflineEnabled: boolean;
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

interface PlotData {
  plots_count?: number;
}

export default function ExperimentList({
  experiment,
  selectedProject,
  isOfflineEnabled,
  toggleOffline,
  isAnyCaching,
  isGlobalCaching,
  offlineLocationStates,
  isLocationOffline,
  getExperimentOfflineLocations,
  networkIsConnected,
}: ExperimentListProps) {
  const {t} = useTranslation();
  const {navigate} = useNavigation<ExperimentScreenProps['navigation']>();
  const {trackExperimentView} = useExperimentTracker();
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingOffline, setLoadingOffline] = useState(false);
  const traitModalRef = useRef<BottomSheetModal>(null);
  const prevOfflineRef = useRef(isOfflineEnabled);

  // Location-specific states
  const [locationExpanded, setLocationExpanded] = useState<{
    [key: number]: boolean;
  }>({});
  const [locationOfflineEnabled, setLocationOfflineEnabled] = useState<{
    [key: number]: boolean;
  }>({});
  const [locationCaching, setLocationCaching] = useState<{
    [key: number]: boolean;
  }>({});
  const [locationLoadingOffline, setLocationLoadingOffline] = useState<{
    [key: number]: boolean;
  }>({});

  // Keep track of previous offline states to detect when toggle completes
  const prevLocationOfflineStates = useRef<{[key: number]: boolean}>({});

  // Fallback timeout refs to clear loaders if state detection fails
  const loadingTimeoutRefs = useRef<{[key: number]: NodeJS.Timeout}>({});

  // Local state for icon display to prevent global icon changes
  const [localIsOfflineEnabled, setLocalIsOfflineEnabled] =
    useState(isOfflineEnabled);
  const [localIsAnyCaching, setLocalIsAnyCaching] = useState(isAnyCaching);

  // Sync local state with props when not loading and not globally caching
  useEffect(() => {
    if (!loadingOffline && !isGlobalCaching) {
      setLocalIsOfflineEnabled(isOfflineEnabled);
      setLocalIsAnyCaching(isAnyCaching);
    }
  }, [isOfflineEnabled, isAnyCaching, loadingOffline, isGlobalCaching]);

  // EXPERIMENT_DETAILS
  const [getDetails, detailsResp] = useApi({
    url: URL.EXPERIMENT_DETAILS,
    method: 'GET',
  });
  const [detailData, setDetailData] = useState<any>(null);
  const [trialLocationId, setTrialLocationId] = useState<number | null>(null);

  // PLOT_LIST
  const [getField, fieldResp] = useApi({
    url: URL.PLOT_LIST,
    method: 'GET',
  });
  const [plotData, setPlotData] = useState<PlotData>({plots_count: 0});

  // fetch experiment-details on mount
  useEffect(() => {
    getDetails({
      pathParams: experiment.id,
      queryParams: `experimentType=${experiment.experimentType}`,
    });
  }, [experiment.id]);

  // when details arrive, extract all locations
  const [locationList, setLocationList] = useState<any[]>([]);

  // Sync location states with global props and clear loaders when operations complete
  useEffect(() => {
    if (locationList.length > 0 && !isGlobalCaching && offlineLocationStates) {
      const updatedOfflineStates: {[key: number]: boolean} = {};
      const updatedCachingStates: {[key: number]: boolean} = {};
      const updatedLoadingStates = {...locationLoadingOffline};
      let hasLoadingChanges = false;

      locationList.forEach((loc, idx) => {
        const locationId = loc.id || idx;
        // Use the actual offline state from the hook if available
        const currentOfflineState = isLocationOffline
          ? isLocationOffline(experiment.id, locationId)
          : false;

        updatedOfflineStates[locationId] = currentOfflineState;
        updatedCachingStates[locationId] = false; // Reset caching state

        // Check if toggle operation completed for this location
        if (locationLoadingOffline[locationId]) {
          const previousOfflineState =
            prevLocationOfflineStates.current[locationId];

          // If the offline state has changed and we were loading, clear the loader
          if (
            previousOfflineState !== undefined &&
            previousOfflineState !== currentOfflineState
          ) {
            updatedLoadingStates[locationId] = false;
            hasLoadingChanges = true;
          }
        }
      });

      setLocationOfflineEnabled(updatedOfflineStates);
      setLocationCaching(updatedCachingStates);

      // Clear loaders if any toggle operations completed
      if (hasLoadingChanges) {
        setLocationLoadingOffline(updatedLoadingStates);

        // Clear any corresponding timeouts since state change was detected
        Object.keys(updatedLoadingStates).forEach(locationIdStr => {
          const locationId = parseInt(locationIdStr);
          if (
            !updatedLoadingStates[locationId] &&
            loadingTimeoutRefs.current[locationId]
          ) {
            clearTimeout(loadingTimeoutRefs.current[locationId]);
            delete loadingTimeoutRefs.current[locationId];
          }
        });
      }

      // Update previous states for next comparison
      prevLocationOfflineStates.current = {...updatedOfflineStates};
    }
  }, [
    locationList,
    isOfflineEnabled,
    isAnyCaching,
    isGlobalCaching,
    offlineLocationStates,
    isLocationOffline,
    experiment.id,
  ]);

  useEffect(() => {
    if (detailsResp?.status_code === 200) {
      const locs = detailsResp.data.locationList || [];
      setLocationList(locs);

      // Initialize location-specific states based on actual offline states
      if (locs.length > 0) {
        const initialOfflineStates: {[key: number]: boolean} = {};
        const initialCachingStates: {[key: number]: boolean} = {};
        const initialExpandedStates: {[key: number]: boolean} = {};

        locs.forEach((loc: any, idx: number) => {
          const locationId = loc.id || idx;
          // Use the actual offline state from the hook if available
          const currentOfflineState = isLocationOffline
            ? isLocationOffline(experiment.id, locationId)
            : false;

          initialOfflineStates[locationId] = currentOfflineState;
          initialCachingStates[locationId] = false; // Default to not caching
          initialExpandedStates[locationId] = false; // Default to collapsed
        });

        setLocationOfflineEnabled(initialOfflineStates);
        setLocationCaching(initialCachingStates);
        setLocationExpanded(initialExpandedStates);

        // Initialize previous states tracking - this is crucial for comparison
        prevLocationOfflineStates.current = {...initialOfflineStates};
      }

      // fallback for legacy code
      if (locs.length > 0) {
        setDetailData(locs[0].traits);
        setTrialLocationId(locs[0].id);
        setPlotData({plots_count: locs[0].plots_count});
      }
    }
  }, [detailsResp, isLocationOffline, experiment.id]);

  // when we have a trialLocationId, fetch plots (for first location only, legacy)
  useEffect(() => {
    if (trialLocationId != null) {
      getField({
        pathParams: String(trialLocationId),
        queryParams: `experimentType=${experiment.experimentType}`,
      });
    }
  }, [trialLocationId]);

  // stash plotData (or default)
  useEffect(() => {
    if (fieldResp?.status_code === 200) {
      setPlotData(fieldResp.data);
    }
  }, [fieldResp]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(loadingTimeoutRefs.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      loadingTimeoutRefs.current = {};
    };
  }, []);

  // stop offline loader when toggle finishes
  useEffect(() => {
    if (loadingOffline && prevOfflineRef.current !== isOfflineEnabled) {
      setLoadingOffline(false);
      // Update local state when toggle completes
      setLocalIsOfflineEnabled(isOfflineEnabled);
      setLocalIsAnyCaching(isAnyCaching);
    }
    prevOfflineRef.current = isOfflineEnabled;
  }, [isOfflineEnabled, loadingOffline, isAnyCaching]);

  // animated toggle knob
  const toggleAnim = useRef(
    new Animated.Value(localIsOfflineEnabled ? 1 : 0),
  ).current;

  // Location-specific animated toggle knobs
  const locationToggleAnims = useRef<{[key: number]: Animated.Value}>({});

  const getLocationToggleAnim = (locationId: number) => {
    if (!locationToggleAnims.current[locationId]) {
      locationToggleAnims.current[locationId] = new Animated.Value(
        locationOfflineEnabled[locationId] ? 1 : 0,
      );
    } else {
      // Update the animation value if the state has changed
      locationToggleAnims.current[locationId].setValue(
        locationOfflineEnabled[locationId] ? 1 : 0,
      );
    }
    return locationToggleAnims.current[locationId];
  };

  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: localIsOfflineEnabled ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.circle),
      useNativeDriver: false,
    }).start();
  }, [localIsOfflineEnabled]);

  // Update location-specific animations
  useEffect(() => {
    Object.keys(locationOfflineEnabled).forEach(locationIdStr => {
      const locationId = parseInt(locationIdStr);
      const anim = getLocationToggleAnim(locationId);
      Animated.timing(anim, {
        toValue: locationOfflineEnabled[locationId] ? 1 : 0,
        duration: 250,
        easing: Easing.out(Easing.circle),
        useNativeDriver: false,
      }).start();
    });
  }, [locationOfflineEnabled]);

  const knobX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 18],
  });

  const getLocationKnobX = (locationId: number) => {
    const anim = getLocationToggleAnim(locationId);
    return anim.interpolate({
      inputRange: [0, 1],
      outputRange: [2, 18],
    });
  };

  const handleOffline = async () => {
    setLoadingOffline(true);
    await toggleOffline({
      id: experiment.id,
      cropId: experiment.cropId,
      experimentType: experiment.experimentType,
    });
  };

  const handleLocationOffline = async (locationId: number) => {
    // Clear any existing timeout for this location
    if (loadingTimeoutRefs.current[locationId]) {
      clearTimeout(loadingTimeoutRefs.current[locationId]);
      delete loadingTimeoutRefs.current[locationId];
    }

    // Set loading state immediately
    setLocationLoadingOffline(prev => ({...prev, [locationId]: true}));

    // Store the current state before the toggle operation for comparison
    const currentStateBeforeToggle =
      locationOfflineEnabled[locationId] || false;
    prevLocationOfflineStates.current[locationId] = currentStateBeforeToggle;

    // Set a fallback timeout to clear loader after 15 seconds (in case state detection fails)
    loadingTimeoutRefs.current[locationId] = setTimeout(() => {
      setLocationLoadingOffline(prev => ({...prev, [locationId]: false}));
      delete loadingTimeoutRefs.current[locationId];
    }, 15000); // 15 seconds fallback

    try {
      await toggleOffline({
        id: experiment.id,
        cropId: experiment.cropId,
        experimentType: experiment.experimentType,
        locationId: locationId,
      });

      // The offline state will be updated via the parent component's state management
      // The loader will be cleared when the state change is detected in the useEffect
    } catch (error) {
      // Clear timeout and loading state on error
      if (loadingTimeoutRefs.current[locationId]) {
        clearTimeout(loadingTimeoutRefs.current[locationId]);
        delete loadingTimeoutRefs.current[locationId];
      }
      setLocationLoadingOffline(prev => ({...prev, [locationId]: false}));
    }
    // Note: We don't clear the loading state here - it will be cleared by the useEffect
    // when it detects that the offline state has changed from the stored previous state
  };

  const toggleLocationExpanded = (locationId: number) => {
    setLocationExpanded(prev => ({
      ...prev,
      [locationId]: !prev[locationId],
    }));
  };

  const onToggleExpand = () => setIsExpanded(v => !v);
  const onViewAll = () => {
    // Track experiment view activity
    trackExperimentView(experiment, experiment.cropName);

    navigate('ExperimentDetails', {
      id: experiment.id,
      type: experiment.experimentType,
      data: {
        projectId: selectedProject,
        designType: experiment.designType,
        season: experiment.season,
        year: experiment.year ? String(experiment.year) : undefined,
        cropName: experiment.cropName,
        experimentName:
          experiment.experimentName ?? experiment.fieldExperimentName,
        fieldExperimentName: experiment.fieldExperimentName,
        projectKey: experiment.projectKey,
        experimentId: experiment.id,
        experimentType: experiment.experimentType,
      },
    });
  };

  return (
    <>
      <View style={[styles.experimentContainer]}>
        {/* Header Spacer */}
        <Pressable style={styles.experimentTitleContainer} onPress={onViewAll}>
          <View style={styles.headerContentContainer} />
        </Pressable>

        {/* Main content */}
        <>
          {/* Locations & Fields - render locations conditionally based on network state */}
          {locationList.length > 0 ? (
            (() => {
              // Filter locations based on network connectivity
              let locationsToRender = locationList;

              // If device is offline, only show locations that are cached offline
              if (networkIsConnected === false) {
                locationsToRender = locationList.filter((loc, idx) => {
                  const locationId = loc.id || idx;
                  return isLocationOffline
                    ? isLocationOffline(experiment.id, locationId)
                    : false;
                });
              }

              return locationsToRender.map((loc, idx) => {
                const locationId = loc.id || idx;
                const isLocationExpanded =
                  locationExpanded[locationId] || false;
                const isLocationOffline =
                  locationOfflineEnabled[locationId] || false;
                const isLocationCaching = locationCaching[locationId] || false;
                const isLocationLoading =
                  locationLoadingOffline[locationId] || false;
                const locationKnobX = getLocationKnobX(locationId);

                return (
                  <View key={locationId} style={{marginBottom: 12}}>
                    <View style={[styles.fieldInfoRow]}>
                      <Text style={styles.fieldInfoText}>
                        Location: {loc.location?.villageName ?? '-'}
                      </Text>
                      <Text style={styles.fieldInfoText}>
                        Field: {loc.location?.fieldLabel ?? '-'}
                      </Text>
                    </View>
                    <View style={styles.mainCardsContainer}>
                      <Pressable
                        style={styles.plotsCard}
                        onPress={() =>
                          navigate('Plots', {
                            id: String(loc.id),
                            type: experiment.experimentType,
                            data: {
                              projectId: selectedProject,
                              designType: experiment.designType,
                              season: experiment.season,
                              year: experiment.year
                                ? String(experiment.year)
                                : undefined,
                              cropName: experiment.cropName,
                              experimentName:
                                experiment.experimentName ??
                                experiment.fieldExperimentName,
                              fieldExperimentName:
                                experiment.fieldExperimentName,
                              projectKey: experiment.projectKey,
                              experimentId: experiment.id,
                              experimentType: experiment.experimentType,
                            },
                            experimentID: String(
                              detailsResp?.data.id ?? experiment.id,
                            ),
                            locationID: loc?.landVillageId,
                          })
                        }
                        disabled={loc.plots_count == null}>
                        <View style={styles.cardValueWithIcon}>
                          <Plots width={28} height={28} color="#1A6DD2" />
                          <View style={styles.plotsTextContainer}>
                            <Text style={styles.cardTitle}>Plots</Text>
                            <Text style={styles.cardValue}>
                              {loc.plots_count ?? 0}
                            </Text>
                          </View>
                          <ChevronRight width={18} height={20} />
                        </View>
                      </Pressable>
                      <Pressable
                        style={styles.traitsCard}
                        onPress={() => traitModalRef.current?.present()}>
                        <View style={styles.cardValueWithIcon}>
                          <Leaf width={24} height={24} color="#1A6DD2" />
                          <View style={styles.plotsTextContainer}>
                            <Text style={styles.cardTitle}>Traits</Text>
                            <Text style={styles.cardValue}>
                              {loc.plots_count && loc.plots_count > 0
                                ? Math.floor(
                                    (loc.traits?.total ?? 0) / loc.plots_count,
                                  )
                                : loc.traits?.total ?? 0}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    </View>

                    {/* Location-specific offline controls */}
                    <View
                      style={[
                        styles.bottomRowContainer,
                        {
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 8,
                        },
                      ]}>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        {isLocationLoading ? (
                          // Show generic icon while loading to avoid confusion
                          <NoInternet width={38} height={24} />
                        ) : isLocationOffline ? (
                          <View style={{paddingRight: 8}}>
                            <AvailableOffline width={32} height={32} />
                          </View>
                        ) : isLocationCaching ? (
                          <YesInternet width={38} height={32} />
                        ) : (
                          <NoInternet width={38} height={24} />
                        )}

                        <View style={styles.toggleWrapper}>
                          {isLocationLoading ? (
                            <View
                              style={[
                                styles.toggleRow,
                                {minWidth: 48, justifyContent: 'center'},
                              ]}>
                              <Loader size="small" color="#007AFF" />
                            </View>
                          ) : (
                            <View style={styles.toggleRow}>
                              <Pressable
                                onPress={() =>
                                  handleLocationOffline(locationId)
                                }
                                style={styles.customToggleWrapper}
                                disabled={isLocationLoading}>
                                {isLocationOffline ? (
                                  <ToggleOn width={48} height={24} />
                                ) : (
                                  <ToggleOff width={48} height={24} />
                                )}
                                <Animated.View
                                  style={[
                                    styles.ovalContainer,
                                    {
                                      transform: [{translateX: locationKnobX}],
                                      position: 'absolute',
                                      top: 2,
                                      left: 2,
                                    },
                                  ]}>
                                  <ToggleOval width={20} height={20} />
                                </Animated.View>
                              </Pressable>
                            </View>
                          )}
                        </View>
                      </View>

                      <Pressable
                        onPress={() => toggleLocationExpanded(locationId)}>
                        {isLocationExpanded ? (
                          <CardArrowUp />
                        ) : (
                          <CardArrowDown />
                        )}
                      </Pressable>
                    </View>

                    {/* Location-specific expanded details */}
                    {isLocationExpanded && (
                      <View style={styles.experimentDetailsContainer}>
                        <View style={styles.experimentDetailsCard}>
                          <Text style={styles.experimentDetailsKeyText}>
                            Location ID
                          </Text>
                          <Text style={styles.experimentDetailsValueText}>
                            {loc.id ?? '-'}
                          </Text>
                        </View>
                        <View style={styles.experimentDetailsCard}>
                          <Text style={styles.experimentDetailsKeyText}>
                            Location Name
                          </Text>
                          <Text style={styles.experimentDetailsValueText}>
                            {loc.location?.fieldLabel ?? '-'}
                          </Text>
                        </View>
                        <View style={styles.experimentDetailsCard}>
                          <Text style={styles.experimentDetailsKeyText}>
                            Location
                          </Text>
                          <Text style={styles.experimentDetailsValueText}>
                            {loc.location?.villageName ?? '-'}
                          </Text>
                        </View>
                        <View style={styles.experimentDetailsCard}>
                          <Text style={styles.experimentDetailsKeyText}>
                            Plots Count
                          </Text>
                          <Text style={styles.experimentDetailsValueText}>
                            {loc.plots_count ?? 0}
                          </Text>
                        </View>
                        <View style={styles.experimentDetailsCard}>
                          <Text style={styles.experimentDetailsKeyText}>
                            Captured Traits
                          </Text>
                          <Text style={styles.experimentDetailsValueText}>
                            {loc.plots_count && loc.plots_count > 0
                              ? Math.floor(
                                  (loc.traits?.recorded ?? 0) / loc.plots_count,
                                )
                              : loc.traits?.recorded ?? 0}
                          </Text>
                        </View>
                        <View style={styles.experimentDetailsCard}>
                          <Text style={styles.experimentDetailsKeyText}>
                            Total Records
                          </Text>
                          <Text style={styles.experimentDetailsValueText}>
                            {loc.plots_count && loc.plots_count > 0
                              ? Math.floor(
                                  (loc.traits?.total ?? 0) / loc.plots_count,
                                )
                              : loc.traits?.total ?? 0}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              });
            })()
          ) : (
            <View style={[styles.fieldInfoRow]}>
              <Text style={styles.fieldInfoText}>Location: -</Text>
              <Text style={styles.fieldInfoText}>Field: -</Text>
            </View>
          )}
          {isExpanded && (
            <>
              <View style={styles.experimentDetailsContainer}>
                {[
                  {
                    id: 2,
                    title: t(LOCALES.EXPERIMENT.LBL_FIELD_DESIGN),
                    key: 'designType',
                  },
                  {
                    id: 3,
                    title: t(LOCALES.EXPERIMENT.LBL_SEASON),
                    key: 'season',
                  },
                  {
                    id: 4,
                    title: t(LOCALES.EXPERIMENT.LBL_ENTRIES),
                    key: 'noOfTreatment',
                  },
                  {
                    id: 5,
                    title: t(LOCALES.EXPERIMENT.LBL_PLOTS),
                    key: 'noOfPlots',
                  },
                  {
                    id: 6,
                    title: t(LOCALES.EXPERIMENT.LBL_REPLICATION),
                    key: 'noOfReplication',
                  },
                  {
                    id: 8,
                    title: t(LOCALES.EXPERIMENT.LBL_LOCATION_DEPLOYED),
                    key: 'noOfLocationsDeployed',
                  },
                  {
                    id: 9,
                    title: t(LOCALES.EXPERIMENT.LBL_LOCATION_REQUIRED),
                    key: 'locationReq',
                  },
                  {
                    id: 10,
                    title: t(LOCALES.EXPERIMENT.LBL_NO_OF_TRAITS),
                    key: 'noOfTraits',
                  },
                ].map((item, idx) => (
                  <View key={idx} style={styles.experimentDetailsCard}>
                    <Text style={styles.experimentDetailsKeyText}>
                      {item.title}
                    </Text>
                    <Text style={styles.experimentDetailsValueText}>
                      {experiment[item.key] ?? '-'}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Experiment-level expand/collapse control */}
          <View
            style={[
              styles.bottomRowContainer,
              {justifyContent: 'flex-end', alignItems: 'center', marginTop: 8},
            ]}>
            {/* <Pressable onPress={onToggleExpand}>
              {isExpanded ? <CardArrowUp /> : <CardArrowDown />}
            </Pressable> */}
          </View>
        </>
        {/* Trait Modal */}
        {/* Pass traitList of first location for modal (legacy) */}
        <TraitModal
          bottomSheetModalRef={traitModalRef}
          data={locationList[0]?.traitList}
        />
      </View>
    </>
  );
}
