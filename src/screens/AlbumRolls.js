import React, {useEffect, useLayoutEffect, useState} from 'react';
import {StyleSheet, View, FlatList, Image, TouchableOpacity, Text} from 'react-native';
import {useRequest} from '../helper';
import {useTheme} from '../theme-manager';
import {AlbumInfo} from '../components/AlbumInfo';
import {Roll} from '../components/Roll';
import HeaderButton from '../components/HeaderButton';
import {customBackButtonHeaderProps} from '../components/BackButton';

export default function AlbumRolls ({route, navigation})
{
    const {album} = route.params;
    const [rolls, setRolls] = useState([]);
    const {request, loading, error} = useRequest();

    const { mode, theme, toggle } = useTheme();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <HeaderButton text="Edit Album" onPress={toEditAlbum}/>
            ),
            ...customBackButtonHeaderProps('Orders')
        });
    }, [navigation]);

    useEffect(() =>
    {
        getRolls();
    }, []);

    async function getRolls ()
    {
        try
        {
            const response = await request(`/albums/${album.id}/rolls`);
            setRolls(response);
        }
        catch (e)
        {
            alert('error:' + e);
        }
    }

    function toEditAlbum ()
    {
        navigation.navigate('EditAlbum', {album, rolls});
    }

    function selectRoll (roll)
    {
        //navigation.navigate('RollImages', {album, roll});
        navigation.navigate('ImageDetail', {album, roll, image : roll.images[0]});
    }

    return (
        <View style={[styles.wrapper, {backgroundColor : theme.backgroundColor}]}>
            <AlbumInfo album={album} isInsideAlbumBlock={false}/>
            <FlatList style={styles.listWrapper} data={rolls} renderItem={({item}) => <Roll key={item.id} roll={item} onPress={() => selectRoll(item)}/>}/>
        </View>
    )
}


const styles = StyleSheet.create({
    wrapper : {
        flex: 1,
        width: '100%',
        paddingTop: 15
    },
    listWrapper : {
        width: '100%',
        paddingHorizontal: 10,
        marginTop: 15
    }
});
