import React from 'react';
import {Image, View, StyleSheet, Text} from 'react-native';

export function AlbumInfo ({album, isInsideAlbumBlock = true, showName = true})
{
    return (
        <View style={[styles.infoWrapper, isInsideAlbumBlock ? {position : 'absolute', backgroundColor: '#00000070'} : {}]}>
            <Text style={[styles.name, isInsideAlbumBlock ? {} : {fontSize: 20}]}>{showName ? album.name : ''}</Text>
            <View style={styles.secondaryInfo}>
                <View style={styles.infoBlock}>
                    <Image style={[styles.icon, {aspectRatio : 38 / 32}]} source={require('../assets/film_canister.png')}></Image>
                    <Text style={styles.text}>{album.photoCount}</Text>
                </View>
                <View style={styles.infoBlock}>
                    <Image style={[styles.icon, {aspectRatio : 44 / 32, marginTop: 3}]} source={require('../assets/picture.png')}></Image>
                    <Text style={styles.text}>{album.imagesCount}</Text>
                </View>
                <Text style={[styles.text, styles.date]}>{album.date}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    infoWrapper : {
        bottom: 0,
        left: 0,
        zIndex: 1,
        width : '100%',
        flexDirection : 'row',
        justifyContent : 'space-between',
        paddingVertical : 5,
        paddingHorizontal : 10,
    },
    name : {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
        fontFamily : 'Roboto-Regular'
    },
    secondaryInfo : {
        flexDirection : 'row'
    },
    infoBlock : {
        flexDirection : 'row',
        marginRight: 10
    },
    icon : {
        width: 20,
        marginRight: 5,
        marginTop: 1
    },
    text : {
        color: 'white',
        fontFamily : 'Roboto-Regular',
    }
});
