import React, {useState, useMemo, useCallback, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Text, OverlayLoader} from '..';
import useTheme from '../../theme/hooks/useTheme';
import {
  AgronomyProtocolProps,
  ProtocolTask,
  AgronomyProtocolResponse,
  TaskProtocol,
  UpdateTaskStatusPayload,
} from '../../types/components/AgronomyProtocol';
import ProtocolProgress from '../ProtocolProgress';
import ProtocolQuickFilters from '../ProtocolQuickFilters';
import ProtocolStageGroup from '../ProtocolStageGroup';
import {useApi} from '../../hooks/useApi';
import {URL} from '../../constants/URLS';
import dayjs from 'dayjs';
import SkeletonBlock, {resolveSkeletonPalette} from '../Skeleton';
import Toast from '../../utilities/toast';

/**
 * AgronomyProtocol Component
 *
 * Main container for displaying agronomy protocol tasks in the Plot screen.
 * Handles API calls, filtering, and state management for protocol tasks.
 *
 * Features:
 * - Progress tracking
 * - Quick filters (All, Pending, Due Soon, Overdue)
 * - Stage-based grouping
 * - Expandable task details
 * - Mark tasks as complete
 *
 * @component
 * @example
 * <AgronomyProtocol
 *   experimentID="123"
 *   locationID="456"
 *   cropId="11"
 * />
 */
