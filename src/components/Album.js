import React, {useState} from 'react';
import {Image, View, StyleSheet, Text, findNodeHandle, TouchableOpacity} from 'react-native';
import {AlbumInfo} from './AlbumInfo';
import {useTheme} from '../theme-manager';

export function Album ({album, onPress})
{
    let backgroundImage = null;
    const [viewRef, setViewRef] = useState(null);

    function imageLoaded ()
    {
        setViewRef(findNodeHandle(backgroundImage));
    }

    const { mode, theme, toggle } = useTheme();

    return (
        <TouchableOpacity onPress={onPress} style={styles.wrapper}>
            {
                album.imageUrl !== "" &&
                <Image ref={(img) => { backgroundImage = img; }} onLoadEnd={imageLoaded} resizeMode="cover" style={styles.image} source={{uri : album.imageUrl}}></Image>
            }
            {
                !album.imageUrl &&
                <View style={[styles.noImages, {borderColor: theme.primaryBackground}]}>
                    <Text style={[styles.noImagesText, {color: theme.primaryText}]}>No photos</Text>
                </View>
            }
            <AlbumInfo album={album}/>
            {/*<BlurView
                style={styles.blur}
                viewRef={viewRef}
                blurType="light"
                blurAmount={10}
            />*/}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    wrapper : {
        marginBottom: 30,
        position: 'relative'
    },
    image : {
        width: '100%',
        height: 300
    },
    blur : {
        backgroundColor: 'transparent',
        overflow: 'hidden',
        bottom : 0,
        left: 0,
        width : 50,
        height: 50
    },
    noImages : {
        marginBottom: 3,
        height: 300,
        borderTopWidth: 0.5,
        alignItems: 'center',
        justifyContent : 'center'
    },
    noImagesText : {
        fontSize: 24
    }
});
