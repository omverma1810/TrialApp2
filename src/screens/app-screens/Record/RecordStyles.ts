import { StyleSheet } from 'react-native';
import { FONTS } from '../../../theme/fonts';
const RecordStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  filter: {},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    width: '100%',
    backgroundColor: '#FBFBFB',
    gap: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
  },
  experimentContainer: {
    paddingVertical: 10,
  },
  experimentItem: {
    backgroundColor: '#F7F7F7',
    borderRadius: 5,
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  experimentTitle: {
    color: 'black',
  },
  experimentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  experimentText: {
    fontSize: 14,
    color: '#454545',
    fontWeight: '400',
  },
  experimentCrop: {
    paddingHorizontal: 10,
    alignItems:'center',
    width: 58,
    justifyContent:'center',
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#EAF4E7',
    display:'flex',
    color: 'black'
  },
  experimentCropText:{
    color: 'black',
    
  },
  chip: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#B7B7B7',
    width: '100%',
  },
  chipLabel: {
    color: '#949494',
  },
  inputContainer: {
    gap: 15,
  },
  fieldContainer: {
    backgroundColor: '#F7F7F7',
    borderRadius: 5,
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldTitle: {
    color: '#454545',
    fontWeight: '500',
    fontSize: 13,
  },
  listByContainer: {
    flexDirection: 'row',
    gap: 35,
    alignItems: 'center',
  },
  listByText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#949494',
  },
  listByButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  listByButton: {
    paddingVertical: 5,
    borderRadius: 6,
    paddingHorizontal:10,
    alignItems: 'center',
  },
  activeListByButton: {
    backgroundColor: '#0E3C74',
    color: 'white',
  },
  inactiveListByButton: {
    backgroundColor: '#E8F0FB',
    color: '#0E3C74',
  },
  modalContainer: {
    paddingHorizontal: 25,
    gap: 30,
    paddingVertical: 15,
  },
  modalTitle: {
    color: '#161616',
    fontWeight: '500',
    fontSize: 16,
  },
  modalItem: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalItemText: {
    color: '#454545',
    fontWeight: '500',
    fontSize: 15,
  },
  modalItemCropText: {
    color: 'black',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  fieldCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldCheckboxText: {
    fontSize: 16,
    color: '#454545',
    marginLeft: 10,
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
});

export default RecordStyles;
