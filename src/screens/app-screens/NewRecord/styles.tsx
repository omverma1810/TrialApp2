import {StyleSheet} from 'react-native';
import {FONTS} from '../../../theme/fonts';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 16,
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
  saveRecordBtnContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 8,
    gap: 10,
  },
  selectExperimentContainer: {
    flex: 1,
  },
  selectExperimentTextContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F7F7F7',
  },
  selectExperimentText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
    color: '#161616',
  },
  filter: {
    gap: 16,
    paddingVertical: 16,
  },
  experimentLabelContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cropLabelContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FCEBEA',
  },
  experimentLabel: {
    fontFamily: FONTS.REGULAR,
    fontSize: 14,
    color: '#161616',
  },
  cropLabel: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 12,
    color: '#161616',
  },
  locationContainer: {
    padding: 16,
  },
  fieldName: {
    color: '#161616',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    marginBottom: 9,
  },
  locationNameContainer: {
    flexDirection: 'row',
  },
  locationName: {
    color: '#454545',
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    marginLeft: 4,
  },
  plotCardContainer: {
    padding: 16,
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
  experimentInfoContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F7F7F7',
  },
  experimentHeaderTitleContainer: {
    gap: 8,
    alignItems: 'flex-start',
  },
  experimentHeaderTitle: {
    color: '#636363',
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
  },
  experimentName: {
    color: '#161616',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
  },
  userInteractionContainer: {
    gap: 24,
    alignSelf: 'flex-end',
    flexDirection: 'row',
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
  unrecordedTraitsContainer: {
    flex: 1,
  },
  unrecordedTraitsTitleContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F7F7F7',
    gap: 8,
  },
  unrecordedTraitsTitle: {
    color: '#161616',
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
  },
  traitsContainer: {
    padding: 16,
    gap: 8,
  },
  traitsInputContainer: {
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  traitsTitle: {
    color: '#161616',
    fontFamily: FONTS.REGULAR,
    fontSize: 14,
  },
  recordButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#E8F0FB',
  },
  recordButtonTitle: {
    color: '#0B2E58',
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
  },
  traitsInputIconText: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: '#636363',
  },
  traitsInfoContainer: {
    gap: 8,
    flex: 1,
  },
  traitsLabelKey: {
    color: '#636363',
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
  },
  traitsLabelValue: {
    color: '#161616',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
  },
  editContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  edit: {
    color: '#1A6DD2',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
  },
  notesModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesModal: {
    backgroundColor: '#FDF8EE',
    borderRadius: 28,
    padding: 24,
    width: '90%',
    gap: 16,
  },
  notesTitle: {
    fontSize: 18,
    fontFamily: FONTS.REGULAR,
    color: '#161616',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#B7B7B7',
    borderRadius: 8,
    padding: 16,
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
    color: '#161616',
    height: 130,
  },
  notesButtonContainer: {
    gap: 8,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    marginTop: 8,
  },
  discardBtnContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  discardBtn: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: '#1A6DD2',
  },
  saveBtnContainer: {
    backgroundColor: '#1A6DD2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveBtn: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: '#F7F7F7',
  },
  notesContainer: {
    backgroundColor: '#FDF8EE',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  notesTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: '#161616',
  },
  notesContent: {
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
    color: '#161616',
  },
  imageViewContainer: {
    gap: 20,
  },
  imageContainer: {
    gap: 12,
    flexDirection: 'row',
  },
  image: {
    height: 150,
    width: 150,
  },
  selectedImage: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  traitsLabel: {
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
    color: '#161616',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    borderColor: '#e53430',
    borderWidth: 1,
  },
  deleteBtnLabel: {
    color: '#e53430',
  },
});
