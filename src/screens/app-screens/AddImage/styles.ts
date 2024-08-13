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
    fontFamily: FONTS.REGULAR,
    paddingHorizontal: 16,
    color: '#000',
    fontSize: 18,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '70%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    gap: 8,
    width: '100%',
    flexDirection: 'row',
    marginTop: '20%',
  },
  button: {
    flex: 0.5,
    backgroundColor: '#F7F7F7',
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {},
  traitsModal: {
    flex: 1,
    paddingHorizontal: 16,
  },
  traitsModalHeader: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
  },
  traitsModalHeaderTitle: {
    color: '#161616',
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
  },
  traitTitleContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  traitTitle: {
    color: '#161616',
    fontFamily: FONTS.REGULAR,
    fontSize: 14,
  },
  optionsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  optionsTitle: {
    color: '#161616',
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 14,
  },
  optionsLabel: {
    color: '#161616',
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
  },
  noDataView: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#161616',
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 14,
    textAlign: 'center',
  },
});
