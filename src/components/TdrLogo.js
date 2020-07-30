import React from 'react';
import {Image, Dimensions} from 'react-native';

export function TdrLogo (props)
{
    let windowWidth = Dimensions.get('window').width,
        imageOriginalWidth = 332,
        imageWidth = Math.round(windowWidth * 0.3),
        imageOriginalHeight = 70,
        imageHeight = imageWidth / imageOriginalWidth * imageOriginalHeight;

    return (
        <Image resizeMode="contain" style={{width: imageWidth, height: imageHeight}} source={require('../assets/tdr_logo.png')}/>
    )
}
