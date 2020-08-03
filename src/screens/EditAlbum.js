import React, {useEffect, useLayoutEffect, useState} from 'react';
import {StyleSheet, View, FlatList, Image, TouchableOpacity, Text} from 'react-native';
import {useRequest} from '../helper';
import {useTheme} from '../theme-manager';
import {AlbumInfo} from '../components/AlbumInfo';
import HeaderButton from '../components/HeaderButton';
import {customBackButtonHeaderProps} from '../components/BackButton';

export default function EditAlbum ({route, navigation})
{
    const {album, rolls} = route.params;
    const {request, loading, error} = useRequest();

    const { mode, theme, toggle } = useTheme();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <HeaderButton text="Done" onPress={submit}/>
            ),
            ...customBackButtonHeaderProps('Album', navigation)
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
    }
});
