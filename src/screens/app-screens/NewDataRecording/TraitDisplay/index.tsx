import React from 'react';
import {View, Text, Pressable, Dimensions} from 'react-native';
import {styles} from './styles';
import {
  arrowLeft as ArrowLeft,
  arrowRight as ArrowRight,
} from '../../../../assets/icons/svgs';

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
  const {width} = Dimensions.get('window');
  const horizontalMargin = width < 360 ? 8 : width >= 768 ? 24 : 16;

  return (
    <View
      style={[
        styles.container,
        {justifyContent: 'center', marginHorizontal: 0},
      ]}>
      <Pressable
        onPress={onPrev}
        hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
        style={[
          styles.arrowContainer,
          {position: 'absolute', left: horizontalMargin},
        ]}>
        <ArrowLeft />
      </Pressable>

      <Pressable onPress={onTraitPress} style={styles.traitBox}>
        <Text
          style={[
            styles.traitText,
            width > 500 ? styles.traitTextLarge : null,
          ]}>
          {traitName}
        </Text>
        <View style={styles.underline} />
      </Pressable>

      <Pressable
        onPress={onNext}
        hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
        style={[
          styles.arrowContainer,
          {position: 'absolute', right: horizontalMargin},
        ]}>
        <ArrowRight />
      </Pressable>
    </View>
  );
};

export default TraitDisplay;
