import {Dimensions, StyleSheet} from 'react-native';
import {FONTS} from '../../../../theme/fonts';

const isSmallScreen = Dimensions.get('window').width < 375;

export const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#6B72802E',
    borderBottomWidth: 1,
    borderRadius: 6,
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
  cropContainer: {
    padding: 8,
    backgroundColor: '#EAF4E7',
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6,
  },

  /* new header row holding badges */
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  /* badge for crop name */
  cropBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cropBadgeText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
    color: '#1976D2',
  },

  /* badge for experiment name */
  nameBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nameBadgeText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
    color: '#161616',
  },

  /* badge for experiment type */
  typeBadge: {
    backgroundColor: '#FEF4E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
    color: '#D9822B',
  },
  cropTitle: {
    color: '#161616',
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
  },
  experimentContainer: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderColor: '#EAF4E7',
    marginBottom: -45,
  },
  experimentTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  leftContentContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingRight: 16,
  },
  experimentTitle: {
    color: '#161616',
    fontSize: 15,
    fontFamily: FONTS.MEDIUM,
  },
  // New bottom row styles
  bottomRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 14,
    gap: 8,
    bottom: 40,
  },
  viewFieldsContainer: {
    flex: 1,
  },
  viewFieldsContainerTitle: {
    color: '#1A6DD2',
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
  },
  toggleContainer: {
    alignItems: 'flex-end',
  },
  experimentDetailsContainer: {
    gap: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    bottom: 30,
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
    alignSelf: 'center',
  },
  viewAllFields: {
    color: '#1A6DD2',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    textAlign: 'center',
  },
  row: {flexDirection: 'row', alignItems: 'center', gap: 20},
  experimentTypeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start', // Prevent the badge from stretching
  },
  experimentType: {
    color: '#161616',
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
  },
  offlineButton: {
    marginLeft: 9,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  offlineButtonText: {
    fontFamily: FONTS.MEDIUM,
    color: '#1A6DD2',
    fontSize: 12,
  },
  offlineEnabledText: {
    backgroundColor: '#1A6DD2',
    color: '#fff',
    paddingHorizontal: 2,
    borderRadius: 2,
  },
  availableOfflineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD', // Light blue background
    paddingHorizontal: 100,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  availableOfflineText: {
    color: '#1976D2', // Blue text color
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },

  // Group header styles
  cropHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },

  // Group-level offline indicator
  groupOfflineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8', // Light green background for group indicator
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
  },
  groupOfflineText: {
    color: '#2E7D32', // Green text color for group indicator
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  customToggleWrapper: {
    width: 40,
    height: 24,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ovalContainer: {
    width: 20,
    height: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    // marginHorizontal: 2,
  },
  mainCardsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row', // ← add this
    flexWrap: 'nowrap', // ← optional: prevent them from wrapping
    bottom: 15, // ← adjust as needed
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
  cardValueWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minWidth: 0, // Allow shrinking
  },
  plotsTextContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: isSmallScreen ? 4 : 8,
    marginRight: isSmallScreen ? 2 : 4,
    minWidth: 0, // Allow shrinking
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
  traitsCard: {
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  // ─── Location / Field info row ─────────────────────────
  fieldInfoRow: {
    // flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 2,
    bottom: 15,
    gap:5,
    paddingBottom:10,
  },
  fieldInfoText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 16,
    color: '#161616',
    marginTop: -4,
  },
  toggleWrapper: {
    marginLeft: 8,
  },
  // new style for that bottom‐left arrow
  expandIcon: {
    position: 'absolute',
    bottom: 65,
    right: 20,
    zIndex: 1,
    justifyContent: 'flex-end',
  },
  expandIconUp: {
    position: 'absolute',
    bottom: 405,
    right: 20,
    zIndex: 1,
    justifyContent: 'flex-end',
  },
});
