import {StyleSheet} from 'react-native';
import {FONTS} from '../../../../theme/fonts';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 25,
    paddingHorizontal: 12,
    marginRight: -12,
    // borderWidth: 1,
    // borderColor: '#ccc',
    // borderRadius: 8,
    // backgroundColor: '#fff',
  },
  traitBox: {
    alignItems: 'center',
    flex: 1,
  },
  traitText: {
    fontSize: 16,
    fontFamily: FONTS.BOLD,
    color: '#333',
  },
  underline: {
    marginTop: 4,
    height: 2,
    backgroundColor: '#007bff',
    width: '60%',
    alignSelf: 'center',
    borderRadius: 1,
  },
});
