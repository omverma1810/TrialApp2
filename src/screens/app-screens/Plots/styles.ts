import {StyleSheet} from 'react-native';
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
  plotContainer: {
    alignItems: 'flex-start',
  },
  fieldTitle: {
    color: '#161616',
    fontFamily: FONTS.REGULAR,
    fontSize: 18,
    marginBottom: 12,
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
    color: '#123E08',
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
});
