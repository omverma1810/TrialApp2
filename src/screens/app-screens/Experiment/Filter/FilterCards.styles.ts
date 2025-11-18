import {StyleSheet} from 'react-native';
import {FONTS} from '../../../../theme/fonts';
import { Dimensions } from 'react-native';


const {width} = Dimensions.get('window')

export default StyleSheet.create({
  /**
   * Container for all three cards in a horizontal row
   */
  row: {
    flexDirection: 'row',
    marginVertical: 8,
    justifyContent:'space-around',
    width:width*0.82
  },

  /**
   * Wrapper for each individual card to evenly distribute space
   */
  cardContainer: {
    marginHorizontal: 1,
  },

  /**
   * The pill-style card itself
   */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 36,
    width: width * 0.25,
    backgroundColor: '#E8F0FB',
    borderRadius: 18,
    paddingHorizontal:10
    
  },

  /**
   * Text inside the card
   */
  cardText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
    color: '#0E3C74',
  },

  /**
   * Container inside the sheet to allow scrolling
   */
  sheetContent: {
    paddingVertical: 8,
  },

  /**
   * Each option row inside the bottom sheet
   */
  option: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  /**
   * Highlighted option row
   */
  optionActive: {
    backgroundColor: '#D1E7FF',
  },

  /**
   * Text inside each option row
   */
  optionText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 16,
    color: '#0E3C74',
  },

  /**
   * Highlighted text for the selected option
   */
  optionTextActive: {
    fontWeight: 'bold',
  },

  /**
   * Apply button styling
   */
  applyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: '#1A6DD2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /**
   * Apply button text styling
   */
  applyButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: FONTS.MEDIUM,
  },
});
