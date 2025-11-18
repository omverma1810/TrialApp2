import {StyleSheet, Dimensions} from 'react-native';
import {FONTS} from '../../../../theme/fonts';

// Get screen dimensions
const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Calculate responsive values
const getResponsiveSpacing = () => {
  // Base values for medium screens
  let horizontalMargin = 16;
  let contentPadding = 12;

  // Adjust for smaller screens
  if (SCREEN_WIDTH < 360) {
    horizontalMargin = 8;
    contentPadding = 8;
  }
  // Adjust for larger screens
  else if (SCREEN_WIDTH >= 768) {
    horizontalMargin = 24;
    contentPadding = 16;
  }

  return {horizontalMargin, contentPadding};
};

const {horizontalMargin, contentPadding} = getResponsiveSpacing();

export default StyleSheet.create({
  navigatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 5,
    // REMOVED: paddingHorizontal was here, removing it lets the arrows touch the edges.
    marginHorizontal: 0,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    height: 'auto',
  },
  navigatorContainerLarge: {
    paddingVertical: 16,
    borderRadius: 16,
  },
  navigatorContainerSmall: {
    paddingVertical: 8,
    // REMOVED: paddingHorizontal was here.
    borderRadius: 8,
  },
  arrowButton: {
    padding: 12, // This padding gives the icon space and increases the touch target.
    borderRadius: 24,
    alignItems: 'center',
  },
  arrowButtonSmall: {
    padding: 8,
    borderRadius: 16,
  },
  details: {
    alignItems: 'center',
    flex: 1,
    // The padding is kept here to prevent the text from touching the arrows.
    paddingHorizontal: contentPadding,
  },
  detailsLarge: {
    paddingHorizontal: 24,
  },
  plotCode: {
    fontFamily: FONTS.BOLD,
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  plotCodeLarge: {
    fontSize: 20,
    marginBottom: 6,
  },
  plotCodeSmall: {
    fontSize: 14,
    marginBottom: 2,
  },
  rowColContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  rowColText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
    color: '#444',
  },
  rowColTextLarge: {
    fontSize: 16,
  },
  rowColTextSmall: {
    fontSize: 12,
  },
  colText: {
    marginLeft: 12,
  },
});
