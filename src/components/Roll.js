import React from 'react';
import {Image, View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {shallowEqual, useSelector} from 'react-redux';

export function Roll ({roll, onPress})
{
    const imagesRotation = useSelector(state => state.main.imagesRotation, shallowEqual);

    function imageRotationAngle (image)
    {
        if (imagesRotation[image.id] !== undefined && imagesRotation[image.id].date > image.updated_at)
        {
            return `${imagesRotation[image.id].angle}deg`;
        }

        return `0deg`;
    }

    return (
        <TouchableOpacity onPress={onPress} style={styles.wrapper}>

            <View style={styles.images}>
                {
                    roll.images.slice(0, 4).map(image =>
                        <View key={image.id.toString()} style={styles.imageWrapper}>
                            <Image style={[styles.image, {transform : [{rotate : imageRotationAngle(image)}]}]}
                                   resizeMode="cover"
                                   source={{uri : image.image_urls.sq, width : 100, height: 100}}/>
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
