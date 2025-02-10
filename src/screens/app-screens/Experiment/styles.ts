import {StyleSheet} from 'react-native';
import {FONTS} from '../../../theme/fonts';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  main_header: {
    paddingHorizontal: 20,
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
  newRecord: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A6DD2',
    borderRadius: 16,
    bottom: 8,
    right: 16,
    gap: 8,
  },
  newRecordText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
  },
  optionsContainer: {
    gap: 16,
  },
  optionsTextContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  optionsText: {
    color: '#161616',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
  },
  optionIcon: {
    borderRadius: 16,
    padding: 16,
    height: 56,
    width: 56,
    backgroundColor: '#E8F0FB',
  },
  closeIcon: {
    backgroundColor: '#1A6DD2',
  },
  optionsModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    bottom: 88,
    right: 16,
  },
  modalOpen: {
    opacity: 0.2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#161616',
    fontSize: 14,
    fontFamily: FONTS.SEMI_BOLD,
  },
});
