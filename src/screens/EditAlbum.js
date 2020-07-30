import React, {useEffect, useLayoutEffect, useState} from 'react';
import {StyleSheet, View, FlatList, Image, TouchableOpacity, Text} from 'react-native';
import {useRequest} from '../helper';
import {useTheme} from '../theme-manager';
import {AlbumInfo} from '../components/AlbumInfo';
import HeaderButton from '../components/HeaderButton';

export default function EditAlbum ({route, navigation})
{
    const {album, rolls} = route.params;
    const {request, loading, error} = useRequest();

    const { mode, theme, toggle } = useTheme();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerBackImage: () => (
                <TouchableOpacity style={styles.backButton}>
                    <Image style={styles.backButtonIcon} source={require('../assets/back_arrow_icon.png')}/>
                </TouchableOpacity>
            ),
            headerRight: () => (
                <HeaderButton text="Done" onPress={submit}/>
            ),
            headerLeftStyle : styles.backButton,
            headerBackTitleStyle : {color: '#fff', marginTop: -10},
            headerBackTitle : 'Rolls'
        });
    }, [navigation]);

    async function submit ()
    {
        try
        {
            const response = await request(`/albums/${album.id}/rolls`);
        }
        catch (e)
        {
            alert('error:' + e);
        }
    }

    return (
        <View style={[styles.wrapper, {backgroundColor : theme.backgroundColor}]}>
            <AlbumInfo album={album} isInsideAlbumBlock={false} showName={false}/>

        </View>
    )
}


const styles = StyleSheet.create({
    wrapper : {
        flex: 1,
        width: '100%',
        paddingTop: 15
    },
    backButton : {
        marginRight: 5,
        marginTop: -10,
        marginLeft: 10
    },
    backButtonIcon : {
        width : 17,
        height: 23,
        marginRight: 5
    }
});
