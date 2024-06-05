import {StyleSheet} from 'react-native';
import {FONTS} from '../../../theme/fonts';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    padding: 24,
  },
  headerTitle: {
    color: '#161616',
    fontSize: 18,
    fontFamily: FONTS.REGULAR,
    fontWeight: '400',
  },
  row: {},
  filter: {
    gap: 16,
    paddingVertical: 16,
  },
});
