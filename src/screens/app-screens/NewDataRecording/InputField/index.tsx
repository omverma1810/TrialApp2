import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import dayjs from 'dayjs';
// Extend dayjs with customParseFormat for strict DD/MM/YYYY parsing
// eslint-disable-next-line @typescript-eslint/no-var-requires
const customParseFormat = require('dayjs/plugin/customParseFormat');
if (!(dayjs as any)._inputFieldDate) {
  dayjs.extend(customParseFormat);
  (dayjs as any)._inputFieldDate = true;
}

export type DataType = 'str' | 'int' | 'float' | 'fixed' | 'date' | 'binary';

interface InputFieldProps {
  value?: string | number | boolean | Date | null;
  dataType: DataType;
  decimals?: number;
}

const InputField: React.FC<InputFieldProps> = ({
  value,
  dataType,
  decimals = 2,
}) => {
  // Get screen dimensions for responsive sizing
  const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

  // Enhanced screen size detection for better Samsung Galaxy support
  const isLargeScreen = SCREEN_WIDTH >= 768;
  const isSmallScreen = SCREEN_WIDTH < 400; // Better threshold for Samsung Galaxy devices
  const isVerySmallScreen = SCREEN_WIDTH < 360;
  const isSamsungGalaxySize = SCREEN_WIDTH >= 360 && SCREEN_WIDTH <= 430; // Common Samsung Galaxy range
  const isHighResolution = SCREEN_HEIGHT >= 2000; // High-res displays like Samsung Galaxy S21

  const formatValue = (): string => {
    if (value == null) return '\u00A0'; // Non-breaking space to maintain height

    if (
      dataType === 'str' ||
      dataType === 'int' ||
      dataType === 'float' ||
      dataType === 'fixed'
    ) {
      const stringValue = String(value);
      return stringValue.trim() === '' ? '\u00A0' : stringValue; // Use non-breaking space for empty strings
    }

    if (dataType === 'date') {
      // Normalise a successfully parsed dayjs instance to DD/MM/YYYY
      const normalize = (d: dayjs.Dayjs | null): string =>
        d && d.isValid() ? d.format('DD/MM/YYYY') : '\u00A0'; // Use non-breaking space instead of empty string

      // Accept Date instance directly
      if (value instanceof Date) {
        return isNaN(value.getTime()) ? '' : normalize(dayjs(value));
      }

      // Numbers (unix ms)
      if (typeof value === 'number') {
        return normalize(dayjs(value));
      }

      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '' || /invalid date/i.test(trimmed)) return '\u00A0'; // Use non-breaking space instead of empty string

        // Quick exact matches first
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
          return normalize(dayjs(trimmed, 'DD/MM/YYYY', true));
        }
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
          // Allow single-digit day/month, still strict on year
          return normalize(dayjs(trimmed, 'D/M/YYYY', true));
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
          return normalize(dayjs(trimmed, 'YYYY-MM-DD', true));
        }

        // Accept DD/MM/YYYY with time components (HH:mm[:ss])
        const timePatterns = [
          'DD/MM/YYYY HH:mm:ss',
          'DD/MM/YYYY HH:mm',
          'D/M/YYYY HH:mm:ss',
          'D/M/YYYY HH:mm',
        ];
        for (const p of timePatterns) {
          const parsed = dayjs(trimmed, p, true);
          if (parsed.isValid()) return normalize(parsed);
        }

        // ISO / RFC3339 / other common forms
        if (/T/.test(trimmed) || /Z$/.test(trimmed)) {
          const iso = dayjs(trimmed);
          if (iso.isValid()) return normalize(iso);
        }

        // Generic fallback parse (last resort). If invalid, show nothing.
        const generic = dayjs(trimmed);
        return generic.isValid() ? normalize(generic) : '\u00A0'; // Use non-breaking space instead of empty string
      }

      return '\u00A0'; // Use non-breaking space instead of empty string
    }

    if (dataType === 'binary') {
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (typeof value === 'number')
        return value === 1 ? 'Yes' : value === 0 ? 'No' : String(value);
      if (value === '1') return 'Yes';
      if (value === '0') return 'No';
      return String(value);
    }

    return String(value);
  };

  // Calculate responsive dimensions
  const getResponsiveDimensions = () => {
    let width: string | number = '90%';
    let maxWidth: string | number = 600;
    let paddingVertical = 16;
    let marginVertical = 10;
    let borderRadius = 10;
    let minHeight = 60; // Minimum height to ensure consistency

    if (isVerySmallScreen) {
      width = '95%';
      maxWidth = 320;
      paddingVertical = 14;
      marginVertical = 4;
      borderRadius = 8;
      minHeight = 50;
    } else if (isSmallScreen || isSamsungGalaxySize) {
      width = '92%';
      maxWidth = 400;
      paddingVertical = 16;
      marginVertical = 6;
      borderRadius = 9;
      minHeight = 55;
    } else if (isLargeScreen) {
      width = '85%';
      maxWidth = 800;
      paddingVertical = 20;
      marginVertical = 12;
      borderRadius = 12;
      minHeight = 80;
    }

    // Adjust for high-resolution displays
    if (isHighResolution && !isLargeScreen) {
      paddingVertical = Math.max(paddingVertical, 16);
      marginVertical = Math.max(marginVertical - 2, 4);
      minHeight = Math.max(minHeight + 5, 60);
    }

    return {
      width,
      maxWidth,
      paddingVertical,
      marginVertical,
      borderRadius,
      minHeight,
    };
  };

  // Calculate responsive font size
  const getResponsiveFontSize = () => {
    let fontSize = 32;

    if (isVerySmallScreen) {
      fontSize = 22;
    } else if (isSmallScreen) {
      fontSize = 26;
    } else if (isSamsungGalaxySize) {
      fontSize = 28;
    } else if (isLargeScreen) {
      fontSize = 40;
    }

    // Adjust for high-resolution displays
    if (isHighResolution && !isLargeScreen) {
      fontSize = Math.min(fontSize + 2, 32);
    }

    return fontSize;
  };

  const dimensions = getResponsiveDimensions();
  const fontSize = getResponsiveFontSize();

  return (
    <View
      style={[
        styles.cardContainer,
        {
          width: dimensions.width as number | `${number}%`,
          maxWidth: dimensions.maxWidth as number | `${number}%`,
          paddingVertical: dimensions.paddingVertical,
          paddingHorizontal: 12,
          minHeight: dimensions.minHeight,
          borderRadius: dimensions.borderRadius,
        },
      ]}>
      <Text
        style={[
          styles.valueText,
          {
            fontSize: fontSize,
          },
        ]}
        numberOfLines={2}
        adjustsFontSizeToFit={isSmallScreen || isSamsungGalaxySize}
        minimumFontScale={0.7}>
        {formatValue()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignSelf: 'center',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    // Fixed positioning to ensure consistent layout
    display: 'flex',
    flexDirection: 'column',
    // Remove any flex properties that could cause size changes
  },
  valueText: {
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    // Ensure text doesn't affect container size
    flex: 0,
    flexShrink: 0,
    // Remove fixed fontSize - it's now calculated dynamically
  },
});

export default InputField;
