import {Dimensions, StyleSheet} from 'react-native';
import {FONTS} from '../../../theme/fonts';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  backIconContainer: {
    padding: 12,
  },
  backIcon: {},
  experimentContainer: {
    alignItems: 'flex-start',
  },
  experimentTitle: {
    color: '#161616',
    fontFamily: FONTS.REGULAR,
    fontSize: 18,
  },
  cropTitleContainer: {
    backgroundColor: '#EAF4E7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginVertical: 8,
    borderRadius: 6,
  },
  cropTitle: {
    color: '#161616',
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
  },
  fieldText: {
    color: '#949494',
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
    marginBottom: 8,
  },
  fieldContainer: {
    borderWidth: 1,
    padding: 16,
    borderColor: '#F7F7F7',
    borderBottomWidth: 0,
  },
  firstIndex: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  lastIndex: {
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderBottomWidth: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldName: {
    color: '#161616',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    marginBottom: 9,
  },
  locationNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationName: {
    color: '#454545',
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    marginLeft: 4,
  },
  search: {
    marginVertical: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  fieldDetailsContainer: {
    gap: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  fieldDetailsCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8F0FB',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldDetailsCardPart: {
    width: Dimensions.get('screen').width / 2 - 38,
  },
  fieldDetailsIcon: {},
  fieldDetailsKeyText: {
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    color: '#636363',
    marginBottom: 4,
  },
  fieldDetailsValueText: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: '#161616',
  },
  fieldDetailsNavAction: {
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
    color: '#1A6DD2',
  },
  fieldDetailsTextContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  row: {flexDirection: 'row', alignItems: 'center', gap: 10},
});
