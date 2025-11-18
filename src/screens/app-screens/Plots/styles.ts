import {StyleSheet} from 'react-native';
import {FONTS} from '../../../theme/fonts';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  backIconContainer: {
    padding: 2,
  },
  backIcon: {},
  plotContainer: {
    alignItems: 'flex-start',
  },
  fieldTitle: {
    color: '#161616',
    fontFamily: FONTS.REGULAR,
    fontSize: 18,
  },
  experimentTitle: {
    color: '#636363',
    fontFamily: FONTS.REGULAR,
    fontSize: 14,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropTitleContainer: {
    backgroundColor: '#EAF4E7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cropTitle: {
    color: '#161616',
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
  },
  plotText: {
    color: '#949494',
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
    marginBottom: 8,
  },
  search: {
    marginVertical: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  plotCardContainer: {
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
  plotName: {
    color: '#161616',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    marginBottom: 8,
  },
  plotInfoContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  plotKeyValueContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  plotInfoKey: {
    color: '#949494',
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
  },
  plotInfoValue: {
    color: '#454545',
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
  },
  plotDetailsContainer: {
    gap: 16,
    marginTop: 16,
  },
  recordedTraitsContainer: {
    borderWidth: 1,
    borderColor: '#F7F7F7',
    borderRadius: 6,
  },
  recordedTraitsTextContainer: {
    padding: 8,
    backgroundColor: '#F7F7F7',
  },
  recordedTraitsText: {
    color: '#161616',
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
  },
  recordedTraitsInfoContainer: {
    padding: 16,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  recordedTraitsInfoKeyTextContainer: {
    gap: 8,
    flex: 1,
  },
  recordedTraitsInfoKeyText: {
    color: '#636363',
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
  },
  recordedTraitsInfoValueText: {
    color: '#161616',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
  },
  editContainer: {
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  edit: {
    color: '#1A6DD2',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
  },
  notesContainer: {
    padding: 8,
  },
  notes: {
    color: '#161616',
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
  },
  noteInfoContainer: {
    padding: 16,
    gap: 8,
    backgroundColor: '#FDF8EE',
    borderRadius: 8,
  },
  notesContent: {
    color: '#161616',
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
  },
  notesDate: {
    color: '#000',
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    opacity: 0.4,
  },
  unrecordedTraitsContainer: {},
  unrecordedTraitsContainerWithDetails: {
    borderWidth: 1,
    borderColor: '#F7F7F7',
    borderRadius: 6,
  },
  unrecordedTraitsTitleContainerWithDetails: {
    backgroundColor: '#F7F7F7',
  },
  unrecordedTraitsTitleContainer: {
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unrecordedTraitsTitle: {
    color: '#161616',
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
    flex: 1,
  },
  viewContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  view: {
    color: '#1A6DD2',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
  },
  unrecordedTraitsInfoValueText: {
    color: '#161616',
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
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
  saveRecord: {
    width: '90%',
    alignSelf: 'center',
    height: 35,
    marginVertical: 10,
  },
  userInteractionContainer: {
    gap: 24,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    marginTop: 10,
  },
  optionContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    color: '#1A6DD2',
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  calendarCard: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 18,
  },
  calendar: {
    width: '100%',
    height: 200, // fix the height so it’s not too tall
    paddingTop: 8,
  },
  dateLabelContainer: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  // Tab Bar Styles
  tabBarContainer: {
    paddingTop: 16,
    paddingHorizontal: 8,
  },
  tabBarBackground: {
    flexDirection: 'row',
    backgroundColor: '#F4F9FF',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E8F0FB',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#1A6DD2',
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: '#454545',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  // Coming Soon Styles
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  comingSoonText: {
    fontSize: 24,
    fontFamily: FONTS.MEDIUM,
    color: '#161616',
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonSubtext: {
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
    color: '#636363',
    textAlign: 'center',
  },
  // Matrix Table Styles
  matrixContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  matrixTitleContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  matrixTitle: {
    fontSize: 18,
    fontFamily: FONTS.MEDIUM,
    color: '#161616',
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tableContent: {
    flexDirection: 'row',
  },
  // Fixed Columns Styles
  fixedColumnsSection: {
    width: 200, // Fixed width for first two columns
    backgroundColor: '#FFFFFF',
    borderRightWidth: 2,
    borderRightColor: '#E0E0E0',
  },
  fixedHeader: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F7',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  fixedHeaderCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48, // Fixed height to match headerCell
  },
  fixedRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  fixedCell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48, // Fixed height to ensure consistent alignment
  },
  // Scrollable Section Styles
  scrollableSection: {
    flex: 1,
  },
  scrollableContent: {
    flexDirection: 'column',
  },
  scrollableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F7',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F7',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerCell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
    height: 48, // Fixed height to match fixedHeaderCell
  },
  headerText: {
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
    color: '#161616',
    textAlign: 'center',
  },
  headerUnitText: {
    fontSize: 10,
    fontFamily: FONTS.REGULAR,
    color: '#666666',
    textAlign: 'center',
    marginTop: 2,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
    width: 100,
    height: 48, // Fixed height to match fixedCell exactly
  },
  cellText: {
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    color: '#161616',
    textAlign: 'center',
  },
  cellTextWithValue: {
    color: '#1976D2',
    fontFamily: FONTS.MEDIUM,
  },
  cellTextEmpty: {
    color: '#999999',
  },
  // Cell Edit Modal Styles
  cellEditHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  cellEditTitle: {
    fontSize: 18,
    fontFamily: FONTS.MEDIUM,
    color: '#161616',
    marginBottom: 4,
  },
  cellEditSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
    color: '#666666',
  },
  cellEditInputContainer: {
    marginBottom: 20,
  },
  valueDisplayContainer: {
    marginBottom: 16,
  },
  valueDisplayLabel: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: '#161616',
    marginBottom: 8,
  },
  valueDisplayField: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueDisplayText: {
    fontSize: 42,
    fontFamily: FONTS.MEDIUM,
    color: '#1976D2',
  },
  textInputContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textInput: {
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
    color: '#161616',
    minHeight: 40,
  },
  cellEditActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cellEditButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cellEditButtonPrimary: {
    backgroundColor: '#1976D2',
  },
  cellEditButtonText: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: '#666666',
  },
  cellEditButtonTextPrimary: {
    color: '#FFFFFF',
  },
  cellEditDeleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
});
