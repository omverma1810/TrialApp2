import {StyleSheet, Dimensions, PixelRatio} from 'react-native';
import {FONTS} from '../../../../theme/fonts';

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
    marginVertical: -5,
    paddingVertical: 30,
    paddingHorizontal: contentPadding,
  },
  arrowContainer: {
    width: 30,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  traitBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: contentPadding,
    maxWidth: SCREEN_WIDTH * 0.7,
  },
  traitText: {
    fontSize: scaleFont(14),
    fontFamily: FONTS.BOLD,
    color: '#333',
    textAlign: 'center',
  },
  traitTextLarge: {
    fontSize: scaleFont(16),
  },
  underline: {
    marginTop: 4,
    height: 2,
    backgroundColor: '#007bff',
    width: '80%',
    alignSelf: 'center',
    borderRadius: 1,
  },
});
