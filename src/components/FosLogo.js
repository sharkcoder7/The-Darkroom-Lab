import React from 'react';
import {Image, Dimensions, View, Platform} from 'react-native';
import Fos from './icons/Fos';

export function FosLogo (props)
{
    let windowWidth = Dimensions.get('window').width,
        imageOriginalWidth = 166,
        imageWidth = Math.round(windowWidth * 0.2),
        imageOriginalHeight = 52,
        imageHeight = imageWidth / imageOriginalWidth * imageOriginalHeight;

    return <View style={{paddingTop : Platform.OS === 'ios' ? 10 : 0}}>
        <Fos/>
    </View>
}
