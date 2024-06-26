import { StyleSheet } from 'react-native';

const PlanVisitStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  chipContainer: {
    gap: 15,
    paddingVertical: 15,
  },
  chipItem: {
    backgroundColor: '#F7F7F7',
    borderRadius: 5,
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  chipTitle: {
    color: '#636363',
  },
  chipTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chipText: {
    fontSize: 14,
    color: '#454545',
    fontWeight: '400',
  },
  chipCropText: {
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
  chipCropText1:{
    color: 'black',
  },

  dateContainer: {
    backgroundColor: '#F7F7F7',
    borderRadius: 5,
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  dateTitle: {
    color: '#636363',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#161616',
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
  submitButton: {
    backgroundColor: '#1A6DD2',
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 8,
    marginTop: 15,
  },
  submitButtonText: {
    color: '#F7F7F7',
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fieldItem: {
    gap: 3,
  },
  fieldItemText: {
    color: '#161616',
    fontWeight: '400',
    fontSize: 15,
  },
  fieldLocationText: {
    color: '#454545',
    fontWeight: '400',
    fontSize: 13,
  },
});

export default PlanVisitStyles;
