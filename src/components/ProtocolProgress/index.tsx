import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from '..';
import useTheme from '../../theme/hooks/useTheme';
import {ProtocolProgressProps} from '../../types/components/AgronomyProtocol';

/**
 * ProtocolProgress Component
 *
 * Displays a progress bar showing the completion status of agronomy protocols.
 * Shows visual progress with percentage and task count.
 *
 * @component
 * @example
 * <ProtocolProgress totalTasks={5} completedTasks={2} />
 */
const ProtocolProgress: React.FC<ProtocolProgressProps> = ({
  totalTasks,
  completedTasks,
}) => {
  const {COLORS, FONTS} = useTheme();

  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: COLORS.COMPONENTS.INPUT.BACKGROUND_COLOR},
      ]}>
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              fontFamily: FONTS.SEMI_BOLD,
              color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
            },
          ]}>
          Agronomy Tasks
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              fontFamily: FONTS.REGULAR,
              color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
            },
          ]}>
          {completedTasks}/{totalTasks} Done
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarBackground,
            {backgroundColor: COLORS.COMPONENTS.INPUT.INACTIVE_BORDER_COLOR},
          ]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: '#4CAF50', // Green for completed
              },
            ]}
          />
        </View>
        <Text
          style={[
            styles.percentageText,
            {
              fontFamily: FONTS.SEMI_BOLD,
              color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
            },
          ]}>
          {progressPercentage}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
  },
  subtitle: {
    fontSize: 14,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 16,
    minWidth: 45,
    textAlign: 'right',
  },
});

export default ProtocolProgress;
