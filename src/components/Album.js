import React, {useState} from 'react';
import {Image, View, StyleSheet, Text, findNodeHandle, TouchableOpacity} from 'react-native';
import {AlbumInfo} from './AlbumInfo';

export function Album ({album, onPress})
{
    let backgroundImage = null;
    const [viewRef, setViewRef] = useState(null);

    function imageLoaded ()
    {
        setViewRef(findNodeHandle(backgroundImage));
    }
    return (
        <TouchableOpacity onPress={onPress} style={styles.wrapper}>
            <Image ref={(img) => { backgroundImage = img; }} onLoadEnd={imageLoaded} resizeMode="cover" style={styles.image} source={{uri : album.imageUrl}}></Image>
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
    }
});
