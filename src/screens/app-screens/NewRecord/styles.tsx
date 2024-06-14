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
});
