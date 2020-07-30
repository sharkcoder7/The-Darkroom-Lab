import React, {useState} from 'react';
import {Image, View, StyleSheet, Text, TouchableOpacity} from 'react-native';

export function Roll ({roll, onPress})
{
    return (
        <TouchableOpacity onPress={onPress} style={styles.wrapper}>

            <View style={styles.images}>
                {
                    roll.images.map(image =>
                        <View style={styles.imageWrapper}>
                            <Image style={styles.image} resizeMode="cover" source={{uri : image.imageUrl, width : 100, height: 100}}/>
                        </View>
                    )
                }
            </View>

            <View style={styles.infoWrapper}>
                <Text style={styles.name}>{roll.name}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    wrapper : {
        marginBottom: 25,
        width: '100%',
        position: 'relative',
    },
    infoWrapper : {
        position: 'absolute',
        backgroundColor: '#00000080',
        bottom: 0,
        left: 0,
        zIndex: 1,
        width : '100%',
        flexDirection : 'row',
        justifyContent : 'center',
        paddingVertical : 5
    },
    images : {
        flexDirection: 'row',
        flexWrap : 'wrap',
        margin: -5
    },
    imageWrapper : {
        width : '50%',
        aspectRatio: 1,
        padding: 5
    },
    image : {
        width: '100%',
        height: '100%'
    },
    name : {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
        fontFamily : 'Roboto-Regular'
    }
});
