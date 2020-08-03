import React from 'react';
import {Image, Dimensions, View, Platform} from 'react-native';

export function FosLogo (props)
{
    let windowWidth = Dimensions.get('window').width,
        imageOriginalWidth = 166,
        imageWidth = Math.round(windowWidth * 0.2),
        imageOriginalHeight = 52,
        imageHeight = imageWidth / imageOriginalWidth * imageOriginalHeight;

    return <View style={{paddingTop : Platform.OS === 'ios' ? 10 : 0}}>
        <Image resizeMode="contain" style={{width: imageWidth, height: imageHeight}} source={require('../assets/fos_logo.png')}/>
    </View>
}