const AgronomyProtocol: React.FC<AgronomyProtocolProps> = ({
  experimentID,
  locationID,
  cropId,
}) => {
  const {COLORS, FONTS} = useTheme();

  // State management
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'pending' | 'due_soon' | 'overdue'
  >('all');
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
  const [protocolTasks, setProtocolTasks] = useState<ProtocolTask[]>([]);

  // API hook for fetching agronomy protocols
  const [getProtocols, protocolsResponse, isLoadingProtocols, protocolsError] =
    useApi({
      url: URL.AGRONOMY_PROTOCOL,
      method: 'GET',
    });

  // API hook for updating task status
  const [
    updateTaskStatus,
    updateTaskResponse,
    isUpdatingTask,
    updateTaskError,
  ] = useApi({
    url: URL.TASK_STATUS,
    method: 'PUT',
  });

  // Helper function to determine task status based on dates
  const calculateTaskStatus = useCallback(
    (
      task: TaskProtocol,
      dueDate: string,
      maxThresholdDate: string,
    ): 'pending' | 'overdue' | 'due_soon' | 'completed' => {
      if (task.isMarkAsCompleted) {
        return 'completed';
      }

      const now = dayjs();
      const due = dayjs(dueDate);
      const threshold = dayjs(maxThresholdDate);

      if (now.isAfter(threshold)) {
        return 'overdue';
      } else if (now.isAfter(due)) {
        return 'due_soon';
      } else {
        return 'pending';
      }
    },
    [],
  );

  // Transform API response to ProtocolTask format
  const transformApiResponse = useCallback(
    (response: AgronomyProtocolResponse): ProtocolTask[] => {
      console.log('🌾 AgronomyProtocol - Starting transformation...');
      const tasks: ProtocolTask[] = [];

      response.data.forEach((protocol, protocolIndex) => {
        console.log(`🌾 Protocol ${protocolIndex}:`, {
          crop_protocol_id: protocol.crop_protocol_id,
          crop_name: protocol.crop_name,
          task_count: protocol.task_protocol.length,
          sowing_date: protocol.sowing_date,
          due_date: protocol.due_date,
        });

        protocol.task_protocol.forEach((task, taskIndex) => {
          const status = calculateTaskStatus(
            task,
            protocol.due_date,
            protocol.max_threshold_date,
          );

          // Log locationId extraction for debugging
          console.log(`  🔍 Task ${taskIndex} locationId check:`, {
            taskLocationId: task.locationId,
            propLocationID: locationID,
            willUse: task.locationId || locationID || null,
          });

          const transformedTask = {
            id: task.id,
            protocolName: task.task || task.taskTypeName,
            stageName: task.growthStage || task.growth_stage,
            description: task.notes || '',
            dueDate: dayjs(protocol.due_date).format('DD/MM/YYYY'),
            status,
            completedDate: task.completedOn
              ? dayjs(task.completedOn).format('DD/MM/YYYY')
              : undefined,
            plotCount: 0, // This might need to come from elsewhere
            daysSinceSowing: task.days_of_sowing,
            // Use task's locationId first, fallback to prop locationID
            locationId:
              task.locationId || (locationID ? Number(locationID) : null),
            delayReason: task.delayReason,
          };

          console.log(`  Task ${taskIndex}:`, transformedTask);
          tasks.push(transformedTask);
        });
      });

      console.log(`🌾 Total tasks transformed: ${tasks.length}`);
      return tasks;
    },
    [calculateTaskStatus],
  );

  // Fetch protocols when component mounts or when IDs change
  useEffect(() => {
    console.log('🌾 AgronomyProtocol - Props received:', {
      cropId,
      experimentID,
      locationID,
    });

    if (cropId && experimentID) {
      const queryParams = `crop_id=${cropId}&trial_meta=${experimentID}&protocol_type=agronomy`;
      console.log(
        '🌾 AgronomyProtocol - Fetching with queryParams:',
        queryParams,
      );
      getProtocols({queryParams});
    } else {
      console.log('🌾 AgronomyProtocol - Missing required params:', {
        hasCropId: !!cropId,
        hasExperimentID: !!experimentID,
      });
    }
  }, [cropId, experimentID]);

  // Process API response
  useEffect(() => {
    console.log('🌾 AgronomyProtocol - API Response:', {
      statusCode: protocolsResponse?.status_code,
      hasData: !!protocolsResponse?.data,
      dataLength: protocolsResponse?.data?.length,
      fullResponse: protocolsResponse,
    });

    if (protocolsResponse?.status_code === 200 && protocolsResponse.data) {
      const transformedTasks = transformApiResponse(protocolsResponse);
      console.log('🌾 AgronomyProtocol - Transformed tasks:', transformedTasks);
      setProtocolTasks(transformedTasks);
    }
  }, [protocolsResponse, transformApiResponse]);

  // Log error if any
  useEffect(() => {
    if (protocolsError) {
      console.error('🌾 AgronomyProtocol - API Error:', protocolsError);
    }
  }, [protocolsError]);

  // Handle update task status response
  useEffect(() => {
    console.log('🌾 Update Task Response Changed:', {
      response: updateTaskResponse,
      message: updateTaskResponse?.message,
      isUpdating: isUpdatingTask,
    });

    // API returns a response with message when successful (no status_code field)
    // Check if we have a response and not currently updating
    if (updateTaskResponse && !isUpdatingTask && !updateTaskError) {
      console.log(
        '🌾 AgronomyProtocol - Task updated successfully:',
        updateTaskResponse,
      );

      // Small delay to ensure overlay is fully dismissed before showing toast
      setTimeout(() => {
        // Show success toast
        Toast.success({
          message:
            updateTaskResponse.message ||
            'Task marked as completed successfully!',
        });
      }, 100);

      // Refresh the protocols list to get updated data
      if (cropId && experimentID) {
        const queryParams = `crop_id=${cropId}&trial_meta=${experimentID}&protocol_type=agronomy`;
        console.log(
          '🌾 AgronomyProtocol - Refreshing protocols to show updated data...',
        );
        getProtocols({queryParams});
      }
    }
  }, [
    updateTaskResponse,
    isUpdatingTask,
    updateTaskError,
    cropId,
    experimentID,
  ]);

  // Handle update task status error
  useEffect(() => {
    console.log('🌾 Update Task Error Changed:', {
      error: updateTaskError,
      isUpdating: isUpdatingTask,
    });

    // Only show error toast when request is complete and there's an error
    if (updateTaskError && !isUpdatingTask) {
      console.error(
        '🌾 AgronomyProtocol - Update Task Error:',
        updateTaskError,
      );

      // Small delay to ensure overlay is fully dismissed
      setTimeout(() => {
        Toast.error({
          message:
            updateTaskError?.message ||
            'Failed to update task status. Please try again.',
        });
      }, 100);
    }
  }, [updateTaskError, isUpdatingTask]);

  // Filter tasks based on selected filter
  const filteredTasks = useMemo(() => {
    switch (selectedFilter) {
      case 'pending':
        return protocolTasks.filter(task => task.status === 'pending');
      case 'due_soon':
        return protocolTasks.filter(task => task.status === 'due_soon');
      case 'overdue':
        return protocolTasks.filter(task => task.status === 'overdue');
      default:
        return protocolTasks;
    }
  }, [protocolTasks, selectedFilter]);

  // Group tasks by stage
  const tasksByStage = useMemo(() => {
    const grouped: Record<string, ProtocolTask[]> = {};

    filteredTasks.forEach(task => {
      if (!grouped[task.stageName]) {
        grouped[task.stageName] = [];
      }
      grouped[task.stageName].push(task);
    });

    return grouped;
  }, [filteredTasks]);

  // Calculate progress
  const completedTasksCount = useMemo(
    () => protocolTasks.filter(task => task.status === 'completed').length,
    [protocolTasks],
  );

  // Handlers
  const handleToggleTask = useCallback((taskId: number) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  const handleMarkAsDone = useCallback(
    (taskId: number, delayReason?: string) => {
      // Find the task to get its locationId
      const task = protocolTasks.find(t => t.id === taskId);

      if (!task) {
        console.error('🌾 Task not found:', taskId);
        Toast.error({message: 'Task not found'});
        return;
      }

      console.log('🌾 Marking task as done:', {
        taskId,
        task,
        delayReason: delayReason || 'No delay reason provided',
      });

      // Show confirmation dialog
      Alert.alert(
        'Mark Task as Completed',
        `Are you sure you want to mark "${task.protocolName}" as completed?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Mark as Done',
            onPress: () => {
              console.log('🌾 Task details before payload creation:', {
                taskId: task.id,
                taskLocationId: task.locationId,
                taskLocationIdType: typeof task.locationId,
                propLocationID: locationID,
                propLocationIDType: typeof locationID,
                delayReasonFromInput: delayReason,
              });

              // Prepare payload
              const payload: UpdateTaskStatusPayload = {
                locationId: task.locationId,
                isMarkAsCompleted: true,
                delayReason: delayReason || '', // Use delay reason from input
                completedOn: new Date().toISOString(), // Current timestamp in ISO format
              };

              console.log('🌾 Updating task status with payload:', payload);
              console.log('🌾 Task ID for path params:', taskId);
              console.log('🌾 Full task object:', task);
              console.log(
                '🌾 Complete URL will be:',
                `${URL.TASK_STATUS}/${taskId}/`,
              );

              // Call PUT API
              updateTaskStatus({
                pathParams: taskId.toString(),
                payload: payload as unknown as Record<string, unknown>,
              });
            },
          },
        ],
      );
    },
    [protocolTasks, updateTaskStatus, locationID],
  );

  const handleFilterChange = useCallback(
    (filter: 'all' | 'pending' | 'due_soon' | 'overdue') => {
      setSelectedFilter(filter);
    },
    [],
  );

  // Skeleton loader component
  const SkeletonLoader = () => {
    const skeletonColors = resolveSkeletonPalette(
      COLORS.APP.BACKGROUND_COLOR || '#FFFFFF',
    );

    return (
      <View style={styles.skeletonContainer}>
        {/* Progress Skeleton */}
        <View style={styles.skeletonSection}>
          <SkeletonBlock height={100} colors={skeletonColors} />
        </View>

        {/* Filters Skeleton */}
        <View style={styles.skeletonFilters}>
          <SkeletonBlock height={36} width={70} colors={skeletonColors} />
          <SkeletonBlock height={36} width={90} colors={skeletonColors} />
          <SkeletonBlock height={36} width={80} colors={skeletonColors} />
          <SkeletonBlock height={36} width={85} colors={skeletonColors} />
        </View>

        {/* Task Cards Skeleton */}
        {[1, 2, 3].map(index => (
          <View key={index} style={styles.skeletonCard}>
            <View style={styles.skeletonCardHeader}>
              <SkeletonBlock height={20} width="70%" colors={skeletonColors} />
              <SkeletonBlock height={20} width={60} colors={skeletonColors} />
            </View>
            <View style={styles.skeletonCardBody}>
              <SkeletonBlock height={16} width="90%" colors={skeletonColors} />
              <SkeletonBlock
                height={16}
                width="60%"
                colors={skeletonColors}
                style={styles.skeletonSpacing}
              />
            </View>
            <View style={styles.skeletonCardFooter}>
              <SkeletonBlock height={14} width={120} colors={skeletonColors} />
              <SkeletonBlock height={14} width={80} colors={skeletonColors} />
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>
      {/* Missing Parameters State */}
      {(!cropId || !experimentID) && !isLoadingProtocols && (
        <View style={styles.emptyContainer}>
          <Text
            style={[
              styles.emptyTitle,
              {
                fontFamily: FONTS.MEDIUM,
                color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
              },
            ]}>
            Configuration Required
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              {
                fontFamily: FONTS.REGULAR,
                color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
              },
            ]}>
            Missing required experiment or crop information
          </Text>
        </View>
      )}

      {/* Skeleton Loading State */}
      {isLoadingProtocols && <SkeletonLoader />}

      {/* Error State */}
      {protocolsError && !isLoadingProtocols && (
        <View style={styles.emptyContainer}>
          <Text
            style={[
              styles.emptyTitle,
              {
                fontFamily: FONTS.MEDIUM,
                color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
              },
            ]}>
            Failed to load protocols
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              {
                fontFamily: FONTS.REGULAR,
                color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
              },
            ]}>
            Please try again later
          </Text>
        </View>
      )}

      {/* Empty State - No data from API */}
      {!isLoadingProtocols && !protocolsError && protocolTasks.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text
            style={[
              styles.emptyTitle,
              {
                fontFamily: FONTS.MEDIUM,
                color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
              },
            ]}>
            No Protocols Available
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              {
                fontFamily: FONTS.REGULAR,
                color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
              },
            ]}>
            No agronomy protocols found for this experiment
          </Text>
        </View>
      )}

      {/* Content - Only show when we have data */}
      {!isLoadingProtocols && protocolTasks.length > 0 && (
        <>
          {/* Protocol Progress */}
          <ProtocolProgress
            totalTasks={protocolTasks.length}
            completedTasks={completedTasksCount}
          />

          {/* Quick Filters */}
          <ProtocolQuickFilters
            selectedFilter={selectedFilter}
            onFilterChange={handleFilterChange}
          />

          {/* Filtered Empty State */}
          {filteredTasks.length === 0 && (
            <View style={styles.filteredEmptyContainer}>
              <Text
                style={[
                  styles.filteredEmptyText,
                  {
                    fontFamily: FONTS.REGULAR,
                    color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
                  },
                ]}>
                No tasks match the selected filter.
              </Text>
            </View>
          )}

          {/* Stage Groups */}
          {Object.keys(tasksByStage).map(stageName => (
            <ProtocolStageGroup
              key={stageName}
              stageName={stageName}
              tasks={tasksByStage[stageName]}
              expandedTasks={expandedTasks}
              onToggleTask={handleToggleTask}
              onMarkAsDone={handleMarkAsDone}
            />
          ))}

          {/* Bottom spacing */}
          <View style={styles.bottomSpacer} />
        </>
      )}

      {/* Overlay Loader for Updating Task */}
      <OverlayLoader isModalVisible={isUpdatingTask} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  filteredEmptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  filteredEmptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
  // Skeleton loader styles
  skeletonContainer: {
    padding: 0,
  },
  skeletonSection: {
    marginBottom: 20,
  },
  skeletonFilters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  skeletonCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonCardBody: {
    marginBottom: 12,
  },
  skeletonSpacing: {
    marginTop: 8,
  },
  skeletonCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default AgronomyProtocol;
