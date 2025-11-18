import React, {useState} from 'react';
import {View, Pressable, StyleSheet, Animated, TextInput} from 'react-native';
import {Text, Button} from '..';
import useTheme from '../../theme/hooks/useTheme';
import {ProtocolAccordionProps} from '../../types/components/AgronomyProtocol';

/**
 * ProtocolAccordion Component
 *
 * Displays an individual protocol task in an expandable accordion format.
 * Shows task details including description, due date, and status.
 * Includes "Mark as Done" button for completing tasks.
 *
 * @component
 * @example
 * <ProtocolAccordion
 *   task={taskData}
 *   index={0}
 *   isExpanded={true}
 *   onToggle={() => {}}
 *   onMarkAsDone={(id) => {}}
 * />
 */
const ProtocolAccordion: React.FC<ProtocolAccordionProps> = ({
  task,
  index,
  isExpanded,
  onToggle,
  onMarkAsDone,
}) => {
  const {COLORS, FONTS} = useTheme();
  const animatedHeight = React.useRef(new Animated.Value(0)).current;
  const [delayReason, setDelayReason] = useState('');

  React.useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, animatedHeight]);

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
        return '#4CAF50'; // Green
      case 'overdue':
        return '#FF5252'; // Red
      case 'due_soon':
        return '#FFA726'; // Orange
      default:
        return '#BDBDBD'; // Gray
    }
  };

  const getStatusLabel = () => {
    switch (task.status) {
      case 'completed':
        return '✓ Completed';
      case 'overdue':
        return '⚠ Overdue';
      case 'due_soon':
        return '⏰ Due Soon';
      default:
        return '○ Pending';
    }
  };

  const contentHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500], // Increased height to accommodate delay reason input
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: COLORS.COMPONENTS.INPUT.BACKGROUND_COLOR,
          borderLeftColor: getStatusColor(),
        },
      ]}>
      {/* Header */}
      <Pressable style={styles.header} onPress={onToggle}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.numberBadge,
              {backgroundColor: COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR},
            ]}>
            <Text
              style={[
                styles.numberText,
                {
                  fontFamily: FONTS.BOLD,
                  color: COLORS.COMPONENTS.BUTTON.TEXT_COLOR,
                },
              ]}>
              {index + 1}
            </Text>
          </View>
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.protocolName,
                {
                  fontFamily: FONTS.SEMI_BOLD,
                  color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
                },
              ]}
              numberOfLines={1}>
              {task.protocolName}
            </Text>
            <Text
              style={[
                styles.statusLabel,
                {
                  fontFamily: FONTS.REGULAR,
                  color: getStatusColor(),
                },
              ]}>
              {getStatusLabel()}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.expandIcon,
            {color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR},
          ]}>
          {isExpanded ? '▲' : '▼'}
        </Text>
      </Pressable>

      {/* Expandable Content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            maxHeight: contentHeight,
            opacity: animatedHeight,
          },
        ]}>
        <View style={styles.content}>
          {/* Description */}
          <View style={styles.infoRow}>
            <Text
              style={[
                styles.label,
                {
                  fontFamily: FONTS.SEMI_BOLD,
                  color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
                },
              ]}>
              Description:
            </Text>
            <Text
              style={[
                styles.value,
                {
                  fontFamily: FONTS.REGULAR,
                  color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
                },
              ]}>
              {task.description}
            </Text>
          </View>

          {/* Due Date */}
          <View style={styles.infoRow}>
            <Text
              style={[
                styles.label,
                {
                  fontFamily: FONTS.SEMI_BOLD,
                  color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
                },
              ]}>
              Due Date:
            </Text>
            <Text
              style={[
                styles.value,
                {
                  fontFamily: FONTS.REGULAR,
                  color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
                },
              ]}>
              {task.dueDate}
              {task.daysSinceSowing && ` (DAS: +${task.daysSinceSowing})`}
            </Text>
          </View>

          {/* Plot Count */}
          <View style={styles.infoRow}>
            <Text
              style={[
                styles.label,
                {
                  fontFamily: FONTS.SEMI_BOLD,
                  color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
                },
              ]}>
              Plots:
            </Text>
            <Text
              style={[
                styles.value,
                {
                  fontFamily: FONTS.REGULAR,
                  color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
                },
              ]}>
              {task.plotCount} plots
            </Text>
          </View>

          {/* Completion Date (if completed) */}
          {task.status === 'completed' && task.completedDate && (
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.label,
                  {
                    fontFamily: FONTS.SEMI_BOLD,
                    color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
                  },
                ]}>
                Completed:
              </Text>
              <Text
                style={[
                  styles.value,
                  {
                    fontFamily: FONTS.REGULAR,
                    color: '#4CAF50',
                  },
                ]}>
                {task.completedDate}
              </Text>
            </View>
          )}

          {/* Delay Reason (if completed and has delay reason) */}
          {task.status === 'completed' && task.delayReason && (
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.label,
                  {
                    fontFamily: FONTS.SEMI_BOLD,
                    color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
                  },
                ]}>
                Delay Reason:
              </Text>
              <Text
                style={[
                  styles.value,
                  {
                    fontFamily: FONTS.REGULAR,
                    color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
                  },
                ]}>
                {task.delayReason}
              </Text>
            </View>
          )}

          {/* Delay Reason Input and Mark as Done Button - Only for non-completed tasks */}
          {task.status !== 'completed' && (
            <View style={styles.actionContainer}>
              {/* Show delay reason input only for overdue tasks */}
              {task.status === 'overdue' && (
                <View style={styles.delayReasonContainer}>
                  <Text
                    style={[
                      styles.delayReasonLabel,
                      {
                        fontFamily: FONTS.SEMI_BOLD,
                        color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
                      },
                    ]}>
                    Reason for Delay:
                  </Text>
                  <TextInput
                    style={[
                      styles.delayReasonInput,
                      {
                        fontFamily: FONTS.REGULAR,
                        color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
                        borderColor: '#D0D0D0', // More visible gray border
                        backgroundColor: '#FFFFFF', // White background for better contrast
                      },
                    ]}
                    placeholder="Enter reason for delay (optional)"
                    placeholderTextColor={
                      COLORS.COMPONENTS.TEXT.SECONDARY_COLOR
                    }
                    value={delayReason}
                    onChangeText={setDelayReason}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              )}

              <View style={styles.buttonContainer}>
                <Button
                  title="Mark as Done"
                  onPress={() => onMarkAsDone(task.id, delayReason)}
                  containerStyle={[
                    styles.button,
                    {backgroundColor: COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR},
                  ]}
                />
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 16,
  },
  titleContainer: {
    flex: 1,
    gap: 4,
  },
  protocolName: {
    fontSize: 16,
  },
  statusLabel: {
    fontSize: 12,
  },
  expandIcon: {
    fontSize: 14,
    marginLeft: 8,
  },
  contentContainer: {
    overflow: 'hidden',
  },
  content: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  infoRow: {
    gap: 4,
  },
  label: {
    fontSize: 13,
  },
  value: {
    fontSize: 14,
  },
  actionContainer: {
    gap: 12,
    marginTop: 4,
    paddingBottom: 4,
  },
  delayReasonContainer: {
    gap: 8,
  },
  delayReasonLabel: {
    fontSize: 13,
  },
  delayReasonInput: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 12,
    paddingTop: 12,
    minHeight: 90,
    maxHeight: 120,
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 4,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
  },
});

export default ProtocolAccordion;
