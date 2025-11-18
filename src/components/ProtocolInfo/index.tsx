import React from 'react';
import {View, Text, Dimensions} from 'react-native';
import {styles} from './styles';
import {ProtocolInfoProps as IProtocolInfoProps} from './types';

const ProtocolInfo: React.FC<IProtocolInfoProps> = ({
  stageName,
  dateOfSowing,
  dueDate,
}) => {
  const {width: screenWidth} = Dimensions.get('window');

  // Debug logging for ProtocolInfo component

  // Calculate responsive font sizes based on screen width
  const getResponsiveFontSize = (baseSize: number): number => {
    const scale = screenWidth / 430; // Base scale from iPhone 14 Pro Max width
    const scaledSize = baseSize * scale;

    // Ensure fonts are smaller for compact single-row layout
    return Math.max(scaledSize * 0.85, 9); // Reduced by 15% and minimum 9px
  };
  // Function to get due date color based on proximity to current date
  const getDueDateColor = (dueDateStr?: string): string => {
    if (!dueDateStr) return '#999'; // gray for no date

    try {
      let dueDate: Date;

      // Parse the due date with multiple format support
      if (dueDateStr.includes('T') && dueDateStr.includes('Z')) {
        // ISO 8601 format with timezone (e.g., "2025-09-23T18:30:00Z")
        dueDate = new Date(dueDateStr);
      } else if (dueDateStr.includes('/')) {
        // DD/MM/YYYY format
        const [day, month, year] = dueDateStr.split('/').map(Number);
        dueDate = new Date(year, month - 1, day);
      } else if (dueDateStr.includes('-')) {
        // YYYY-MM-DD or DD-MM-YYYY format
        const parts = dueDateStr.split('-').map(Number);
        if (parts[0] > 31) {
          // YYYY-MM-DD format
          dueDate = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
          // DD-MM-YYYY format
          dueDate = new Date(parts[2], parts[1] - 1, parts[0]);
        }
      } else {
        // Try to parse as is
        dueDate = new Date(dueDateStr);
      }

      // Check if date is valid
      if (isNaN(dueDate.getTime())) {
        return '#999'; // fallback to gray
      }

      const currentDate = new Date();
      // Set time to start of day for accurate day comparison
      currentDate.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);

      // Calculate difference in days
      const timeDiff = dueDate.getTime() - currentDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff < 0) {
        // Overdue - red
        return '#E53E3E';
      } else if (daysDiff <= 3) {
        // Due soon (3 days or less) - yellow/orange
        return '#D69E2E';
      } else {
        // Due later - green
        return '#38A169';
      }
    } catch (error) {
      return '#999'; // fallback to gray
    }
  };

  // Function to format date for display (compact for single row)
  const formatDateForDisplay = (dateStr?: string): string => {
    if (!dateStr) return '-';

    try {
      // Handle various date formats
      let date: Date;

      if (dateStr.includes('T') && dateStr.includes('Z')) {
        // ISO 8601 format with timezone (e.g., "2025-09-23T18:30:00Z")
        date = new Date(dateStr);
      } else if (dateStr.includes('/')) {
        // DD/MM/YYYY format
        const [day, month, year] = dateStr.split('/').map(Number);
        date = new Date(year, month - 1, day);
      } else if (dateStr.includes('-')) {
        // YYYY-MM-DD or DD-MM-YYYY format
        const parts = dateStr.split('-').map(Number);
        if (parts[0] > 31) {
          // YYYY-MM-DD format
          date = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
          // DD-MM-YYYY format
          date = new Date(parts[2], parts[1] - 1, parts[0]);
        }
      } else {
        // Try to parse as is
        date = new Date(dateStr);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '-'; // Return dash if can't parse
      }

      // Compact format for single row: "18 Mar" (no year to save space)
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const day = date.getDate();
      const month = months[date.getMonth()];

      return `${day} ${month}`;
    } catch (error) {
      return '-';
    }
  };

  // Function to format due date with "Due:" prefix (compact)
  const formatDueDate = (dateStr?: string): string => {
    if (!dateStr) return '-';
    const formattedDate = formatDateForDisplay(dateStr);
    return formattedDate && formattedDate !== '-'
      ? `Due: ${formattedDate}`
      : '-';
  };

  // Don't render if no data is provided at all
  if (!stageName && !dateOfSowing && !dueDate) {
    return null;
  }


  // Count available data fields to determine layout
  const availableFields = [stageName, dateOfSowing, dueDate].filter(
    Boolean,
  ).length;
  const isSingleField = availableFields === 1;


  return (
    <View
      style={[
        styles.container,
        isSingleField ? styles.centeredContainer : styles.fullWidthContainer,
      ]}>
      {/* Single row for all protocol info with dynamic sizing */}
      <View
        style={[
          styles.singleRow,
          isSingleField ? styles.singleFieldRow : styles.multipleFieldsRow,
        ]}>
        {/* Stage name - conditionally render */}
        {stageName && (
          <View
            style={[
              styles.compactStageContainer,
              isSingleField && styles.singleFieldStageContainer,
            ]}>
            <Text
              style={[
                styles.compactStageText,
                {
                  fontSize: isSingleField
                    ? getResponsiveFontSize(16)
                    : getResponsiveFontSize(18),
                },
              ]}
              numberOfLines={isSingleField ? 2 : 1}
              adjustsFontSizeToFit={!isSingleField}
              minimumFontScale={isSingleField ? 1.0 : 0.8}>
              {stageName}
            </Text>
          </View>
        )}

        {/* Date of sowing - conditionally render */}
        {dateOfSowing && (
          <View
            style={[
              styles.compactSowingContainer,
              isSingleField && styles.singleFieldSowingContainer,
            ]}>
            <Text
              style={[
                styles.compactSowingLabel,
                {
                  fontSize: isSingleField
                    ? getResponsiveFontSize(16)
                    : getResponsiveFontSize(18),
                },
              ]}
              numberOfLines={1}>
              DOS:
            </Text>
            <Text
              style={[
                styles.compactSowingText,
                {
                  fontSize: isSingleField
                    ? getResponsiveFontSize(16)
                    : getResponsiveFontSize(18),
                },
              ]}
              numberOfLines={isSingleField ? 2 : 1}
              adjustsFontSizeToFit={!isSingleField}
              minimumFontScale={isSingleField ? 1.0 : 0.7}>
              {formatDateForDisplay(dateOfSowing)}
            </Text>
          </View>
        )}

        {/* Due date - conditionally render */}
        {dueDate && (
          <View
            style={[
              styles.compactDueDateContainer,
              {backgroundColor: getDueDateColor(dueDate) + '15'}, // Add transparency
              isSingleField && styles.singleFieldDueDateContainer,
            ]}>
            <View
              style={[
                styles.compactDueDateDot,
                {backgroundColor: getDueDateColor(dueDate)},
              ]}
            />
            <Text
              style={[
                styles.compactDueDateText,
                {
                  color: getDueDateColor(dueDate),
                  fontSize: isSingleField
                    ? getResponsiveFontSize(15)
                    : getResponsiveFontSize(16),
                },
              ]}
              numberOfLines={isSingleField ? 2 : 1}
              adjustsFontSizeToFit={!isSingleField}
              minimumFontScale={isSingleField ? 1.0 : 0.7}>
              {formatDueDate(dueDate)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ProtocolInfo;
