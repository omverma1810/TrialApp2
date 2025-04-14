import React from 'react';
import {View, Text, Pressable} from 'react-native';
import {styles} from './styles';
import {arrowLeft, arrowRight} from '../../../../assets/icons/svgs';

type TraitDisplayProps = {
  traitName: string;
  onPrev: () => void;
  onNext: () => void;
  onTraitPress: () => void;
};

const TraitDisplay: React.FC<TraitDisplayProps> = ({
  traitName,
  onPrev,
  onNext,
  onTraitPress,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      ]}>
      <Pressable onPress={onPrev} style={{marginRight: 50}}>
        {arrowLeft}
      </Pressable>

      <Pressable onPress={onTraitPress} style={styles.traitBox}>
        <Text style={styles.traitText}>{traitName}</Text>
        <View style={styles.underline} />
      </Pressable>

      <Pressable onPress={onNext} style={{marginLeft: 50}}>
        {arrowRight}
      </Pressable>
    </View>
  );
};

export default TraitDisplay;
