import React, {useState} from 'react';
import {ActivityIndicator, Image, View} from 'react-native';

const ImageWithLoader = ({uri, style}: {uri: any; style: any}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={{position: 'relative'}}>
      {isLoading && (
        <ActivityIndicator
          size="small"
          color="#000"
          style={{position: 'absolute', alignSelf: 'center', top: '50%'}}
        />
      )}
      <Image
        source={{uri}}
        style={style}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
      />
    </View>
  );
};

export default ImageWithLoader;
