import {Dimensions, StyleSheet} from 'react-native';
import {FONTS} from '../../../theme/fonts';

const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;

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
    borderBottomWidth: 10,
    borderBottomColor: '#FFFFFF',
    backgroundColor: '#FAFAFA',
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

  // Location Header Styles
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationName: {
    color: '#161616',
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    marginLeft: 8,
  },
  chevronPlaceholder: {
    color: '#949494',
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
  },

  // Main Cards Container - Updated to match UI
  mainCardsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  mainCardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  plotsCard: {
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    padding: isSmallScreen ? 12 : 16,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    minHeight: isSmallScreen ? 80 : 90,
  },
  traitsCard: {
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },

  cardTitle: {
    color: '#161616',
    fontSize: isSmallScreen ? 12 : 14,
    fontFamily: FONTS.MEDIUM,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardValue: {
    color: '#1A6DD2',
    fontSize: isSmallScreen ? 16 : 18,
    fontFamily: FONTS.BOLD,
    textAlign: 'center',
  },

  // More Details Section
  moreDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  moreDetailsTitle: {
    color: '#161616',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    paddingLeft: 8,
  },
  moreDetailsContainer: {
    marginTop: 8,
  },
  moreDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moreDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    paddingVertical: 12,
  },
  moreDetailTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  moreDetailTitle: {
    color: '#636363',
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    marginBottom: 2,
  },
  moreDetailValue: {
    color: '#161616',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
  },

  // Legacy styles (keeping for compatibility)
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
    padding: 12,
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
    paddingLeft: 12,
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
  detailCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },

  detailCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailCardTextContainer: {
    marginLeft: 10,
    flex: 1,
  },

  detailCardTitle: {
    fontSize: 12,
    color: '#636363',
    fontFamily: FONTS.REGULAR,
    marginBottom: 2,
  },

  detailCardValue: {
    fontSize: 14,
    color: '#161616',
    fontFamily: FONTS.MEDIUM,
  },
  cardValueWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minWidth: 0, // Allow shrinking
  },

  chevronIcon: {
    marginLeft: isSmallScreen ? 2 : 4,
    marginTop: 1,
    flexShrink: 0, // Prevent chevron from shrinking
  },
  plotsTextContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: isSmallScreen ? 4 : 8,
    marginRight: isSmallScreen ? 2 : 4,
    minWidth: 0, // Allow shrinking
  },
});
