import {Dimensions, StyleSheet} from 'react-native';
import {FONTS} from '../../../../theme/fonts';

export const styles = StyleSheet.create({
  container: {
    // marginBottom: 24,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EAF4E7',
    borderRadius: 6,
  },
  cropContainer: {
    padding: 8,
    backgroundColor: '#EAF4E7',
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6,
  },
  cropTitle: {
    color: '#161616',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
  },
  experimentContainer: {
    padding: 16,
    gap: 16,
    // borderTopWidth: 1,
    // borderColor: '#EAF4E7',
  },
  experimentTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  experimentTitle: {
    color: '#161616',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
  },
  viewFieldsContainer: {},
  viewFieldsContainerTitle: {
    color: '#1A6DD2',
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
  },
  experimentDetailsContainer: {
    gap: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  experimentDetailsCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8F0FB',
    width: Dimensions.get('screen').width / 2 - 38,
  },
  experimentDetailsKeyText: {
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    color: '#636363',
    marginBottom: 4,
  },
  experimentDetailsValueText: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: '#161616',
  },
  viewContainer: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    zIndex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#1A6DD2',
  },
  view: {
    color: '#1A6DD2',
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
  },
  viewAllFieldsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#1A6DD2',
  },
  viewAllFields: {
    color: '#1A6DD2',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    textAlign: 'center',
  },
});
