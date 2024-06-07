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
});
