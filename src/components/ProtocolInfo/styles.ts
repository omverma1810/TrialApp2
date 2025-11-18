import {StyleSheet, Dimensions, PixelRatio} from 'react-native';
import {FONTS} from '../../theme/fonts';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Font scale function
const scaleFont = (size: number) => {
  const scale = SCREEN_WIDTH / 375; // base scale from iPhone 11 width
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Responsive paddings
const getResponsiveSpacing = () => {
  let horizontalMargin = 16;
  let contentPadding = 12;

  if (SCREEN_WIDTH < 360) {
    horizontalMargin = 8;
    contentPadding = 8;
  } else if (SCREEN_WIDTH >= 768) {
    horizontalMargin = 24;
    contentPadding = 16;
  }

  return {horizontalMargin, contentPadding};
};

const {horizontalMargin, contentPadding} = getResponsiveSpacing();

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: horizontalMargin,
    marginVertical: 6, // Reduced from 8
    padding: contentPadding * 0.8, // Reduced padding for compact design
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    overflow: 'hidden',
  },
  // Centered container for single field
  centeredContainer: {
    alignSelf: 'center',
  },
  // Full width container for multiple fields
  fullWidthContainer: {
    alignSelf: 'stretch',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stageContainer: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  stageText: {
    fontSize: scaleFont(13),
    fontFamily: FONTS.SEMI_BOLD,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sowingDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sowingDateLabel: {
    fontSize: scaleFont(12),
    fontFamily: FONTS.MEDIUM,
    color: '#6C757D',
    marginRight: 4,
  },
  sowingDateText: {
    fontSize: scaleFont(12),
    fontFamily: FONTS.SEMI_BOLD,
    color: '#495057',
  },
  dueDateRow: {
    alignItems: 'flex-start',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  dueDateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dueDateText: {
    fontSize: scaleFont(12),
    fontFamily: FONTS.SEMI_BOLD,
  },
  // Single row layout styles for production-level compact design
  singleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap', // Prevent wrapping to maintain single line
    gap: 6, // Reduced gap for compact layout
    minHeight: 28, // Reduced height for compact design
  },
  // Single field row (centered)
  singleFieldRow: {
    justifyContent: 'center',
    gap: 0,
  },
  // Multiple fields row (distributed)
  multipleFieldsRow: {
    justifyContent: 'space-between',
    gap: 6,
  },
  // Compact stage container
  compactStageContainer: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    minWidth: 60,
    maxWidth: '25%',
    alignItems: 'center',
    flexShrink: 0,
  },
  // Single field stage container (no width restrictions)
  singleFieldStageContainer: {
    maxWidth: undefined,
    minWidth: 100,
    paddingHorizontal: 12, // More padding for better text display
  },
  compactStageText: {
    fontFamily: FONTS.SEMI_BOLD,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Compact sowing date container
  compactSowingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 4,
    maxWidth: '40%',
  },
  // Single field sowing container (no width restrictions)
  singleFieldSowingContainer: {
    flex: 0,
    maxWidth: undefined,
    paddingHorizontal: 8, // More padding for better spacing
  },
  compactSowingLabel: {
    fontFamily: FONTS.MEDIUM,
    color: '#6C757D',
    marginRight: 3,
    flexShrink: 0,
  },
  compactSowingText: {
    fontFamily: FONTS.SEMI_BOLD,
    color: '#495057',
    flexShrink: 1,
  },
  // Compact due date container
  compactDueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0,
    maxWidth: '30%',
  },
  // Single field due date container (no width restrictions)
  singleFieldDueDateContainer: {
    maxWidth: undefined,
    paddingHorizontal: 8, // More padding for better display
  },
  compactDueDateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  compactDueDateText: {
    fontFamily: FONTS.SEMI_BOLD,
    flexShrink: 1,
  },
});
