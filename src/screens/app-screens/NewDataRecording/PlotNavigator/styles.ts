import {StyleSheet} from 'react-native';
import {FONTS} from '../../../../theme/fonts';

const styles = StyleSheet.create({
  navigatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
    // elevation: 2,
    // shadowColor: '#000',
    // shadowOpacity: 0.08,
    // shadowRadius: 4,
    // shadowOffset: {width: 0, height: 2},
  },
  details: {
    alignItems: 'center',
  },
  rowColText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
    color: '#444',
  },
  plotCode: {
    fontFamily: FONTS.BOLD,
    fontSize: 16,
    color: '#000',
    marginTop: 6,
  },
});

export default styles;
