import {StyleSheet} from 'react-native';
import {FONTS} from '../../../../theme/fonts';

// pastel backgrounds & matching text colors, same as Notes badges
const palette = {
  successBg: '#E6F7E8',
  successText: '#097C34',
  warningBg: '#FFF6E0',
  warningText: '#B98F00',
  errorBg: '#FFEAEA',
  errorText: '#C53030',
  border: '#F7F7F7',
  heading: '#161616',
  accent: '#1A6DD2', // Stronger blue accent color for left border
};

export default StyleSheet.create({
  container: {
    padding: 5,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: palette.heading,
    marginBottom: 8,
  },

  projectCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: palette.border,
    borderRightColor: palette.border,
    borderBottomColor: palette.border,
    borderLeftWidth: 6,
    borderLeftColor: palette.accent,
    marginBottom: 10,
    overflow: 'hidden', // Ensures border radius works properly with left border
  },

  tagContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
  },

  // container colors
  badgeSuccess: {backgroundColor: palette.successBg},
  badgeWarning: {backgroundColor: palette.warningBg},
  badgeError: {backgroundColor: palette.errorBg},

  // text colors
  badgeTextSuccess: {color: palette.successText},
  badgeTextWarning: {color: palette.warningText},
  badgeTextError: {color: palette.errorText},

  projectCode: {
    fontSize: 15,
    fontFamily: FONTS.MEDIUM,
    color: palette.heading,
  },

  // Loading states
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: palette.heading,
    marginLeft: 8,
  },

  // Error states
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: palette.errorText,
  },

  // No data states
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noDataText: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: palette.heading,
    marginBottom: 4,
  },
  noDataSubText: {
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
    color: '#888',
    textAlign: 'center',
  },

  // Refresh indicator styles
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  refreshText: {
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    color: '#1A6DD2',
    marginLeft: 8,
  },
});
