import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from '..';
import useTheme from '../../theme/hooks/useTheme';
import ProtocolAccordion from '../ProtocolAccordion';
import {ProtocolStageGroupProps} from '../../types/components/AgronomyProtocol';

/**
 * ProtocolStageGroup Component
 *
 * Groups protocol tasks by their stage name and displays them in accordions.
 * Provides a collapsible section for each growth stage.
 *
 * @component
 * @example
 * <ProtocolStageGroup
 *   stageName="Pre-Sowing"
 *   tasks={tasks}
 *   expandedTasks={expandedSet}
 *   onToggleTask={(id) => {}}
 *   onMarkAsDone={(id) => {}}
 * />
 */
const ProtocolStageGroup: React.FC<ProtocolStageGroupProps> = ({
  stageName,
  tasks,
  expandedTasks,
  onToggleTask,
  onMarkAsDone,
}) => {
  const {COLORS, FONTS} = useTheme();

  if (tasks.length === 0) {
    return null;
  }

  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <View style={styles.container}>
      {/* Stage Header */}
      <View
        style={[
          styles.stageHeader,
          {
            backgroundColor: 'transparent',
            borderLeftColor: COLORS.APP.PRIMARY_COLOR,
          },
        ]}>
        <Text
          style={[
            styles.stageName,
            {
              fontFamily: FONTS.BOLD,
              color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
            },
          ]}>
          {stageName}
        </Text>
        <Text
          style={[
            styles.taskCount,
            {
              fontFamily: FONTS.MEDIUM,
              color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
            },
          ]}>
          {completedCount}/{tasks.length} tasks
        </Text>
      </View>

      {/* Task Accordions */}
      <View style={styles.tasksContainer}>
        {tasks.map((task, index) => (
          <ProtocolAccordion
            key={task.id}
            task={task}
            index={index}
            isExpanded={expandedTasks.has(task.id)}
            onToggle={() => onToggleTask(task.id)}
            onMarkAsDone={onMarkAsDone}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingLeft: 20,
    borderRadius: 0,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  stageName: {
    fontSize: 18,
  },
  taskCount: {
    fontSize: 14,
  },
  tasksContainer: {
    gap: 0,
  },
});

export default ProtocolStageGroup;
