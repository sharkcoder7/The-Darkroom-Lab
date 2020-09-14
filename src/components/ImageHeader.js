import React from 'react';
import {View, Image, StyleSheet, Dimensions} from 'react-native';
import Header from '@react-navigation/stack/src/views/Header/Header';

export function ImageHeader (props)
{
    return (
        <View style={{ backgroundColor: '#eee' }}>
            <Image
                style={{...StyleSheet.absoluteFill, marginRight: -100, height: Header.HEIGHT, width: Dimensions.get('window').width}}
                source={require('../assets/header_background.png')}
            />
            <Header {...props} style={{ backgroundColor: 'transparent' }}/>
        </View>
    )
}
