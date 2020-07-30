import React from 'react';
import {View, Image, StyleSheet} from 'react-native';
import Header from '@react-navigation/stack/src/views/Header/Header';

export function ImageHeader (props)
{
    return (
        <View style={{ backgroundColor: '#eee' }}>
            <Image
                style={{...StyleSheet.absoluteFill, height: Header.HEIGHT}}
                source={require('../assets/header_background.png')}
            />
            <Header {...props} style={{ backgroundColor: 'transparent' }}/>
        </View>
    )
}
